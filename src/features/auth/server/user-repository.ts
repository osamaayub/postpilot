import "server-only";
import { eq } from "drizzle-orm";
import { LENGTHS, TONES, type Length, type Tone } from "@/features/posts/schemas";
import { getDb } from "@/server/db";
import { users } from "@/server/schema";

export type PublicUser = { id: string; name: string; email: string; headline: string | null; defaultTone: Tone; defaultLength: Length };
export type ProfileUpdate = { name: string; headline: string | null; defaultTone: Tone; defaultLength: Length };

const publicCols = { id: users.id, name: users.name, email: users.email, headline: users.headline, defaultTone: users.defaultTone, defaultLength: users.defaultLength };
type Row = { id: string; name: string; email: string; headline: string | null; defaultTone: string; defaultLength: string };

// The columns are plain text in the database; narrow them safely on the way out.
const toPublic = (r: Row): PublicUser => ({
  ...r,
  defaultTone: (TONES as readonly string[]).includes(r.defaultTone) ? (r.defaultTone as Tone) : "practical",
  defaultLength: (LENGTHS as readonly string[]).includes(r.defaultLength) ? (r.defaultLength as Length) : "medium",
});

export const userRepository = {
  async findById(id: string): Promise<PublicUser | null> {
    const db = await getDb();
    const [row] = await db.select(publicCols).from(users).where(eq(users.id, id));
    return row ? toPublic(row) : null;
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
    return row ? toPublic(row) : null;
  },
  async updateProfile(id: string, profile: ProfileUpdate): Promise<PublicUser | null> {
    const db = await getDb();
    const [row] = await db.update(users).set(profile).where(eq(users.id, id)).returning(publicCols);
    return row ? toPublic(row) : null;
  },
};
