import "server-only";
import { z } from "zod";

// Treat empty strings from .env files as "not set".
const optional = z.preprocess((v) => (v === "" ? undefined : v), z.string().optional());

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  DATABASE_URL: optional,
  OPENAI_API_KEY: optional,
  OPENAI_MODEL: z.string().default("gpt-5-mini"),
  DAILY_POST_LIMIT: z.coerce.number().int().min(1).max(1000).default(10),
});

export type Env = z.infer<typeof EnvSchema>;
let cached: Env | undefined;

/** Validated, typed environment, parsed on first use so `next build` needs no secrets. */
export function env(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return (cached = parsed.data);
}
