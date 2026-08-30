import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      // Allow preview/proxy hosts (e.g. <port>-<sandbox>.e2b.app) to reach the dev server.
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          // Split heavy third-party libraries into their own cached chunks so the
          // shared app bundle stays small (better first-load + repeat-load).
          manualChunks: {
            react: ['react', 'react-dom'],
            lucide: ['lucide-react'],
            motion: ['motion'],
            supabase: ['@supabase/supabase-js'],
          },
        },
      },
    },
  };
});
