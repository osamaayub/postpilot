import "server-only";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getDb } from "@/server/db";
import { postgresDailyLimiter } from "@/server/rate-limit";
import { drizzlePostStore } from "./repository";
import { createPostService, type PostService } from "./service";
import { getWriter } from "./writers";

const g = globalThis as unknown as { __postService?: Promise<PostService> };

/** Composition root: the only place that wires real adapters into the service. */
export function postService(): Promise<PostService> {
  g.__postService ??= getDb().then((db) =>
    createPostService({
      store: drizzlePostStore(db),
      writer: getWriter(),
      limiter: postgresDailyLimiter(db),
      dailyLimit: env().DAILY_POST_LIMIT,
      onError: (error, ctx) => logger.error("post.generate_failed", { ...ctx, error: String(error) }),
    }),
  );
  return g.__postService;
}

export { isDemoWriter } from "./writers";
