import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="bg-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative"><Logo /></div>
      <p className="text-gradient relative text-7xl font-semibold tracking-tight">404</p>
      <h1 className="relative text-2xl font-semibold tracking-tight">This page doesn&apos;t exist</h1>
      <p className="relative text-muted">The link may be old, or the page was moved.</p>
      <Link href="/" className="btn btn-primary relative">Back to home <ArrowRightIcon /></Link>
    </div>
  );
}
