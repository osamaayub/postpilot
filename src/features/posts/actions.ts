"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/server/current-user";
import { postService } from "./server";

export type SaveResult = { ok: true } | { ok: false; message: string };

export async function updatePost(id: string, body: string): Promise<SaveResult> {
  const user = await getCurrentUser(); // never trust the client
  const result = await (await postService()).update(user.id, { id, body });
  if (!result.ok) return { ok: false, message: result.message };
  revalidatePath("/history");
  return { ok: true };
}

export async function deletePost(id: string): Promise<SaveResult> {
  const user = await getCurrentUser();
  const removed = await (await postService()).remove(user.id, id);
  revalidatePath("/history");
  return removed ? { ok: true } : { ok: false, message: "That post no longer exists." };
}
