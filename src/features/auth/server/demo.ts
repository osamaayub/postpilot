import "server-only";
import { env } from "@/lib/env";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/server/seed";

/** The demo login exists only on the built-in demo database, never on a real one. */
export const demoAccount = () => (env().DATABASE_URL ? undefined : { email: DEMO_EMAIL, password: DEMO_PASSWORD });
