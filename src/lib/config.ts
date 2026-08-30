/**
 * Centralized runtime configuration.
 *
 * Why this file exists:
 *   - Keeps every environment variable read in ONE place (easy to audit/find).
 *   - The server uses `dotenv`; the browser only sees `VITE_`-prefixed vars,
 *     so this file normalizes both under the same names.
 *   - A future engineer just fills `.env` and everything reacts automatically.
 *
 * How to configure:
 *   Copy `.env.example` to `.env`, then set:
 *     VITE_SUPABASE_URL    = your Supabase project URL
 *     VITE_SUPABASE_ANON_KEY = your Supabase anon (public) key
 *
 * IMPORTANT (security):
 *   - NEVER put the Supabase `service_role` key here. That key bypasses all
 *     Row Level Security (RLS) and must live ONLY on the server (server.ts),
 *     and only for trusted server-side operations.
 *   - The anon key is safe to expose to the browser; all real access control
 *     is enforced by RLS policies on the server (see supabase/migrations).
 */

/** True when a real Supabase project has been wired up. */
export const isSupabaseConfigured = (): boolean =>
  Boolean(
    (import.meta.env?.VITE_SUPABASE_URL as string | undefined) &&
      (import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined)
  );

/** Supabase project URL, or '' when not configured. */
export const getSupabaseUrl = (): string =>
  (import.meta.env?.VITE_SUPABASE_URL as string | undefined)?.trim() || '';

/** Supabase anon key, or '' when not configured. */
export const getSupabaseAnonKey = (): string =>
  (import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

/**
 * Storage mode for the data layer.
 *   - 'supabase' : real backend is active (localStorage is only an offline cache).
 *   - 'local'    : no backend configured — fall back to localStorage (demo mode).
 */
export const getStorageMode = (): 'supabase' | 'local' =>
  isSupabaseConfigured() ? 'supabase' : 'local';
