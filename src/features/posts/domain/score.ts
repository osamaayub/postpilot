import { hookOf } from "./fold";

export type CheckId = "hook" | "fold" | "question" | "paragraphs" | "length" | "hashtags";
export type Check = { id: CheckId; label: string; pass: boolean; tip: string };
export type PostScore = { score: number; checks: Check[]; words: number };

const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

/**
 * Scores a LinkedIn post against simple, explainable rules. Pure function: no AI call,
 * so it is free, instant and the same every time.
 */
export function scorePost(body: string): PostScore {
  const text = body.trim();
  const hook = hookOf(text);
  const hookWords = words(hook);
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const lastLine = text.split("\n").map((l) => l.trim()).filter(Boolean).at(-1) ?? "";
  const total = words(text);
  const hashtags = (text.match(/(^|\s)#[\p{L}\p{N}_]+/gu) ?? []).length;

  const checks: Check[] = [
    { id: "hook", label: "Hook under 12 words", pass: hookWords >= 3 && hookWords <= 12, tip: "Make the first line short and specific: 3 to 12 words." },
    { id: "fold", label: "Hook fits before \"see more\"", pass: hook.length > 0 && hook.length <= 150, tip: "Keep the first line under 150 characters so it shows in full." },
    { id: "question", label: "Ends with a question", pass: lastLine.endsWith("?"), tip: "Finish with a question to invite comments." },
    { id: "paragraphs", label: "Short paragraphs", pass: paragraphs.length >= 2 && paragraphs.every((p) => p.length <= 280), tip: "Split long blocks: one idea per paragraph, with a blank line between." },
    { id: "length", label: "Easy-to-read length", pass: total >= 40 && total <= 250, tip: "Aim for 40 to 250 words." },
    { id: "hashtags", label: "Three hashtags or fewer", pass: hashtags <= 3, tip: "Use at most three hashtags; more looks like spam." },
  ];

  const passed = checks.filter((c) => c.pass).length;
  return { score: text ? Math.round((passed / checks.length) * 100) : 0, checks, words: total };
}

/** Label and colour band for a score, for the UI. */
export const scoreBand = (score: number) => (score >= 80 ? "great" : score >= 50 ? "good" : "weak") as "great" | "good" | "weak";
