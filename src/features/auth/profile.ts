import { z } from "zod";
import { LENGTHS, TONES } from "@/features/posts/schemas";

export const HEADLINE_MAX = 100;

/** Profile form rules. An empty headline means "use the default". */
export const ProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Keep your name under 80 characters"),
  headline: z.string().trim().max(HEADLINE_MAX, `Keep your headline under ${HEADLINE_MAX} characters`).transform((v) => v || null),
  defaultTone: z.enum(TONES, "Pick a tone"),
  defaultLength: z.enum(LENGTHS, "Pick a length"),
});
