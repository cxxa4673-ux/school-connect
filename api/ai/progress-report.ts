/**
 * Vercel serverless entry point: POST /api/ai/progress-report
 * Parent / institution progress guard report.
 */
import { progressReportHandler } from '../_lib/handlers';

export const maxDuration = 60;

export default progressReportHandler;
