import Link from "next/link";
import { SparkIcon } from "./icons";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group flex items-center gap-2.5 rounded-lg font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-brand">
      <span className="grid size-8 place-items-center rounded-[10px] bg-gradient-to-br from-fill-from to-fill-to text-white shadow-[var(--glow)] transition group-hover:rotate-6" aria-hidden>
        <SparkIcon size={17} strokeWidth={2} />
      </span>
      <span className="text-[1.05rem]">PostPilot</span>
    </Link>
  );
}
