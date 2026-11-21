"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckIcon, CopyIcon, PenIcon, RefreshIcon, SparkIcon, StopIcon } from "@/components/icons";
import { LENGTHS, TONES, TOPIC_MAX, TOPIC_MIN, type Length, type Tone } from "../schemas";
import { SAVED_MARKER } from "../marker";
import { updatePost } from "../actions";
import { PostPreview } from "./post-preview";

const IDEAS = ["What I learned shipping my first SaaS", "Why I write tests before fixing bugs", "How I price freelance projects", "Server Actions vs API routes"];
const TONE_HINT: Record<Tone, string> = { practical: "Tips and steps", story: "A lesson learned", bold: "One strong opinion", friendly: "Warm and casual" };
const LENGTH_HINT: Record<Length, string> = { short: "40–70 words", medium: "80–140 words", long: "150–220 words" };

function Segmented<T extends string>({ label, options, value, onChange, hints }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void; hints: Record<T, string> }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-sunken p-1 sm:grid-flow-col sm:grid-cols-none">
        {options.map((o) => (
          <label key={o} className={`cursor-pointer rounded-xl px-3 py-2 text-center transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand ${value === o ? "bg-surface shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}>
            <input type="radio" name={label} value={o} checked={value === o} onChange={() => onChange(o)} className="sr-only" />
            <span className={`block text-sm capitalize ${value === o ? "font-semibold text-ink" : ""}`}>{o}</span>
            <span className="block text-[11px] leading-tight text-muted">{hints[o]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function WriteStudio({ name, remaining, limit }: { name: string; remaining: number; limit: number }) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("practical");
  const [length, setLength] = useState<Length>("medium");
  const [body, setBody] = useState("");
  const [postId, setPostId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [left, setLeft] = useState(remaining);
  const abort = useRef<AbortController | null>(null);

  async function generate() {
    abort.current?.abort();
    const controller = (abort.current = new AbortController());
    setBody(""); setPostId(null); setEditing(false); setStreaming(true);
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, tone, length }), signal: controller.signal });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ message: "Something went wrong. Please try again." }));
        toast.error(data.message);
        return;
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let text = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        text += value;
        const i = text.indexOf(SAVED_MARKER);
        setBody(i === -1 ? text : text.slice(0, i));
        if (i !== -1) setPostId(JSON.parse(text.slice(i + 1)).id);
      }
      setLeft((n) => Math.max(0, n - 1));
      toast.success("Saved to your history");
      router.refresh();
    } catch (e) {
      if ((e as Error).name !== "AbortError") toast.error("The AI request failed. You were not charged a credit.");
    } finally {
      setStreaming(false);
    }
  }

  async function saveEdit() {
    if (!postId) return;
    const result = await updatePost(postId, body);
    if (result.ok) { setEditing(false); toast.success("Changes saved"); } else toast.error(result.message);
  }

  async function copy() {
    await navigator.clipboard.writeText(body.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    toast.success("Copied. Paste it into LinkedIn.");
  }

  const tooShort = topic.trim().length < TOPIC_MIN;
  const canGenerate = !tooShort && !streaming && left > 0;
  const used = limit - left;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
      <form className="card space-y-6 p-5 sm:p-6" onSubmit={(e) => { e.preventDefault(); if (canGenerate) generate(); }}>
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <label htmlFor="topic" className="text-sm font-medium">What do you want to post about?</label>
            <span className={`text-xs tabular-nums ${topic.length > TOPIC_MAX - 20 ? "text-danger" : "text-muted"}`}>{topic.length}/{TOPIC_MAX}</span>
          </div>
          <textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canGenerate) { e.preventDefault(); generate(); } }}
            maxLength={TOPIC_MAX}
            rows={4}
            placeholder="e.g. The bug that taught me to write tests first"
            className="input resize-none text-base"
          />
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Starter ideas">
            {IDEAS.map((idea) => (
              <button key={idea} type="button" onClick={() => setTopic(idea)} aria-pressed={topic === idea} className="chip">
                <SparkIcon size={12} /> {idea}
              </button>
            ))}
          </div>
        </div>

        <Segmented label="Tone" options={TONES} value={tone} onChange={setTone} hints={TONE_HINT} />
        <Segmented label="Length" options={LENGTHS} value={length} onChange={setLength} hints={LENGTH_HINT} />

        <div className="space-y-4 border-t border-line pt-5">
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-muted">
              <span><span className="font-semibold text-ink">{left}</span> of {limit} posts left today</span>
              <span>Resets at midnight UTC</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-label="Posts used today" aria-valuemin={0} aria-valuemax={limit} aria-valuenow={used}>
              <div className="h-full rounded-full bg-gradient-to-r from-fill-from to-fill-to transition-[width] duration-500" style={{ width: `${Math.min(100, (used / limit) * 100)}%` }} />
            </div>
          </div>
          {streaming ? (
            <button type="button" onClick={() => abort.current?.abort()} className="btn btn-ghost btn-lg w-full"><StopIcon /> Stop writing</button>
          ) : (
            <button type="submit" disabled={!canGenerate} className="btn btn-accent btn-lg w-full">
              <SparkIcon /> Write post <span className="kbd ml-1 hidden sm:inline-flex">Ctrl ↵</span>
            </button>
          )}
          {left === 0 && <p className="text-center text-xs text-muted">You&apos;ve used today&apos;s posts. Come back tomorrow.</p>}
        </div>
      </form>

      <section className="space-y-3 lg:sticky lg:top-24" aria-live="polite">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-medium">Preview</h2>
          {streaming && <span className="flex items-center gap-1.5 text-xs text-brand"><span className="size-1.5 animate-pulse rounded-full bg-brand" /> Writing…</span>}
        </div>
        {editing
          ? <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={14} className="input font-serif text-[1.05rem] leading-relaxed" aria-label="Edit post" />
          : <PostPreview name={name} body={body} streaming={streaming} />}
        {body && !streaming && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copy} className="btn btn-primary">{copied ? <CheckIcon /> : <CopyIcon />} Copy</button>
            {editing
              ? <button type="button" onClick={saveEdit} className="btn btn-ghost"><CheckIcon /> Save changes</button>
              : <button type="button" onClick={() => setEditing(true)} disabled={!postId} className="btn btn-ghost"><PenIcon /> Edit</button>}
            <button type="button" onClick={generate} disabled={!canGenerate} className="btn btn-ghost"><RefreshIcon /> Try again</button>
          </div>
        )}
      </section>
    </div>
  );
}
