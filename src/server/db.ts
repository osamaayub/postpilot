import "server-only";
import { sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { DDL } from "./ddl";
import * as schema from "./schema";
import { seedDemo } from "./seed";

export type DB = PgDatabase<PgQueryResultHKT, typeof schema>;

/** Creates the tables if needed. Safe on every cold start: an advisory lock stops parallel starts racing. */
async function prepare(db: DB, demo: boolean) {
  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(4270001)`);
    for (const stmt of DDL.split("\n").map((l) => l.trim()).filter(Boolean)) await tx.execute(sql.raw(stmt));
  });
  if (demo) await seedDemo(db);
  return db;
}

/** Real PostgreSQL (local, Neon, Supabase, RDS...). */
async function connectPostgres(url: string): Promise<DB> {
  const [{ Pool }, { drizzle }] = await Promise.all([import("pg"), import("drizzle-orm/node-postgres")]);
  const local = /localhost|127\.0\.0\.1/.test(url);
  const pool = new Pool({ connectionString: url, max: 5, ssl: local ? undefined : { rejectUnauthorized: true } });
  return prepare(drizzle(pool, { schema }) as unknown as DB, false);
}

/** No DATABASE_URL: Postgres compiled to WebAssembly (PGlite), in memory, with a demo account. */
async function demoDatabase(): Promise<DB> {
  const [{ PGlite }, { drizzle }] = await Promise.all([import("@electric-sql/pglite"), import("drizzle-orm/pglite")]);
  logger.info("db.demo", { note: "DATABASE_URL not set: using in-memory PGlite with demo data" });
  return prepare(drizzle(new PGlite(), { schema }) as unknown as DB, true);
}

const g = globalThis as unknown as { __postpilotDb?: Promise<DB> };

/** One pool (or demo database) per server instance, shared by every request. */
export function getDb(): Promise<DB> {
  const url = env().DATABASE_URL;
  g.__postpilotDb ??= (url ? connectPostgres(url) : demoDatabase()).catch((e) => {
    g.__postpilotDb = undefined; // let the next request retry instead of caching the failure
    throw e;
  });
  return g.__postpilotDb;
}
