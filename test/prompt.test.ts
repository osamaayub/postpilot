import { describe, expect, it } from "vitest";
import { input, instructions } from "@/features/posts/domain/prompt";
import { GenerateSchema } from "@/features/posts/schemas";

describe("prompt", () => {
  it("includes tone, length and the honesty rule", () => {
    const text = instructions({ tone: "story", length: "short" });
    expect(text).toContain("personal story");
    expect(text).toContain("40 to 70 words");
    expect(text).toContain("Never invent numbers");
  });

  it("wraps the topic", () => {
    expect(input({ topic: "Testing first" })).toBe("Write a post about: Testing first");
  });
});

describe("GenerateSchema", () => {
  it("trims the topic and falls back for unknown tone and length", () => {
    expect(GenerateSchema.parse({ topic: "  shipping a SaaS  ", tone: "angry", length: "huge" })).toEqual({ topic: "shipping a SaaS", tone: "practical", length: "medium" });
  });

  it("rejects a topic that is too short", () => {
    expect(GenerateSchema.safeParse({ topic: "hi" }).success).toBe(false);
  });
});
