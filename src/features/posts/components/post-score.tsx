"use client";

import { CheckIcon } from "@/components/icons";
import { scoreBand, scorePost } from "../domain/score";

const BAND = {
  great: { ring: "stroke-emerald-500", text: "text-emerald-600 dark:text-emerald-400", label: "Ready to post" },
  good: { ring: "stroke-amber-500", text: "text-amber-600 dark:text-amber-400", label: "Almost there" },
  weak: { ring: "stroke-rose-500", text: "text-rose-600 dark:text-rose-400", label: "Needs work" },
};

/** A small ring with the score, for cards and lists. */
export function ScoreBadge({ body }: { body: string }) {
  const { score } = scorePost(body);
  const band = BAND[scoreBand(score)];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-sunken px-2 py-0.5 text-[11px] font-semibold tabular-nums ${band.text}`} title={`Post score: ${score}/100`}>
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden><circle cx="5" cy="5" r="4" className={band.ring} fill="none" strokeWidth="2" /></svg>
      {score}
    </span>
  );
}

/** Score ring plus the checklist, with a tip for every failed rule. */
export function PostScorePanel({ body }: { body: string }) {
  const { score, checks, words } = scorePost(body);
  const band = BAND[scoreBand(score)];
  const r = 26, c = 2 * Math.PI * r;
  return (
    <section className="card p-5" aria-label="Post score">
      <div className="flex items-center gap-4">
        <div className="relative size-16 shrink-0">
          <svg viewBox="0 0 64 64" className="size-16 -rotate-90" aria-hidden>
            <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-sunken" />
            <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" strokeLinecap="round" className={`${band.ring} transition-[stroke-dashoffset] duration-700`} strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-lg font-semibold tabular-nums">{score}</span>
        </div>
        <div>
          <p className="text-sm font-semibold">Post score <span className={`ml-1 ${band.text}`}>· {band.label}</span></p>
          <p className="text-xs text-muted">{checks.filter((x) => x.pass).length} of {checks.length} checks passed · {words} words</p>
        </div>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {checks.map((check) => (
          <li key={check.id} className="flex gap-2 text-sm" title={check.pass ? undefined : check.tip}>
            <span className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ${check.pass ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/15 text-rose-600 dark:text-rose-400"}`}>
              {check.pass ? <CheckIcon size={11} strokeWidth={3} /> : <span className="text-[10px] leading-none font-bold">!</span>}
            </span>
            <span>
              <span className={check.pass ? "" : "font-medium"}>{check.label}</span>
              {!check.pass && <span className="block text-xs text-muted">{check.tip}</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
