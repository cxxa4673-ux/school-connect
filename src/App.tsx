import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp, AppView } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ConnectAIAssistant } from './components/ai/ConnectAIAssistant';
import { MobileBottomNavigation } from './components/layout/MobileBottomNavigation';
import { AuthModal } from './components/modals/AuthModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { RoleSwitcherBottomSheet } from './components/layout/RoleSwitcherBottomSheet';

// Code-split heavy content views so the initial bundle stays small.
// These are all named exports, so we map them to a default via .then().
const StudentDashboard = lazy(() => import('./components/dashboard/StudentDashboard').then((m) => ({ default: m.StudentDashboard })));
const ParentDashboard = lazy(() => import('./components/dashboard/ParentDashboard').then((m) => ({ default: m.ParentDashboard })));
const TeacherDashboard = lazy(() => import('./components/dashboard/TeacherDashboard').then((m) => ({ default: m.TeacherDashboard })));
const InstitutionDashboard = lazy(() => import('./components/dashboard/InstitutionDashboard').then((m) => ({ default: m.InstitutionDashboard })));
const PYQExplorer = lazy(() => import('./components/pyq/PYQExplorer').then((m) => ({ default: m.PYQExplorer })));
const CBTTestEngine = lazy(() => import('./components/test-engine/CBTTestEngine').then((m) => ({ default: m.CBTTestEngine })));
const TestSeriesList = lazy(() => import('./components/test-engine/TestSeriesList').then((m) => ({ default: m.TestSeriesList })));
const TestResultView = lazy(() => import('./components/test-engine/TestResultView').then((m) => ({ default: m.TestResultView })));
const StudyHub = lazy(() => import('./components/study/StudyHub').then((m) => ({ default: m.StudyHub })));
const RevisionHub = lazy(() => import('./components/study/RevisionHub').then((m) => ({ default: m.RevisionHub })));
const NCERTHub = lazy(() => import('./components/study/NCERTHub').then((m) => ({ default: m.NCERTHub })));
const SyllabusTracker = lazy(() => import('./components/syllabus/SyllabusTracker').then((m) => ({ default: m.SyllabusTracker })));
const DoubtChatSystem = lazy(() => import('./components/chat/DoubtChatSystem').then((m) => ({ default: m.DoubtChatSystem })));
const TestHistoryView = lazy(() => import('./components/history/TestHistoryView').then((m) => ({ default: m.TestHistoryView })));
const BookmarksView = lazy(() => import('./components/bookmarks/BookmarksView').then((m) => ({ default: m.BookmarksView })));
const DailyGoalsTracker = lazy(() => import('./components/goals/DailyGoalsTracker').then((m) => ({ default: m.DailyGoalsTracker })));

const AppContent: React.FC = () => {
  const { currentView, currentUser, activeTest } = useApp();

  // If in live CBT test simulation mode, show the full-screen CBT engine
  if (currentView === 'cbt-live' || activeTest !== null) {
    return (
      <Suspense
        fallback={
          <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
          </div>
        }
      >
        <CBTTestEngine />
      </Suspense>
    );
  }

  const renderMainView = () => {
    switch (currentView) {
      case 'dashboard':
        if (currentUser.role === 'parent') return <ParentDashboard />;
        if (currentUser.role === 'teacher') return <TeacherDashboard />;
        if (currentUser.role === 'institution_admin') return <InstitutionDashboard />;
        return <StudentDashboard />;

      case 'parent-mirror':
        return <ParentDashboard initialTab="overview" />;

      case 'parent-reports':
        return <ParentDashboard initialTab="reports" />;

      case 'parent-link':
        return <ParentDashboard initialTab="link" />;

      case 'parent-tests':
        return <ParentDashboard initialTab="tests" />;

      case 'teacher-portal':
        return <TeacherDashboard initialTab="overview" />;

      case 'teacher-batches':
        return <TeacherDashboard initialTab="batches" />;

      case 'teacher-create-question':
        return <TeacherDashboard initialTab="create-question" />;

      case 'teacher-create-test':
        return <TeacherDashboard initialTab="create-test" />;

      case 'teacher-marketplace':
        return <TeacherDashboard initialTab="marketplace" />;

      case 'teacher-doubts':
        return <TeacherDashboard initialTab="doubts" />;

      case 'institution-portal':
        return <InstitutionDashboard initialTab="batches" />;

      case 'institution-batches':
        return <InstitutionDashboard initialTab="batches" />;

      case 'institution-students':
        return <InstitutionDashboard initialTab="students" />;

      case 'institution-faculty':
        return <InstitutionDashboard initialTab="faculty" />;

      case 'institution-tests':
        return <InstitutionDashboard initialTab="tests" />;

      case 'pyq':
        return <PYQExplorer />;

      case 'test-series':
        return <TestSeriesList />;

      case 'test-result':
        return <TestResultView />;

      case 'study':
        return <StudyHub />;

      case 'revise':
        return <RevisionHub />;

      case 'ncert':
        return <NCERTHub />;

      case 'syllabus':
        return <SyllabusTracker />;

      case 'doubt-chat':
      case 'chat':
        return <DoubtChatSystem />;

      case 'history':
        return <TestHistoryView />;

      case 'bookmarks':
        return <BookmarksView />;

      case 'daily-goals':
        return <DailyGoalsTracker />;

      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Container with Sidebar + View Content */}
      <div className="flex-1 flex w-full relative">
        <Sidebar />

        <main className="flex-1 min-w-0 p-3.5 sm:p-6 lg:p-8 pb-20 lg:pb-8 overflow-y-auto max-w-[1400px] w-full mx-auto transition-all duration-300">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
                  <span className="text-xs text-slate-500">Loading…</span>
                </div>
              </div>
            }
          >
            {renderMainView()}
          </Suspense>
        </main>
      </div>

      {/* Mobile-First Floating/Bottom Navigation */}
      <MobileBottomNavigation />

      {/* Connect AI Slideover Assistant */}
      <ConnectAIAssistant />

      {/* Modals & Bottom Sheets */}
      <AuthModal />
      <ProfileModal />
      <RoleSwitcherBottomSheet />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
