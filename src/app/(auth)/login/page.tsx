import type { Metadata } from "next";
import { connection } from "next/server";
import { AuthForm } from "@/features/auth/components/auth-form";
import { demoAccount } from "@/features/auth/server/demo";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  await connection(); // decide per request (runtime env), not at build time
  return <AuthForm mode="login" demo={demoAccount()} />;
}
