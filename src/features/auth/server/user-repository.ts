import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { users } from "@/server/schema";

export type PublicUser = { id: string; name: string; email: string };
const publicCols = { id: users.id, name: users.name, email: users.email };

export const userRepository = {
  async findById(id: string): Promise<PublicUser | null> {
    const db = await getDb();
    const [row] = await db.select(publicCols).from(users).where(eq(users.id, id));
    return row ?? null;
  },
  async findCredentials(email: string) {
    const db = await getDb();
    const [row] = await db.select({ id: users.id, passwordHash: users.passwordHash }).from(users).where(eq(users.email, email));
    return row ?? null;
  },
  /** Returns null when the email is taken (the unique index decides, so two signups can't race). */
  async create(input: { name: string; email: string; passwordHash: string }): Promise<PublicUser | null> {
    const db = await getDb();
    const [row] = await db.insert(users).values(input).onConflictDoNothing({ target: users.email }).returning(publicCols);
    return row ?? null;
  },
};
