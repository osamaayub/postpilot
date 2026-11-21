import { LogoutIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { logout } from "@/features/auth/actions";
import { getCurrentUser } from "@/features/auth/server/current-user";
import { isDemoWriter } from "@/features/posts/server";
import { Nav, TabBar } from "./nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const initials = user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="min-h-dvh pb-24 sm:pb-0">
      <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6"><Logo href="/write" /><Nav /></div>
          <div className="flex items-center gap-2 sm:gap-3">
            {isDemoWriter() && <span className="hidden rounded-full border border-amber-300/70 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 md:inline dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300" title="No OpenAI key set: posts come from the free demo writer">Demo AI</span>}
            <span className="hidden items-center gap-2 text-sm sm:flex">
              <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-fill-from to-fill-to text-xs font-semibold text-white" aria-hidden>{initials}</span>
              <span className="max-w-32 truncate text-muted">{user.name}</span>
            </span>
            <form action={logout}><button className="btn btn-quiet" aria-label="Log out"><LogoutIcon /> <span className="hidden sm:inline">Log out</span></button></form>
          </div>
        </div>
      </header>
      <main className="rise mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
      <TabBar />
    </div>
  );
}
