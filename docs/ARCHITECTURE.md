# School-Connect — Architecture & Developer Guide

This is the single source of truth for how the app is put together. Read this
before changing anything so you don't break the two operating modes or the
security model.

---

## 1. What this app is

A SaaS education ecosystem for competitive-exam prep (JEE, NEET, SSC, UPSC,
CBSE). It has:

- A **CBT test engine** (computer-based mock tests)
- A **PYQ bank** (previous-year questions, chapter/topic explorer)
- An **AI mentor** (Gemini-powered chat, weakness analysis, revision planner,
  progress reports, question explanations)
- Four portals: **Student**, **Parent**, **Teacher**, **Institution Admin**
- A **chat system** (student ↔ parent ↔ teacher, doubts, media)
- Study tools: NCERT hub, revision hub, syllabus tracker, daily goals, bookmarks

> The UI is intentionally rich/detailed. The backend is what this document is
> mostly about — it now supports a **real backend** when you wire up Supabase,
> and falls back to a fully-working **demo mode** otherwise.

---

## 2. Stack

| Layer     | Technology                                                              |
|-----------|-------------------------------------------------------------------------|
| Frontend  | React 19, TypeScript, Vite 6, Tailwind CSS 4, Motion                    |
| Backend   | Express (server.ts), Node 20+                                            |
| AI        | Google Gemini (`@google/genai`), server-side only                        |
| Database  | Supabase (Postgres + Row Level Security) — optional but recommended      |
| Auth      | Supabase Auth (email + password) — optional; demo fallback otherwise     |

---

## 3. The two operating modes (IMPORTANT)

The app auto-detects its mode at runtime. **No component decides this — it is
centralized in `src/lib/config.ts`.**

| Mode         | Trigger                                        | Auth | Data storage                              |
|--------------|------------------------------------------------|------|-------------------------------------------|
| **supabase** | `VITE_SUPABASE_URL` **and** `VITE_SUPABASE_ANON_KEY` are set | Real (Supabase Auth) | Supabase tables (localStorage = cache)    |
| **local**    | Neither env var is set (the default)           | Demo (still validates email+password shape) | localStorage only (single-browser demo) |

### To switch to the real backend

1. Create a Supabase project.
2. Run the migration: `supabase/migrations/20260826112805_create_school_connect_tables.sql`
   (this creates the 9 tables AND enables Row Level Security).
3. Copy `.env.example` → `.env` and fill:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   GEMINI_API_KEY=your-gemini-key
   GEMINI_MODEL=gemini-3.6-flash
   ```
4. Restart `npm run dev`.

> **Security:** only the **anon** key goes in the browser. The **service_role**
> key must NEVER be in client code or `.env` exposed to the browser; it bypasses
> RLS and belongs only in a trusted server context.

---

## 4. Project structure

```
school-connect/
├─ server.ts                     Express + Gemini AI + security middleware
├─ vite.config.ts                Vite + Tailwind + chunk splitting
├─ package.json                  scripts (dev/build/test/start/lint)
├─ .env.example                  every env var, documented
├─ docs/ARCHITECTURE.md          this file
├─ supabase/migrations/          Postgres schema + RLS policies
└─ src/
   ├─ main.tsx                   React entry + <ErrorBoundary>
   ├─ App.tsx                    lazy-loaded route views
   ├─ types.ts                   all shared types
   ├─ lib/
   │  ├─ config.ts               env reads + mode detection  (READ THIS FIRST)
   │  ├─ supabase.ts             lazy Supabase client (null in demo mode)
   │  ├─ validate.ts             pure School-Connect ID validation (unit-tested)
   │  └─ __tests__/              Vitest tests for lib logic
   ├─ services/
   │  ├─ aiService.ts            calls the /api/ai/* endpoints (client)
   │  ├─ authService.ts          signup / signin / signout
   │  └─ dataService.ts          CRUD → Supabase or localStorage
   ├─ context/AppContext.tsx     global state (single provider)
   ├─ data/mockData.ts           seeded demo data
   └─ components/                feature components (routes, dashboards, modals)
```

---

## 5. Data flow

### Reads
UI reads from React state (`AppContext`). In **local** mode that state is
initialized from `localStorage` keys prefixed `sc_`. In **supabase** mode the
provider also runs a one-time hydration effect that fetches collections from
Supabase on mount and merges them into state.

### Writes
Any state change runs a localStorage write **and** (in supabase mode) an async
`upsertCollection` call to the matching table. LocalStorage is the *instant
render cache*; Supabase is the *durable store*. They stay in sync so a parent on
one device and a student on another can share data.

### Mapping
`dataService.ts` converts the app's camelCase shapes to the database's
snake_case columns. The writable column list per table lives in `WRITABLE_COLUMNS`
— only columns that actually exist are ever sent, so you can't accidentally
error with "column does not exist."

---

## 6. Security model

Server (`server.ts`):
- Rate limiting (in-memory, per-IP, now evicts oldest instead of clearing all).
- Prototype-pollution guard on JSON bodies.
- Correlation ID on every response (for tracing, never leaks internals).
- Security headers (nosniff, XSS, Referrer-Policy, Permissions-Policy, HSTS in prod).
- Blocks access to `.git`, `.env`, `.pem/.key/.crt`, `package-lock.json`.
- Blocks TRACE/TRACK methods.
- All AI keys stay server-side (never sent to the browser).

Client:
- Env vars centralized in `src/lib/config.ts`.
- Passwords never stored in localStorage (demo mode keeps a safe session flag).
- `ErrorBoundary` prevents a blank white screen on crashes.

Database (Supabase):
- RLS enabled on every table. In the single-tenant demo setup policies allow
  `anon`/`authenticated` CRUD so the frontend works out of the box. **For
  multi-tenant/production, tighten these policies** so each institution/role only
  sees its own rows (see §9).

---

## 7. Commands

| Command            | What it does                                            |
|--------------------|---------------------------------------------------------|
| `npm run dev`      | Start Express + Vite dev server (http://0.0.0.0:3000)    |
| `npm run build`    | Production build (vite + esbuild server) → `dist/`        |
| `npm start`        | Serve the production build                               |
| `npm run lint`     | Type-check with `tsc --noEmit`                           |
| `npm test`         | Run the Vitest unit tests                                |
| `npm run clean`    | Remove `dist/`                                           |

---

## 8. Where to put a new feature

1. **Types** → `src/types.ts`
2. **Transport/data** → a function in `src/services/*` (never call Supabase
   directly in a component; use the services so the localStorage fallback stays).
3. **State** → extend `AppContext` only for globally-shared state; keep
   component-local state in the component.
4. **Route/View** → add the component under `src/components/`, lazy-load it in
   `App.tsx`, and add the view id to the `AppView` union in `AppContext.tsx`.
5. **DB table** → add a migration in `supabase/migrations/` and add the table to
   `TABLE_MAP` + `WRITABLE_COLUMNS` in `src/services/dataService.ts`.

---

## 9. Known limitations / next steps

- **Multi-tenancy**: currently a single-tenant demo. Institutions are mock data.
  Real per-school isolation requires tightening the RLS policies and passing a
  `service_role`-style context on the server for trusted operations.
- **PYQ count**: displayed as "15,000+" but ships with a sample set. A real
  content/seed pipeline is needed to load the full bank into `questions`.
- **Real-time chat**: chat persists (localStorage / Supabase) but live updates
  between users would need Supabase *Realtime* (websockets) or polling.
- **Payments/billing**: not implemented. Would need a payment gateway (e.g.
  Razorpay/Stripe) on the server.
- **File uploads**: chat attachments are mocked with sample URLs. Real uploads
  would use Supabase Storage.
- **Tests**: a Vitest suite for pure logic exists. Add integration/e2e tests for
  the API endpoints and React flows as the backend grows.
