/**
 * Vercel serverless entry point: POST /api/ai/chat
 * Connect AI mentor conversation (Gemini, server-side key only).
 */
import { chatHandler } from '../_lib/handlers';

export const maxDuration = 60;

export default chatHandler;
