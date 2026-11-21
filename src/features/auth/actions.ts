"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/result";
import { logger } from "@/lib/logger";
import { LoginSchema, SignupSchema } from "./schemas";
import { hashPassword, verifyPassword } from "./server/password";
import { createSession, destroySession } from "./server/session";
import { userRepository } from "./server/user-repository";

export type AuthState = ActionState<{ name: string; email: string }>;
const echo = (f: FormData) => ({ name: String(f.get("name") ?? ""), email: String(f.get("email") ?? "") });

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = SignupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message, fields: echo(formData) };
  const user = await userRepository.create({ name: parsed.data.name, email: parsed.data.email, passwordHash: await hashPassword(parsed.data.password) });
  if (!user) return { status: "error", message: "An account with this email already exists", fields: echo(formData) };
  logger.info("user.signup", { userId: user.id });
  await createSession(user.id);
  redirect("/write");
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message, fields: echo(formData) };
  const creds = await userRepository.findCredentials(parsed.data.email);
  if (!(await verifyPassword(parsed.data.password, creds?.passwordHash)) || !creds) {
    logger.warn("user.login_failed");
    return { status: "error", message: "Wrong email or password", fields: echo(formData) };
  }
  await createSession(creds.id);
  redirect("/write");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
