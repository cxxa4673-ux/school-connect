/**
 * Vercel serverless entry point: POST /api/ai/smart-revision
 * Generates the 7-day spaced-repetition revision plan.
 */
import { smartRevisionHandler } from '../_lib/handlers';

export const maxDuration = 60;

export default smartRevisionHandler;
