"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LENGTHS, TONES, TOPIC_MAX, type Length, type Tone } from "../schemas";
import { SAVED_MARKER } from "../marker";
import { updatePost } from "../actions";
import { PostPreview } from "./post-preview";

const IDEAS = ["What I learned shipping my first SaaS", "Why I write tests before fixing bugs", "How I price freelance projects", "Server Actions vs API routes"];

function Segmented<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="grid grid-flow-col gap-1 rounded-xl bg-paper p-1">
        {options.map((o) => (
          <label key={o} className={`cursor-pointer rounded-lg px-3 py-2 text-center text-sm capitalize transition ${value === o ? "bg-surface font-semibold shadow-sm" : "text-muted hover:text-ink"}`}>
            <input type="radio" name={label} value={o} checked={value === o} onChange={() => onChange(o)} className="sr-only" />
            {o}
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
    toast.success("Copied. Paste it into LinkedIn.");
  }

  const canGenerate = topic.trim().length >= 8 && !streaming && left > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <form className="card space-y-6 p-5 sm:p-6" onSubmit={(e) => { e.preventDefault(); if (canGenerate) generate(); }}>
        <div>
          <label htmlFor="topic" className="mb-2 block text-sm font-medium">What do you want to post about?</label>
          <textarea id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={TOPIC_MAX} rows={4} placeholder="e.g. The bug that taught me to write tests first" className="input resize-none" />
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Starter ideas">
            {IDEAS.map((idea) => (
              <button key={idea} type="button" onClick={() => setTopic(idea)} className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs text-muted hover:border-ink hover:text-ink">{idea}</button>
            ))}
          </div>
        </div>
        <Segmented label="Tone" options={TONES} value={tone} onChange={setTone} />
        <Segmented label="Length" options={LENGTHS} value={length} onChange={setLength} />
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted"><span className="font-semibold text-ink">{left}</span> of {limit} posts left today</p>
          {streaming
            ? <button type="button" onClick={() => abort.current?.abort()} className="btn btn-ghost">Stop</button>
            : <button type="submit" disabled={!canGenerate} className="btn btn-primary">✦ Write post</button>}
        </div>
      </form>

      <section className="space-y-3" aria-live="polite">
        {editing
          ? <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={14} className="input font-serif text-[1.05rem] leading-relaxed" aria-label="Edit post" />
          : <PostPreview name={name} body={body} streaming={streaming} />}
        {body && !streaming && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copy} className="btn btn-primary">Copy</button>
            {editing
              ? <button type="button" onClick={saveEdit} className="btn btn-ghost">Save changes</button>
              : <button type="button" onClick={() => setEditing(true)} disabled={!postId} className="btn btn-ghost">Edit</button>}
            <button type="button" onClick={generate} disabled={!canGenerate} className="btn btn-ghost">Try again</button>
          </div>
        )}
      </section>
    </div>
  );
}
