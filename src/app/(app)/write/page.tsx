import type { Metadata } from "next";
import { getCurrentUser } from "@/features/auth/server/current-user";
import { WriteStudio } from "@/features/posts/components/write-studio";
import { postService } from "@/features/posts/server";

export const metadata: Metadata = { title: "Write" };

export default async function WritePage() {
  const user = await getCurrentUser();
  const { remaining, limit } = await (await postService()).usage(user.id);
  const first = user.name.split(" ")[0];
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Write a post</h1>
        <p className="mt-2 text-muted">Hi {first}. Give PostPilot an idea and it writes the hook, the body and the question at the end.</p>
      </div>
      <WriteStudio name={user.name} remaining={remaining} limit={limit} />
    </>
  );
}
