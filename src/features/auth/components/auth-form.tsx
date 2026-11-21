"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { login, signup, type AuthState } from "../actions";

export function AuthForm({ mode, demo }: { mode: "login" | "signup"; demo?: { email: string; password: string } }) {
  const [state, action] = useActionState<AuthState, FormData>(mode === "login" ? login : signup, { status: "idle" });
  const fields = state.status === "error" ? state.fields : undefined;
  const isLogin = mode === "login";

  return (
    <form action={action} className="card w-full max-w-sm space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{isLogin ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-muted">{isLogin ? "Sign in to write your next post." : "Free: 10 AI posts a day."}</p>
      </div>
      {!isLogin && (
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">Name</label>
          <input id="name" name="name" required autoComplete="name" defaultValue={fields?.name} className="input" />
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={fields?.email ?? demo?.email} className="input" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" required minLength={isLogin ? 1 : 8} autoComplete={isLogin ? "current-password" : "new-password"} defaultValue={demo?.password} className="input" />
      </div>
      {state.status === "error" && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>}
      <SubmitButton pendingLabel={isLogin ? "Signing in..." : "Creating account..."} className="w-full">{isLogin ? "Sign in" : "Create account"}</SubmitButton>
      {demo && <p className="text-center text-xs text-muted">Demo account filled in: just press Sign in.</p>}
      <p className="text-center text-sm text-muted">
        {isLogin ? "New here? " : "Have an account? "}
        <Link href={isLogin ? "/signup" : "/login"} className="font-medium text-brand hover:underline">{isLogin ? "Create an account" : "Sign in"}</Link>
      </p>
    </form>
  );
}
