import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  GraduationCap,
  Users,
  BookOpen,
  Building2,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

export const RoleSwitcherBottomSheet: React.FC = () => {
  const {
    isRoleSheetOpen,
    setIsRoleSheetOpen,
    currentUser,
    switchRole,
    setIsAuthModalOpen,
  } = useApp();

  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRoleSheetOpen) {
        setIsRoleSheetOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRoleSheetOpen, setIsRoleSheetOpen]);

  if (!isRoleSheetOpen) return null;

  const roles: Array<{
    id: UserRole;
    title: string;
    subtitle: string;
    description: string;
    icon: any;
    badge: string;
    color: string;
    activeBorder: string;
    activeGlow: string;
    iconBg: string;
    highlights: string[];
  }> = [
    {
      id: 'student' as UserRole,
      title: 'Student Aspirant',
      subtitle: 'Aarav Sharma • JEE 2026',
      description: 'CBT Mock Engine, 15,000+ PYQs, Connect AI Weakness Radar, and peer doubt resolution.',
      icon: GraduationCap,
      badge: 'Primary Mode',
      color: 'text-cyan-400',
      activeBorder: 'border-cyan-500/80 bg-cyan-950/30 ring-1 ring-cyan-500/50',
      activeGlow: 'shadow-lg shadow-cyan-500/20',
      iconBg: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
      highlights: ['Live CBT Mock Tests', 'Interactive Doubt Chat', 'AI Weakness Radar'],
    },
    {
      id: 'parent' as UserRole,
      title: 'Parent (Live Mirror)',
      subtitle: 'Rajesh Sharma • Monitoring Aarav',
      description: 'Real-time child academic syllabus sync, test performance reports, and direct faculty chat.',
      icon: Users,
      badge: 'Live Sync',
      color: 'text-emerald-400',
      activeBorder: 'border-emerald-500/80 bg-emerald-950/30 ring-1 ring-emerald-500/50',
      activeGlow: 'shadow-lg shadow-emerald-500/20',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      highlights: ['Real-Time Child Mirror', 'Direct Teacher Connect', 'AI Progress Guard'],
    },
    {
      id: 'teacher' as UserRole,
      title: 'Faculty / Teacher',
      subtitle: 'Dr. Vikramaditya • Physics HOD',
      description: 'Class batch management, syllabus milestone grading, student doubts, and question authoring.',
      icon: BookOpen,
      badge: 'Educator Hub',
      color: 'text-purple-400',
      activeBorder: 'border-purple-500/80 bg-purple-950/30 ring-1 ring-purple-500/50',
      activeGlow: 'shadow-lg shadow-purple-500/20',
      iconBg: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      highlights: ['Multi-Class Switcher', 'Parent Inquiries Desk', '+ Create PYQ / Test'],
    },
    {
      id: 'institution_admin' as UserRole,
      title: 'Institution Admin',
      subtitle: 'Apex Science Academy • Admin Portal',
      description: 'Campus-wide batch tracking, student rosters, faculty performance, and campus CBT rank lists.',
      icon: Building2,
      badge: 'Enterprise Admin',
      color: 'text-amber-400',
      activeBorder: 'border-amber-500/80 bg-amber-950/30 ring-1 ring-amber-500/50',
      activeGlow: 'shadow-lg shadow-amber-500/20',
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      highlights: ['Batch Cohort Matrix', 'Faculty & Student Rosters', 'Campus CBT Analytics'],
    },
  ];

  const handleSelectRole = (roleId: UserRole) => {
    switchRole(roleId);
    setIsRoleSheetOpen(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY !== null) {
      const touchEndY = e.changedTouches[0].clientY;
      if (touchEndY - touchStartY > 60) {
        setIsRoleSheetOpen(false);
      }
      setTouchStartY(null);
    }
  };

  return (
    <div
      id="role-switcher-bottom-sheet-container"
      className="fixed inset-0 z-50 flex flex-col justify-end select-none animate-fadeIn"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsRoleSheetOpen(false)}
      />

      {/* Sheet Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative z-10 w-full max-w-xl mx-auto bg-slate-900 border-t border-slate-700/80 rounded-t-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col animate-slideUp"
      >
        {/* Drag Handle Bar */}
        <div className="pt-3 pb-2 flex flex-col items-center justify-center cursor-pointer">
          <div className="w-12 h-1.5 rounded-full bg-slate-700 hover:bg-slate-600 transition" />
        </div>

        {/* Header */}
        <div className="px-5 py-2.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">Switch Persona / Role</h3>
              <p className="text-[11px] text-slate-400">Experience School-Connect through any stakeholder lens</p>
            </div>
          </div>

          <button
            onClick={() => setIsRoleSheetOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Cards List */}
        <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = currentUser.role === r.id;

            return (
              <div
                key={r.id}
                onClick={() => handleSelectRole(r.id)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                  isSelected
                    ? `${r.activeBorder} ${r.activeGlow}`
                    : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${r.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{r.title}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isSelected
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {r.badge}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-300">{r.subtitle}</p>
                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{r.description}</p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center pt-1">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/40 ring-2 ring-blue-400/40">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-slate-700 text-slate-500 flex items-center justify-center">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Highlights tags */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center gap-1.5 flex-wrap">
                  {r.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/60 font-medium"
                    >
                      • {h}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3 safe-area-pb">
          <button
            onClick={() => {
              setIsRoleSheetOpen(false);
              setIsAuthModalOpen(true);
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 min-h-[44px]"
          >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Create Custom Account</span>
          </button>

          <button
            onClick={() => setIsRoleSheetOpen(false)}
            className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition active:scale-95 min-h-[44px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
