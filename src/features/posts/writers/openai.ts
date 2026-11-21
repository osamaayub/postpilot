import "server-only";
import OpenAI from "openai";
import type { PostWriter } from "../ports";

/** Streams text from the OpenAI Responses API. The key stays on the server. */
export class OpenAIWriter implements PostWriter {
  private readonly client: OpenAI;

  constructor(apiKey: string, readonly model: string) {
    this.client = new OpenAI({ apiKey, maxRetries: 2, timeout: 60_000 });
  }

  async *stream(instructions: string, input: string, opts?: { signal?: AbortSignal }) {
    const events = await this.client.responses.create({ model: this.model, instructions, input, stream: true }, { signal: opts?.signal });
    for await (const event of events) {
      if (event.type === "response.output_text.delta") yield event.delta;
    }
  }
}
