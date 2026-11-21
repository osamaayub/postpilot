import { afterEach, describe, expect, it, vi } from "vitest";

const base = { SESSION_SECRET: "x".repeat(32) };

describe("env", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

  it("trims whitespace and wrapping quotes from pasted values", async () => {
    vi.stubEnv("SESSION_SECRET", base.SESSION_SECRET);
    vi.stubEnv("OPENAI_API_KEY", '  "sk-test-123"\n');
    const { env } = await import("@/lib/env");
    expect(env().OPENAI_API_KEY).toBe("sk-test-123");
  });

  it("treats blank values as not set", async () => {
    vi.stubEnv("SESSION_SECRET", base.SESSION_SECRET);
    vi.stubEnv("OPENAI_API_KEY", "   ");
    vi.stubEnv("DATABASE_URL", "");
    const { env } = await import("@/lib/env");
    expect(env().OPENAI_API_KEY).toBeUndefined();
    expect(env().DATABASE_URL).toBeUndefined();
  });
});
