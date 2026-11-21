import type { GenerateInput, Length, Tone } from "../schemas";

const WORDS: Record<Length, string> = { short: "40 to 70", medium: "80 to 140", long: "150 to 220" };
const VOICE: Record<Tone, string> = {
  practical: "clear and useful, like a senior engineer sharing a tip",
  story: "a short personal story with a lesson at the end",
  bold: "confident and direct, with one strong opinion",
  friendly: "warm and conversational",
};

/** System instructions for the model. Pure function, so it is easy to test and to tweak. */
export function instructions({ tone, length }: Pick<GenerateInput, "tone" | "length">) {
  return [
    "You write LinkedIn posts for developers and freelancers.",
    `Voice: ${VOICE[tone]}.`,
    `Length: ${WORDS[length]} words.`,
    "The first line is a hook under 12 words that makes people tap \"see more\".",
    "Use short paragraphs separated by blank lines. Plain text only: no markdown, no hashtags, no emojis.",
    "Never invent numbers, clients or results the user did not give you.",
  ].join("\n");
}

export const input = ({ topic }: Pick<GenerateInput, "topic">) => `Write a post about: ${topic}`;
