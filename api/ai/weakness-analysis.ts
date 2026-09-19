/**
 * Vercel serverless entry point: POST /api/ai/weakness-analysis
 * Diagnoses weak micro-topics from a completed test attempt.
 */
import { weaknessAnalysisHandler } from '../_lib/handlers';

export const maxDuration = 60;

export default weaknessAnalysisHandler;
