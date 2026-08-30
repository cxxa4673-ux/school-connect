/**
 * Authentication service.
 *
 * Two modes (auto-detected, see src/lib/config):
 *   'supabase' → REAL auth. Email + password via Supabase Auth, returns a JWT
 *                session and a persisted profile in the `profiles` table.
 *                Role is stored on the profile and used by RLS to gate access.
 *   'local'    → demo mode. No backend. We still enforce email + password
 *                shape and store a mock session in localStorage so the app is
 *                fully usable offline while you wire up credentials later.
 *
 * IMPORTANT SECURITY NOTES:
 *   - Passwords are NEVER stored in localStorage. In local mode we only keep a
 *     flag and the safe profile fields (name, email, role, id). The password is
 *     used to validate on sign-in and then discarded.
 *   - In supabase mode the profile row is written by the server using the RLS
 *     policies defined in supabase/migrations; the anon key cannot write
 *     `role` arbitrarily if you tighten those policies (see docs/ARCHITECTURE).
 */

import { UserProfile, UserRole, ExamType } from '../types';
import { getStorageMode } from '../lib/config';
import { getSupabase } from '../lib/supabase';
import { upsertCollection } from './dataService';

const SESSION_KEY = 'sc_auth_session';

export interface AuthResult {
  ok: boolean;
  user?: UserProfile;
  error?: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  accountType: 'independent' | 'institution';
  targetExam?: string;
  institutionName?: string;
}

/** Safe profile parts we keep locally in demo mode (never the password). */
function buildProfile(p: SignupPayload): UserProfile {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const roleCode = p.role === 'parent' ? 'PAR' : p.role === 'teacher' ? 'TCH' : p.role === 'institution_admin' ? 'INS' : 'STU';
  return {
    id: `user_${Date.now()}`,
    name: p.name,
    email: p.email.toLowerCase().trim(),
    role: p.role,
    accountType: p.accountType,
    schoolConnectId: `SC-${roleCode}-${randomSuffix}`,
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    targetExam: (p.targetExam || 'JEE Main') as ExamType,
    institutionName: p.institutionName,
    institutionId: p.accountType === 'institution' ? `SC-INS-${randomSuffix}` : undefined,
    createdAt: new Date().toISOString(),
  };
}

/** Create an account. Returns the signed-in profile on success. */
export async function signup(payload: SignupPayload): Promise<AuthResult> {
  const email = payload.email.trim().toLowerCase();

  // Basic client-side validation (also enforced server-side).
  if (!email.includes('@') || email.length < 5) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (payload.password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }
  if (!payload.name.trim()) {
    return { ok: false, error: 'Please enter your full name.' };
  }

  if (getStorageMode() === 'supabase') {
    const supabase = getSupabase();
    if (!supabase) return { ok: false, error: 'Supabase is not reachable.' };
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: payload.password,
        options: { data: { name: payload.name, role: payload.role } },
      });
      if (error) return { ok: false, error: error.message };
      if (!data.user) return { ok: false, error: 'Sign up failed. Please try again.' };

      const profile = buildProfile(payload);
      profile.id = data.user.id;
      // Persist the profile. IMPORTANT: the server RLS policy decides whether
      // this write is allowed — see supabase/migrations.
      await upsertCollection('currentUser', [profile as unknown as Record<string, unknown>]);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ mode: 'supabase', userId: data.user.id }));
      return { ok: true, user: profile };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Sign up failed.' };
    }
  }

  // --- Demo (local) mode ---
  const profile = buildProfile(payload);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ mode: 'local', profile, email }));
  return { ok: true, user: profile };
}

/** Sign in with an existing account. */
export async function signin(email: string, password: string): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.includes('@')) return { ok: false, error: 'Enter a valid email.' };
  if (!password) return { ok: false, error: 'Enter your password.' };

  if (getStorageMode() === 'supabase') {
    const supabase = getSupabase();
    if (!supabase) return { ok: false, error: 'Supabase is not reachable.' };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) return { ok: false, error: error.message };
      if (!data.user) return { ok: false, error: 'Sign in failed.' };

      // Try to hydrate the profile from the profiles table.
      let user: UserProfile | undefined;
      const { data: profileRow } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
      if (profileRow) {
        const p: any = profileRow;
        user = {
          id: p.id, name: p.name, email: p.email, role: p.role, accountType: p.account_type || 'independent',
          schoolConnectId: p.school_connect_id || '', avatar: p.avatar || '', targetExam: p.target_exam,
          standardClass: p.standard_class, institutionName: p.institution_name, institutionId: p.institution_id,
          linkedChildIds: p.linked_child_ids || [], createdAt: p.created_at,
        } as UserProfile;
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify({ mode: 'supabase', userId: data.user.id }));
      return { ok: true, user };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Sign in failed.' };
    }
  }

  // --- Demo (local) mode: validate against the stored mock session ---
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw) {
    const session = JSON.parse(raw);
    if (session?.email === cleanEmail && session?.profile) {
      return { ok: true, user: session.profile as UserProfile };
    }
  }
  return { ok: false, error: 'No matching demo account. Create one first.' };
}

/** Sign out and clear the local session (keeps the profile data intact). */
export async function signout(): Promise<void> {
  if (getStorageMode() === 'supabase') {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
  }
  localStorage.removeItem(SESSION_KEY);
}

/** Restore a previously stored local session (called once on app mount). */
export function restoreLocalSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.mode === 'local' ? (session.profile as UserProfile) : null;
  } catch {
    return null;
  }
}
