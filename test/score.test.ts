import { describe, expect, it } from "vitest";
import { scoreBand, scorePost } from "@/features/posts/domain/score";

const GOOD = [
  "I deleted 6 API routes this week.",
  "",
  "Server Actions now handle every form in my Next.js app. Validation runs on the server with Zod, errors are returned instead of thrown, and the pending state comes from useActionState.",
  "",
  "I still keep API routes for webhooks and streaming responses. Pick the right tool for each job.",
  "",
  "What would you keep as an API route?",
].join("\n");

const pass = (body: string) => Object.fromEntries(scorePost(body).checks.map((c) => [c.id, c.pass]));

describe("scorePost", () => {
  it("gives a well-shaped post a perfect score", () => {
    const s = scorePost(GOOD);
    expect(s.checks.every((c) => c.pass)).toBe(true);
    expect(s.score).toBe(100);
  });

  it("flags a long hook, a missing question and one huge paragraph", () => {
    const body = "This is a very long opening line that rambles on and on without ever getting to the point at all. " + "word ".repeat(60);
    expect(pass(body)).toMatchObject({ hook: false, question: false, paragraphs: false });
    expect(scorePost(body).score).toBeLessThan(50);
  });

  it("counts hashtags and words", () => {
    expect(pass(GOOD + " #nextjs #react #webdev #typescript").hashtags).toBe(false);
    expect(pass(GOOD + " #nextjs #react").hashtags).toBe(true);
    expect(scorePost("one two three").words).toBe(3);
  });

  it("scores an empty post as 0", () => {
    expect(scorePost("   ").score).toBe(0);
  });
});

describe("scoreBand", () => {
  it("maps scores to bands", () => {
    expect(scoreBand(100)).toBe("great");
    expect(scoreBand(67)).toBe("good");
    expect(scoreBand(33)).toBe("weak");
  });
});
