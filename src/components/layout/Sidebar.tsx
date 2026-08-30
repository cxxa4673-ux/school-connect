import React from 'react';
import { useApp, AppView } from '../../context/AppContext';
import { LayoutDashboard, BookOpen, RotateCcw, FileQuestionMark as FileQuestion, Timer, Library, MapPin, History, Bookmark, SquareCheck as CheckSquare, Activity, Users, Building2, GraduationCap, Sparkles, School, FilePlus, Circle as HelpCircle, ShoppingBag, Award, Link2, PanelLeftClose, X } from 'lucide-react';

interface NavItem {
  id: AppView;
  label: string;
  icon: any;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    bookmarks,
    dailyGoals,
    testAttempts,
    isSidebarOpen,
    setIsSidebarOpen,
  } = useApp();

  const activeGoalsCount = dailyGoals.filter((g) => !g.isDone).length;
  const totalBookmarks = bookmarks.length;
  const totalAttempts = testAttempts.length;

  const handleNavClick = (viewId: AppView) => {
    setCurrentView(viewId);
    // On small screens, close the sidebar overlay when a nav item is chosen
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Student Core Navigation Items
  const studentPrimaryItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'doubt-chat', label: 'Doubt Chat & Class Groups', icon: HelpCircle, badge: 'Live', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    { id: 'syllabus', label: 'Syllabus Tracker', icon: MapPin, badge: '68%', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { id: 'revise', label: 'Revise & Flashcards', icon: RotateCcw, badge: 'High Yield', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    { id: 'study', label: 'Study', icon: BookOpen },
    { id: 'pyq', label: 'Previous Year Questions (PYQs)', icon: FileQuestion, badge: '2025 Live', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { id: 'test-series', label: 'Test Series & CBT Engine', icon: Timer, badge: 'CBT Mode', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { id: 'ncert', label: 'NCERT Hub', icon: Library },
    { id: 'history', label: 'My Tests History', icon: History, badge: totalAttempts },
    { id: 'bookmarks', label: 'Bookmark Questions', icon: Bookmark, badge: totalBookmarks },
  ];

  const studentToolsItems: NavItem[] = [
    { id: 'daily-goals', label: 'Daily Goals', icon: CheckSquare, badge: activeGoalsCount > 0 ? `${activeGoalsCount} Left` : 'Done', badgeColor: activeGoalsCount > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { id: 'dashboard', label: 'Preparation Tracker', icon: Activity },
  ];

  // Parent Role Navigation Items
  const parentMenuItems: NavItem[] = [
    { id: 'parent-mirror', label: 'Child Live Overview', icon: Users, badge: 'Live', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { id: 'syllabus', label: 'Child Live Syllabus Progress', icon: MapPin, badge: 'Live Sync', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { id: 'doubt-chat', label: 'Family Chat & Parent Link', icon: HelpCircle, badge: 'Family', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    { id: 'parent-reports', label: 'AI Progress Guard Reports', icon: Sparkles, badge: 'AI', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { id: 'parent-tests', label: 'CBT Test Scorecards', icon: Award, badge: totalAttempts },
    { id: 'parent-link', label: 'Linked Child Accounts', icon: Link2, badge: currentUser.linkedChildIds?.length || 1 },
  ];

  // Teacher Role Navigation Items
  const teacherMenuItems: NavItem[] = [
    { id: 'teacher-portal', label: 'Faculty Overview', icon: GraduationCap },
    { id: 'doubt-chat', label: '1-on-1 Doubts & Class Groups', icon: HelpCircle, badge: 'Active', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { id: 'syllabus', label: 'Student Syllabus Mastery Matrix', icon: MapPin, badge: 'Physics', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { id: 'teacher-batches', label: 'My Batches & Students', icon: Users, badge: '3 Batches', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { id: 'teacher-create-question', label: '+ Add Question / PYQ', icon: FilePlus },
    { id: 'teacher-create-test', label: '+ Compose Test', icon: Timer },
    { id: 'teacher-marketplace', label: 'Content Marketplace', icon: ShoppingBag, badge: '₹4.2k', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  ];

  // Institution Admin Navigation Items
  const institutionMenuItems: NavItem[] = [
    { id: 'institution-batches', label: 'Active Batches', icon: Building2, badge: '3 Active', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { id: 'institution-students', label: 'Enrolled Students', icon: Users, badge: '1,450', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { id: 'institution-faculty', label: 'Faculty Showcase', icon: GraduationCap, badge: '8', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { id: 'institution-tests', label: 'Campus CBT Exams & Ranks', icon: Award, badge: 'Sync', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  ];

  const renderNavList = (items: NavItem[], activeTheme: 'blue' | 'emerald' | 'purple' | 'amber') => {
    const activeColorClasses = {
      blue: 'bg-blue-600 text-white font-semibold shadow-sm',
      emerald: 'bg-emerald-600 text-white font-semibold shadow-sm',
      purple: 'bg-purple-600 text-white font-semibold shadow-sm',
      amber: 'bg-amber-600 text-white font-semibold shadow-sm',
    }[activeTheme];

    return (
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id + item.label}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition group ${
                isActive
                  ? activeColorClasses
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
                    item.badgeColor || (isActive ? 'bg-black/20 text-white border-white/20' : 'bg-slate-800 text-slate-400 border-slate-700')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Dark Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300 animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar (Collapsible on Desktop & 60% Width Slide-over on Mobile) */}
      <aside
        id="core-navigation-sidebar"
        className={`shrink-0 bg-slate-900 text-slate-300 flex flex-col justify-between select-none z-40 transition-all duration-300 ease-in-out ${
          // Mobile classes (60% width drawer overlay, leaving 40% open for backdrop)
          isSidebarOpen
            ? 'fixed inset-y-0 left-0 w-[60vw] max-w-[280px] min-w-[220px] shadow-2xl border-r border-slate-800 translate-x-0'
            : 'fixed inset-y-0 left-0 w-[60vw] max-w-[280px] min-w-[220px] -translate-x-full shadow-none border-none pointer-events-none'
        } ${
          // Desktop classes (sticky flex child)
          isSidebarOpen
            ? 'lg:static lg:translate-x-0 lg:w-64 lg:h-[calc(100vh-3.5rem)] lg:sticky lg:top-14 lg:border-r lg:border-slate-800 lg:opacity-100 lg:pointer-events-auto'
            : 'lg:static lg:translate-x-0 lg:w-0 lg:h-[calc(100vh-3.5rem)] lg:sticky lg:top-14 lg:border-r-0 lg:opacity-0 lg:overflow-hidden lg:pointer-events-none'
        }`}
      >
        <div className="p-3 space-y-4 overflow-y-auto custom-scrollbar flex-1 min-w-0">
          {/* Top Header with Collapse/Close Button */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Navigation Menu
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Hide Navigation Sidebar"
              aria-label="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4 hidden lg:block" />
              <X className="w-4 h-4 lg:hidden" />
            </button>
          </div>

          {/* User Profile Card - Click to jump to Role Home */}
          <div
            onClick={() => {
              let homeView: any = 'dashboard';
              if (currentUser.role === 'parent') homeView = 'parent-mirror';
              else if (currentUser.role === 'teacher') homeView = 'teacher-portal';
              else if (currentUser.role === 'institution_admin') homeView = 'institution-batches';
              handleNavClick(homeView);
            }}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 flex items-center gap-2.5 cursor-pointer active:scale-[0.98] transition group"
            title="Click to go to your Role Dashboard"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-700 shrink-0 border border-cyan-400/40 group-hover:border-cyan-400 transition">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">{currentUser.name}</span>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className={`capitalize font-semibold ${
                  currentUser.role === 'student' ? 'text-cyan-400' :
                  currentUser.role === 'parent' ? 'text-emerald-400' :
                  currentUser.role === 'teacher' ? 'text-purple-400' : 'text-amber-400'
                }`}>
                  {currentUser.role.replace('_', ' ')}
                </span>
                <span>•</span>
                <span className="font-mono text-[9px] text-slate-300">{currentUser.schoolConnectId}</span>
              </div>
            </div>
          </div>

        {/* 1. STUDENT ONLY NAVIGATION */}
        {currentUser.role === 'student' && (
          <>
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Core Navigation</span>
              </div>
              {renderNavList(studentPrimaryItems, 'blue')}
            </div>

            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Tools & Performance</span>
              </div>
              {renderNavList(studentToolsItems, 'blue')}
            </div>
          </>
        )}

        {/* 2. PARENT ONLY NAVIGATION */}
        {currentUser.role === 'parent' && (
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
              <span>Parental Guard Portal</span>
              <Users className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            {renderNavList(parentMenuItems, 'emerald')}
          </div>
        )}

        {/* 3. TEACHER ONLY NAVIGATION */}
        {currentUser.role === 'teacher' && (
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center justify-between">
              <span>Faculty Portal</span>
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
            </div>
            {renderNavList(teacherMenuItems, 'purple')}
          </div>
        )}

        {/* 4. INSTITUTION ADMIN ONLY NAVIGATION */}
        {currentUser.role === 'institution_admin' && (
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
              <span>Institutional Command</span>
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
            </div>
            {renderNavList(institutionMenuItems, 'amber')}
          </div>
        )}
      </div>

      {/* Footer Role-Specific Banner */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        {currentUser.role === 'student' && (
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-900/40 to-slate-800/80 border border-blue-500/20 text-xs">
            <div className="flex items-center gap-1.5 text-blue-300 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>AI Progress Guard</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Weak topic detected: <strong className="text-slate-200">Ray Optics</strong>. 7-day spaced repetition is queued.
            </p>
          </div>
        )}

        {currentUser.role === 'parent' && (
          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-300 font-semibold mb-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Child Mirror Mode</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Syncing live CBT attempts and study logs from <strong className="text-slate-200">Aarav Sharma</strong>.
            </p>
          </div>
        )}

        {currentUser.role === 'teacher' && (
          <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/20 text-xs">
            <div className="flex items-center gap-1.5 text-purple-300 font-semibold mb-1">
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              <span>Faculty Desk</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Curate questions, monitor batch accuracy, and answer doubts for <strong className="text-slate-200">Apex Academy</strong>.
            </p>
          </div>
        )}

        {currentUser.role === 'institution_admin' && (
          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/20 text-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-1">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Institute Hub</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Managing <strong className="text-slate-200">Apex Science Academy</strong> • 1,450 enrolled aspirants.
            </p>
          </div>
        )}
      </div>
    </aside>
    </>
  );
};

