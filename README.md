<div align="center">

# PostPilot

### An AI LinkedIn post writer built with Next.js 16, PostgreSQL and the OpenAI Responses API

Type an idea. Get a post with a strong hook, short paragraphs and a question at the end, streamed word by word, saved to your history, ready to copy.

[![CI](https://github.com/osamaayub/postpilot/actions/workflows/ci.yml/badge.svg)](https://github.com/osamaayub/postpilot/actions/workflows/ci.yml)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=000)](https://orm.drizzle.team)
[![OpenAI](https://img.shields.io/badge/OpenAI-Responses_API-412991?logo=openai&logoColor=white)](https://platform.openai.com/docs/api-reference/responses)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Run it locally](#quick-start) · [Architecture](#architecture) · [How it works](#how-it-works) · [YouTube channel](https://www.youtube.com/@osamaayubdev)

</div>

## Contents

- [Features](#features)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Architecture](#architecture)
- [How it works](#how-it-works)
- [Project structure](#project-structure)
- [Design decisions](#design-decisions)
- [Security](#security)
- [Testing](#testing)
- [Deploy](#deploy)
- [Practise](#practise)

## Features

| | |
| --- | --- |
| **Streaming AI** | Posts stream into the page as the OpenAI Responses API writes them. Press **Stop** at any time |
| **Feed preview** | The post is shown the way the LinkedIn feed shows it: three lines, then **...see more**. The hook line is highlighted and the preview tells you how many characters are above the fold |
| **Tone and length** | Practical, story, bold or friendly; short, medium or long. Starter ideas for a quick first post |
| **History** | Every finished post is saved. Edit (optimistic update), copy, or delete with a 5 second **Undo** |
| **Fair daily limit** | 10 posts per user per day (configurable), enforced by one atomic PostgreSQL upsert. A failed or stopped generation gives the credit back |
| **Auth** | Email and password sign-up with bcrypt, a signed JWT in an httpOnly cookie, and a server-side check on every page, action and API call |
| **Zero setup demo** | No database? It runs on PGlite (PostgreSQL compiled to WebAssembly) with a demo account. No OpenAI key? A free demo writer streams a sample post |
| **Works on phones** | Responsive layout with a bottom tab bar on small screens |

## Quick start

You need Node.js 20.9 or newer.

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

The demo account only exists on the built-in demo database. It is never created on a real `DATABASE_URL`.

### Use real PostgreSQL and real AI

```bash
# .env.local
DATABASE_URL=postgres://user:password@localhost:5432/postpilot
OPENAI_API_KEY=sk-...
```

Tables are created automatically on the first request (see [`src/server/ddl.ts`](src/server/ddl.ts)).

## Environment variables

| Name | Required | Default | What it does |
| --- | --- | --- | --- |
| `SESSION_SECRET` | Yes | | Signs session cookies. At least 32 characters |
| `DATABASE_URL` | No | built-in PGlite | Any PostgreSQL: local, Neon, Supabase, RDS |
| `OPENAI_API_KEY` | No | demo writer | Turns on real AI. Stays on the server |
| `OPENAI_MODEL` | No | `gpt-5-mini` | Model used for posts |
| `DAILY_POST_LIMIT` | No | `10` | Posts per user per day |

All variables are validated with Zod on first use ([`src/lib/env.ts`](src/lib/env.ts)), so a typo fails fast with a clear message.

## Architecture

Each feature is split into layers. The rule is simple: **dependencies point inwards**. The business rules (`service.ts`) know nothing about Next.js, SQL or OpenAI; they talk to the outside world only through small interfaces (`ports.ts`).

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

Why it is worth it: the service is tested with in-memory fakes in milliseconds, and swapping OpenAI for Anthropic means writing one class that implements `PostWriter`.

## How it works

### Writing a post

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

- **Why a Route Handler and not a Server Action?** The browser must read the response while it is still arriving. Forms that just save data (edit, delete) use Server Actions.
- **How does the browser learn the new post's id?** After the text, the stream sends the ASCII record separator (`U+001E`) followed by `{"id":"..."}`. The client splits on it ([`marker.ts`](src/features/posts/marker.ts)).
- **The daily limit** is a single statement, so two requests at the same moment cannot both take the last credit:

```sql
INSERT INTO usage (user_id, day, count) VALUES ($1, $2, 1)
ON CONFLICT (user_id, day) DO UPDATE SET count = usage.count + 1
WHERE usage.count < $3
RETURNING count;   -- no row back = limit reached
```

### The LinkedIn fold

LinkedIn shows about three lines (roughly 210 characters) before **...see more**. [`domain/fold.ts`](src/features/posts/domain/fold.ts) splits a post at the same point, never in the middle of a word, so the preview matches the feed and the writer can see exactly what readers see.

## Project structure

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
```

## Design decisions

| Decision | Why |
| --- | --- |
| Feature folders with ports and a composition root | Business rules stay testable and framework-free; infrastructure can change without touching them |
| Credits are taken **before** the AI call and given back on failure | Users never pay for an error, and nobody can start ten generations to get around the limit |
| PGlite fallback | Anyone can clone and run the project in one minute, with real PostgreSQL behaviour |
| Results instead of exceptions for expected failures | `INVALID_INPUT`, `LIMIT_REACHED`, `NOT_FOUND` are values the UI can show; real exceptions are logged |
| Delete behind an Undo toast | A misclick never loses a post, and the server stays simple (no soft-delete column) |
| Plain-text prompt rules in `domain/prompt.ts` | Easy to read, test and change. The model is told never to invent numbers or results |

## Security

- Passwords hashed with bcrypt (12 rounds); failed logins take the same time whether or not the email exists
- Sessions are signed JWTs in `httpOnly`, `sameSite=lax` cookies (`secure` in production)
- `proxy.ts` only redirects; the real check (`getCurrentUser`) runs on the server for every page, action and API call
- Every post query includes `user_id`, so one user can never read, edit or delete another user's posts (tested)
- All input is validated with Zod on the server; the OpenAI key never reaches the browser
- Security headers (`nosniff`, `DENY` framing, strict referrer, permissions policy); `X-Powered-By` removed

## Testing

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

GitHub Actions runs lint, typecheck, tests and a production build on every push ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Deploy

1. Create a PostgreSQL database (Neon, Supabase, or any Postgres 13+).
2. Deploy to Vercel or any Node host and set `SESSION_SECRET`, `DATABASE_URL` and, for real AI, `OPENAI_API_KEY`.
3. The tables are created on the first request.

## Practise

1. Add a **Regenerate hook only** button that rewrites just the first line.
2. Add a Pro plan with Stripe that raises the daily limit.
3. Add an `AnthropicWriter` that implements `PostWriter`, and pick it with an environment variable.

## License

[MIT](LICENSE) © Osama Ayub
