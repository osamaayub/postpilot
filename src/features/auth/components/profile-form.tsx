"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { SubmitButton } from "@/components/submit-button";
import { PostPreview } from "@/features/posts/components/post-preview";
import { LENGTHS, TONES, type Length, type Tone } from "@/features/posts/schemas";
import { updateProfile, type ProfileState } from "../actions";
import { HEADLINE_MAX } from "../profile";

type Profile = { name: string; email: string; headline: string | null; defaultTone: Tone; defaultLength: Length };
const SAMPLE = "Your headline shows under your name, just like on LinkedIn.\n\nChange it on the left and watch this preview update.";

function Choice<T extends string>({ name, options, value, onChange }: { name: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="grid grid-flow-col gap-1 rounded-2xl bg-sunken p-1">
      {options.map((o) => (
        <label key={o} className={`cursor-pointer rounded-xl px-3 py-2 text-center text-sm capitalize transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand ${value === o ? "bg-surface font-semibold shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}>
          <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} className="sr-only" />
          {o}
        </label>
      ))}
    </div>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState<ProfileState, FormData>(updateProfile, { status: "idle" });
  const [name, setName] = useState(profile.name);
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [tone, setTone] = useState<Tone>(profile.defaultTone);
  const [length, setLength] = useState<Length>(profile.defaultLength);

  useEffect(() => {
    if (state.status === "success") toast.success(state.message ?? "Saved");
  }, [state]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
      <form action={action} className="card space-y-6 p-5 sm:p-6">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Name</label>
          <input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={80} autoComplete="name" className="input" />
        </div>
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="headline" className="text-sm font-medium">LinkedIn headline</label>
            <span className="text-xs text-muted tabular-nums">{headline.length}/{HEADLINE_MAX}</span>
          </div>
          <input id="headline" name="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={HEADLINE_MAX} placeholder="Full-stack developer · Next.js & AI" className="input" />
          <p className="mt-1.5 text-xs text-muted">Shown under your name in every preview.</p>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Default tone</legend>
          <Choice name="defaultTone" options={TONES} value={tone} onChange={setTone} />
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Default length</legend>
          <Choice name="defaultLength" options={LENGTHS} value={length} onChange={setLength} />
        </fieldset>
        <div>
          <p className="mb-1.5 text-sm font-medium">Email</p>
          <p className="rounded-xl bg-sunken px-3.5 py-2.5 text-sm text-muted">{profile.email}</p>
        </div>
        {state.status === "error" && <p role="alert" className="rounded-xl bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-3.5 py-2.5 text-sm text-danger">{state.message}</p>}
        <SubmitButton pendingLabel="Saving..." className="btn-lg w-full">Save profile</SubmitButton>
      </form>

      <section className="space-y-3 lg:sticky lg:top-24">
        <h2 className="px-1 text-sm font-medium">Preview</h2>
        <PostPreview name={name || "Your name"} headline={headline} body={SAMPLE} />
      </section>
    </div>
  );
}
