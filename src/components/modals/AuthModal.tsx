import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, UserProfile } from '../../types';
import { Users, Building2, GraduationCap, Sparkles, CircleCheck as CheckCircle2, X, ArrowRight, School, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setCurrentUser, switchRolePreset, currentUser } = useApp();

  const [entryType, setEntryType] = useState<'independent' | 'institution'>('independent');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetExam, setTargetExam] = useState<'JEE Main' | 'JEE Advanced' | 'NEET UG' | 'CBSE Class 12'>('JEE Main');
  const [instName, setInstName] = useState('');
  const [instCity, setInstCity] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name && !instName) return;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    let generatedId = '';

    if (entryType === 'independent') {
      if (selectedRole === 'student') generatedId = `SC-STU-${randomSuffix}`;
      else if (selectedRole === 'parent') generatedId = `SC-PAR-${randomSuffix}`;
      else if (selectedRole === 'teacher') generatedId = `SC-TCH-${randomSuffix}`;

      const newUser: UserProfile = {
        id: `user_${Date.now()}`,
        name: name || 'Aspirant',
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@schoolconnect.in`,
        role: selectedRole,
        accountType: 'independent',
        schoolConnectId: generatedId,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        targetExam,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(newUser);
    } else {
      generatedId = `SC-INS-${randomSuffix}`;
      const newAdmin: UserProfile = {
        id: `user_${Date.now()}`,
        name: `${instName} Administrator`,
        email: email || `admin@${instName.toLowerCase().replace(/\s+/g, '')}.edu`,
        role: 'institution_admin',
        accountType: 'institution',
        schoolConnectId: generatedId,
        avatar: `https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80`,
        institutionName: instName,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(newAdmin);
    }

    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-5 shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              SC
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">School-Connect Account Portal</h2>
              <span className="text-[10px] text-slate-400">Unique ID Linking Architecture</span>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Role Preview Demo Presets */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
            ⚡ 1-Click Quick Role Switcher (Try Any Perspective):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
            <button
              onClick={() => {
                switchRolePreset('student');
                setIsAuthModalOpen(false);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-blue-600/30 border border-slate-700 text-slate-200 text-left"
            >
              <span className="font-bold text-blue-400 block">Student</span>
              <span className="text-[9px] text-slate-400">Aarav (SC-STU-4821)</span>
            </button>
            <button
              onClick={() => {
                switchRolePreset('parent');
                setIsAuthModalOpen(false);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-600/30 border border-slate-700 text-slate-200 text-left"
            >
              <span className="font-bold text-emerald-400 block">Parent</span>
              <span className="text-[9px] text-slate-400">Mirror child logs</span>
            </button>
            <button
              onClick={() => {
                switchRolePreset('teacher');
                setIsAuthModalOpen(false);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-purple-600/30 border border-slate-700 text-slate-200 text-left"
            >
              <span className="font-bold text-purple-400 block">Teacher</span>
              <span className="text-[9px] text-slate-400">Curator & Doubts</span>
            </button>
            <button
              onClick={() => {
                switchRolePreset('institution_admin');
                setIsAuthModalOpen(false);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-amber-600/30 border border-slate-700 text-slate-200 text-left"
            >
              <span className="font-bold text-amber-400 block">Institution</span>
              <span className="text-[9px] text-slate-400">Apex Academy Admin</span>
            </button>
          </div>
        </div>

        {/* Dual-Entry Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Select Your Account Entry Type:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setEntryType('independent')}
              className={`p-3 rounded-xl border text-left text-xs transition ${
                entryType === 'independent'
                  ? 'bg-blue-600/20 border-blue-500 text-white font-bold ring-1 ring-blue-500'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
              }`}
            >
              <Users className="w-5 h-5 mb-1.5 text-blue-400" />
              <span className="block font-bold">Independent Candidate</span>
              <span className="text-[10px] text-slate-400 font-normal">Student, Parent, or Teacher</span>
            </button>

            <button
              type="button"
              onClick={() => setEntryType('institution')}
              className={`p-3 rounded-xl border text-left text-xs transition ${
                entryType === 'institution'
                  ? 'bg-amber-600/20 border-amber-500 text-white font-bold ring-1 ring-amber-500'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
              }`}
            >
              <Building2 className="w-5 h-5 mb-1.5 text-amber-400" />
              <span className="block font-bold">Institution / Academy</span>
              <span className="text-[10px] text-slate-400 font-normal">School, Coaching or Tuition</span>
            </button>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-3.5 text-xs">
          {entryType === 'independent' ? (
            <>
              <div>
                <label className="block text-slate-400 mb-1">Your Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['student', 'parent', 'teacher'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`p-2 rounded-lg border capitalize font-semibold transition ${
                        selectedRole === r
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

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
            </>
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

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2"
            >
              <span>Create Account & Generate Unique School-Connect ID</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
