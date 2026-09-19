/**
 * Gemini client factory — server-side only.
 *
 * The API key is read from `process.env.GEMINI_API_KEY` and NEVER leaves the
 * server (neither Vercel functions nor the local Express server expose it to the
 * browser). When the key is missing, every endpoint answers with a built-in
 * pedagogical fallback instead of failing, so the UI always works.
 */
import { GoogleGenAI } from '@google/genai';

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

export const isAIConfigured = (): boolean => Boolean(process.env.GEMINI_API_KEY);

let cachedClient: GoogleGenAI | null = null;

/** Returns a shared client, or null when no key is configured (caller uses fallbacks). */
export const getAIClient = (): GoogleGenAI | null => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'school-connect' } },
    });
  }
  return cachedClient;
};

/** Ask Gemini for JSON and parse it defensively (models sometimes wrap in code fences). */
export const generateJson = async <T>(prompt: string, systemInstruction?: string): Promise<T | null> => {
  const ai = getAIClient();
  if (!ai) return null;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      ...(systemInstruction ? { systemInstruction } : {}),
    },
  });

  const text = (response.text || '').trim();
  if (!text) return null;
  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
};
