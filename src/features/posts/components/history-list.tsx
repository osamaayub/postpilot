"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deletePost, updatePost } from "../actions";
import { foldPost } from "../domain/fold";

type Item = { id: string; topic: string; tone: string; length: string; body: string; createdAt: string };
const UNDO_MS = 5000;

function HistoryCard({ item, onDelete }: { item: Item; onDelete: (item: Item) => void }) {
  const [body, setBody] = useState(item.body);
  const [draft, setDraft] = useState(item.body);
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const { visible, folded } = foldPost(body);

  async function save() {
    const previous = body;
    setBody(draft); setEditing(false); // optimistic: show the edit at once
    const result = await updatePost(item.id, draft);
    if (!result.ok) { setBody(previous); toast.error(result.message); } else toast.success("Changes saved");
  }

  return (
    <li className="card p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</time>
        <span aria-hidden>·</span>
        <span className="rounded-full bg-paper px-2 py-0.5 capitalize">{item.tone}</span>
        <span className="rounded-full bg-paper px-2 py-0.5 capitalize">{item.length}</span>
      </div>
      <p className="mb-2 text-sm font-medium">{item.topic}</p>
      {editing ? (
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={8} className="input font-serif leading-relaxed" aria-label="Edit post" />
      ) : (
        <p className="whitespace-pre-wrap font-serif leading-relaxed">
          {open || !folded ? body : visible}
          {folded && !open && <button type="button" onClick={() => setOpen(true)} className="ml-1 font-sans text-sm text-muted hover:text-brand hover:underline">...see more</button>}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {editing ? (
          <>
            <button type="button" onClick={save} className="btn btn-primary">Save</button>
            <button type="button" onClick={() => { setDraft(body); setEditing(false); }} className="btn btn-ghost">Cancel</button>
          </>
        ) : (
          <>
            <button type="button" onClick={async () => { await navigator.clipboard.writeText(body); toast.success("Copied"); }} className="btn btn-ghost">Copy</button>
            <button type="button" onClick={() => setEditing(true)} className="btn btn-ghost">Edit</button>
            <button type="button" onClick={() => onDelete({ ...item, body })} className="btn btn-ghost text-red-700">Delete</button>
          </>
        )}
      </div>
    </li>
  );
}

/** Delete is delayed a few seconds behind an Undo toast, so a misclick never loses a post. */
export function HistoryList({ items }: { items: Item[] }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const visible = items.filter((i) => !hidden.has(i.id));

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

  if (!visible.length) {
    return <p className="card p-8 text-center text-muted">No posts yet. Write your first one and it will show up here.</p>;
  }
  return <ul className="space-y-4">{visible.map((item) => <HistoryCard key={item.id} item={item} onDelete={remove} />)}</ul>;
}
