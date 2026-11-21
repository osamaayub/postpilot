"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/write", label: "Write", icon: "✦" },
  { href: "/history", label: "History", icon: "☰" },
];

function useActive() {
  const path = usePathname();
  const active = (href: string) => path.startsWith(href);
  const cls = (href: string) => (active(href) ? "text-ink font-semibold" : "text-muted hover:text-ink");
  return { active, cls };
}

/** Top links in the header, shown from the sm breakpoint up. */
export function Nav() {
  const { active, cls } = useActive();
  return (
    <nav className="hidden gap-6 text-sm sm:flex" aria-label="Main">
      {LINKS.map((l) => <Link key={l.href} href={l.href} className={cls(l.href)} aria-current={active(l.href) ? "page" : undefined}>{l.label}</Link>)}
    </nav>
  );
}

/**
 * Bottom tab bar on phones. Rendered outside the header on purpose: the header uses
 * backdrop-blur, and a backdrop-filter makes it the containing block for fixed children.
 */
export function TabBar() {
  const { active, cls } = useActive();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-2 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden" aria-label="Main">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={`flex flex-col items-center gap-0.5 py-2.5 text-xs ${cls(l.href)}`} aria-current={active(l.href) ? "page" : undefined}>
          <span aria-hidden className="text-base">{l.icon}</span>{l.label}
        </Link>
      ))}
    </nav>
  );
}
