import { err, ok, type Result } from "@/lib/result";
import { input, instructions } from "./domain/prompt";
import { SAVED_MARKER } from "./marker";
import type { Clock, DailyLimiter, PostStore, PostWriter } from "./ports";
import { GenerateSchema, UpdateSchema } from "./schemas";
import type { Post } from "./types";

export type PostError = "INVALID_INPUT" | "LIMIT_REACHED" | "NOT_FOUND";

type Deps = {
  store: PostStore;
  writer: PostWriter;
  limiter: DailyLimiter;
  dailyLimit: number;
  clock?: Clock;
  onError?: (error: unknown, context: Record<string, unknown>) => void;
};

const utcClock: Clock = { today: () => new Date().toISOString().slice(0, 10) };

/**
 * Business rules for posts. No Next.js, no SQL, no SDK: everything comes in
 * through ports, so the rules are unit-tested with fakes in milliseconds.
 */
export function createPostService({ store, writer, limiter, dailyLimit, clock = utcClock, onError }: Deps) {
  return {
    dailyLimit,
    list: (userId: string) => store.listByUser(userId),

    async usage(userId: string) {
      const used = await limiter.used(userId, clock.today());
      return { used, limit: dailyLimit, remaining: Math.max(0, dailyLimit - used) };
    },

    /**
     * Validates, takes one credit, then returns the AI text as a stream. The
     * post is saved when the stream finishes; if the AI fails, the credit is
     * given back so users never pay for an error.
     */
    async generate(userId: string, raw: unknown, signal?: AbortSignal): Promise<Result<AsyncIterable<string>, PostError>> {
      const parsed = GenerateSchema.safeParse(raw);
      if (!parsed.success) return err("INVALID_INPUT", parsed.error.issues[0].message);
      const req = parsed.data;

      const day = clock.today();
      if (!(await limiter.take(userId, day, dailyLimit))) {
        return err("LIMIT_REACHED", `You've used all ${dailyLimit} posts for today. Come back tomorrow.`);
      }

      async function* run(): AsyncGenerator<string> {
        let body = "";
        try {
          for await (const chunk of writer.stream(instructions(req), input(req), { signal })) {
            body += chunk;
            yield chunk;
          }
          // The reader left before the end: don't charge them or save half a post.
          if (signal?.aborted) {
            await limiter.give(userId, day);
            return;
          }
          if (!body.trim()) throw new Error("The model returned an empty post");
        } catch (error) {
          await limiter.give(userId, day);
          onError?.(error, { userId, model: writer.model });
          throw error;
        }
        const saved = await store.create({ userId, topic: req.topic, tone: req.tone, length: req.length, body: body.trim(), model: writer.model });
        yield SAVED_MARKER + JSON.stringify({ id: saved.id });
      }
      return ok(run());
    },

    async update(userId: string, raw: unknown): Promise<Result<Post, PostError>> {
      const parsed = UpdateSchema.safeParse(raw);
      if (!parsed.success) return err("INVALID_INPUT", parsed.error.issues[0].message);
      const post = await store.updateBody(userId, parsed.data.id, parsed.data.body);
      return post ? ok(post) : err("NOT_FOUND", "That post no longer exists.");
    },

    remove: (userId: string, id: string) => store.remove(userId, id),
  };
}

export type PostService = ReturnType<typeof createPostService>;
