import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExamType, UserRole } from '../../types';
import {
  GraduationCap,
  Sparkles,
  User,
  Copy,
  Check,
  Clock,
  BookOpen,
  ChevronDown,
  Building2,
  Users,
  ShieldCheck,
  Flame,
  Search,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    switchRole,
    currentExam,
    setCurrentExam,
    currentView,
    setCurrentView,
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar,
    isAIAssistantOpen,
    setIsAIAssistantOpen,
    setIsProfileModalOpen,
    setIsAuthModalOpen,
    setIsRoleSheetOpen,
  } = useApp();

  const [copiedId, setCopiedId] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);

  // Navigate to current role's respective home dashboard
  const handleLogoClick = () => {
    let targetHomeView: any = 'dashboard';
    switch (currentUser.role) {
      case 'parent':
        targetHomeView = 'parent-mirror';
        break;
      case 'teacher':
        targetHomeView = 'teacher-portal';
        break;
      case 'institution_admin':
        targetHomeView = 'institution-batches';
        break;
      case 'student':
      default:
        targetHomeView = 'dashboard';
        break;
    }
    setCurrentView(targetHomeView);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const getRoleHomeTitle = () => {
    switch (currentUser.role) {
      case 'parent':
        return 'Go to Parent Live Mirror';
      case 'teacher':
        return 'Go to Teacher Faculty Portal';
      case 'institution_admin':
        return 'Go to Institution Admin Batches';
      case 'student':
      default:
        return 'Go to Student Dashboard';
    }
  };

  const handleRoleButtonClick = () => {
    if (window.innerWidth < 768) {
      setIsRoleSheetOpen(true);
    } else {
      setIsRoleDropdownOpen(!isRoleDropdownOpen);
    }
  };

  const copyConnectId = () => {
    navigator.clipboard.writeText(currentUser.schoolConnectId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const availableExams: ExamType[] = [
    'JEE Main',
    'JEE Advanced',
    'NEET UG',
    'CBSE Class 12',
    'CBSE Class 11',
  ];

  const roleLabels: Record<UserRole, { label: string; icon: any; color: string }> = {
    student: { label: 'Student', icon: GraduationCap, color: 'bg-blue-600 text-white' },
    parent: { label: 'Parent (Mirror)', icon: Users, color: 'bg-emerald-600 text-white' },
    teacher: { label: 'Faculty / Teacher', icon: BookOpen, color: 'bg-purple-600 text-white' },
    institution_admin: { label: 'Institution Admin', icon: Building2, color: 'bg-amber-600 text-white' },
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-between gap-2">
        {/* Brand & 3-Line Menu Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* 3-Line Hamburger Menu Button */}
          <button
            id="sidebar-hamburger-toggle-button"
            onClick={toggleSidebar}
            className={`p-2 rounded-lg border transition-all duration-200 flex items-center justify-center ${
              isSidebarOpen
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30'
                : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title={isSidebarOpen ? 'Hide Side Navigation Bar' : 'Show Side Navigation Bar'}
            aria-label="Toggle Side Navigation Bar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* School-Connect Logo with Dynamic Role Home Navigation */}
          <button
            id="school-connect-main-logo-button"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 font-bold tracking-tight text-left group cursor-pointer focus:outline-none select-none transition-transform duration-150 active:scale-95"
            title={getRoleHomeTitle()}
            aria-label={getRoleHomeTitle()}
          >
            {/* Logo Icon with glowing ring and role accent */}
            <div className="relative">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 border border-white/20 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all duration-200 shrink-0">
                <GraduationCap className="w-5 h-5 transition-transform duration-200 group-hover:rotate-[-6deg]" />
              </div>
              {/* Role Status Dot on Logo */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 shadow-sm ${
                  currentUser.role === 'student'
                    ? 'bg-cyan-400 shadow-cyan-400/50'
                    : currentUser.role === 'parent'
                    ? 'bg-emerald-400 shadow-emerald-400/50'
                    : currentUser.role === 'teacher'
                    ? 'bg-purple-400 shadow-purple-400/50'
                    : 'bg-amber-400 shadow-amber-400/50'
                }`}
                title={`Active Role: ${currentUser.role.replace('_', ' ')}`}
              />
            </div>

            {/* Brand Text */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-white font-black text-base sm:text-lg tracking-tight group-hover:text-slate-100 transition-colors">
                  School<span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">Connect</span>
                </span>
                <span className={`hidden xl:inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md border tracking-wider ${
                  currentUser.role === 'student'
                    ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                    : currentUser.role === 'parent'
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                    : currentUser.role === 'teacher'
                    ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                    : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                }`}>
                  {currentUser.role === 'institution_admin' ? 'Campus Admin' : currentUser.role}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium leading-tight hidden sm:inline group-hover:text-slate-300 transition-colors mt-0.5">
                {currentUser.role === 'parent'
                  ? '👨‍👩‍👧 Parent Live Mirror Dashboard'
                  : currentUser.role === 'teacher'
                  ? '📚 Faculty & Class Batches Portal'
                  : currentUser.role === 'institution_admin'
                  ? '🏛️ Campus CBT & Roster Management'
                  : '⚡ CBT Mock & AI Prep Ecosystem'}
              </span>
            </div>
          </button>

          {/* Exam Selector Dropdown - ONLY for Student */}
          {currentUser.role === 'student' && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsExamDropdownOpen(!isExamDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition"
                title="Change Target Exam"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{currentExam} 2026</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isExamDropdownOpen && (
                <div
                  className="absolute left-0 mt-1 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs"
                  onMouseLeave={() => setIsExamDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-700">
                    Target Exam
                  </div>
                  {availableExams.map((exam) => (
                    <button
                      key={exam}
                      onClick={() => {
                        setCurrentExam(exam);
                        setIsExamDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-700 transition ${
                        currentExam === exam ? 'text-blue-400 font-bold bg-slate-700/50' : 'text-slate-300'
                      }`}
                    >
                      <span>{exam}</span>
                      {currentExam === exam && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Role Status Pills for Non-Student Roles */}
          {currentUser.role === 'parent' && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Monitoring: <strong>Aarav Sharma</strong></span>
            </div>
          )}

          {currentUser.role === 'teacher' && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Faculty Desk • <strong>Physics Dept</strong></span>
            </div>
          )}

          {currentUser.role === 'institution_admin' && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Institute Admin • <strong>Apex Science Academy</strong></span>
            </div>
          )}
        </div>

        {/* Center: Exam Countdown & Daily Streak (STUDENT ONLY) */}
        {currentUser.role === 'student' && (
          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/70 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Target: <strong>Jan 2026</strong></span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400 font-mono font-medium">142 Days Left</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-semibold">6-Day Streak</span>
            </div>
          </div>
        )}

        {/* Right: Unique School-Connect ID, AI Assistant, Role Switcher, Profile */}
        <div className="flex items-center gap-2">
          {/* Unique School-Connect ID Pill */}
          <button
            onClick={copyConnectId}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-blue-500/30 text-xs font-mono text-blue-300 transition group"
            title="Click to copy your unique School-Connect ID for Parents or Institutions"
          >
            <span className="text-[10px] text-slate-400">ID:</span>
            <span className="font-bold">{currentUser.schoolConnectId}</span>
            {copiedId ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400 group-hover:text-blue-300" />
            )}
          </button>

          {/* Proactive Connect AI Tutor Button (Navbar on Desktop, bottom bar on Mobile) */}
          <button
            onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition ${
              isAIAssistantOpen
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-blue-500/40 text-blue-200 hover:border-blue-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
            <span className="font-semibold">Connect AI</span>
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={handleRoleButtonClick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-xs font-medium text-slate-200 transition min-h-[38px]"
              title="Switch role view (Student, Parent, Teacher, Institution)"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${
                currentUser.role === 'student' ? 'bg-cyan-400 shadow-sm shadow-cyan-400' :
                currentUser.role === 'parent' ? 'bg-emerald-400 shadow-sm shadow-emerald-400' :
                currentUser.role === 'teacher' ? 'bg-purple-400 shadow-sm shadow-purple-400' : 'bg-amber-400 shadow-sm shadow-amber-400'
              }`} />
              <span className="capitalize font-bold text-xs">{currentUser.role.replace('_', ' ')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div
                className="absolute right-0 mt-1 w-52 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs"
                onMouseLeave={() => setIsRoleDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700 flex items-center justify-between">
                  <span>Switch Role Demo</span>
                  <span className="text-[9px] text-blue-400 font-normal">Dual-Entry</span>
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map((role) => {
                  const item = roleLabels[role];
                  const Icon = item.icon;
                  const isCurrent = currentUser.role === role;
                  return (
                    <button
                      key={role}
                      onClick={() => {
                        switchRole(role);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-700 transition ${
                        isCurrent ? 'bg-slate-700/60 font-bold text-white' : 'text-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="flex-1">{item.label}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  );
                })}
                <div className="border-t border-slate-700 pt-1 mt-1">
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-blue-400 hover:bg-slate-700 flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Create Custom Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar / Modal Trigger */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-md hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
            title="Edit Profile"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-blue-500/50"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
