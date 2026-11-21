import { describe, expect, it } from "vitest";
import { ProfileSchema } from "@/features/auth/profile";

describe("ProfileSchema", () => {
  it("trims values and stores an empty headline as null", () => {
    expect(ProfileSchema.parse({ name: "  Osama Ayub ", headline: "   ", defaultTone: "story", defaultLength: "short" }))
      .toEqual({ name: "Osama Ayub", headline: null, defaultTone: "story", defaultLength: "short" });
  });

  it("rejects unknown tones, short names and long headlines", () => {
    expect(ProfileSchema.safeParse({ name: "Osama", headline: "", defaultTone: "angry", defaultLength: "short" }).success).toBe(false);
    expect(ProfileSchema.safeParse({ name: "O", headline: "", defaultTone: "story", defaultLength: "short" }).success).toBe(false);
    expect(ProfileSchema.safeParse({ name: "Osama", headline: "x".repeat(101), defaultTone: "story", defaultLength: "short" }).success).toBe(false);
  });
});
