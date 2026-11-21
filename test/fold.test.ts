import { describe, expect, it } from "vitest";
import { foldPost, hookOf } from "@/features/posts/domain/fold";

describe("foldPost", () => {
  it("keeps short posts unfolded", () => {
    expect(foldPost("One line.\n\nTwo.")).toEqual({ visible: "One line.\n\nTwo.", hidden: "", folded: false });
  });

  it("folds after three lines", () => {
    const f = foldPost("Hook\nline 2\nline 3\nline 4\nline 5");
    expect(f.visible).toBe("Hook\nline 2\nline 3");
    expect(f.hidden).toBe("line 4\nline 5");
    expect(f.folded).toBe(true);
  });

  it("folds long single paragraphs at about 210 characters without cutting a word", () => {
    const body = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");
    const f = foldPost(body);
    expect(f.visible.length).toBeLessThanOrEqual(210);
    expect(body.startsWith(f.visible)).toBe(true);
    expect(body[f.visible.length]).toBe(" ");
    expect(f.visible + " " + f.hidden).toBe(body);
  });

  it("finds the hook", () => {
    expect(hookOf("  The hook\nThe rest")).toBe("The hook");
  });
});
