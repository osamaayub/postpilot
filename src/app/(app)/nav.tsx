"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListIcon, PenIcon, UserIcon } from "@/components/icons";

const LINKS = [
  { href: "/write", label: "Write", Icon: PenIcon },
  { href: "/history", label: "History", Icon: ListIcon },
  { href: "/settings", label: "Profile", Icon: UserIcon },
];

function useActive() {
  const path = usePathname();
  return (href: string) => path.startsWith(href);
}

/** Pill tabs in the header, shown from the sm breakpoint up. */
export function Nav() {
  const active = useActive();
  return (
    <nav className="hidden items-center gap-1 rounded-xl bg-sunken p-1 text-sm sm:flex" aria-label="Main">
      {LINKS.map(({ href, label, Icon }) => (
        <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${active(href) ? "bg-surface font-semibold text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
          <Icon size={15} /> {label}
        </Link>
      ))}
    </nav>
  );
}

/**
 * Bottom tab bar on phones. Rendered outside the header on purpose: the header uses
 * backdrop-blur, and a backdrop-filter makes it the containing block for fixed children.
 */
export function TabBar() {
  const active = useActive();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden" aria-label="Main">
      {LINKS.map(({ href, label, Icon }) => (
        <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}
          className={`flex flex-col items-center gap-1 py-2.5 text-xs ${active(href) ? "font-semibold text-brand" : "text-muted"}`}>
          <Icon size={20} />{label}
        </Link>
      ))}
    </nav>
  );
}
