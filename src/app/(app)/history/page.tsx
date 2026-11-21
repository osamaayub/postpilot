import type { Metadata } from "next";
import { getCurrentUser } from "@/features/auth/server/current-user";
import { HistoryList } from "@/features/posts/components/history-list";
import { postService } from "@/features/posts/server";

export const metadata: Metadata = { title: "History" };

export default async function HistoryPage() {
  const user = await getCurrentUser();
  const posts = await (await postService()).list(user.id);
  const items = posts.map((p) => ({ id: p.id, topic: p.topic, tone: p.tone, length: p.length, body: p.body, createdAt: p.createdAt.toISOString() }));
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">History</h1>
        <p className="mt-1 text-muted">{items.length} {items.length === 1 ? "post" : "posts"}. Edit, copy or delete any of them.</p>
      </div>
      <HistoryList items={items} />
    </>
  );
}
