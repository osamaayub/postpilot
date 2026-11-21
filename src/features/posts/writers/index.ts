import "server-only";
import { env } from "@/lib/env";
import type { PostWriter } from "../ports";
import { DemoWriter } from "./demo";
import { OpenAIWriter } from "./openai";

/** Real AI when a key is set, otherwise the free demo writer. */
export function getWriter(): PostWriter {
  const { OPENAI_API_KEY, OPENAI_MODEL } = env();
  return OPENAI_API_KEY ? new OpenAIWriter(OPENAI_API_KEY, OPENAI_MODEL) : new DemoWriter();
}

export const isDemoWriter = () => !env().OPENAI_API_KEY;
