import "server-only";
import { and, eq, sql } from "drizzle-orm";
import type { DailyLimiter } from "@/features/posts/ports";
import type { DB } from "./db";
import { usage } from "./schema";

/**
 * Daily limit in one atomic statement. The WHERE on the conflict branch means
 * two requests at the same moment can never both take the last credit.
 */
export function postgresDailyLimiter(db: DB): DailyLimiter {
  return {
    async take(userId, day, limit) {
      const rows = await db.execute(sql`
        INSERT INTO usage (user_id, day, count) VALUES (${userId}, ${day}, 1)
        ON CONFLICT (user_id, day) DO UPDATE SET count = usage.count + 1
        WHERE usage.count < ${limit}
        RETURNING count`);
      const list = (rows as unknown as { rows: { count: number }[] }).rows;
      return list.length > 0 && list[0].count <= limit;
    },
    async give(userId, day) {
      await db.update(usage).set({ count: sql`GREATEST(${usage.count} - 1, 0)` }).where(and(eq(usage.userId, userId), eq(usage.day, day)));
    },
    async used(userId, day) {
      const [row] = await db.select({ count: usage.count }).from(usage).where(and(eq(usage.userId, userId), eq(usage.day, day)));
      return row?.count ?? 0;
    },
  };
}
