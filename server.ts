import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  chatHandler,
  explainQuestionHandler,
  healthHandler,
  progressReportHandler,
  smartRevisionHandler,
  weaknessAnalysisHandler,
} from './api/_lib/handlers';

dotenv.config();

const app = express();
const PORT = 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// 1. Disable server fingerprinting (Hacker reconnaissance defense)
app.disable('x-powered-by');

// 2. Critical Environment Variable Check
if (!process.env.GEMINI_API_KEY) {
  console.info('[Security Notice] GEMINI_API_KEY is not set. Intelligent built-in pedagogical fallbacks will be used for AI endpoints.');
}

// 3. Block HTTP Method Tampering (Cross-Site Tracing XST defense)
app.use((req: Request, res: Response, next: NextFunction) => {
  if (['TRACE', 'TRACK'].includes(req.method.toUpperCase())) {
    return res.status(405).send('Method Not Allowed');
  }
  next();
});

// 4. Block Direct Access to Sensitive Files & Secrets (.env, .git, keys)
app.use((req: Request, res: Response, next: NextFunction) => {
  const urlPath = req.path.toLowerCase();
  // Protect secrets, credentials, and git directories
  if (
    urlPath.includes('/.git') ||
    urlPath.endsWith('.env') ||
    urlPath.endsWith('.key') ||
    urlPath.endsWith('.pem') ||
    urlPath.endsWith('.crt') ||
    urlPath.includes('package-lock.json') ||
    (IS_PROD && (urlPath.endsWith('.ts') || urlPath.endsWith('.tsx')))
  ) {
    return res.status(404).json({
      error: 'Not Found',
      correlationId: (req as any).correlationId,
    });
  }
  next();
});

// 5. Prototype Pollution Protection Middleware
const cleanObject = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanObject);
  
  const clean: any = {};
  for (const key of Object.keys(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    clean[key] = cleanObject(obj[key]);
  }
  return clean;
};

app.use(express.json({ limit: '500kb' }));
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = cleanObject(req.body);
  }
  next();
});

// 6. Correlation ID Middleware (For tracing errors without leaking internals)
app.use((req: Request, res: Response, next: NextFunction) => {
  const correlationId = (req.headers['x-correlation-id'] as string) || crypto.randomUUID();
  res.setHeader('X-Correlation-ID', correlationId);
  (req as any).correlationId = correlationId;
  next();
});

// 7. Robust Security Headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  if (IS_PROD) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

// 8. Hardened In-Memory Rate Limiting with Memory Leak & OOM Protection
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute per IP
const MAX_TRACKED_IPS = 5000; // Prevent memory exhaustion attacks

// Periodic cleanup of expired rate limit entries (every 60s)
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60 * 1000).unref();

const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  
  // Guard map size against spoofed IP flood: evict the oldest expired entries
  // instead of clearing the whole map (which would reset everyone's budget).
  if (rateLimitMap.size > MAX_TRACKED_IPS) {
    const sorted = [...rateLimitMap.entries()].sort((a, b) => a[1].resetTime - b[1].resetTime);
    const toEvict = sorted.slice(0, Math.ceil(rateLimitMap.size * 0.1));
    for (const [oldIp] of toEvict) {
      rateLimitMap.delete(oldIp);
    }
  }

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please wait a moment before sending more requests.',
      correlationId: (req as any).correlationId,
    });
  }

  record.count += 1;
  next();
};

app.use('/api/', rateLimiter);

// 9. API routes — the SAME handlers that power the Vercel serverless functions
// (api/**). Mounting them here means local dev, `npm start` and the deployed
// site all share one implementation and identical behaviour.
app.get('/api/health', healthHandler);
app.post('/api/ai/chat', chatHandler);
app.post('/api/ai/weakness-analysis', weaknessAnalysisHandler);
app.post('/api/ai/smart-revision', smartRevisionHandler);
app.post('/api/ai/progress-report', progressReportHandler);
app.post('/api/ai/explain-question', explainQuestionHandler);

// 10. Global 404 Handler for Unmatched API routes
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested API endpoint does not exist.',
    correlationId: (req as any).correlationId,
  });
});

// 11. Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred.',
    correlationId: (req as any).correlationId,
  });
});

// 12. Vite middleware & Static Serving Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`School-Connect server running on http://0.0.0.0:${PORT} [${IS_PROD ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
  });
}

startServer();
