/**
 * Shared HTTP helpers for the API endpoints.
 *
 * These live in `api/_lib/` so that BOTH deployments can import them:
 *   - Vercel serverless functions  (api/**\/*.ts  → each file is one endpoint)
 *   - Local Express dev server     (server.ts    → mounts the same handlers)
 *
 * Keeping one implementation means the AI behaviour is identical locally and in
 * production. Files/folders starting with `_` are ignored by Vercel's router, so
 * nothing in here becomes a public endpoint by accident.
 */
import crypto from 'crypto';

/** Structural type satisfied by both `VercelRequest` and Express `Request`. */
export interface ApiRequest {
  method?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
  ip?: string;
  socket?: { remoteAddress?: string };
}

/** Structural type satisfied by both `VercelResponse` and Express `Response`. */
export interface ApiResponse {
  status(code: number): ApiResponse;
  json(payload: unknown): unknown;
  setHeader(name: string, value: string | number | readonly string[]): unknown;
}

export type ApiHandler = (req: ApiRequest, res: ApiResponse) => Promise<void> | void;

// ---------------------------------------------------------------------------
// Input sanitization (never trust the client)
// ---------------------------------------------------------------------------

/** Trim + hard-cap a string field. */
export const sanitizeString = (input: unknown, maxLength = 2000): string => {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
};

/** Trim + hard-cap every item of an array of strings. */
export const sanitizeArray = (input: unknown, maxItems = 50, itemMaxLength = 500): string[] => {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, itemMaxLength))
    .slice(0, maxItems);
};

/** Recursively drop `__proto__` / `constructor` / `prototype` keys (prototype pollution). */
export const cleanObject = (obj: unknown): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanObject);

  const clean: Record<string, unknown> = {};
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    clean[key] = cleanObject((obj as Record<string, unknown>)[key]);
  }
  return clean;
};

// ---------------------------------------------------------------------------
// Request parsing
// ---------------------------------------------------------------------------

export const getHeader = (req: ApiRequest, name: string): string => {
  const raw = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  if (Array.isArray(raw)) return raw[0] || '';
  return typeof raw === 'string' ? raw : '';
};

const MAX_BODY_BYTES = 256 * 1024;

const parseJson = (raw: string): Record<string, any> => {
  if (!raw.trim()) return {};
  try {
    return cleanObject(JSON.parse(raw));
  } catch {
    return {};
  }
};

/**
 * Read the raw request stream, used only when the host did not parse the body
 * for us (defensive: Express parses via `express.json()`, Vercel parses JSON
 * bodies for Node functions, but this keeps both paths working either way).
 */
const readStream = (req: ApiRequest): Promise<string | null> =>
  new Promise((resolve) => {
    const stream = req as unknown as {
      on?: (event: string, cb: (chunk?: any) => void) => void;
      readableEnded?: boolean;
    };
    if (typeof stream.on !== 'function') return resolve(null);

    const chunks: Buffer[] = [];
    let size = 0;
    let settled = false;
    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    // Never hang a serverless invocation on a stalled stream.
    const timer = setTimeout(() => finish(null), 2000);

    stream.on('data', (chunk: any) => {
      size += chunk?.length ?? 0;
      if (size > MAX_BODY_BYTES) return finish(null);
      chunks.push(Buffer.from(chunk));
    });
    stream.on('end', () => finish(chunks.length ? Buffer.concat(chunks).toString('utf8') : null));
    stream.on('error', () => finish(null));

    if (stream.readableEnded) finish(chunks.length ? Buffer.concat(chunks).toString('utf8') : null);
  });

/**
 * Body as a plain object, whether the host already parsed it (object), left it
 * as a raw string, or consumed the stream itself already.
 */
export const readBody = async (req: ApiRequest): Promise<Record<string, any>> => {
  const raw = (req as { body?: unknown }).body;
  if (raw !== undefined && raw !== null) {
    if (typeof raw === 'string') return parseJson(raw);
    if (typeof raw === 'object') return cleanObject(raw);
    return {};
  }
  const streamed = await readStream(req);
  return streamed ? parseJson(streamed) : {};
};

/** Client IP, best effort (Vercel sets `x-forwarded-for`). */
export const getClientIp = (req: ApiRequest): string => {
  const forwarded = getHeader(req, 'x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = getHeader(req, 'x-real-ip');
  if (real) return real;
  return req.ip || req.socket?.remoteAddress || '127.0.0.1';
};

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

/** Every response carries a correlation id for tracing (never leaks internals). */
export const attachCorrelationId = (req: ApiRequest, res: ApiResponse): string => {
  const incoming = getHeader(req, 'x-correlation-id');
  const id = incoming && incoming.length <= 128 ? incoming : crypto.randomUUID();
  try {
    res.setHeader('X-Correlation-ID', id);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  } catch {
    /* headers may be immutable once a response has started — safe to ignore */
  }
  return id;
};

export const sendJson = (res: ApiResponse, status: number, payload: unknown): void => {
  res.status(status).json(payload);
};

export const sendError = (
  res: ApiResponse,
  status: number,
  error: string,
  message: string,
  correlationId?: string
): void => {
  sendJson(res, status, { error, message, correlationId });
};

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

/** Only allow the documented HTTP method for an endpoint. */
export const requireMethod = (req: ApiRequest, res: ApiResponse, method: string): boolean => {
  const actual = (req.method || 'GET').toUpperCase();
  if (actual === method) return true;
  res.setHeader('Allow', method);
  sendError(res, 405, 'Method Not Allowed', `Use ${method} for this endpoint.`);
  return false;
};

/**
 * Same-origin guard. Browsers send `Origin` for cross-site calls, so matching it
 * against the `Host` header keeps the endpoint from being used as an open proxy.
 * Requests with no Origin (curl, server-to-server) are allowed.
 */
export const isAllowedOrigin = (req: ApiRequest): boolean => {
  const origin = getHeader(req, 'origin');
  if (!origin) return true;
  const host = getHeader(req, 'x-forwarded-host') || getHeader(req, 'host');
  if (!host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per instance — best effort on serverless)
// ---------------------------------------------------------------------------

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;
const MAX_TRACKED_IPS = 5000;
const buckets = new Map<string, Map<string, RateLimitRecord>>();

const bucketFor = (name: string): Map<string, RateLimitRecord> => {
  let bucket = buckets.get(name);
  if (!bucket) {
    bucket = new Map<string, RateLimitRecord>();
    buckets.set(name, bucket);
  }
  return bucket;
};

/** Returns false (and writes a 429) when the caller is over budget. */
export const checkRateLimit = (req: ApiRequest, res: ApiResponse, bucketName = 'default'): boolean => {
  const now = Date.now();
  const bucket = bucketFor(bucketName);

  // Guard map size against spoofed-IP floods: evict oldest rather than clearing all.
  if (bucket.size > MAX_TRACKED_IPS) {
    const sorted = [...bucket.entries()].sort((a, b) => a[1].resetTime - b[1].resetTime);
    for (const [ip] of sorted.slice(0, Math.ceil(bucket.size * 0.1))) bucket.delete(ip);
  }

  const ip = getClientIp(req);
  const record = bucket.get(ip);
  if (!record || now > record.resetTime) {
    bucket.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
    sendError(res, 429, 'Too Many Requests', 'Rate limit exceeded. Please wait a moment before retrying.');
    return false;
  }
  record.count += 1;
  return true;
};
