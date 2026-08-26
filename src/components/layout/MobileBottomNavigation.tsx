import React from 'react';
import { useApp, AppView } from '../../context/AppContext';
import { LayoutDashboard, BookOpen, Circle as HelpCircle, User, Sparkles, Users, GraduationCap, Building2, FileQuestionMark as FileQuestion, RotateCcw } from 'lucide-react';

export const MobileBottomNavigation: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    setIsAIAssistantOpen,
    setIsRoleSheetOpen,
    setIsProfileModalOpen,
    dailyGoals,
    chatMessages,
    channels,
  } = useApp();

  // If in active full CBT test simulation mode, hide the bottom bar for 100% focus
  if (currentView === 'cbt-live') return null;

  // Unread/action counts
  const pendingGoals = dailyGoals.filter((g) => !g.isDone).length;
  
  // Calculate role-appropriate home destination
  const getHomeView = (): AppView => {
    switch (currentUser.role) {
      case 'parent':
        return 'parent-mirror';
      case 'teacher':
        return 'teacher-portal';
      case 'institution_admin':
        return 'institution-batches';
      case 'student':
      default:
        return 'dashboard';
    }
  };

  // Determine active states
  const homeView = getHomeView();
  const isHomeActive = currentView === homeView || currentView === 'dashboard';
  const isStudyActive = ['pyq', 'test-series', 'study', 'revise', 'ncert', 'syllabus', 'history', 'bookmarks'].includes(currentView);
  const isChatActive = ['doubt-chat', 'chat', 'teacher-doubts'].includes(currentView);

  return (
    <nav
      id="mobile-bottom-navigation-bar"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb select-none transition-all duration-300"
    >
      {/* 1. HOME TAB */}
      <button
        id="mobile-nav-home-tab"
        onClick={() => setCurrentView(homeView)}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 min-w-[56px] min-h-[44px] active:scale-95 relative cursor-pointer ${
          isHomeActive
            ? 'text-cyan-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative flex items-center justify-center">
          {currentUser.role === 'parent' ? (
            <Users className="w-5 h-5" />
          ) : currentUser.role === 'teacher' ? (
            <GraduationCap className="w-5 h-5" />
          ) : currentUser.role === 'institution_admin' ? (
            <Building2 className="w-5 h-5" />
          ) : (
            <LayoutDashboard className="w-5 h-5" />
          )}
          {isHomeActive && (
            <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
          )}
        </div>
        <span className="text-[10px] tracking-tight mt-1">
          {currentUser.role === 'parent' ? 'Child Live' : currentUser.role === 'teacher' ? 'Faculty' : currentUser.role === 'institution_admin' ? 'Campus' : 'Home'}
        </span>
      </button>

      {/* 2. STUDY / PYQs / TESTS TAB */}
      <button
        id="mobile-nav-study-tab"
        onClick={() => setCurrentView('pyq')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 min-w-[56px] min-h-[44px] active:scale-95 relative cursor-pointer ${
          isStudyActive
            ? 'text-cyan-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <BookOpen className="w-5 h-5" />
          {isStudyActive && (
            <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
          )}
        </div>
        <span className="text-[10px] tracking-tight mt-1">
          {currentUser.role === 'student' ? 'Study & PYQ' : 'Syllabus'}
        </span>
      </button>

      {/* 3. CENTER GLOWING AI MENTOR TAB */}
      <button
        id="mobile-nav-ai-mentor-tab"
        onClick={() => setIsAIAssistantOpen(true)}
        className="flex flex-col items-center justify-center -mt-5 min-w-[56px] min-h-[44px] active:scale-95 group relative cursor-pointer"
        title="Open Connect AI Mentor"
      >
        {/* Glow Ring */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-500 via-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/40 ring-4 ring-slate-950 group-hover:scale-105 transition-all duration-200 border border-white/40">
          <Sparkles className="w-6 h-6 animate-pulse text-amber-300" />
        </div>
        <span className="text-[10px] font-bold text-cyan-300 tracking-tight mt-0.5">
          AI Mentor
        </span>
      </button>

      {/* 4. DOUBT CHAT TAB */}
      <button
        id="mobile-nav-chat-tab"
        onClick={() => setCurrentView('doubt-chat')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 min-w-[56px] min-h-[44px] active:scale-95 relative cursor-pointer ${
          isChatActive
            ? 'text-cyan-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative flex items-center justify-center">
          <HelpCircle className="w-5 h-5" />
          {/* Badge */}
          <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-blue-600 text-[9px] font-mono text-white font-bold animate-pulse">
            Live
          </span>
          {isChatActive && (
            <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
          )}
        </div>
        <span className="text-[10px] tracking-tight mt-1">Doubt Chat</span>
      </button>

      {/* 5. PROFILE & ROLE SWITCHER TAB */}
      <button
        id="mobile-nav-profile-tab"
        onClick={() => setIsRoleSheetOpen(true)}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 min-w-[56px] min-h-[44px] active:scale-95 relative cursor-pointer text-slate-400 hover:text-slate-200"
      >
        <div className="relative flex items-center justify-center">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-5 h-5 rounded-full object-cover border border-cyan-500/50"
          />
          <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 ${
            currentUser.role === 'student' ? 'bg-blue-400' :
            currentUser.role === 'parent' ? 'bg-emerald-400' :
            currentUser.role === 'teacher' ? 'bg-purple-400' : 'bg-amber-400'
          }`} />
        </div>
        <span className="text-[10px] tracking-tight mt-1 capitalize font-medium">
          {currentUser.role === 'institution_admin' ? 'Admin' : currentUser.role}
        </span>
      </button>
    </nav>
  );
};
