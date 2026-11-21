import { z } from "zod";

export const TONES = ["practical", "story", "bold", "friendly"] as const;
export const LENGTHS = ["short", "medium", "long"] as const;
export type Tone = (typeof TONES)[number];
export type Length = (typeof LENGTHS)[number];

export const TOPIC_MIN = 8;
export const TOPIC_MAX = 200;
export const BODY_MAX = 3000; // LinkedIn's post limit

export const GenerateSchema = z.object({
  topic: z.string().trim().min(TOPIC_MIN, "Describe your idea in a few more words").max(TOPIC_MAX, `Keep the idea under ${TOPIC_MAX} characters`),
  tone: z.enum(TONES).catch("practical"),
  length: z.enum(LENGTHS).catch("medium"),
});
export type GenerateInput = z.infer<typeof GenerateSchema>;

export const UpdateSchema = z.object({
  id: z.uuid("Unknown post"),
  body: z.string().trim().min(1, "A post can't be empty").max(BODY_MAX, `LinkedIn allows ${BODY_MAX.toLocaleString("en-US")} characters`),
});
