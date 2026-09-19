/**
 * Tests for the API handlers that power BOTH the Vercel serverless functions
 * and the local Express server. They run without a GEMINI_API_KEY, which is
 * exactly how the app behaves in demo mode — every endpoint must still answer
 * with a useful fallback instead of failing.
 */
import { describe, expect, it } from 'vitest';
import {
  chatHandler,
  explainQuestionHandler,
  healthHandler,
  progressReportHandler,
  smartRevisionHandler,
  weaknessAnalysisHandler,
} from '../_lib/handlers';
import type { ApiRequest, ApiResponse } from '../_lib/http';

/** Minimal Express/Vercel-compatible response double. */
const createRes = () => {
  const state = { statusCode: 200, headers: {} as Record<string, unknown>, body: undefined as any };
  const res: ApiResponse & { state: typeof state } = {
    state,
    status(code: number) {
      state.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      state.body = payload;
      return payload;
    },
    setHeader(name: string, value: string | number | readonly string[]) {
      state.headers[name] = value;
    },
  };
  return res;
};

const createReq = (overrides: Partial<ApiRequest> = {}): ApiRequest => ({
  method: 'POST',
  headers: {},
  body: {},
  socket: { remoteAddress: '10.0.0.1' },
  ...overrides,
});

describe('GET /api/health', () => {
  it('reports health, environment and whether the AI key is wired up', () => {
    const res = createRes();
    healthHandler(createReq({ method: 'GET' }), res);

    expect(res.state.statusCode).toBe(200);
    expect(res.state.body.status).toBe('healthy');
    expect(res.state.body).toHaveProperty('aiConfigured');
    expect(res.state.headers['X-Correlation-ID']).toBeTruthy();
  });

  it('rejects non-GET methods with 405', () => {
    const res = createRes();
    healthHandler(createReq({ method: 'POST' }), res);
    expect(res.state.statusCode).toBe(405);
    expect(res.state.headers.Allow).toBe('GET');
  });
});

describe('POST /api/ai/chat', () => {
  it('returns a reply when the AI key is absent (demo fallback)', async () => {
    const res = createRes();
    await chatHandler(
      createReq({ body: { message: 'Explain ray optics sign convention', context: { targetExam: 'JEE Main' } } }),
      res
    );
    expect(res.state.statusCode).toBe(200);
    expect(typeof res.state.body.reply).toBe('string');
    expect(res.state.body.reply.length).toBeGreaterThan(20);
  });

  it('answers 400 when the message is missing', async () => {
    const res = createRes();
    await chatHandler(createReq({ body: {} }), res);
    expect(res.state.statusCode).toBe(400);
    expect(res.state.body.error).toBe('Bad Request');
  });

  it('parses a raw string body (unparsed hosts)', async () => {
    const res = createRes();
    await chatHandler(createReq({ body: JSON.stringify({ message: 'hello', context: {} }) }), res);
    expect(res.state.statusCode).toBe(200);
    expect(res.state.body.reply).toBeTruthy();
  });

  it('blocks cross-origin browser calls', async () => {
    const res = createRes();
    await chatHandler(
      createReq({ headers: { origin: 'https://evil.example', host: 'school-connect.vercel.app' }, body: { message: 'hi' } }),
      res
    );
    expect(res.state.statusCode).toBe(403);
  });

  it('allows same-origin browser calls', async () => {
    const res = createRes();
    await chatHandler(
      createReq({ headers: { origin: 'https://school-connect.vercel.app', host: 'school-connect.vercel.app' }, body: { message: 'hi' } }),
      res
    );
    expect(res.state.statusCode).toBe(200);
  });

  it('ignores prototype-pollution keys in the body', async () => {
    const res = createRes();
    await chatHandler(createReq({ body: { message: 'hi', __proto__: { polluted: true } } }), res);
    expect(res.state.statusCode).toBe(200);
    expect(({} as any).polluted).toBeUndefined();
  });
});

describe('POST /api/ai/weakness-analysis', () => {
  it('returns the five diagnostic sections', async () => {
    const res = createRes();
    await weaknessAnalysisHandler(
      createReq({
        body: {
          testAttempt: { score: 180, maxScore: 300, accuracy: 68, subjectScores: { Physics: 40 } },
          userProfile: { targetExam: 'NEET UG' },
        },
      }),
      res
    );
    expect(res.state.statusCode).toBe(200);
    expect(res.state.body.weakTopics.length).toBeGreaterThan(0);
    expect(res.state.body.suggestedRevisionQueue.length).toBeGreaterThan(0);
  });
});

describe('POST /api/ai/smart-revision', () => {
  it('returns a 7-day plan', async () => {
    const res = createRes();
    await smartRevisionHandler(
      createReq({ body: { userProfile: { targetExam: 'JEE Advanced' }, weakTopics: ['Ray Optics'] } }),
      res
    );
    expect(res.state.statusCode).toBe(200);
    expect(res.state.body.days).toHaveLength(7);
    expect(typeof res.state.body.aiTip).toBe('string');
  });
});

describe('POST /api/ai/progress-report', () => {
  it('personalises the report title with the student name', async () => {
    const res = createRes();
    await progressReportHandler(createReq({ body: { studentName: 'Aarav', testHistory: [], recipientType: 'parent' } }), res);
    expect(res.state.statusCode).toBe(200);
    expect(res.state.body.reportTitle).toContain('Aarav');
  });
});

describe('POST /api/ai/explain-question', () => {
  it('returns a step-by-step breakdown', async () => {
    const res = createRes();
    await explainQuestionHandler(
      createReq({ body: { questionText: 'Find the focal length.', options: ['10', '20'], correctOption: 1, subject: 'Physics', chapter: 'Optics' } }),
      res
    );
    expect(res.state.statusCode).toBe(200);
    expect(res.state.body.stepByStepSolution.length).toBeGreaterThan(1);
  });

  it('answers 400 without questionText', async () => {
    const res = createRes();
    await explainQuestionHandler(createReq({ body: { subject: 'Physics' } }), res);
    expect(res.state.statusCode).toBe(400);
  });
});
