/**
 * Supabase client singleton.
 *
 * This module exports a single lazy client so no code ever duplicates the
 * connection. It is `null` when Supabase is NOT configured (demo/local mode),
 * and all callers must handle that gracefully (the data + auth services do).
 *
 * NEVER import the `client` directly in components. Use the services in
 * `src/services/*` which wrap this and provide the localStorage fallback.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, isSupabaseConfigured } from './config';

let client: SupabaseClient | null = null;

/** Lazily create (and cache) the Supabase client, or return null. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (client) return client;

  client = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      // Keep the session in localStorage so a refresh doesn't log the user out.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}
