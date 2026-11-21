import Link from "next/link";
import { Logo } from "@/components/logo";
import { PostPreview } from "@/features/posts/components/post-preview";

const SAMPLE = "I deleted 6 API routes this week.\n\nServer Actions now handle every form in my Next.js app:\n- Validation with Zod on the server\n- Errors returned, not thrown\n- Pending state with useActionState\n\nI still keep API routes for webhooks and streaming. Pick the tool for the job.";

const FEATURES = [
  ["Hooks that earn the click", "The first line is written to make people tap \"see more\", and the preview shows exactly where LinkedIn folds your post."],
  ["Streams as it writes", "Words appear as the AI writes them. Stop it any time; you're only charged when a post is finished."],
  ["Your history, editable", "Every post is saved. Edit, copy or delete it later, with undo if you misclick."],
];

export default function Home() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <div className="flex gap-2">
          <Link href="/login" className="btn btn-ghost">Sign in</Link>
          <Link href="/signup" className="btn btn-primary hidden sm:inline-flex">Get started</Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="grid grid-cols-1 items-center gap-10 py-10 lg:grid-cols-2 lg:py-20">
          <div className="min-w-0">
            <p className="mb-4 inline-block rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">For developers and freelancers</p>
            <h1 className="font-serif text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">LinkedIn posts people <span className="hook">actually read</span>.</h1>
            <p className="mt-5 max-w-lg text-lg text-muted">Type an idea. Get a post with a strong hook, short paragraphs and a question at the end, ready to copy.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-primary px-5 py-3">Try the demo</Link>
              <Link href="/signup" className="btn btn-ghost px-5 py-3">Create a free account</Link>
            </div>
          </div>
          <div className="min-w-0"><PostPreview name="Osama Ayub" body={SAMPLE} /></div>
        </section>
        <section className="grid grid-cols-1 gap-4 pb-20 md:grid-cols-3">
          {FEATURES.map(([title, text]) => (
            <div key={title} className="card p-6">
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-muted">{text}</p>
            </div>
          ))}
        </section>
      </main>
      <footer className="border-t border-line py-6 text-center text-sm text-muted">
        Open source. <a href="https://github.com/osamaayub/postpilot" className="text-brand hover:underline">View the code on GitHub</a>
      </footer>
    </div>
  );
}
