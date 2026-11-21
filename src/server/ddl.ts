/**
 * Creates the schema if it is missing, and adds newer columns to older databases.
 * One statement per line: PGlite runs them one at a time.
 */
export const DDL = `
CREATE TABLE IF NOT EXISTS users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, email text NOT NULL UNIQUE, password_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())
CREATE TABLE IF NOT EXISTS posts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, topic text NOT NULL, tone text NOT NULL, length text NOT NULL, body text NOT NULL, model text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())
ALTER TABLE users ADD COLUMN IF NOT EXISTS headline text
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_tone text NOT NULL DEFAULT 'practical'
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_length text NOT NULL DEFAULT 'medium'
CREATE INDEX IF NOT EXISTS posts_user_created_idx ON posts (user_id, created_at)
CREATE TABLE IF NOT EXISTS usage (user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, day date NOT NULL, count integer NOT NULL DEFAULT 0, PRIMARY KEY (user_id, day))
`;
