/** Why the AI could not write a post. Adapters translate their SDK errors into these codes. */
export type WriterErrorCode = "AUTH" | "QUOTA" | "MODEL" | "UNAVAILABLE";

const MESSAGES: Record<WriterErrorCode, string> = {
  AUTH: "The AI service rejected this app's API key.",
  QUOTA: "The AI service is out of credit or rate limited. Please try again later.",
  MODEL: "The AI model isn't available for this API key.",
  UNAVAILABLE: "The AI service isn't responding. Please try again.",
};

export class WriterError extends Error {
  constructor(readonly code: WriterErrorCode, options?: { cause?: unknown }) {
    super(MESSAGES[code], options);
    this.name = "WriterError";
  }
}

/**
 * True for a WriterError. Checks the name and code instead of instanceof, because the
 * bundler can load this module more than once (route handler vs. server chunk).
 */
export function isWriterError(error: unknown): error is WriterError {
  return error instanceof Error && error.name === "WriterError" && typeof (error as WriterError).code === "string" && (error as WriterError).code in MESSAGES;
}

/** Maps an HTTP status from an AI provider to a WriterError code. */
export function codeForStatus(status: number | undefined, message = ""): WriterErrorCode {
  if (status === 401 || status === 403) return "AUTH";
  if (status === 429) return "QUOTA";
  if (status === 404 || (status === 400 && /model/i.test(message))) return "MODEL";
  return "UNAVAILABLE";
}
