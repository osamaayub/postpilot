"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { login, signup, type AuthState } from "../actions";

export function AuthForm({ mode, demo }: { mode: "login" | "signup"; demo?: { email: string; password: string } }) {
  const [state, action] = useActionState<AuthState, FormData>(mode === "login" ? login : signup, { status: "idle" });
  const [show, setShow] = useState(false);
  const fields = state.status === "error" ? state.fields : undefined;
  const isLogin = mode === "login";

  return (
    <form action={action} className="w-full max-w-sm space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{isLogin ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-2 text-sm text-muted">{isLogin ? "Sign in to write your next post." : "Free forever. 10 AI posts a day, no credit card."}</p>
      </div>

      {demo && (
        <p className="rounded-xl border border-[color-mix(in_oklab,var(--brand)_30%,var(--line))] bg-brand-soft px-3.5 py-2.5 text-sm text-brand">
          Demo account filled in. Just press <span className="font-semibold">Sign in</span>.
        </p>
      )}

      {!isLogin && (
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Name</label>
          <input id="name" name="name" required autoComplete="name" defaultValue={fields?.name} placeholder="Ada Lovelace" className="input" />
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={fields?.email ?? demo?.email} placeholder="you@example.com" className="input" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
        <div className="relative">
          <input id="password" name="password" type={show ? "text" : "password"} required minLength={isLogin ? 1 : 8} autoComplete={isLogin ? "current-password" : "new-password"} defaultValue={demo?.password} placeholder={isLogin ? "Your password" : "At least 8 characters"} className="input pr-11" />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-sunken hover:text-ink">
            {show ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      {state.status === "error" && <p role="alert" className="rounded-xl bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-3.5 py-2.5 text-sm text-danger">{state.message}</p>}

      <SubmitButton pendingLabel={isLogin ? "Signing in..." : "Creating account..."} className="btn-lg w-full">{isLogin ? "Sign in" : "Create account"}</SubmitButton>

      <p className="text-center text-sm text-muted">
        {isLogin ? "New here? " : "Have an account? "}
        <Link href={isLogin ? "/signup" : "/login"} className="font-semibold text-brand hover:underline">{isLogin ? "Create an account" : "Sign in"}</Link>
      </p>
    </form>
  );
}
