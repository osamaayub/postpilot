import type { Length, Tone } from "./schemas";

export type Post = {
  id: string;
  userId: string;
  topic: string;
  tone: Tone;
  length: Length;
  body: string;
  model: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewPost = Omit<Post, "id" | "createdAt" | "updatedAt">;
