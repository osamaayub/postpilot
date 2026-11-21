import type { NewPost, Post } from "./types";

/** Storage for posts. Implemented with Drizzle in repository.ts and with an array in tests. */
export interface PostStore {
  listByUser(userId: string): Promise<Post[]>;
  create(post: NewPost): Promise<Post>;
  updateBody(userId: string, id: string, body: string): Promise<Post | null>;
  remove(userId: string, id: string): Promise<boolean>;
}

/** Something that writes a post as a stream of text chunks: OpenAI, or the free demo writer. */
export interface PostWriter {
  readonly model: string;
  stream(instructions: string, input: string, opts?: { signal?: AbortSignal }): AsyncIterable<string>;
}

/** Per-user daily credits. take() must be atomic. */
export interface DailyLimiter {
  take(userId: string, day: string, limit: number): Promise<boolean>;
  give(userId: string, day: string): Promise<void>;
  used(userId: string, day: string): Promise<number>;
}

export interface Clock {
  /** Today as YYYY-MM-DD (UTC). */
  today(): string;
}
