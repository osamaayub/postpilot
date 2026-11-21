import { describe, expect, it } from "vitest";
import { codeForStatus, isWriterError, WriterError } from "@/features/posts/domain/writer-error";
import { toWriterError } from "@/features/posts/writers/openai";

describe("codeForStatus", () => {
  it("maps provider HTTP errors to clear codes", () => {
    expect(codeForStatus(401)).toBe("AUTH");
    expect(codeForStatus(403)).toBe("AUTH");
    expect(codeForStatus(429)).toBe("QUOTA");
    expect(codeForStatus(404)).toBe("MODEL");
    expect(codeForStatus(400, "The model `gpt-x` does not exist")).toBe("MODEL");
    expect(codeForStatus(400, "bad request")).toBe("UNAVAILABLE");
    expect(codeForStatus(500)).toBe("UNAVAILABLE");
    expect(codeForStatus(undefined)).toBe("UNAVAILABLE");
  });
});

describe("isWriterError", () => {
  it("recognises WriterErrors without relying on instanceof", () => {
    expect(isWriterError(new WriterError("QUOTA"))).toBe(true);
    const copy = Object.assign(new Error("x"), { name: "WriterError", code: "AUTH" }); // as if from a second module copy
    expect(isWriterError(copy)).toBe(true);
    expect(isWriterError(new Error("boom"))).toBe(false);
    expect(isWriterError(Object.assign(new Error("x"), { name: "WriterError", code: "NOPE" }))).toBe(false);
  });
});

describe("toWriterError", () => {
  it("wraps SDK errors and keeps the original as the cause", () => {
    const sdkError = Object.assign(new Error("Incorrect API key provided"), { status: 401 });
    const e = toWriterError(sdkError) as WriterError;
    expect(e).toBeInstanceOf(WriterError);
    expect(e.code).toBe("AUTH");
    expect(e.message).not.toContain("Incorrect API key"); // provider details stay in logs, not the UI
    expect(e.cause).toBe(sdkError);
  });

  it("treats network failures as UNAVAILABLE and leaves aborts alone", () => {
    expect((toWriterError(new TypeError("fetch failed")) as WriterError).code).toBe("UNAVAILABLE");
    const controller = new AbortController();
    controller.abort();
    const abort = new DOMException("aborted", "AbortError");
    expect(toWriterError(abort, controller.signal)).toBe(abort);
  });
});
