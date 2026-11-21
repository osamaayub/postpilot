"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CheckIcon, CopyIcon, PenIcon, SearchIcon, SparkIcon, TrashIcon } from "@/components/icons";
import { deletePost, updatePost } from "../actions";
import { foldPost } from "../domain/fold";
import { TONES } from "../schemas";

type Item = { id: string; topic: string; tone: string; length: string; body: string; createdAt: string };
const UNDO_MS = 5000;

function ago(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function HistoryCard({ item, onDelete }: { item: Item; onDelete: (item: Item) => void }) {
  const [body, setBody] = useState(item.body);
  const [draft, setDraft] = useState(item.body);
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { visible, folded } = foldPost(body);
  const [hook, ...rest] = (open || !folded ? body : visible).split("\n");
  const words = body.trim().split(/\s+/).filter(Boolean).length;

  async function save() {
    const previous = body;
    setBody(draft); setEditing(false); // optimistic: show the edit at once
    const result = await updatePost(item.id, draft);
    if (!result.ok) { setBody(previous); toast.error(result.message); } else toast.success("Changes saved");
  }

  async function copy() {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    toast.success("Copied");
  }

  return (
    <li className="card flex flex-col p-5 transition hover:border-[color-mix(in_oklab,var(--brand)_35%,var(--line))]">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <time suppressHydrationWarning dateTime={item.createdAt} title={new Date(item.createdAt).toLocaleString()}>{ago(item.createdAt)}</time>
        <span aria-hidden>·</span>
        <span className="rounded-full bg-brand-soft px-2 py-0.5 font-medium capitalize text-brand">{item.tone}</span>
        <span className="rounded-full bg-sunken px-2 py-0.5 capitalize">{item.length}</span>
        <span className="ml-auto tabular-nums">{words} words</span>
      </div>
      <p className="mb-2 line-clamp-1 text-sm font-semibold">{item.topic}</p>
      {editing ? (
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={8} className="input font-serif leading-relaxed" aria-label="Edit post" autoFocus />
      ) : (
        <p className="whitespace-pre-wrap break-words font-serif leading-relaxed">
          <span className="hook">{hook}</span>
          {rest.length > 0 && "\n" + rest.join("\n")}
          {folded && !open && <button type="button" onClick={() => setOpen(true)} className="ml-1 font-sans text-sm text-muted hover:text-brand hover:underline">...see more</button>}
        </p>
      )}
      <div className="mt-auto flex flex-wrap gap-1 pt-4">
        {editing ? (
          <>
            <button type="button" onClick={save} className="btn btn-primary"><CheckIcon /> Save</button>
            <button type="button" onClick={() => { setDraft(body); setEditing(false); }} className="btn btn-ghost">Cancel</button>
          </>
        ) : (
          <>
            <button type="button" onClick={copy} className="btn btn-ghost">{copied ? <CheckIcon /> : <CopyIcon />} Copy</button>
            <button type="button" onClick={() => setEditing(true)} className="btn btn-quiet"><PenIcon /> Edit</button>
            <button type="button" onClick={() => onDelete({ ...item, body })} className="btn btn-quiet ml-auto hover:!text-danger"><TrashIcon /> Delete</button>
          </>
        )}
      </div>
    </li>
  );
}

/** Delete is delayed a few seconds behind an Undo toast, so a misclick never loses a post. */
export function HistoryList({ items }: { items: Item[] }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [tone, setTone] = useState<string | null>(null);
  const live = items.filter((i) => !hidden.has(i.id));
  const q = query.trim().toLowerCase();
  const shown = live.filter((i) => (!tone || i.tone === tone) && (!q || i.topic.toLowerCase().includes(q) || i.body.toLowerCase().includes(q)));

  function remove(item: Item) {
    setHidden((h) => new Set(h).add(item.id));
    let undone = false;
    const timer = setTimeout(async () => {
      if (undone) return;
      const result = await deletePost(item.id);
      if (!result.ok) toast.error(result.message);
    }, UNDO_MS);
    toast("Post deleted", {
      duration: UNDO_MS,
      action: { label: "Undo", onClick: () => { undone = true; clearTimeout(timer); setHidden((h) => { const n = new Set(h); n.delete(item.id); return n; }); } },
    });
  }

  if (!live.length) {
    return (
      <div className="card flex flex-col items-center px-6 py-16 text-center">
        <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand"><SparkIcon size={22} /></span>
        <h2 className="text-lg font-semibold">No posts yet</h2>
        <p className="mt-1 max-w-sm text-sm text-muted">Write your first post and it will be saved here, ready to copy or edit later.</p>
        <Link href="/write" className="btn btn-accent mt-6"><SparkIcon /> Write your first post</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block sm:max-w-xs sm:flex-1">
          <span className="sr-only">Search posts</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your posts" className="input py-2 pl-9 text-sm" />
        </label>
        <div className="flex flex-wrap gap-1.5" aria-label="Filter by tone">
          <button type="button" className="chip" aria-pressed={tone === null} onClick={() => setTone(null)}>All</button>
          {TONES.map((t) => <button key={t} type="button" className="chip capitalize" aria-pressed={tone === t} onClick={() => setTone(tone === t ? null : t)}>{t}</button>)}
        </div>
      </div>
      {shown.length ? (
        <ul className="grid gap-4 md:grid-cols-2">{shown.map((item) => <HistoryCard key={item.id} item={item} onDelete={remove} />)}</ul>
      ) : (
        <p className="card p-8 text-center text-sm text-muted">No posts match. Try another search or tone.</p>
      )}
    </div>
  );
}
