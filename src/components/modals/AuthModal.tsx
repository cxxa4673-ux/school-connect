import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Users, Building2, X, ArrowRight, CircleCheck, Loader2 } from 'lucide-react';

/**
 * Authentication modal.
 *
 * Two modes of operation (auto-detected, see src/lib/config):
 *   - Supabase configured → REAL email + password auth (Supabase Auth).
 *   - No Supabase → demo mode, still enforces email + password shape and keeps
 *     a safe mock session so the app is usable before backend wiring.
 *
 * The "Quick Role Switcher" presets remain as a demo convenience: they let a
 * visitor preview each role's dashboard without making an account.
 */
export const AuthModal: React.FC = () => {
  // NOTE: the demo preset helper is `switchRole` (it exists in the context).
  // The original code referenced a non-existent `switchRolePreset`, which
  // crashed the preset buttons on click. We now use `switchRole`.
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    registerAccount,
    loginAccount,
    switchRole,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [entryType, setEntryType] = useState<'independent' | 'institution'>('independent');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [targetExam, setTargetExam] = useState<'JEE Main' | 'JEE Advanced' | 'NEET UG' | 'CBSE Class 12'>('JEE Main');
  const [instName, setInstName] = useState('');
  const [instCity, setInstCity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const resetForm = () => {
    setError('');
    setPassword('');
    setConfirm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Shared client-side checks.
    if (!email.trim()) return setError('Please enter your email.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Please enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    if (mode === 'signup') {
      if (!name.trim()) return setError('Please enter your full name.');
      if (password !== confirm) return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const result =
        mode === 'signup'
          ? await registerAccount({
              name: name.trim(),
              email: email.trim(),
              password,
              role: selectedRole,
              accountType: entryType,
              targetExam,
              institutionName: entryType === 'institution' ? instName.trim() : undefined,
            })
          : await loginAccount(email.trim(), password);

      if (!result.ok) {
        setError(result.error || 'Something went wrong. Please try again.');
        return;
      }
      // Success → close and reset.
      setIsAuthModalOpen(false);
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-5 shadow-2xl animate-scaleUp my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              SC
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">School-Connect Account Portal</h2>
              <span className="text-[10px] text-slate-400">Secure email + password authentication</span>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Role Switcher (demo presets) */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
            ⚡ 1-Click Demo Preview (no account needed):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
            {/* Preset buttons use the real `switchRole` helper. */}
            {(['student', 'parent', 'teacher', 'institution_admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  switchRole(r);
                  setIsAuthModalOpen(false);
                }}
                className={`p-2 rounded-lg bg-slate-800 hover:bg-blue-600/30 border border-slate-700 text-slate-200 text-left capitalize`}
              >
                <span className="font-bold text-blue-400 block">{r.replace('_admin', ' Admin')}</span>
                <span className="text-[9px] text-slate-400">
                  {r === 'student' ? 'Aarav (SC-STU-4821)' : r === 'parent' ? 'Mirror child logs' : r === 'teacher' ? 'Curator & Doubts' : 'Apex Academy Admin'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Login / Sign up toggle */}
        <div className="grid grid-cols-2 gap-2 bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-2 rounded-lg transition ${mode === 'signup' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-lg transition ${mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            Sign In
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Sign-up only fields */}
          {mode === 'signup' && (
            <>
              {entryType === 'independent' ? (
                <div>
                  <label className="block text-slate-400 mb-1">Your Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['student', 'parent', 'teacher'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRole(r)}
                        className={`p-2 rounded-lg border capitalize font-semibold transition ${
                          selectedRole === r ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1">Institution Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Science Academy"
                      value={instName}
                      onChange={(e) => setInstName(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">City / Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Kota, Rajasthan"
                      value={instCity}
                      onChange={(e) => setInstCity(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              {entryType === 'independent' && (
                <div>
                  <label className="block text-slate-400 mb-1">Target Examination</label>
                  <select
                    value={targetExam}
                    onChange={(e: any) => setTargetExam(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                  >
                    <option value="JEE Main">JEE Main (Engineering)</option>
                    <option value="JEE Advanced">JEE Advanced (IIT)</option>
                    <option value="NEET UG">NEET UG (Medical)</option>
                    <option value="CBSE Class 12">CBSE Class 12 Boards</option>
                  </select>
                </div>
              )}
            </>
          )}

          {/* Entry-type selector (signup only) */}
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEntryType('independent')}
                className={`p-2.5 rounded-xl border text-left text-xs transition ${
                  entryType === 'independent' ? 'bg-blue-600/20 border-blue-500 text-white font-bold ring-1 ring-blue-500' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Users className="w-4 h-4 mb-1 text-blue-400" />
                <span className="block font-bold">Independent Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => setEntryType('institution')}
                className={`p-2.5 rounded-xl border text-left text-xs transition ${
                  entryType === 'institution' ? 'bg-amber-600/20 border-amber-500 text-white font-bold ring-1 ring-amber-500' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Building2 className="w-4 h-4 mb-1 text-amber-400" />
                <span className="block font-bold">Institution / Academy</span>
              </button>
            </div>
          )}

          {/* Shared credentials */}
          <div>
            <label className="block text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          {mode === 'signup' && (
            <div>
              <label className="block text-slate-400 mb-1">Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/40 text-rose-300 text-[11px] flex items-start gap-2">
              <CircleCheck className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2 disabled:opacity-60`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === 'signup' ? 'Creating account…' : 'Signing in…'}
                </>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Create Account & Generate Unique School-Connect ID' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
