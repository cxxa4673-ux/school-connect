/*
# School-Connect: Core Database Tables

## Overview
Creates the main tables for the School-Connect education platform. This is a
single-tenant app with no sign-in screen (uses a role switcher with mock data),
so all policies use `TO anon, authenticated` to allow the anon-key frontend to
read and write its own data.

## New Tables
1. **profiles** — User profiles (students, parents, teachers, institution admins)
2. **tests** — Mock tests, chapter tests, PYQ papers, AI boosters
3. **questions** — Individual exam questions linked to tests
4. **test_attempts** — Student test attempt records with scores and AI analysis
5. **syllabus_chapters** — Syllabus chapters with topics and progress tracking
6. **daily_goals** — Daily study goals tracker
7. **bookmarks** — Saved/bookmarked questions by users
8. **chat_channels** — Chat channels for student-parent-teacher communication
9. **chat_messages** — Individual messages within chat channels

## Security
- RLS enabled on every table.
- All tables allow anon + authenticated CRUD (single-tenant, no auth screen).
- `USING (true)` / `WITH CHECK (true)` is intentional — data is shared/public
  in this single-tenant demo app.
*/

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text,
  role text NOT NULL DEFAULT 'student',
  account_type text NOT NULL DEFAULT 'independent',
  school_connect_id text,
  avatar text DEFAULT '',
  target_exam text,
  standard_class text,
  institution_id text,
  institution_name text,
  linked_child_ids text[] DEFAULT '{}',
  bio text,
  qualifications text,
  rating numeric DEFAULT 0,
  total_ratings integer DEFAULT 0,
  blood_group text,
  phone text,
  city text,
  created_at timestamptz DEFAULT now(),
  enrolled_batches text[] DEFAULT '{}'
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_profiles" ON profiles;
CREATE POLICY "anon_select_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_profiles" ON profiles;
CREATE POLICY "anon_insert_profiles" ON profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_profiles" ON profiles;
CREATE POLICY "anon_update_profiles" ON profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_profiles" ON profiles;
CREATE POLICY "anon_delete_profiles" ON profiles FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 2. TESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS tests (
  id text PRIMARY KEY,
  title text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 180,
  total_marks integer NOT NULL DEFAULT 300,
  target_exam text NOT NULL DEFAULT 'JEE Main',
  test_type text NOT NULL DEFAULT 'Full Mock',
  subject text DEFAULT 'All',
  chapter text,
  year integer,
  instructions text[] DEFAULT '{}',
  author_name text,
  difficulty text DEFAULT 'Moderate',
  attempts_count integer DEFAULT 0,
  avg_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tests" ON tests;
CREATE POLICY "anon_select_tests" ON tests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tests" ON tests;
CREATE POLICY "anon_insert_tests" ON tests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tests" ON tests;
CREATE POLICY "anon_update_tests" ON tests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tests" ON tests;
CREATE POLICY "anon_delete_tests" ON tests FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 3. QUESTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
  id text PRIMARY KEY,
  test_id text REFERENCES tests(id) ON DELETE CASCADE,
  subject text NOT NULL,
  chapter text NOT NULL,
  topic text NOT NULL,
  exam_type text NOT NULL DEFAULT 'JEE Main',
  year integer,
  shift_or_set text,
  question_text text NOT NULL,
  question_type text DEFAULT 'single_correct',
  options text[] DEFAULT '{}',
  correct_option_index integer NOT NULL DEFAULT 0,
  numerical_answer numeric,
  numerical_tolerance numeric,
  explanation text,
  formula_used text,
  key_concept text,
  difficulty text DEFAULT 'Medium',
  tags text[] DEFAULT '{}'
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_questions" ON questions;
CREATE POLICY "anon_select_questions" ON questions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_questions" ON questions;
CREATE POLICY "anon_insert_questions" ON questions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_questions" ON questions;
CREATE POLICY "anon_update_questions" ON questions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_questions" ON questions;
CREATE POLICY "anon_delete_questions" ON questions FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_questions_test_id ON questions(test_id);

-- ============================================================
-- 4. TEST_ATTEMPTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS test_attempts (
  id text PRIMARY KEY,
  test_id text NOT NULL,
  test_title text NOT NULL,
  user_id text NOT NULL,
  user_name text NOT NULL,
  target_exam text NOT NULL DEFAULT 'JEE Main',
  started_at timestamptz,
  completed_at timestamptz DEFAULT now(),
  total_questions integer DEFAULT 0,
  attempted_questions integer DEFAULT 0,
  correct_answers integer DEFAULT 0,
  incorrect_answers integer DEFAULT 0,
  unattempted integer DEFAULT 0,
  score integer DEFAULT 0,
  max_score integer DEFAULT 0,
  accuracy numeric DEFAULT 0,
  percentile numeric DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  subject_scores jsonb DEFAULT '{}',
  question_responses jsonb DEFAULT '{}',
  ai_analysis jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_test_attempts" ON test_attempts;
CREATE POLICY "anon_select_test_attempts" ON test_attempts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_test_attempts" ON test_attempts;
CREATE POLICY "anon_insert_test_attempts" ON test_attempts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_test_attempts" ON test_attempts;
CREATE POLICY "anon_update_test_attempts" ON test_attempts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_test_attempts" ON test_attempts;
CREATE POLICY "anon_delete_test_attempts" ON test_attempts FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_test_id ON test_attempts(test_id);

-- ============================================================
-- 5. SYLLABUS_CHAPTERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS syllabus_chapters (
  id text PRIMARY KEY,
  subject text NOT NULL,
  name text NOT NULL,
  standard_class text NOT NULL,
  weightage_percent numeric DEFAULT 0,
  topics jsonb DEFAULT '[]',
  status text DEFAULT 'Not Started',
  is_high_yield boolean DEFAULT false,
  formula_sheet_available boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE syllabus_chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_syllabus" ON syllabus_chapters;
CREATE POLICY "anon_select_syllabus" ON syllabus_chapters FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_syllabus" ON syllabus_chapters;
CREATE POLICY "anon_insert_syllabus" ON syllabus_chapters FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_syllabus" ON syllabus_chapters;
CREATE POLICY "anon_update_syllabus" ON syllabus_chapters FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_syllabus" ON syllabus_chapters;
CREATE POLICY "anon_delete_syllabus" ON syllabus_chapters FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 6. DAILY_GOALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_goals (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  date text NOT NULL,
  title text NOT NULL,
  target_count integer DEFAULT 0,
  completed_count integer DEFAULT 0,
  unit text DEFAULT 'questions',
  is_done boolean DEFAULT false,
  category text DEFAULT 'PYQs',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_daily_goals" ON daily_goals;
CREATE POLICY "anon_select_daily_goals" ON daily_goals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_daily_goals" ON daily_goals;
CREATE POLICY "anon_insert_daily_goals" ON daily_goals FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_daily_goals" ON daily_goals;
CREATE POLICY "anon_update_daily_goals" ON daily_goals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_daily_goals" ON daily_goals;
CREATE POLICY "anon_delete_daily_goals" ON daily_goals FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_daily_goals_user_id ON daily_goals(user_id);

-- ============================================================
-- 7. BOOKMARKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  question_id text NOT NULL,
  question jsonb NOT NULL DEFAULT '{}',
  note text DEFAULT '',
  tag text DEFAULT '',
  saved_at timestamptz DEFAULT now()
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_bookmarks" ON bookmarks;
CREATE POLICY "anon_select_bookmarks" ON bookmarks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bookmarks" ON bookmarks;
CREATE POLICY "anon_insert_bookmarks" ON bookmarks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bookmarks" ON bookmarks;
CREATE POLICY "anon_update_bookmarks" ON bookmarks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bookmarks" ON bookmarks;
CREATE POLICY "anon_delete_bookmarks" ON bookmarks FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);

-- ============================================================
-- 8. CHAT_CHANNELS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_channels (
  id text PRIMARY KEY,
  type text NOT NULL DEFAULT 'student_parent',
  title text NOT NULL,
  subtitle text DEFAULT '',
  subject text,
  teacher_name text,
  teacher_id text,
  teacher_subject text,
  linked_group_id text,
  linked_teacher_channel_id text,
  standard_class text,
  batch_id text,
  batch_name text,
  class_id text,
  student_name text,
  student_id text,
  parent_name text,
  parent_id text,
  moderator_id text,
  moderator_name text,
  peer_school_connect_id text,
  participant_ids text[] DEFAULT '{}',
  participant_school_connect_ids text[] DEFAULT '{}',
  avatar text DEFAULT '',
  last_message text DEFAULT '',
  last_message_time timestamptz DEFAULT now(),
  unread_count integer DEFAULT 0,
  is_doubt_channel boolean DEFAULT false,
  is_resolved boolean DEFAULT false,
  is_online boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_chat_channels" ON chat_channels;
CREATE POLICY "anon_select_chat_channels" ON chat_channels FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat_channels" ON chat_channels;
CREATE POLICY "anon_insert_chat_channels" ON chat_channels FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_chat_channels" ON chat_channels;
CREATE POLICY "anon_update_chat_channels" ON chat_channels FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chat_channels" ON chat_channels;
CREATE POLICY "anon_delete_chat_channels" ON chat_channels FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 9. CHAT_MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id text PRIMARY KEY,
  channel_id text NOT NULL,
  sender_id text NOT NULL,
  sender_name text NOT NULL,
  sender_role text NOT NULL DEFAULT 'student',
  sender_avatar text DEFAULT '',
  text text NOT NULL DEFAULT '',
  timestamp timestamptz DEFAULT now(),
  attachments jsonb DEFAULT '[]',
  is_doubt boolean DEFAULT false,
  is_resolved boolean DEFAULT false,
  subject text,
  question_id text,
  reactions jsonb DEFAULT '{}',
  reply_to jsonb
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_chat_messages" ON chat_messages;
CREATE POLICY "anon_select_chat_messages" ON chat_messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat_messages" ON chat_messages;
CREATE POLICY "anon_insert_chat_messages" ON chat_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_chat_messages" ON chat_messages;
CREATE POLICY "anon_update_chat_messages" ON chat_messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chat_messages" ON chat_messages;
CREATE POLICY "anon_delete_chat_messages" ON chat_messages FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON chat_messages(channel_id);
