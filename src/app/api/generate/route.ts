import { findCurrentUser } from "@/features/auth/server/current-user";
import { isWriterError } from "@/features/posts/domain/writer-error";
import { postService } from "@/features/posts/server";

/**
 * Streams a new post as plain text. A Route Handler (not a Server Action)
 * because the browser needs to read the response while it is still arriving.
 */
export async function POST(req: Request) {
  const user = await findCurrentUser();
  if (!user) return Response.json({ message: "Please sign in again." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const service = await postService();
  const result = await service.generate(user.id, body, req.signal);
  if (!result.ok) return Response.json({ message: result.message }, { status: result.error === "LIMIT_REACHED" ? 429 : 400 });

  // Wait for the first chunk before answering, so a rejected AI request becomes a clear
  // JSON error (the credit is already given back) instead of a broken stream.
  const iterator = result.value[Symbol.asyncIterator]();
  let first: IteratorResult<string>;
  try {
    first = await iterator.next();
  } catch (error) {
    const known = isWriterError(error);
    return Response.json(
      { message: known ? error.message : "The AI request failed. Please try again.", code: known ? error.code : "UNKNOWN" },
      { status: known && error.code === "UNAVAILABLE" ? 503 : 502 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      if (first.done) controller.close();
      else controller.enqueue(encoder.encode(first.value));
    },
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        if (done) controller.close();
        else controller.enqueue(encoder.encode(value));
      } catch {
        controller.error(new Error("generation failed"));
      }
    },
    async cancel() {
      await iterator.return?.();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
