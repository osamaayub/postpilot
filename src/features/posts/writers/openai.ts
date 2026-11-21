import "server-only";
import OpenAI from "openai";
import { codeForStatus, isWriterError, WriterError } from "../domain/writer-error";
import type { PostWriter } from "../ports";

/** Turns an OpenAI SDK error into a WriterError. Aborts pass through untouched. */
export function toWriterError(error: unknown, signal?: AbortSignal): unknown {
  if (signal?.aborted || isWriterError(error)) return error;
  const { status, message } = (error ?? {}) as { status?: unknown; message?: unknown };
  return new WriterError(codeForStatus(typeof status === "number" ? status : undefined, typeof message === "string" ? message : ""), { cause: error });
}

/** Streams text from the OpenAI Responses API. The key stays on the server. */
export class OpenAIWriter implements PostWriter {
  private readonly client: OpenAI;

  constructor(apiKey: string, readonly model: string) {
    this.client = new OpenAI({ apiKey, maxRetries: 2, timeout: 60_000 });
  }

  async *stream(instructions: string, input: string, opts?: { signal?: AbortSignal }) {
    try {
      const events = await this.client.responses.create({ model: this.model, instructions, input, stream: true }, { signal: opts?.signal });
      for await (const event of events) {
        if (event.type === "response.output_text.delta") yield event.delta;
      }
    } catch (error) {
      throw toWriterError(error, opts?.signal);
    }
  }
}
