# School-Connect

SaaS education ecosystem with a CBT test engine, PYQ bank, Gemini AI weakness
tracker, and dual Independent + Institution portals.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # tsc --noEmit
npm test           # vitest unit tests
npm run build      # production build
```

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
