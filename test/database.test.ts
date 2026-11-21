import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { sql } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { drizzlePostStore } from "@/features/posts/repository";
import type { DB } from "@/server/db";
import { DDL } from "@/server/ddl";
import { postgresDailyLimiter } from "@/server/rate-limit";
import * as schema from "@/server/schema";

// Real PostgreSQL (PGlite) so the atomic upsert and the owner scoping are tested for real.
const db = drizzle(new PGlite(), { schema }) as unknown as DB;
let a = "", b = "";

beforeAll(async () => {
  for (const stmt of DDL.split("\n").map((l) => l.trim()).filter(Boolean)) await db.execute(sql.raw(stmt));
  const rows = await db.insert(schema.users).values([
    { name: "A", email: "a@example.com", passwordHash: "x" },
    { name: "B", email: "b@example.com", passwordHash: "x" },
  ]).returning({ id: schema.users.id });
  [a, b] = rows.map((r) => r.id);
});

describe("postgresDailyLimiter", () => {
  it("never hands out more credits than the limit, even when asked all at once", async () => {
    const limiter = postgresDailyLimiter(db);
    const results = await Promise.all(Array.from({ length: 10 }, () => limiter.take(a, "2026-11-21", 3)));
    expect(results.filter(Boolean)).toHaveLength(3);
    expect(await limiter.used(a, "2026-11-21")).toBe(3);
  });

  it("gives a credit back and counts each day separately", async () => {
    const limiter = postgresDailyLimiter(db);
    await limiter.give(a, "2026-11-21");
    expect(await limiter.used(a, "2026-11-21")).toBe(2);
    expect(await limiter.take(a, "2026-11-22", 3)).toBe(true);
    expect(await limiter.used(a, "2026-11-22")).toBe(1);
  });
});

describe("drizzlePostStore", () => {
  it("scopes every query to the owner", async () => {
    const store = drizzlePostStore(db);
    const post = await store.create({ userId: a, topic: "t", tone: "practical", length: "short", body: "Hello", model: "demo" });
    expect((await store.listByUser(a)).map((p) => p.id)).toContain(post.id);
    expect(await store.listByUser(b)).toHaveLength(0);
    expect(await store.updateBody(b, post.id, "hacked")).toBeNull();
    expect(await store.remove(b, post.id)).toBe(false);
    expect((await store.updateBody(a, post.id, "Edited"))?.body).toBe("Edited");
    expect(await store.remove(a, post.id)).toBe(true);
  });
});
