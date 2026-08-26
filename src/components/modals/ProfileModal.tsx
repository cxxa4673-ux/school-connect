import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Copy,
  CheckCircle2,
  Building2,
  X,
  Award,
  BookOpen,
  Link2,
  Trash2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    currentUser,
    setCurrentUser,
    deleteCurrentUserData,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [instCodeInput, setInstCodeInput] = useState('');
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!isProfileModalOpen) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUser.schoolConnectId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instCodeInput) return;
    setCurrentUser({
      ...currentUser,
      institutionId: instCodeInput,
      institutionName: 'Apex Science Academy Kota',
    });
    setLinkSuccess(true);
    setInstCodeInput('');
    setTimeout(() => setLinkSuccess(false), 3000);
  };

  const handleDeleteData = () => {
    deleteCurrentUserData();
    setIsConfirmingDelete(false);
    setIsProfileModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-5 shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white">My School-Connect Profile</h2>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3.5">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/50"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white truncate">{currentUser.name}</h3>
            <span className="text-xs text-blue-400 font-semibold capitalize block">
              {currentUser.role.replace('_', ' ')}
            </span>
            <span className="text-[11px] text-slate-400 font-mono truncate block">{currentUser.email}</span>
          </div>
        </div>

        {/* Unique School-Connect ID Display & Copy */}
        <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40 space-y-1.5">
          <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block">
            Your Unique School-Connect ID (Share with Parents / Coaching):
          </span>
          <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-700">
            <span className="font-mono font-bold text-sm text-emerald-400 tracking-wider">
              {currentUser.schoolConnectId}
            </span>
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy ID'}</span>
            </button>
          </div>
        </div>

        {/* Link Institution Code */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Institution / Coaching Affiliation</span>
          </div>

          {currentUser.institutionName ? (
            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300">
              Enrolled at: <strong>{currentUser.institutionName}</strong>
            </div>
          ) : (
            <form onSubmit={handleLinkInstitution} className="space-y-2 text-xs">
              <p className="text-[11px] text-slate-400">
                Enter your coaching or school ID (e.g. <code>SC-INS-9812</code>) to sync batch assignments.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. SC-INS-9812"
                  value={instCodeInput}
                  onChange={(e) => setInstCodeInput(e.target.value)}
                  className="flex-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Link
                </button>
              </div>
            </form>
          )}

          {linkSuccess && (
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Affiliation linked to Apex Science Academy Kota!</span>
            </div>
          )}
        </div>

        {/* Privacy, GDPR & Account Data Erasure Section */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Privacy & Right to Erasure (GDPR)</span>
            </div>
            {!isConfirmingDelete && (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-medium transition"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete All My Data</span>
              </button>
            )}
          </div>

          {isConfirmingDelete && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 space-y-2 animate-fadeIn">
              <div className="flex items-start gap-2 text-red-200 text-[11px]">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p>
                  This will permanently wipe all test attempts, bookmarks, syllabus history, and account profile data from this device.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDeleteData}
                  className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition"
                >
                  Confirm Permanent Erasure
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsProfileModalOpen(false)}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
        >
          Close Profile
        </button>
      </div>
    </div>
  );
};
