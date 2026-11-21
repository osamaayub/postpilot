import { CheckIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { PostPreview } from "@/features/posts/components/post-preview";

const SAMPLE = "Most freelancers lose clients in the first message.\n\nNot because of price. Because the reply is about them, not the client.\n\nNow I open with the client's problem in one line.";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-12">{children}</div>
        <p className="text-xs text-muted">Open source on <a href="https://github.com/osamaayub/postpilot" className="underline hover:text-ink">GitHub</a>.</p>
      </div>
      <aside className="relative hidden overflow-hidden border-l border-line bg-sunken lg:flex lg:flex-col lg:justify-center lg:px-14">
        <div className="bg-glow absolute inset-0" aria-hidden />
        <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto w-full max-w-md space-y-8">
          <div className="float"><PostPreview name="Osama Ayub" body={SAMPLE} /></div>
          <ul className="space-y-3 text-sm">
            {["A hook written to earn the \"see more\" tap", "Streams in seconds, saved to your history", "See exactly where LinkedIn folds your post"].map((t) => (
              <li key={t} className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-brand-soft text-brand"><CheckIcon size={14} /></span>{t}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
