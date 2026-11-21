import "server-only";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { DB } from "./db";
import { posts, users } from "./schema";

export const DEMO_EMAIL = "demo@postpilot.dev";
export const DEMO_PASSWORD = "password123";

const SAMPLES: { topic: string; tone: string; length: string; body: string }[] = [
  { topic: "Shipping my first SaaS in 30 days", tone: "story", length: "medium", body: "I gave myself 30 days to ship a SaaS.\n\nDay 1 I had a Figma file. Day 30 I had 14 paying users.\n\nWhat worked:\n- One feature, done well\n- Talking to users every Friday\n- Saying no to dark mode (for now)\n\nWhat didn't: building a settings page nobody opened.\n\nIf you're on day 1, start smaller than feels right." },
  { topic: "Why I write tests before fixing a bug", tone: "practical", length: "short", body: "Every bug I fix starts with a failing test.\n\nIt proves the bug is real, shows when it's fixed, and stops it coming back.\n\nFive minutes now saves an hour next month." },
  { topic: "What freelancing taught me about scope", tone: "bold", length: "medium", body: "\"Can you just add one small thing?\" cost me 40 hours last year.\n\nNow every project has three lists: in scope, out of scope, and later.\n\nClients don't hate boundaries. They hate surprises.\n\nWrite the lists before you write the code." },
  { topic: "Server Actions vs API routes", tone: "practical", length: "medium", body: "I deleted 6 API routes this week.\n\nServer Actions now handle every form in my Next.js app:\n- Validation with Zod on the server\n- Errors returned, not thrown\n- Pending state with useActionState\n\nI still keep API routes for webhooks and streaming. Pick the tool for the job." },
  { topic: "A lesson from a failed launch", tone: "story", length: "long", body: "My launch got 3 signups.\n\nI had spent two months on the product and two hours on the launch. That ratio was the problem.\n\nThis time I'm doing it the other way:\n- Writing in public every week\n- Showing the ugly first version\n- Asking 20 people what they'd pay for\n\nThe product matters. But nobody can buy what they never see.\n\nWhat's the best launch advice you've had?" },
  { topic: "Code review comments that help", tone: "friendly", length: "short", body: "My favourite code review comment: \"What happens if this list is empty?\"\n\nNo blame, no rewrite. Just a question that finds the bug.\n\nAsk more questions in reviews." },
];

/** Demo account with a few posts spread over the last two weeks. Runs only once per database. */
export async function seedDemo(db: DB) {
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, DEMO_EMAIL));
  if (existing.length) return;
  const [user] = await db.insert(users).values({ name: "Demo User", email: DEMO_EMAIL, passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10) }).returning({ id: users.id });
  const now = Date.now();
  await db.insert(posts).values(SAMPLES.map((s, i) => {
    const at = new Date(now - (i * 2 + 1) * 86_400_000);
    return { ...s, userId: user.id, model: "demo", createdAt: at, updatedAt: at };
  }));
}
