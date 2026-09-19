/**
 * Guards `vercel.json` against the mistakes that silently break a deployment.
 *
 * Vercel parses `rewrites[].source` with path-to-regexp (NOT a regex engine), so
 * a negative lookahead such as "/((?!api/).*)" fails the whole build with:
 *   "Rewrite at index N has invalid `source` pattern"
 * This test fails locally instead of in a Vercel build.
 */
import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const configPath = path.resolve(__dirname, '../../vercel.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

describe('vercel.json', () => {
  it('uses the Vite build command and dist output directory', () => {
    expect(config.framework).toBe('vite');
    expect(config.buildCommand).toBeTruthy();
    expect(config.buildCommand).not.toContain('esbuild'); // server bundle is not needed on Vercel
    expect(config.outputDirectory).toBe('dist');
  });

  it('keeps an SPA fallback rewrite to index.html', () => {
    const rewrites = config.rewrites || [];
    expect(rewrites.length).toBeGreaterThan(0);
    const catchAll = rewrites.find((r: any) => r.destination === '/index.html');
    expect(catchAll).toBeTruthy();
    expect(catchAll.source).toBe('/(.*)');
  });

  it('uses no lookaround or capturing-group tricks in rewrite sources', () => {
    for (const rule of config.rewrites || []) {
      // path-to-regexp rejects capturing groups inside lookaheads; keep sources simple.
      expect(rule.source).not.toMatch(/\(\?<?[=!]/);
      expect((rule.source.match(/\(/g) || []).length).toBeLessThanOrEqual(1);
    }
  });

  it('ships security headers on every response', () => {
    const globalHeaders = (config.headers || []).find((h: any) => h.source === '/(.*)');
    const names = (globalHeaders?.headers || []).map((h: any) => h.key);
    expect(names).toContain('X-Content-Type-Options');
    expect(names).toContain('Referrer-Policy');
    expect(names).toContain('Permissions-Policy');
  });

  it('never commits secrets — .env stays git-ignored', () => {
    const gitignore = readFileSync(path.resolve(__dirname, '../../.gitignore'), 'utf8');
    expect(gitignore).toMatch(/^\.env$/m);
    expect(JSON.stringify(config)).not.toMatch(/GEMINI_API_KEY|service_role/);
  });
});
