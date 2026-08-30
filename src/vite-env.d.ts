/// <reference types="vite/client" />

/**
 * Typed environment variables for the browser (Vite).
 * Only `VITE_`-prefixed variables are exposed to the client bundle.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
