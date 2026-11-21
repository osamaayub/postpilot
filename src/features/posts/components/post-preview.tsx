"use client";

import { useState } from "react";
import { foldPost } from "../domain/fold";

/**
 * Shows the post the way the LinkedIn feed does: about three lines, then
 * "...see more". The hook is highlighted because it is all most people read.
 */
export function PostPreview({ name, body, streaming = false, initialOpen = false }: { name: string; body: string; streaming?: boolean; initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const { visible, hidden, folded } = foldPost(body);
  const [hook, ...rest] = visible.split("\n");
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <article className="card overflow-hidden" aria-label="Post preview">
      <header className="flex items-center gap-3 px-5 pt-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-white" aria-hidden>{initials}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-xs text-muted">Full-stack developer · now</p>
        </div>
      </header>
      <div className={`whitespace-pre-wrap break-words px-5 py-4 font-serif text-[1.05rem] leading-relaxed ${streaming ? "caret" : ""}`}>
        {body ? (
          <>
            <span className="hook">{hook}</span>
            {rest.length > 0 && "\n" + rest.join("\n")}
            {folded && !open && !streaming && (
              <button type="button" onClick={() => setOpen(true)} className="ml-1 font-sans text-sm font-medium text-muted hover:text-brand hover:underline">...see more</button>
            )}
            {(open || streaming) && hidden && (folded ? "\n" : "") + hidden}
          </>
        ) : (
          <span className="text-muted">Your post will appear here.</span>
        )}
      </div>
      {folded && !streaming && (
        <p className="border-t border-dashed border-line px-5 py-2 text-xs text-muted">
          Above the fold: {visible.length} of {body.trim().length} characters. Make the first line count.
        </p>
      )}
    </article>
  );
}
