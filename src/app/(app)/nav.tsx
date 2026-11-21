"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/write", label: "Write", icon: "✦" },
  { href: "/history", label: "History", icon: "☰" },
];

/** Top links on desktop, a bottom tab bar on phones. */
export function Nav() {
  const path = usePathname();
  const cls = (href: string) => (path.startsWith(href) ? "text-ink font-semibold" : "text-muted hover:text-ink");
  return (
    <>
      <nav className="hidden gap-6 text-sm sm:flex" aria-label="Main">
        {LINKS.map((l) => <Link key={l.href} href={l.href} className={cls(l.href)} aria-current={path.startsWith(l.href) ? "page" : undefined}>{l.label}</Link>)}
      </nav>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-2 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden" aria-label="Main">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={`flex flex-col items-center gap-0.5 py-2.5 text-xs ${cls(l.href)}`} aria-current={path.startsWith(l.href) ? "page" : undefined}>
            <span aria-hidden className="text-base">{l.icon}</span>{l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
