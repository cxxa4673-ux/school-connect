/**
 * Vercel serverless entry point: POST /api/ai/explain-question
 * Step-by-step solution breakdown for one question.
 */
import { explainQuestionHandler } from '../_lib/handlers';

export const maxDuration = 60;

export default explainQuestionHandler;
