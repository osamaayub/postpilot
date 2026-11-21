import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid size-8 place-items-center rounded-lg bg-ink text-sm text-white" aria-hidden>P</span>
      <span>PostPilot</span>
    </Link>
  );
}
