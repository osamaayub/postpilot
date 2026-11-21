import type { Metadata } from "next";
import { getCurrentUser } from "@/features/auth/server/current-user";
import { WriteStudio } from "@/features/posts/components/write-studio";
import { postService } from "@/features/posts/server";

export const metadata: Metadata = { title: "Write" };

export default async function WritePage() {
  const user = await getCurrentUser();
  const { remaining, limit } = await (await postService()).usage(user.id);
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Write a post</h1>
        <p className="mt-1 text-muted">Give it an idea. PostPilot writes the hook, the body and the question at the end.</p>
      </div>
      <WriteStudio name={user.name} remaining={remaining} limit={limit} />
    </>
  );
}
