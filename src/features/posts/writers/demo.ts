import type { PostWriter } from "../ports";

const OPENERS = ["Here's what nobody tells you about", "I learned this the hard way:", "One small change made a big difference:", "Quick lesson from this week:"];

/**
 * Free, offline writer for demos and tests. It builds a simple post from the
 * topic and streams it word by word, so the UI behaves exactly like real AI.
 */
export class DemoWriter implements PostWriter {
  readonly model = "demo";
  constructor(private readonly delayMs = 18) {}

  async *stream(_instructions: string, input: string, opts?: { signal?: AbortSignal }) {
    const topic = input.replace(/^Write a post about:\s*/i, "").trim().replace(/[.!?]+$/, "");
    const opener = OPENERS[topic.length % OPENERS.length];
    const text = [
      `${opener} ${topic.charAt(0).toLowerCase()}${topic.slice(1)}.`,
      "Most people overthink the first step. I did too.",
      "What worked for me:\n- Start with the smallest useful version\n- Share it before it feels ready\n- Ask one person for honest feedback",
      "Progress beats perfect. Every single time.",
      "What would you add?",
      "(Demo mode: add OPENAI_API_KEY for real AI posts.)",
    ].join("\n\n");
    for (const word of text.split(/(?<=\s)/)) {
      if (opts?.signal?.aborted) return;
      if (this.delayMs) await new Promise((r) => setTimeout(r, this.delayMs));
      yield word;
    }
  }
}
