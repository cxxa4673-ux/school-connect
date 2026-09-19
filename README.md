# School-Connect

SaaS education ecosystem with a CBT test engine, PYQ bank, Gemini AI weakness
tracker, and dual Independent + Institution portals.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # tsc --noEmit
npm test           # vitest unit tests
npm run build      # production build (web bundle + server bundle)
```

## Deploying to Vercel

The repo is deploy-ready — `vercel.json` pins everything Vercel needs, so no
dashboard settings have to be changed:

| Setting        | Value                                          |
|----------------|------------------------------------------------|
| Framework      | Vite (set by `vercel.json`)                    |
| Build command  | `npm run build:app` → `vite build`             |
| Output dir     | `dist`                                         |
| Install command| `npm install`                                  |
| Functions      | `api/**` (Vercel serverless, Node runtime)     |

Steps:

1. Import the GitHub repo in Vercel (**Root Directory must be the repo root**).
2. Add the environment variables (Project → Settings → Environment Variables):
   - `GEMINI_API_KEY` — server-side only, powers the AI endpoints
   - `GEMINI_MODEL` — optional (defaults to `gemini-3.6-flash`)
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — optional, for real backend mode
   > `VITE_*` values are baked into the bundle at **build** time: after changing
   > them you must redeploy (not just restart) for the app to pick them up.
3. Deploy, then open `/api/health`. It returns
   `{"status":"healthy","aiConfigured":true|false,...}` — if `aiConfigured` is
   `false`, the `GEMINI_API_KEY` did not reach the runtime.
4. Optional: set the Vercel project's **Node.js Version** to 20.x or 22.x.

How the deploy maps to the code:

- `api/_lib/` — shared, framework-agnostic handlers (sanitizers, rate limit,
  Gemini calls, fallbacks). Files starting with `_` are not routed by Vercel.
- `api/health.ts`, `api/ai/*.ts` — one Vercel function per endpoint; each simply
  re-exports a handler from `api/_lib/handlers.ts`.
- `server.ts` (local dev + `npm start`) mounts the **same** handlers on Express,
  so local and production behaviour can't drift apart.

### Deploy troubleshooting

| Symptom | Cause / fix |
|---|---|
| Build fails with ``Rewrite at index N has invalid `source` pattern`` | A negative-lookahead rewrite (e.g. `/((?!api/).*)`). Vercel parses `source` with path-to-regexp, not regex. Use the canonical `/(.*)` → `/index.html`; real files and `/api/*` functions are matched before rewrites. |
| `No Output Directory named "dist" found` | The build command produced no `dist/`. Check that the build command is `npm run build:app` and that the Root Directory is the repo root. |
| Build works locally, fails on Vercel | Usually a stale install: clear the build cache in Vercel, and keep `package-lock.json` in sync with `package.json` (`npm install` locally, commit the lockfile). |
| App loads but AI replies look generic | `GEMINI_API_KEY` missing on Vercel — the endpoints intentionally fall back to built-in pedagogical answers instead of erroring. See `/api/health`. |
| Deep links (e.g. `/chat`) 404 on refresh | SPA fallback rewrite missing — `vercel.json` already includes it. |

`api/__tests__/vercel-config.test.ts` fails the test suite if anyone
reintroduces a rewrite pattern Vercel rejects.

## Two operating modes

The app runs in **demo mode** out of the box (all data in localStorage, no
backend needed). To enable a real backend with accounts and cross-device sync,
copy `.env.example` → `.env` and fill in your **Supabase** URL + anon key and
**Gemini** API key. See `docs/ARCHITECTURE.md` for the full guide.

## Project map

- `server.ts` — Express + Gemini AI + security middleware
- `src/lib/config.ts` — env reading + mode detection
- `src/services/` — auth, data, and AI service layers
- `src/context/AppContext.tsx` — global state
- `supabase/migrations/` — Postgres schema + RLS
- `docs/ARCHITECTURE.md` — how everything fits together

## Security notes

- All AI keys stay **server-side**.
- Rate limiting, security headers, prototype-pollution guard, and sensitive-file
  blocking are enabled on the server.
- Never put the Supabase `service_role` key in client code or `.env` exposed to
  the browser — use only the anon key there.
