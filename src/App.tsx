import React from 'react';
import { AppProvider, useApp, AppView } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { ParentDashboard } from './components/dashboard/ParentDashboard';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { InstitutionDashboard } from './components/dashboard/InstitutionDashboard';
import { PYQExplorer } from './components/pyq/PYQExplorer';
import { CBTTestEngine } from './components/test-engine/CBTTestEngine';
import { TestSeriesList } from './components/test-engine/TestSeriesList';
import { TestResultView } from './components/test-engine/TestResultView';
import { StudyHub } from './components/study/StudyHub';
import { RevisionHub } from './components/study/RevisionHub';
import { NCERTHub } from './components/study/NCERTHub';
import { SyllabusTracker } from './components/syllabus/SyllabusTracker';
import { DoubtChatSystem } from './components/chat/DoubtChatSystem';
import { TestHistoryView } from './components/history/TestHistoryView';
import { BookmarksView } from './components/bookmarks/BookmarksView';
import { DailyGoalsTracker } from './components/goals/DailyGoalsTracker';
import { ConnectAIAssistant } from './components/ai/ConnectAIAssistant';
import { MobileBottomNavigation } from './components/layout/MobileBottomNavigation';
import { AuthModal } from './components/modals/AuthModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { RoleSwitcherBottomSheet } from './components/layout/RoleSwitcherBottomSheet';

const AppContent: React.FC = () => {
  const { currentView, currentUser, activeTest } = useApp();

  // If in live CBT test simulation mode, show the full-screen CBT engine
  if (currentView === 'cbt-live' || activeTest !== null) {
    return <CBTTestEngine />;
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
          {renderMainView()}
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
