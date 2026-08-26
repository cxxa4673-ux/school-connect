import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Play,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  ArrowRight,
  Flame,
  Target,
  BarChart3,
  Calendar,
  Layers,
  FileText,
  ChevronRight,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    currentExam,
    setCurrentView,
    startCBTTest,
    tests,
    syllabus,
    dailyGoals,
    toggleGoal,
    testAttempts,
    triggerAIQuickPrompt,
  } = useApp();

  const [activeSubjectTab, setActiveSubjectTab] = useState<'All' | 'Physics' | 'Chemistry' | 'Mathematics'>('All');

  const latestAttempt = testAttempts[0];

  // Calculate syllabus stats
  const totalTopics = syllabus.reduce((acc, ch) => acc + ch.topics.length, 0);
  const completedTopics = syllabus.reduce(
    (acc, ch) => acc + ch.topics.filter((t) => t.completed).length,
    0
  );
  const syllabusPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const mockTest = tests.find((t) => t.testType === 'Full Mock') || tests[0];
  const aiBoosterTest = tests.find((t) => t.testType === 'AI Booster') || tests[1];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner / Student Greeting */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 shadow-lg text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {currentExam} 2026 Target
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {currentUser.schoolConnectId}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Welcome back, {currentUser.name}! 🚀
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {currentUser.institutionName
              ? `Enrolled at ${currentUser.institutionName} • Target 99.5+ Percentile`
              : 'Independent Aspirant • Pro-Active AI Mentorship Active'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => startCBTTest(mockTest)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Live CBT Mock Test</span>
          </button>
          <button
            onClick={() => setCurrentView('pyq')}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs transition"
          >
            <span>Solve PYQs</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Proactive Connect AI Weakness Diagnostic Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                  Pro-Active AI Weakness Alert
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-medium">
                  Spaced Repetition Due
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                You missed questions in <strong className="text-amber-200">Ray Optics (Sign Convention & Curved Refraction)</strong> on your last mock test. Connect AI generated a 10-minute targeted booster test.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => startCBTTest(aiBoosterTest)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>Start 10-Min AI Booster</span>
            </button>
            <button
              onClick={() => triggerAIQuickPrompt('Analyze my mistakes in Ray Optics and suggest 5 high-yield shortcut formulas.')}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Ask Tutor
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Metric Cards - Stacks vertically on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => setCurrentView('syllabus')}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-transform hover:border-slate-700"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-300">Syllabus Completion</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{syllabusPercent}%</span>
              <span className="text-[10px] text-slate-400 font-mono font-medium">{completedTopics}/{totalTopics} topics</span>
            </div>
            <div className="w-full bg-slate-800/90 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all duration-500 shadow-sm shadow-cyan-500/50"
                style={{ width: `${syllabusPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div
          onClick={() => setCurrentView('test-series')}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-transform hover:border-slate-700"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-300">Recent CBT Accuracy</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">
                {latestAttempt ? `${latestAttempt.accuracy}%` : '80%'}
              </span>
              <span className="text-[10px] text-emerald-300 font-mono font-semibold">Percentile: {latestAttempt?.percentile || 96.4}</span>
            </div>
            <div className="w-full bg-slate-800/90 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
                style={{ width: `${latestAttempt?.accuracy || 80}%` }}
              />
            </div>
          </div>
        </div>

        <div
          onClick={() => setCurrentView('daily-goals')}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-transform hover:border-slate-700"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-300">Daily Prep Streak</span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-300">6 Days</span>
              <span className="text-[10px] text-emerald-400 font-semibold">+1.5 hrs Today</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Best: 14 Days streak in July</p>
          </div>
        </div>

        <div
          onClick={() => setCurrentView('pyq')}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-transform hover:border-slate-700"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-300">Solved PYQs Bank</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-300">420</span>
              <span className="text-[10px] text-purple-300 font-medium font-mono">2025-2019</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">82% First-try accuracy</p>
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Chips for Quick Subject Focus */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-1 -mx-1 px-1">
        {(['All', 'Physics', 'Chemistry', 'Mathematics'] as const).map((subj) => (
          <button
            key={subj}
            onClick={() => setActiveSubjectTab(subj)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 flex items-center gap-1.5 min-h-[38px] ${
              activeSubjectTab === subj
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 border border-blue-400/40 ring-1 ring-blue-400/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <span>{subj === 'All' ? '🌟 All Subjects' : subj === 'Physics' ? '⚡ Physics' : subj === 'Chemistry' ? '🧪 Chemistry' : '📐 Mathematics'}</span>
          </button>
        ))}
        <button
          onClick={() => setCurrentView('pyq')}
          className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 min-h-[38px]"
        >
          <span>🎯 2025 Solved Papers</span>
        </button>
        <button
          onClick={() => setCurrentView('revise')}
          className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 min-h-[38px]"
        >
          <span>⚡ Formula Flashcards</span>
        </button>
      </div>

      {/* Main Grid: Left (Daily Goals & PYQ Quick launch) | Right (Syllabus & Recent Tests) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick PYQ Launcher Box */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  High-Yield PYQs Explorer (2025 - 2019)
                </h2>
              </div>
              <button
                onClick={() => setCurrentView('pyq')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
              >
                <span>View All Papers</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setCurrentView('pyq')}
                className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 cursor-pointer transition group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-blue-300">
                  <span>Physics</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">2025 Jan</span>
                </div>
                <p className="text-xs text-slate-300 font-bold mt-1.5 group-hover:text-blue-400 transition">
                  Ray Optics & Electrostatics
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">45 Questions • 8 High Yield</span>
              </div>

              <div
                onClick={() => setCurrentView('pyq')}
                className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 cursor-pointer transition group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
                  <span>Chemistry</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">2025 Jan</span>
                </div>
                <p className="text-xs text-slate-300 font-bold mt-1.5 group-hover:text-emerald-400 transition">
                  Aldehydes & Coordination
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">52 Questions • 12 High Yield</span>
              </div>

              <div
                onClick={() => setCurrentView('pyq')}
                className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 cursor-pointer transition group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                  <span>Mathematics</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">2025 Jan</span>
                </div>
                <p className="text-xs text-slate-300 font-bold mt-1.5 group-hover:text-purple-400 transition">
                  Definite Integrals & Matrices
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">48 Questions • 10 High Yield</span>
              </div>
            </div>
          </div>

          {/* Daily Goals Checklist Section */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  Today's Preparation Goals
                </h2>
              </div>
              <button
                onClick={() => setCurrentView('daily-goals')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Manage Goals
              </button>
            </div>

            <div className="space-y-2">
              {dailyGoals.slice(0, 4).map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                    goal.isDone
                      ? 'bg-slate-900/60 border-slate-800 text-slate-500'
                      : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                        goal.isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-600 bg-slate-800'
                      }`}
                    >
                      {goal.isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className={`text-xs font-semibold ${goal.isDone ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {goal.title}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {goal.completedCount}/{goal.targetCount} {goal.unit}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                    {goal.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Syllabus Snapshot & Spaced Repetition Queue */}
        <div className="space-y-6">
          {/* Syllabus Progress Snapshot */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  Syllabus Tracker
                </h2>
              </div>
              <button
                onClick={() => setCurrentView('syllabus')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Full Tracker
              </button>
            </div>

            <div className="space-y-3">
              {syllabus.slice(0, 4).map((ch) => {
                const comp = ch.topics.filter((t) => t.completed).length;
                const total = ch.topics.length;
                const pct = Math.round((comp / total) * 100);
                return (
                  <div key={ch.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 truncate max-w-[180px]">{ch.name}</span>
                      <span className="text-[10px] font-mono text-blue-400 font-semibold">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          ch.status === 'Completed'
                            ? 'bg-emerald-500'
                            : ch.status === 'Needs Revision'
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-Day Spaced Repetition Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                Smart Spaced Repetition
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              AI tracks topics where you made mistakes and schedules automatic revision every 7 days.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-400 block">Due Today</span>
                  <span className="text-slate-200 font-medium">Ray Optics Lens Maker Formula</span>
                </div>
                <button
                  onClick={() => triggerAIQuickPrompt('Provide a concise formula breakdown for Lens Maker Formula and combinations.')}
                  className="text-[11px] text-blue-400 font-semibold hover:underline"
                >
                  Revise
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">In 2 Days</span>
                  <span className="text-slate-200 font-medium">Aldol vs Cannizzaro Reaction</span>
                </div>
                <span className="text-[10px] text-slate-500">Scheduled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
