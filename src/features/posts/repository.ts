import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import type { DB } from "@/server/db";
import { posts } from "@/server/schema";
import type { PostStore } from "./ports";
import type { Post } from "./types";

/** All post SQL lives here. Every query is scoped to the owner, so one user can never touch another's posts. */
export function drizzlePostStore(db: DB): PostStore {
  const mine = (userId: string, id: string) => and(eq(posts.id, id), eq(posts.userId, userId));
  return {
    async listByUser(userId) {
      return (await db.select().from(posts).where(eq(posts.userId, userId)).orderBy(desc(posts.createdAt)).limit(100)) as Post[];
    },
    async create(post) {
      const [row] = await db.insert(posts).values(post).returning();
      return row as Post;
    },
    async updateBody(userId, id, body) {
      const [row] = await db.update(posts).set({ body, updatedAt: sql`now()` }).where(mine(userId, id)).returning();
      return (row as Post | undefined) ?? null;
    },
    async remove(userId, id) {
      const rows = await db.delete(posts).where(mine(userId, id)).returning({ id: posts.id });
      return rows.length > 0;
    },
  };
}
