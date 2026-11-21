<div align="center">

# ✦ PostPilot

**An AI LinkedIn post writer built with Next.js 16, PostgreSQL and the OpenAI Responses API.**

Type an idea. Get a post with a strong hook, short paragraphs and a question at the end,<br>
streamed word by word, saved to your history, ready to copy.

[![Live demo](https://img.shields.io/badge/Live_demo-postpilot--osamaayub.vercel.app-000?logo=vercel)](https://postpilot-osamaayub.vercel.app)
[![CI](https://github.com/osamaayub/postpilot/actions/workflows/ci.yml/badge.svg)](https://github.com/osamaayub/postpilot/actions/workflows/ci.yml)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=000)](https://orm.drizzle.team)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[**Live demo**](https://postpilot-osamaayub.vercel.app) · [Quick start](#-quick-start) · [Screenshots](#-screenshots) · [Architecture](#-architecture) · [API](#-api) · [Deploy](#-deploy) · [YouTube](https://www.youtube.com/@osamaayubdev)

<br>

<img src="docs/demo.gif" alt="Typing an idea into PostPilot, picking the Story tone, and watching the LinkedIn post stream into a feed-style preview" width="860">

</div>

<br>

## Contents

- [Why PostPilot](#-why-postpilot)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech stack](#-tech-stack)
- [Quick start](#-quick-start)
- [Environment variables](#-environment-variables)
- [Scripts](#-scripts)
- [Architecture](#-architecture)
- [How a post is written](#-how-a-post-is-written)
- [Database](#-database)
- [API](#-api)
- [Project structure](#-project-structure)
- [Design decisions](#-design-decisions)
- [Security](#-security)
- [Testing and CI](#-testing-and-ci)
- [Deploy](#-deploy)
- [Troubleshooting](#-troubleshooting)
- [Roadmap and practice ideas](#-roadmap-and-practice-ideas)
- [License](#license)

## 💡 Why PostPilot

LinkedIn only shows the first three lines of a post before **...see more**. If those lines are weak, nobody reads the rest. PostPilot writes the hook first, shows you exactly where the feed will cut your post, and keeps every draft so you can edit it later.

It is also a **reference project** for building a production-style AI feature in Next.js: streaming responses, a fair usage limit that cannot be raced, credits refunded on failure, owner-scoped data, and business logic that is tested without a framework, a database or an API key.

## ✨ Features

| | |
| --- | --- |
| **Streaming AI** | Posts stream into the page as the OpenAI Responses API writes them. Press **Stop** at any time |
| **Feed preview** | The post is shown the way the LinkedIn feed shows it: three lines, then **...see more**. The hook is highlighted and the preview counts the characters above the fold |
| **Tone and length** | Practical, story, bold or friendly; short, medium or long. Starter ideas for a quick first post |
| **History** | Every finished post is saved. Edit (optimistic update), copy, or delete with a 5 second **Undo** |
| **Fair daily limit** | 10 posts per user per day (configurable), enforced by one atomic PostgreSQL upsert. A failed or stopped generation gives the credit back |
| **Auth** | Email and password sign-up with bcrypt, a signed JWT in an `httpOnly` cookie, and a server-side check on every page, action and API call |
| **Zero-setup demo** | No database? It runs on PGlite (PostgreSQL compiled to WebAssembly) with a demo account. No OpenAI key? A free demo writer streams a sample post |
| **Works on phones** | Responsive layout with a bottom tab bar on small screens |

## 📸 Screenshots

| Landing page | Writing a post |
| --- | --- |
| <img src="docs/screenshots/landing.png" alt="PostPilot landing page with a sample LinkedIn post preview"> | <img src="docs/screenshots/write.png" alt="Write page: topic, tone and length on the left, the finished post in a feed preview on the right"> |
| **History** | **On a phone** |
| <img src="docs/screenshots/history.png" alt="History page listing saved posts with Copy, Edit and Delete buttons"> | <img src="docs/screenshots/mobile-write.png" alt="PostPilot on a phone with the bottom tab bar" width="48%"> <img src="docs/screenshots/mobile-history.png" alt="History page on a phone" width="48%"> |

> These images are captured from the running app by GitHub Actions ([`screenshots.yml`](.github/workflows/screenshots.yml) runs [`scripts/screenshots.mjs`](scripts/screenshots.mjs)), so they update when the UI changes.

## 🧰 Tech stack

| Area | Choice |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions, Route Handlers), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4, Geist and Source Serif 4 fonts, [sonner](https://sonner.emilkowal.ski) toasts |
| Database | PostgreSQL via [Drizzle ORM](https://orm.drizzle.team) and `pg`; [PGlite](https://pglite.dev) when no `DATABASE_URL` is set |
| AI | [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses) (streaming), behind a `PostWriter` interface |
| Auth | bcryptjs, [jose](https://github.com/panva/jose) (JWT), `httpOnly` cookies |
| Validation | [Zod 4](https://zod.dev) for every input and for environment variables |
| Testing | [Vitest](https://vitest.dev), in-memory fakes, real PostgreSQL through PGlite |
| CI | GitHub Actions with a PostgreSQL 16 service |

## 🚀 Quick start

You need **Node.js 20.9 or newer**.

```bash
git clone https://github.com/osamaayub/postpilot.git
cd postpilot
npm install
cp .env.example .env.local     # then set SESSION_SECRET (openssl rand -base64 32)
npm run dev
```

Open http://localhost:3000 and press **Try the demo**. The demo account is filled in for you:

| Email | Password |
| --- | --- |
| `demo@postpilot.dev` | `password123` |

> The demo account only exists on the built-in demo database. It is never created on a real `DATABASE_URL`, where you sign up with your own account.

### Use real PostgreSQL and real AI

```bash
# .env.local
DATABASE_URL=postgres://user:password@localhost:5432/postpilot
OPENAI_API_KEY=sk-...
```

No migrations to run: the tables are created on the first request ([`src/server/ddl.ts`](src/server/ddl.ts)).

Need a local Postgres? One line with Docker:

```bash
docker run -d --name postpilot-db -e POSTGRES_PASSWORD=postpilot -e POSTGRES_DB=postpilot -p 5432:5432 postgres:16
# DATABASE_URL=postgres://postgres:postpilot@localhost:5432/postpilot
```

## 🔐 Environment variables

| Name | Required | Default | What it does |
| --- | --- | --- | --- |
| `SESSION_SECRET` | **Yes** | | Signs session cookies. At least 32 characters (`openssl rand -base64 32`) |
| `DATABASE_URL` | No | built-in PGlite | Any PostgreSQL: local, Neon, Supabase, RDS. Without it, data lives in memory and resets on restart |
| `OPENAI_API_KEY` | No | demo writer | Turns on real AI. Read only on the server |
| `OPENAI_MODEL` | No | `gpt-5-mini` | Model used for posts |
| `DAILY_POST_LIMIT` | No | `10` | Posts per user per day |

All variables are validated with Zod on first use ([`src/lib/env.ts`](src/lib/env.ts)), so a typo fails fast with a clear message.

## 📜 Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint, including the architecture rules below |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run check` | lint + typecheck + tests (run this before you push) |

## 🏛 Architecture

Each feature is split into layers, and **dependencies point inwards**. The business rules (`service.ts`) know nothing about Next.js, SQL or OpenAI; they talk to the outside world only through small interfaces (`ports.ts`).

```mermaid
flowchart LR
  subgraph UI["UI (Next.js)"]
    P[Pages and components]
    R["Route Handler<br/>/api/generate"]
    A[Server Actions]
  end
  subgraph Core["Core (framework-free)"]
    S["service.ts<br/>business rules"]
    D["domain/<br/>fold, prompt"]
    PT["ports.ts<br/>interfaces"]
  end
  subgraph Infra["Adapters"]
    RP["repository.ts<br/>Drizzle + PostgreSQL"]
    W["writers/<br/>OpenAI or demo"]
    L["rate-limit.ts<br/>atomic upsert"]
  end
  C["server.ts<br/>composition root"]
  P --> A --> S
  R --> S
  S --> D
  S --> PT
  RP -. implements .-> PT
  W -. implements .-> PT
  L -. implements .-> PT
  C --> S
  C --> RP
  C --> W
  C --> L
```

| Layer | Files | May import |
| --- | --- | --- |
| **Domain** | `features/posts/domain/*` | nothing but plain TypeScript |
| **Service** | `features/posts/service.ts` | domain, ports, schemas |
| **Ports** | `features/posts/ports.ts` | types only |
| **Adapters** | `repository.ts`, `writers/*`, `server/rate-limit.ts` | Drizzle, OpenAI, the database |
| **Composition root** | `features/posts/server.ts` | everything, and wires it together once |
| **UI** | `app/*`, `features/*/components`, `actions.ts` | the composition root, never the database |

These rules are **enforced by ESLint** ([`eslint.config.mjs`](eslint.config.mjs)): importing `next`, `drizzle-orm` or `openai` into the core, or the database into a page or component, fails `npm run lint`.

**Why it is worth it:** the service is tested with in-memory fakes in milliseconds, and swapping OpenAI for Anthropic means writing one class that implements `PostWriter`.

## 🔄 How a post is written

```mermaid
sequenceDiagram
  participant B as Browser
  participant R as /api/generate
  participant S as postService
  participant L as DailyLimiter (Postgres)
  participant W as PostWriter (OpenAI)
  participant DB as PostStore (Postgres)
  B->>R: POST { topic, tone, length }
  R->>R: read session cookie (401 if none)
  R->>S: generate(userId, input, signal)
  S->>S: validate with Zod (400)
  S->>L: take one credit (atomic, 429 if none left)
  S->>W: stream(instructions, input)
  loop every chunk
    W-->>S: text delta
    S-->>R: text
    R-->>B: streamed text
  end
  S->>DB: save the finished post
  S-->>B: record separator + { id }
  Note over S,L: AI error or user pressed Stop: give the credit back, save nothing
```

- **Why a Route Handler and not a Server Action?** The browser must read the response while it is still arriving. Forms that only save data (edit, delete) use Server Actions.
- **How does the browser learn the new post's id?** After the text, the stream sends the ASCII record separator (`U+001E`) followed by `{"id":"..."}`. The client splits on it ([`marker.ts`](src/features/posts/marker.ts)).
- **The daily limit** is a single statement, so two requests at the same moment cannot both take the last credit:

```sql
INSERT INTO usage (user_id, day, count) VALUES ($1, $2, 1)
ON CONFLICT (user_id, day) DO UPDATE SET count = usage.count + 1
WHERE usage.count < $3
RETURNING count;   -- no row back = limit reached
```

- **The LinkedIn fold:** LinkedIn shows about three lines (roughly 210 characters) before **...see more**. [`domain/fold.ts`](src/features/posts/domain/fold.ts) splits a post at the same point, never in the middle of a word, so the preview matches the feed.

## 🗄 Database

Three tables, created automatically on the first request.

```mermaid
erDiagram
  users ||--o{ posts : writes
  users ||--o{ usage : "uses credits"
  users {
    uuid id PK
    text name
    text email UK
    text password_hash
    timestamptz created_at
  }
  posts {
    uuid id PK
    uuid user_id FK
    text topic
    text tone
    text length
    text body
    text model
    timestamptz created_at
    timestamptz updated_at
  }
  usage {
    uuid user_id PK,FK
    date day PK
    int count
  }
```

- `posts (user_id, created_at)` is indexed for the history page.
- Deleting a user cascades to their posts and usage rows.
- `usage` has one row per user per day, which keeps the limit check to a single upsert.

## 🔌 API

### `POST /api/generate`

Streams a new post as plain text. Requires the session cookie.

```http
POST /api/generate
Content-Type: application/json

{ "topic": "Why I write tests first", "tone": "practical", "length": "medium" }
```

| Field | Rules |
| --- | --- |
| `topic` | Required, trimmed, 8 to 200 characters |
| `tone` | `practical` · `story` · `bold` · `friendly` (anything else falls back to `practical`) |
| `length` | `short` · `medium` · `long` (anything else falls back to `medium`) |

| Status | Meaning |
| --- | --- |
| `200` | `text/plain` stream of the post, then `U+001E` and `{"id":"<post id>"}` |
| `400` | Invalid input: `{ "message": "..." }` |
| `401` | Not signed in |
| `429` | Daily limit reached |

Closing the connection early (the **Stop** button) cancels the AI call and refunds the credit.

### Server Actions

| Action | File | Does |
| --- | --- | --- |
| `signup`, `login`, `logout` | [`features/auth/actions.ts`](src/features/auth/actions.ts) | Account and session |
| `updatePost(id, body)` | [`features/posts/actions.ts`](src/features/posts/actions.ts) | Edit your own post |
| `deletePost(id)` | [`features/posts/actions.ts`](src/features/posts/actions.ts) | Delete your own post |

## 📁 Project structure

```
src/
  app/
    page.tsx                     Landing page
    (auth)/login, signup         Auth pages
    (app)/layout.tsx             Signed-in shell: header, nav, mobile tab bar
    (app)/write, history         The app
    api/generate/route.ts        Streaming endpoint
  features/
    auth/
      actions.ts                 signup, login, logout (Server Actions)
      schemas.ts                 Zod input rules
      server/                    token (JWT), session (cookie), password (bcrypt),
                                 user-repository, current-user (the auth check)
      components/auth-form.tsx
    posts/
      domain/fold.ts, prompt.ts  Pure functions
      ports.ts                   PostStore, PostWriter, DailyLimiter, Clock
      service.ts                 Business rules (framework-free)
      repository.ts              Drizzle PostStore, scoped to the owner
      writers/                   OpenAIWriter, DemoWriter, getWriter()
      server.ts                  Composition root
      actions.ts                 updatePost, deletePost
      components/                WriteStudio, PostPreview, HistoryList
  lib/                           env (Zod), result type, JSON logger
  server/                        db (Postgres or PGlite), schema, ddl, seed, rate-limit
  proxy.ts                       Fast redirect for signed-out users (no database)
test/                            Vitest: domain, service with fakes, tokens, real PGlite
scripts/screenshots.mjs          Captures the README images from the running app
```

## 🧭 Design decisions

| Decision | Why |
| --- | --- |
| Feature folders with ports and a composition root | Business rules stay testable and framework-free; infrastructure can change without touching them |
| Credits are taken **before** the AI call and given back on failure | Users never pay for an error, and nobody can start ten generations at once to get around the limit |
| PGlite fallback | Anyone can clone and run the project in a minute, with real PostgreSQL behaviour |
| Results instead of exceptions for expected failures | `INVALID_INPUT`, `LIMIT_REACHED`, `NOT_FOUND` are values the UI can show; real exceptions are logged |
| Delete behind an Undo toast | A misclick never loses a post, and the server stays simple (no soft-delete column) |
| Plain-text prompt rules in `domain/prompt.ts` | Easy to read, test and change. The model is told never to invent numbers or results |

## 🛡 Security

- Passwords hashed with bcrypt (12 rounds); failed logins take the same time whether or not the email exists
- Sessions are signed JWTs in `httpOnly`, `sameSite=lax` cookies (`secure` in production)
- `proxy.ts` only redirects; the real check (`getCurrentUser`) runs on the server for every page, action and API call
- Every post query includes `user_id`, so one user can never read, edit or delete another user's posts (tested)
- All input is validated with Zod on the server; the OpenAI key never reaches the browser
- Security headers (`nosniff`, `DENY` framing, strict referrer, permissions policy); `X-Powered-By` removed

## ✅ Testing and CI

```bash
npm test          # Vitest
npm run check     # lint + typecheck + tests
```

| Test file | What it proves |
| --- | --- |
| `fold.test.ts` | Posts fold after 3 lines or about 210 characters, never mid-word |
| `prompt.test.ts` | Tone, length and the honesty rule reach the prompt; bad input falls back safely |
| `post-service.test.ts` | Streaming, saving, the daily limit, credit refund on AI errors and on Stop, owner-only edits |
| `token.test.ts` | Session tokens reject other secrets, garbage and missing values |
| `database.test.ts` | On real PostgreSQL (PGlite): 10 requests at once never exceed a limit of 3; every query is owner-scoped |

**On every push and pull request**, [`ci.yml`](.github/workflows/ci.yml) runs lint, typecheck, tests and a production build, then starts the app against a **PostgreSQL 16** service and smoke-tests it (home page renders, signed-out users are redirected, the API rejects anonymous calls).

## ☁️ Deploy

### Live deployment

**https://postpilot-osamaayub.vercel.app** runs on Vercel (region `iad1`) with a Neon PostgreSQL 17 database in `us-east-1`. Sign up with any email to try it. It auto-deploys every push to `main`.

| Variable | Set to | Environments |
| --- | --- | --- |
| `SESSION_SECRET` | 64 random characters (sensitive) | Production, Preview |
| `DATABASE_URL` | Neon pooled connection string (sensitive) | Production, Preview |
| `OPENAI_MODEL` | `gpt-5-mini` | All |
| `DAILY_POST_LIMIT` | `10` | All |
| `OPENAI_API_KEY` | not set yet, so posts use the free demo writer | |

### Vercel + Neon (recommended, both have free tiers)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fosamaayub%2Fpostpilot&project-name=postpilot&repository-name=postpilot&env=SESSION_SECRET,DATABASE_URL&envDescription=SESSION_SECRET%3A%2032%2B%20random%20characters.%20DATABASE_URL%3A%20a%20PostgreSQL%20connection%20string%20(Neon%20works%20well).&envLink=https%3A%2F%2Fgithub.com%2Fosamaayub%2Fpostpilot%23-environment-variables)

1. Create a free database at [neon.tech](https://neon.tech) and copy its connection string (keep `?sslmode=require`).
2. Click **Deploy with Vercel** above, or import the repo at [vercel.com/new](https://vercel.com/new).
3. Set the environment variables:

   | Name | Value |
   | --- | --- |
   | `SESSION_SECRET` | output of `openssl rand -base64 32` |
   | `DATABASE_URL` | your Neon connection string |
   | `OPENAI_API_KEY` | optional, for real AI (otherwise the demo writer is used) |

4. Deploy. The tables are created on the first request; sign up to create your account.

> **Do not deploy without `DATABASE_URL`.** The PGlite fallback keeps data in memory, and serverless instances restart often, so accounts and posts would disappear.

### Any other Node host

`npm ci && npm run build && npm start` with the same environment variables. Any PostgreSQL 13+ works.

## 🩺 Troubleshooting

| Problem | Fix |
| --- | --- |
| `SESSION_SECRET must be at least 32 characters` | Generate one with `openssl rand -base64 32` and put it in `.env.local` |
| The demo login does not work | It only exists without `DATABASE_URL`. With a real database, sign up instead |
| Posts end with "(Demo mode: add OPENAI_API_KEY...)" | No OpenAI key is set, so the free demo writer is used. Add `OPENAI_API_KEY` |
| Data disappears after a restart | You are on the in-memory PGlite fallback. Set `DATABASE_URL` |
| `429` from `/api/generate` | The daily limit is reached. Raise `DAILY_POST_LIMIT` or wait until tomorrow (UTC) |
| SSL error connecting to Neon or Supabase | Keep `?sslmode=require` at the end of the connection string |

## 🗺 Roadmap and practice ideas

Good first contributions, or exercises if you are learning from this code:

- [ ] **Regenerate hook only**: rewrite just the first line
- [ ] **Pro plan with Stripe** that raises the daily limit
- [ ] **`AnthropicWriter`** that implements `PostWriter`, picked with an environment variable
- [ ] **Hashtag suggestions** under the preview
- [ ] **Dark mode**

Issues and pull requests are welcome. Please run `npm run check` before opening a PR.

## License

[MIT](LICENSE) © Osama Ayub · Built and explained on [YouTube](https://www.youtube.com/@osamaayubdev)
