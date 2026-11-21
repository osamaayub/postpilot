import type { Metadata } from "next";
import Link from "next/link";
import { SparkIcon } from "@/components/icons";
import { getCurrentUser } from "@/features/auth/server/current-user";
import { HistoryList } from "@/features/posts/components/history-list";
import { scorePost } from "@/features/posts/domain/score";
import { postService } from "@/features/posts/server";

export const metadata: Metadata = { title: "History" };

const WEEK_MS = 7 * 86_400_000;

export default async function HistoryPage() {
  const user = await getCurrentUser();
  const posts = await (await postService()).list(user.id);
  const items = posts.map((p) => ({ id: p.id, topic: p.topic, tone: p.tone, length: p.length, body: p.body, createdAt: p.createdAt.toISOString() }));

  // Writing stats, computed from the user's own posts.
  const now = new Date().getTime();
  const thisWeek = posts.filter((p) => now - p.createdAt.getTime() < WEEK_MS).length;
  const avgScore = posts.length ? Math.round(posts.reduce((sum, p) => sum + scorePost(p.body).score, 0) / posts.length) : 0;
  const tones = posts.reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.tone]: (acc[p.tone] ?? 0) + 1 }), {});
  const topTone = Object.entries(tones).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const stats = [
    ["Posts written", String(posts.length)],
    ["This week", String(thisWeek)],
    ["Average score", posts.length ? `${avgScore}/100` : "—"],
    ["Favourite tone", topTone],
  ];

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">History</h1>
          <p className="mt-2 text-muted">{items.length} {items.length === 1 ? "post" : "posts"}. Edit, copy or delete any of them.</p>
        </div>
        {items.length > 0 && <Link href="/write" className="btn btn-accent"><SparkIcon /> New post</Link>}
      </div>
      {items.length > 0 && (
        <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="card px-5 py-4">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="mt-1 text-2xl font-semibold tracking-tight capitalize tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <HistoryList items={items} />
    </>
  );
}
