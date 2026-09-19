/**
 * Vercel serverless entry point: GET /api/health
 *
 * Deploy checklist helper — open /api/health on the deployed URL to confirm the
 * function is live and whether GEMINI_API_KEY reached the runtime.
 */
import { healthHandler } from './_lib/handlers';

export const maxDuration = 15;

export default healthHandler;
