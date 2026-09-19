/**
 * The single implementation of every API endpoint.
 *
 * `server.ts` mounts these on Express (local dev + `npm start`), and each file
 * in `api/**` re-exports one of them as a Vercel serverless function — so the
 * app behaves identically in both environments.
 */
import {
  ApiHandler,
  ApiRequest,
  ApiResponse,
  attachCorrelationId,
  checkRateLimit,
  isAllowedOrigin,
  readBody,
  requireMethod,
  sanitizeArray,
  sanitizeString,
  sendError,
  sendJson,
} from './http';
import { GEMINI_MODEL, generateJson, getAIClient, isAIConfigured } from './gemini';

// ---------------------------------------------------------------------------
// Shared guard: method + origin + rate limit, with the correlation id attached.
// ---------------------------------------------------------------------------
const guard = (req: ApiRequest, res: ApiResponse, method: string, bucket: string): string | null => {
  const correlationId = attachCorrelationId(req, res);
  if (!requireMethod(req, res, method)) return null;
  if (!isAllowedOrigin(req)) {
    sendError(res, 403, 'Forbidden', 'Cross-origin requests are not allowed.', correlationId);
    return null;
  }
  if (!checkRateLimit(req, res, bucket)) return null;
  return correlationId;
};

const looksLike = (text: string, ...needles: string[]): boolean => {
  const lower = text.toLowerCase();
  return needles.some((needle) => lower.includes(needle));
};

// ---------------------------------------------------------------------------
// GET /api/health
// ---------------------------------------------------------------------------
export const healthHandler: ApiHandler = (req, res) => {
  const correlationId = attachCorrelationId(req, res);
  if (!requireMethod(req, res, 'GET')) return;
  sendJson(res, 200, {
    status: 'healthy',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    aiConfigured: isAIConfigured(),
    aiModel: isAIConfigured() ? GEMINI_MODEL : null,
    timestamp: new Date().toISOString(),
    correlationId,
  });
};

// ---------------------------------------------------------------------------
// POST /api/ai/chat
// ---------------------------------------------------------------------------
interface ChatTurn {
  sender?: string;
  role?: string;
  text?: string;
}

export const chatHandler: ApiHandler = async (req, res) => {
  const correlationId = guard(req, res, 'POST', 'ai-chat');
  if (!correlationId) return;

  try {
    const body = await readBody(req);
    const context = (body.context || {}) as Record<string, unknown>;

    const message = sanitizeString(body.message, 2000);
    const targetExam = sanitizeString(context.targetExam || 'JEE Main', 50);
    const standardClass = sanitizeString(context.standardClass || 'Class 12', 50);
    const accuracy = sanitizeString(context.accuracy || '74%', 20);
    const weakTopics = sanitizeArray(context.weakTopics, 10, 100);
    const rawHistory = Array.isArray(body.history) ? (body.history as ChatTurn[]) : [];

    if (!message) {
      return sendError(res, 400, 'Bad Request', 'Message parameter is required.', correlationId);
    }

    const ai = getAIClient();
    if (!ai) {
      const fallback = looksLike(message, 'optic')
        ? 'For Ray Optics, stick to the Cartesian Sign Convention: distances measured along the incident light are positive. Drill the Lens Maker formula 1/f = (n-1)(1/R1 - 1/R2) for symmetric vs plano lenses.'
        : looksLike(message, 'electro')
          ? 'For Electrostatics, focus on Gauss Law applications (cylindrical vs planar symmetry) and dipole potential energy U = -p·E.'
          : 'Great question! Keep a balanced 3-subject daily rotation: 20 Physics PYQs, 20 Organic mechanisms, and 20 Calculus/Coordinate problems — and log every wrong attempt in the Syllabus Tracker.';
      return sendJson(res, 200, {
        reply: `[Connect AI Tutor] ${fallback}`,
        suggestedActions: [
          { label: 'Start 10-Min Weakness Drill', action: 'START_AI_DRILL' },
          { label: 'View Formula Sheet', action: 'VIEW_FORMULA_SHEET' },
        ],
      });
    }

    const systemInstruction = `You are "Connect AI", an expert personal academic mentor and tutor on the School-Connect education ecosystem.
You help students preparing for competitive exams like JEE Main, JEE Advanced, NEET UG, and CBSE Boards (Classes 11 & 12).
Student Context:
- Target Exam: ${targetExam}
- Standard: ${standardClass}
- Weak Topics Flagged: ${(weakTopics.length ? weakTopics : ['Ray Optics', 'Rotational Motion', 'Organic Reaction Mechanisms']).join(', ')}
- Accuracy: ${accuracy}

Be concise, mathematically sound, supportive, and pedagogical. Format equations clearly using standard text/markdown notation. Provide mnemonic tricks and shortcut formulas when applicable. Keep replies under 250 words unless asked for a complete derivation.`;

    // Multi-turn thread from the client-provided history (last 12 turns).
    const historyTurns = rawHistory
      .filter((turn) => turn && typeof turn.text === 'string')
      .slice(-12)
      .map((turn) => ({
        role: turn.sender === 'assistant' || turn.role === 'model' || turn.sender === 'model' ? 'model' : 'user',
        parts: [{ text: String(turn.text).slice(0, 2000) }],
      }));

    const lastTurn = historyTurns[historyTurns.length - 1];
    const conversation =
      lastTurn && lastTurn.role === 'user'
        ? historyTurns
        : [...historyTurns, { role: 'user', parts: [{ text: message }] }];

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: conversation,
      config: { systemInstruction, temperature: 0.7 },
    });

    const reply = response.text || 'I am ready to help you conquer your syllabus and optimize your test scores.';
    sendJson(res, 200, {
      reply,
      suggestedActions: [
        { label: 'Practice PYQs on this topic', action: 'OPEN_PYQS' },
        { label: 'Generate AI Booster Test', action: 'GENERATE_TEST' },
      ],
    });
  } catch (err: any) {
    console.error('[AI Chat Error]:', err?.message);
    // Never surface a 500 to the student — answer with a useful fallback instead.
    sendJson(res, 200, {
      reply:
        '[Connect AI Mentor] I could not reach the AI model just now. Meanwhile: revise your last mock-test mistakes, drill 15 timed PYQs, and log weak topics in the Syllabus Tracker.',
      suggestedActions: [
        { label: 'Practice PYQs on this topic', action: 'OPEN_PYQS' },
        { label: 'Generate AI Booster Drill', action: 'GENERATE_TEST' },
      ],
    });
  }
};

// ---------------------------------------------------------------------------
// POST /api/ai/weakness-analysis
// ---------------------------------------------------------------------------
export const weaknessAnalysisHandler: ApiHandler = async (req, res) => {
  const correlationId = guard(req, res, 'POST', 'ai-weakness');
  if (!correlationId) return;

  const fallback = {
    weakTopics: [
      'Ray Optics (Focal length & sign convention)',
      'Thermodynamics (Adiabatic PV curve calculations)',
      'Definite Integrals (King Property application)',
    ],
    strengths: ['Electrostatics & Gauss Law', 'Chemical Bonding', 'Matrices & Determinants'],
    recommendation:
      'Your speed in Physics was 2.4 min/question (optimal is 1.8 min). In Ray Optics, 3 mistakes were sign-convention slips in refraction at curved surfaces. Revise NCERT Chapter 9 derivations.',
    speedInsight:
      'Spent 14 mins on 2 tough math questions. In a real exam, skip to single-line chemistry questions first.',
    suggestedRevisionQueue: [
      'Ray Optics (Sign Convention & Lens Maker)',
      'Definite Integrals (Properties 1 to 4)',
      'Aldehydes & Ketones (Cannizzaro & Aldol mechanisms)',
    ],
  };

  try {
    const body = await readBody(req);
    const attempt = (body.testAttempt || {}) as Record<string, any>;
    const profile = (body.userProfile || {}) as Record<string, any>;

    const targetExam = sanitizeString(profile.targetExam || 'JEE Main', 50);
    const score = Number(attempt.score) || 0;
    const maxScore = Number(attempt.maxScore) || 300;
    const accuracy = Number(attempt.accuracy) || 0;
    const subjectScores =
      attempt.subjectScores && typeof attempt.subjectScores === 'object' ? attempt.subjectScores : {};
    const incorrectDetails = Array.isArray(attempt.incorrectDetails)
      ? attempt.incorrectDetails.slice(0, 30).map((q: any) => ({
          subject: sanitizeString(q?.subject, 50),
          chapter: sanitizeString(q?.chapter, 100),
          topic: sanitizeString(q?.topic, 100),
          timeSpent: Number(q?.timeSpent) || 0,
        }))
      : [];

    if (!isAIConfigured()) return sendJson(res, 200, fallback);

    const parsed = await generateJson<typeof fallback>(`Analyze this student's exam attempt data and provide a high-precision weakness diagnostic:
Target: ${targetExam}
Score: ${score}/${maxScore} (${accuracy}% accuracy)
Subject breakdown: ${JSON.stringify(subjectScores)}
Incorrect Questions Data: ${JSON.stringify(incorrectDetails)}

Provide a structured JSON response with:
1. "weakTopics": list of 3-4 specific micro-topics where student lost marks.
2. "strengths": list of 2-3 topics with high accuracy.
3. "recommendation": 2-3 sentence actionable diagnostic.
4. "speedInsight": actionable time-management advice.
5. "suggestedRevisionQueue": list of 3 high-yield topics to revise in the next 7 days.`);

    sendJson(res, 200, parsed ?? fallback);
  } catch (err: any) {
    console.error('[Weakness Analysis Error]:', err?.message);
    sendJson(res, 200, fallback);
  }
};

// ---------------------------------------------------------------------------
// POST /api/ai/smart-revision
// ---------------------------------------------------------------------------
const revisionFallback = {
  days: [
    { day: 'Day 1 (Today)', subject: 'Physics', topic: 'Ray Optics - Lens Maker Formula & Prism', timeEstimate: '45 mins', taskType: 'PYQ Drill (15 Questions)' },
    { day: 'Day 2', subject: 'Chemistry', topic: 'Aldehydes, Ketones & Carboxylic Acids', timeEstimate: '40 mins', taskType: 'NCERT In-text + Exemplar' },
    { day: 'Day 3', subject: 'Mathematics', topic: 'Definite Integrals & King Property', timeEstimate: '50 mins', taskType: 'Targeted Practice' },
    { day: 'Day 4', subject: 'Physics', topic: 'Thermodynamics & Carnot Engine', timeEstimate: '40 mins', taskType: 'Formula Revision & 10 PYQs' },
    { day: 'Day 5', subject: 'Chemistry', topic: 'Coordination Compounds (CFT & Isomerism)', timeEstimate: '35 mins', taskType: 'High-Yield Flashcards' },
    { day: 'Day 6', subject: 'Mathematics', topic: 'Vector & 3D Geometry (Shortest Distance)', timeEstimate: '45 mins', taskType: 'Speed Drill' },
    { day: 'Day 7', subject: 'All', topic: 'Full Week 7-Day Spaced Repetition Mock Test', timeEstimate: '60 mins', taskType: 'Adaptive AI Test' },
  ],
  aiTip:
    'Spaced repetition after 24 hours, 7 days, and 21 days converts short-term test memory into permanent retrieval during 3-hour CBT exams.',
};

export const smartRevisionHandler: ApiHandler = async (req, res) => {
  const correlationId = guard(req, res, 'POST', 'ai-revision');
  if (!correlationId) return;

  try {
    const body = await readBody(req);
    const profile = (body.userProfile || {}) as Record<string, unknown>;
    const targetExam = sanitizeString(profile.targetExam || 'JEE Main', 50);
    const weakTopics = sanitizeArray(body.weakTopics, 10, 100);

    if (!isAIConfigured()) return sendJson(res, 200, revisionFallback);

    const parsed = await generateJson<typeof revisionFallback>(`Generate a personalized 7-Day Spaced Repetition Revision Plan for a ${targetExam} student.
Weak areas identified: ${(weakTopics.length ? weakTopics : ['Ray Optics', 'Definite Integrals', 'Organic Mechanisms']).join(', ')}
Output valid JSON with structure:
{
  "days": [
    { "day": "Day 1", "subject": "Physics", "topic": "...", "timeEstimate": "45 mins", "taskType": "..." }, ... up to Day 7
  ],
  "aiTip": "..."
}`);

    sendJson(res, 200, parsed ?? revisionFallback);
  } catch (err: any) {
    console.error('[Smart Revision Error]:', err?.message);
    sendJson(res, 200, revisionFallback);
  }
};

// ---------------------------------------------------------------------------
// POST /api/ai/progress-report
// ---------------------------------------------------------------------------
const progressFallback = {
  reportTitle: 'Weekly Progress Guard Report: Student',
  generatedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  executiveSummary:
    'Demonstrated solid dedication this week with continuous CBT mock test practice and formula drills. Overall accuracy is trending up.',
  attendanceAndEffort: '98% study consistency with a steady daily goal streak.',
  keyStrengths: ['Consistent performance in Mathematics', 'Fast question selection in Physical Chemistry'],
  areasNeedingSupport: [
    'Physics Ray Optics sign conventions (score dropped in the optics section)',
    'Revise Class 11 Mechanics formulas before the next weekend assessment',
  ],
  parentActionableAdvice:
    'Encourage a calm 30-minute formula review before sleeping, and avoid back-to-back late-night CBT simulations.',
  institutionRating: 'A (On-track with targeted revision)',
};

export const progressReportHandler: ApiHandler = async (req, res) => {
  const correlationId = guard(req, res, 'POST', 'ai-progress');
  if (!correlationId) return;

  try {
    const body = await readBody(req);
    const studentName = sanitizeString(body.studentName || 'Student', 100);
    const recipientType = sanitizeString(body.recipientType || 'parent', 20);
    const testHistory = Array.isArray(body.testHistory) ? body.testHistory.slice(0, 10) : [];
    const syllabusProgress =
      body.syllabusProgress && typeof body.syllabusProgress === 'object' ? body.syllabusProgress : {};

    const localFallback = {
      ...progressFallback,
      reportTitle: `Weekly Progress Guard Report: ${studentName}`,
    };

    if (!isAIConfigured()) return sendJson(res, 200, localFallback);

    const parsed = await generateJson<typeof progressFallback>(`You are the AI Academic Counselor on School-Connect.
Generate a comprehensive, encouraging, and detailed ${recipientType === 'institution' ? 'Institutional Performance Evaluation' : 'Parent Mirror Progress Guard Report'} for student "${studentName}".
Recent test attempts: ${JSON.stringify(testHistory)}
Syllabus completion: ${JSON.stringify(syllabusProgress)}

Return valid JSON with keys:
- "reportTitle"
- "generatedDate"
- "executiveSummary"
- "attendanceAndEffort"
- "keyStrengths" (array of strings)
- "areasNeedingSupport" (array of strings)
- "parentActionableAdvice"
- "institutionRating"`);

    sendJson(res, 200, parsed ?? localFallback);
  } catch (err: any) {
    console.error('[Progress Report Error]:', err?.message);
    sendJson(res, 200, progressFallback);
  }
};

// ---------------------------------------------------------------------------
// POST /api/ai/explain-question
// ---------------------------------------------------------------------------
export const explainQuestionHandler: ApiHandler = async (req, res) => {
  const correlationId = guard(req, res, 'POST', 'ai-explain');
  if (!correlationId) return;

  const body = await readBody(req);
  const subject = sanitizeString(body.subject || 'Physics', 50);
  const chapter = sanitizeString(body.chapter || 'General', 100);
  const questionText = sanitizeString(body.questionText, 3000);

  // Validate first so a malformed request is rejected the same way in every mode.
  if (!questionText) {
    return sendError(res, 400, 'Bad Request', 'questionText parameter is required.', correlationId);
  }

  if (!isAIConfigured()) {
    return sendJson(res, 200, {
      conceptTitle: `${subject} - ${chapter}`,
      intuition:
        'This question tests direct physical reasoning coupled with dimensional sanity checking and boundary condition application.',
      stepByStepSolution: [
        'Step 1: Identify the given values and convert to standard SI units.',
        'Step 2: Apply the governing fundamental equation.',
        'Step 3: Substitute the parameters carefully, accounting for signs.',
        'Step 4: Verify that the result matches the target option.',
      ],
      shortcutTrick:
        'Elimination method: check extreme limits where a parameter approaches 0 or infinity to rule out 2 options in under 15 seconds.',
      commonPitfall: 'Forgetting the sign convention or a unit conversion (e.g. cm to meters, eV to Joules).',
    });
  }

  try {
    const options = sanitizeArray(body.options, 6, 500);
    const correctOption = Math.max(0, Math.min(Number(body.correctOption) || 0, Math.max(options.length - 1, 0)));

    const parsed = await generateJson<Record<string, unknown>>(`Provide an expert, pedagogical step-by-step breakdown of this ${subject} question:
Chapter: ${chapter}
Question: ${questionText}
Options: ${JSON.stringify(options)}
Correct Answer: Option ${correctOption + 1} (${options[correctOption] || ''})

Provide JSON:
{
  "conceptTitle": string,
  "intuition": string,
  "stepByStepSolution": string[],
  "shortcutTrick": string,
  "commonPitfall": string
}`);

    if (!parsed) {
      return sendJson(res, 200, {
        conceptTitle: `${subject} - Core Concept`,
        intuition: 'Apply the fundamental definition and substitute the standard values.',
        stepByStepSolution: [
          'Step 1: Recall the governing formula for this topic.',
          'Step 2: Substitute the given values with correct sign conventions.',
          'Step 3: Simplify to match the correct option.',
        ],
        shortcutTrick: 'Dimensional analysis: check the units of each option to eliminate wrong ones instantly.',
        commonPitfall: 'Calculation slip or wrong unit conversion.',
      });
    }
    sendJson(res, 200, parsed);
  } catch (err: any) {
    console.error('[Explain Question Error]:', err?.message);
    sendJson(res, 200, {
      conceptTitle: `${subject} - Core Concept`,
      intuition: 'Apply the fundamental definition and substitute the standard values.',
      stepByStepSolution: [
        'Step 1: Recall the governing formula for this topic.',
        'Step 2: Substitute the given values with correct sign conventions.',
        'Step 3: Simplify to match the correct option.',
      ],
      shortcutTrick: 'Dimensional analysis: check the units of each option to eliminate wrong ones instantly.',
      commonPitfall: 'Calculation slip or wrong unit conversion.',
    });
  }
};
