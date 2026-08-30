/**
 * Data access layer.
 *
 * Every read/write of application data goes through this module so the app can
 * run in two modes without changing any component:
 *
 *   mode = 'supabase'  → real backend (Supabase tables). localStorage is used
 *                        only as an offline cache so the UI stays instant.
 *   mode = 'local'     → demo mode: no backend configured. Everything stays in
 *                        localStorage so the app is fully usable offline.
 *
 * The mapping layer converts between the app's camelCase shapes and the
 * Supabase snake_case columns (see supabase/migrations). Only columns that
 * actually exist in a table are ever sent, which keeps the anon key safe and
 * avoids "column does not exist" errors.
 */

import { getStorageMode } from '../lib/config';
import { getSupabase } from '../lib/supabase';

/** Collection keys in the client map to Supabase table names. */
export const TABLE_MAP = {
  currentUser: 'profiles',
  tests: 'tests',
  questions: 'questions',
  testAttempts: 'test_attempts',
  syllabus: 'syllabus_chapters',
  dailyGoals: 'daily_goals',
  bookmarks: 'bookmarks',
  channels: 'chat_channels',
  chatMessages: 'chat_messages',
} as const;

export type CollectionKey = keyof typeof TABLE_MAP;

/** Top-level fields we allow writing to each table (camelCase as used in the app). */
const WRITABLE_COLUMNS: Record<CollectionKey, string[]> = {
  currentUser: [
    'id', 'name', 'email', 'role', 'accountType', 'schoolConnectId', 'avatar',
    'targetExam', 'standardClass', 'institutionId', 'institutionName',
    'linkedChildIds', 'bio', 'qualifications', 'rating', 'totalRatings',
    'bloodGroup', 'phone', 'city', 'createdAt', 'enrolledBatches',
  ],
  tests: [
    'id', 'title', 'durationMinutes', 'totalMarks', 'targetExam', 'testType',
    'subject', 'chapter', 'year', 'instructions', 'authorName', 'difficulty',
    'attemptsCount', 'avgScore', 'createdAt',
  ],
  questions: [
    'id', 'testId', 'subject', 'chapter', 'topic', 'examType', 'year',
    'shiftOrSet', 'questionText', 'questionType', 'options', 'correctOptionIndex',
    'numericalAnswer', 'numericalTolerance', 'explanation', 'formulaUsed',
    'keyConcept', 'difficulty', 'tags',
  ],
  testAttempts: [
    'id', 'testId', 'testTitle', 'userId', 'userName', 'targetExam', 'startedAt',
    'completedAt', 'totalQuestions', 'attemptedQuestions', 'correctAnswers',
    'incorrectAnswers', 'unattempted', 'score', 'maxScore', 'accuracy',
    'percentile', 'timeSpentSeconds', 'subjectScores', 'questionResponses',
    'aiAnalysis', 'createdAt',
  ],
  syllabus: [
    'id', 'subject', 'name', 'standardClass', 'weightagePercent', 'topics',
    'status', 'isHighYield', 'formulaSheetAvailable', 'createdAt',
  ],
  dailyGoals: [
    'id', 'userId', 'date', 'title', 'targetCount', 'completedCount', 'unit',
    'isDone', 'category', 'createdAt',
  ],
  bookmarks: ['id', 'userId', 'questionId', 'question', 'note', 'tag', 'savedAt'],
  channels: [
    'id', 'type', 'title', 'subtitle', 'subject', 'teacherName', 'teacherId',
    'teacherSubject', 'linkedGroupId', 'linkedTeacherChannelId', 'standardClass',
    'batchId', 'batchName', 'classId', 'studentName', 'studentId', 'parentName',
    'parentId', 'moderatorId', 'moderatorName', 'peerSchoolConnectId',
    'participantIds', 'participantSchoolConnectIds', 'avatar', 'lastMessage',
    'lastMessageTime', 'unreadCount', 'isDoubtChannel', 'isResolved', 'isOnline',
    'isPinned', 'createdAt',
  ],
  chatMessages: [
    'id', 'channelId', 'senderId', 'senderName', 'senderRole', 'senderAvatar',
    'text', 'timestamp', 'attachments', 'isDoubt', 'isResolved', 'subject',
    'questionId', 'reactions', 'replyTo',
  ],
};

/** camelCase → snake_case. e.g. `schoolConnectId` → `school_connect_id`. */
function toSnake(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

/** snake_case → camelCase. e.g. `school_connect_id` → `schoolConnectId`. */
function toCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/** Convert an app collection row into a DB-safe snake_case object. */
function rowToDb<RowType extends Record<string, unknown>>(
  collection: CollectionKey,
  row: RowType
): Record<string, unknown> {
  const allowed = new Set(WRITABLE_COLUMNS[collection]?.map(toSnake) || []);
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const snake = toSnake(key);
    if (allowed.has(snake) && value !== undefined) {
      out[snake] = value === null ? undefined : value;
    }
  }
  return out;
}

/** Convert a DB row (snake_case) back into the app camelCase shape. */
function dbToRow<RowType>(row: Record<string, unknown>): RowType {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[toCamel(key)] = value;
  }
  return out as RowType;
}

/** Persist a batch of rows to the backend. Fire-and-forget, never throws to the UI. */
export async function upsertCollection<RowType extends Record<string, unknown>>(
  collection: CollectionKey,
  rows: RowType[]
): Promise<void> {
  if (getStorageMode() !== 'supabase' || rows.length === 0) return;
  const supabase = getSupabase();
  if (!supabase) return;

  const table = TABLE_MAP[collection];
  const payload = rows.map((r) => rowToDb(collection, r));

  try {
    await supabase.from(table).upsert(payload, { onConflict: 'id' });
  } catch (err) {
    // Never let a backend failure crash the UI — it's just a sync issue.
    console.warn(`[dataService] Upsert to ${table} failed:`, err);
  }
}

/** Fetch an entire collection from the backend (returns [] in demo mode). */
export async function fetchCollection<RowType>(collection: CollectionKey): Promise<RowType[]> {
  if (getStorageMode() !== 'supabase') return [];
  const supabase = getSupabase();
  if (!supabase) return [];

  const table = TABLE_MAP[collection];
  try {
    const { data, error } = await supabase.from(table).select('*').limit(1000);
    if (error) {
      console.warn(`[dataService] Fetch from ${table} failed:`, error.message);
      return [];
    }
    return (data as Record<string, unknown>[]).map((r) => dbToRow<RowType>(r));
  } catch (err) {
    console.warn(`[dataService] Fetch from ${table} threw:`, err);
    return [];
  }
}
