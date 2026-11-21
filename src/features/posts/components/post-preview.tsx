"use client";

import { useState } from "react";
import { CommentIcon, LikeIcon, RepostIcon, SendIcon } from "@/components/icons";
import { foldPost } from "../domain/fold";

/**
 * Shows the post the way the LinkedIn feed does: about three lines, then
 * "...see more". The hook is highlighted because it is all most people read.
 */
export function PostPreview({ name, headline, body, streaming = false, initialOpen = false }: { name: string; headline?: string | null; body: string; streaming?: boolean; initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const { visible, hidden, folded } = foldPost(body);
  const [hook, ...rest] = visible.split("\n");
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const waiting = streaming && !body;

  return (
    <article className="card overflow-hidden" aria-label="Post preview" aria-busy={streaming}>
      <header className="flex items-center gap-3 px-5 pt-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-fill-from to-fill-to text-sm font-semibold text-white" aria-hidden>{initials}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="truncate text-xs text-muted">{headline || "Full-stack developer"} · now · 🌐</p>
        </div>
      </header>

      <div className={`min-h-28 whitespace-pre-wrap break-words px-5 py-4 font-serif text-[1.05rem] leading-relaxed ${streaming && body ? "caret" : ""}`}>
        {waiting ? (
          <div className="space-y-2.5 pt-1" aria-label="Writing your post">
            <div className="skeleton h-4 w-4/5" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        ) : body ? (
          <>
            <span className="hook">{hook}</span>
            {rest.length > 0 && "\n" + rest.join("\n")}
            {folded && !open && !streaming && (
              <button type="button" onClick={() => setOpen(true)} className="ml-1 font-sans text-sm font-medium text-muted hover:text-brand hover:underline">...see more</button>
            )}
            {(open || streaming) && hidden && (folded ? "\n" : "") + hidden}
          </>
        ) : (
          <span className="font-sans text-sm text-muted">Your post will appear here, exactly as the LinkedIn feed shows it.</span>
        )}
      </div>

      {folded && !streaming && (
        <p className="mx-5 mb-1 flex items-center gap-2 rounded-lg bg-brand-soft px-3 py-2 text-xs text-brand">
          <span className="font-semibold">{visible.length}</span> of {body.trim().length} characters show before &quot;see more&quot;. Make the first line count.
        </p>
      )}

      <footer className="mt-2 grid grid-cols-4 border-t border-line text-xs font-medium text-muted" aria-hidden>
        {[["Like", LikeIcon], ["Comment", CommentIcon], ["Repost", RepostIcon], ["Send", SendIcon]].map(([label, Icon]) => {
          const I = Icon as typeof LikeIcon;
          return <span key={label as string} className="flex items-center justify-center gap-1.5 py-3"><I size={15} /> <span className="hidden sm:inline">{label as string}</span></span>;
        })}
      </footer>
    </article>
  );
}
