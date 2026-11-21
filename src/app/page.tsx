import Link from "next/link";
import { connection } from "next/server";
import { ArrowRightIcon, BoltIcon, CheckIcon, CodeIcon, FoldIcon, GaugeIcon, GitHubIcon, PenIcon, ShieldIcon, SparkIcon, UndoIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { demoAccount } from "@/features/auth/server/demo";
import { PostPreview } from "@/features/posts/components/post-preview";

const REPO = "https://github.com/osamaayub/postpilot";
const SAMPLE = "I deleted 6 API routes this week.\n\nServer Actions now handle every form in my Next.js app:\n- Validation with Zod on the server\n- Errors returned, not thrown\n- Pending state with useActionState\n\nI still keep API routes for webhooks and streaming. Pick the tool for the job.\n\nWhat would you keep as an API route?";

const STEPS = [
  ["Type an idea", "One sentence is enough: a lesson, a win, an opinion."],
  ["Pick a tone and length", "Practical, story, bold or friendly. Short, medium or long."],
  ["Copy and post", "Watch it stream in, tweak it, copy it into LinkedIn."],
];

const FEATURES = [
  [SparkIcon, "Hooks that earn the click", "The first line is written to make people tap \"see more\", and it is highlighted so you can judge it at a glance."],
  [FoldIcon, "See the fold", "The preview cuts your post exactly where the LinkedIn feed does, and counts the characters above it."],
  [BoltIcon, "Streams as it writes", "Words appear as the AI writes them. Stop any time; a stopped or failed post never costs a credit."],
  [UndoIcon, "History with undo", "Every post is saved. Search, edit, copy, or delete with a 5 second undo."],
  [GaugeIcon, "Fair daily limit", "10 posts a day per account, enforced by one atomic database query that cannot be raced."],
  [ShieldIcon, "Private by design", "Your posts are scoped to your account on every query, and the AI key never reaches the browser."],
] as const;

const STACK = ["Next.js 16", "React 19", "TypeScript", "PostgreSQL", "Drizzle ORM", "OpenAI Responses API", "Tailwind CSS 4", "Vitest"];

export default async function Home() {
  await connection(); // the demo button depends on runtime env
  const hasDemo = Boolean(demoAccount());
  const primary = hasDemo ? { href: "/login", label: "Try the live demo" } : { href: "/signup", label: "Start writing free" };

  return (
    <div className="min-h-dvh overflow-x-clip">
      <header className="sticky top-0 z-20 border-b border-transparent bg-paper/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm text-muted md:flex" aria-label="Sections">
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#features" className="hover:text-ink">Features</a>
            <a href="#open-source" className="hover:text-ink">Open source</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-quiet">Sign in</Link>
            <Link href={primary.href} className="btn btn-primary hidden sm:inline-flex">Get started</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative">
          <div className="bg-glow pointer-events-none absolute inset-0" aria-hidden />
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
          <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-24 lg:pb-28">
            <div className="rise min-w-0">
              <a href={REPO} className="chip mb-6 !py-1.5 !text-xs">
                <span className="rounded-full bg-gradient-to-r from-fill-from to-fill-to px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">Free</span>
                Open source · Built with Next.js 16 <ArrowRightIcon size={12} />
              </a>
              <h1 className="text-[2.6rem] leading-[1.05] font-semibold tracking-[-0.035em] text-balance sm:text-6xl lg:text-[4.2rem]">
                LinkedIn posts people <span className="text-gradient">actually read</span>.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted text-pretty">
                Type an idea. Get a post with a hook that earns the &quot;see more&quot; tap, short paragraphs and a question at the end. Streamed in seconds, ready to copy.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href={primary.href} className="btn btn-accent btn-lg"><SparkIcon /> {primary.label} <ArrowRightIcon /></Link>
                <a href={REPO} className="btn btn-ghost btn-lg"><GitHubIcon /> View source</a>
              </div>
              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                {["Free, 10 posts a day", "No credit card", "Your posts stay private"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5"><CheckIcon size={15} className="text-brand" /> {t}</li>
                ))}
              </ul>
            </div>

            <div className="relative min-w-0">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand/25 to-brand-2/20 blur-3xl" aria-hidden />
              <div className="float relative"><PostPreview name="Osama Ayub" body={SAMPLE} /></div>
              <div className="card absolute -top-5 -left-3 hidden items-center gap-2 px-3 py-2 text-xs font-medium sm:flex" aria-hidden>
                <span className="grid size-5 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"><CheckIcon size={12} /></span> Hook under 12 words
              </div>
              <div className="card absolute -right-3 -bottom-5 hidden items-center gap-2 px-3 py-2 text-xs font-medium sm:flex" aria-hidden>
                <BoltIcon size={14} className="text-brand" /> Streams word by word
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <p className="text-sm font-semibold text-brand">How it works</p>
          <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">From idea to post in three steps.</h2>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="card relative p-6">
                <span className="text-gradient text-5xl font-semibold tracking-tight">{i + 1}</span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="features" className="scroll-mt-20 border-y border-line bg-surface/60">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <p className="text-sm font-semibold text-brand">Features</p>
            <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Everything a good post needs. Nothing it doesn&apos;t.</h2>
            <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(([Icon, title, text]) => (
                <div key={title} className="bg-surface p-7">
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand"><Icon size={19} /></span>
                  <h3 className="mt-5 font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="open-source" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-brand">Open source</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Built in the open, for developers to learn from.</h2>
              <p className="mt-4 leading-relaxed text-muted">Clean feature architecture, business rules tested without a framework, and a usage limit that cannot be raced. Read the code, run it locally in a minute, or deploy your own.</p>
              <div className="mt-6 flex flex-wrap gap-2">{STACK.map((s) => <span key={s} className="chip">{s}</span>)}</div>
              <a href={REPO} className="btn btn-primary mt-8"><GitHubIcon /> Star on GitHub</a>
            </div>
            <div className="card overflow-hidden !rounded-2xl bg-[#0b1020] text-[13px] text-slate-300 dark:bg-[#07090f]">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-xs text-slate-400">
                <CodeIcon size={14} /> src/server/rate-limit.ts
              </div>
              <pre className="overflow-x-auto p-5 leading-relaxed"><code>{`INSERT INTO usage (user_id, day, count)
VALUES ($1, $2, 1)
ON CONFLICT (user_id, day)
DO UPDATE SET count = usage.count + 1
WHERE usage.count < $3
RETURNING count;`}<span className="text-slate-500">{`
-- no row back = limit reached`}</span></code></pre>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-fill-from to-fill-to px-6 py-14 text-center text-white sm:px-12">
            <div className="bg-grid absolute inset-0 opacity-20" aria-hidden />
            <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">Your next post is one idea away.</h2>
            <p className="relative mx-auto mt-3 max-w-md text-white/80">Free to use. No credit card. Write your first post in under a minute.</p>
            <Link href={primary.href} className="btn btn-lg relative mt-8 bg-white text-[#0b1020] hover:bg-white/90"><PenIcon /> {primary.label}</Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
          <Logo />
          <p>Open source under the MIT license. Made by <a href="https://www.youtube.com/@osamaayubdev" className="text-ink hover:underline">Osama Ayub</a>.</p>
          <a href={REPO} className="flex items-center gap-1.5 hover:text-ink"><GitHubIcon /> GitHub</a>
        </div>
      </footer>
    </div>
  );
}
