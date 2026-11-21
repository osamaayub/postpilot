import { Logo } from "@/components/logo";
import { logout } from "@/features/auth/actions";
import { getCurrentUser } from "@/features/auth/server/current-user";
import { isDemoWriter } from "@/features/posts/server";
import { Nav, TabBar } from "./nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="min-h-dvh pb-20 sm:pb-0">
      <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-8"><Logo href="/write" /><Nav /></div>
          <div className="flex items-center gap-3">
            {isDemoWriter() && <span className="hidden rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs text-amber-800 md:inline">Demo AI</span>}
            <span className="hidden text-sm text-muted sm:inline">{user.name}</span>
            <form action={logout}><button className="btn btn-ghost py-1.5">Log out</button></form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      <TabBar />
    </div>
  );
}
