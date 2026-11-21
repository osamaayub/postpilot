import { describe, expect, it, vi } from "vitest";
import { SAVED_MARKER } from "@/features/posts/marker";
import type { DailyLimiter, PostStore, PostWriter } from "@/features/posts/ports";
import { createPostService } from "@/features/posts/service";
import type { Post } from "@/features/posts/types";

const TOPIC = { topic: "Why I write tests first", tone: "practical", length: "short" };

function memoryStore(): PostStore & { rows: Post[] } {
  const rows: Post[] = [];
  return {
    rows,
    listByUser: async (u) => rows.filter((r) => r.userId === u),
    create: async (p) => { const row = { ...p, id: crypto.randomUUID(), createdAt: new Date(), updatedAt: new Date() } as Post; rows.push(row); return row; },
    updateBody: async (u, id, body) => { const r = rows.find((x) => x.id === id && x.userId === u); if (!r) return null; r.body = body; return r; },
    remove: async (u, id) => { const i = rows.findIndex((x) => x.id === id && x.userId === u); if (i < 0) return false; rows.splice(i, 1); return true; },
  };
}

function memoryLimiter(): DailyLimiter & { counts: Map<string, number> } {
  const counts = new Map<string, number>();
  const k = (u: string, d: string) => `${u}:${d}`;
  return {
    counts,
    take: async (u, d, limit) => { const n = counts.get(k(u, d)) ?? 0; if (n >= limit) return false; counts.set(k(u, d), n + 1); return true; },
    give: async (u, d) => { counts.set(k(u, d), Math.max(0, (counts.get(k(u, d)) ?? 0) - 1)); },
    used: async (u, d) => counts.get(k(u, d)) ?? 0,
  };
}

const writer = (chunks: string[], failAfter?: number): PostWriter => ({
  model: "fake",
  async *stream() {
    for (const [i, c] of chunks.entries()) {
      if (failAfter !== undefined && i === failAfter) throw new Error("boom");
      yield c;
    }
  },
});

const clock = { today: () => "2026-11-21" };
const setup = (w: PostWriter = writer(["Hook line\n\n", "Body."]), dailyLimit = 2) => {
  const store = memoryStore(), limiter = memoryLimiter(), onError = vi.fn();
  return { store, limiter, onError, service: createPostService({ store, writer: w, limiter, dailyLimit, clock, onError }) };
};

async function drain(it: AsyncIterable<string>) {
  let out = "";
  for await (const c of it) out += c;
  return out;
}

describe("postService.generate", () => {
  it("streams the text, saves the post and ends with its id", async () => {
    const { service, store } = setup();
    const r = await service.generate("u1", TOPIC);
    if (!r.ok) throw new Error(r.message);
    const out = await drain(r.value);
    const [text, meta] = out.split(SAVED_MARKER);
    expect(text).toBe("Hook line\n\nBody.");
    expect(store.rows).toHaveLength(1);
    expect(JSON.parse(meta).id).toBe(store.rows[0].id);
    expect(store.rows[0]).toMatchObject({ userId: "u1", tone: "practical", body: "Hook line\n\nBody.", model: "fake" });
  });

  it("rejects bad input without using a credit", async () => {
    const { service, limiter } = setup();
    expect(await service.generate("u1", { topic: "no" })).toMatchObject({ ok: false, error: "INVALID_INPUT" });
    expect(await limiter.used("u1", clock.today())).toBe(0);
  });

  it("stops at the daily limit", async () => {
    const { service } = setup(undefined, 1);
    const first = await service.generate("u1", TOPIC);
    if (first.ok) await drain(first.value);
    expect(await service.generate("u1", TOPIC)).toMatchObject({ ok: false, error: "LIMIT_REACHED" });
  });

  it("gives the credit back and saves nothing when the AI fails", async () => {
    const { service, store, limiter, onError } = setup(writer(["Hook", "more"], 1));
    const r = await service.generate("u1", TOPIC);
    if (!r.ok) throw new Error(r.message);
    await expect(drain(r.value)).rejects.toThrow("boom");
    expect(await limiter.used("u1", clock.today())).toBe(0);
    expect(store.rows).toHaveLength(0);
    expect(onError).toHaveBeenCalledOnce();
  });

  it("gives the credit back and saves nothing when the reader leaves early", async () => {
    const controller = new AbortController();
    const slow: PostWriter = { model: "fake", async *stream() { yield "Hook"; controller.abort(); yield " rest"; } };
    const { service, store, limiter } = setup(slow);
    const r = await service.generate("u1", TOPIC, controller.signal);
    if (!r.ok) throw new Error(r.message);
    await drain(r.value);
    expect(store.rows).toHaveLength(0);
    expect(await limiter.used("u1", clock.today())).toBe(0);
  });
});

describe("postService.update and remove", () => {
  it("only changes the owner's post", async () => {
    const { service, store } = setup();
    const r = await service.generate("u1", TOPIC);
    if (r.ok) await drain(r.value);
    const id = store.rows[0].id;
    expect(await service.update("u2", { id, body: "hacked" })).toMatchObject({ ok: false, error: "NOT_FOUND" });
    expect(await service.update("u1", { id, body: "  edited  " })).toMatchObject({ ok: true });
    expect(store.rows[0].body).toBe("edited");
    expect(await service.remove("u2", id)).toBe(false);
    expect(await service.remove("u1", id)).toBe(true);
  });

  it("rejects an empty edit", async () => {
    const { service } = setup();
    expect(await service.update("u1", { id: crypto.randomUUID(), body: "   " })).toMatchObject({ ok: false, error: "INVALID_INPUT" });
  });
});
