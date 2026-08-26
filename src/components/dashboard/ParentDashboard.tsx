import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getProgressReport, ProgressReportResponse } from '../../services/aiService';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Link2,
  FileText,
  Calendar,
  BarChart2,
  Activity,
  Heart,
  ChevronRight,
  MessageSquare,
  BookOpen,
} from 'lucide-react';

interface ParentDashboardProps {
  initialTab?: 'overview' | 'reports' | 'link' | 'tests';
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ initialTab = 'overview' }) => {
  const {
    currentUser,
    linkChildById,
    testAttempts,
    syllabus,
    triggerAIQuickPrompt,
    setCurrentView,
    openChatWithParent,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'link' | 'tests'>(initialTab);
  const [inputChildId, setInputChildId] = useState('');
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState<ProgressReportResponse | null>(null);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const linkedId = currentUser.linkedChildIds?.[0] || 'SC-STU-4821';
  const childName = 'Aarav Sharma';

  const handleLinkChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChildId) return;
    const ok = linkChildById(inputChildId);
    if (ok) {
      setLinkSuccess(`Successfully linked child with ID ${inputChildId.toUpperCase()}`);
      setInputChildId('');
      setTimeout(() => setLinkSuccess(null), 3000);
    }
  };

  const generateAIProgressGuard = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await getProgressReport(childName, testAttempts, syllabus, 'parent');
      setAiReport(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/30 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Parent Mirror Portal
            </span>
            <span className="text-xs text-slate-400 font-mono">Linked Child: {linkedId}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Tracking: {childName}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Live Sync Active" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time CBT test logs, active study attendance, and AI-powered progress guard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setCurrentView('syllabus')}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Live Syllabus</span>
          </button>

          <button
            onClick={openChatWithParent}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat with Child</span>
          </button>

          <button
            onClick={generateAIProgressGuard}
            disabled={isGeneratingReport}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>{isGeneratingReport ? 'Generating AI Guard...' : 'AI Guard Report'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'overview' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Child Live Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'reports' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
          <span>AI Progress Guard</span>
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'tests' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>CBT Test Scorecards ({testAttempts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('link')}
          className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'link' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Linked Child IDs ({currentUser.linkedChildIds?.length || 1})</span>
        </button>
      </div>

      {/* Tab: Link Child */}
      {(activeTab === 'link' || activeTab === 'overview') && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wide">
                Link Another Student / Child Account
              </h2>
              <p className="text-xs text-slate-400">
                Enter the unique School-Connect ID from your child's student dashboard.
              </p>
            </div>
          </div>

          <form onSubmit={handleLinkChild} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="e.g. SC-STU-4821"
              value={inputChildId}
              onChange={(e) => setInputChildId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 transition"
            >
              Link ID
            </button>
          </form>
        </div>
      )}

      {linkSuccess && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{linkSuccess}</span>
        </div>
      )}

      {/* 4 Performance Indicators */}
      {(activeTab === 'overview' || activeTab === 'reports') && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Overall Accuracy</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-extrabold text-emerald-400">80%</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Top 5% percentile on Platform</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Study Attendance</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-extrabold text-blue-400">98%</span>
              <p className="text-[10px] text-slate-400 mt-0.5">6/7 days target met this week</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Avg Test Time</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-extrabold text-amber-300">2.2 min</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Optimal pace for JEE Main</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Institution Status</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-base font-extrabold text-purple-300 truncate block">Apex Academy</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Batch Alpha • Regular</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Progress Guard Report Section */}
      {(activeTab === 'reports' || activeTab === 'overview') && (
        <>
          {!aiReport && activeTab === 'reports' && (
            <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI Progress Guard Academic Prescription</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Connect AI synthesizes all recent CBT test logs, mistake patterns in Ray Optics, and chapter revision status to produce a tailored action plan for parents.
                </p>
              </div>
              <button
                onClick={generateAIProgressGuard}
                disabled={isGeneratingReport}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition"
              >
                {isGeneratingReport ? 'Analyzing Academic Data...' : 'Generate Comprehensive Guard Report'}
              </button>
            </div>
          )}

          {aiReport && (
            <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950/60 border border-blue-500/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                    {aiReport.reportTitle}
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-mono">{aiReport.generatedDate}</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 leading-relaxed">
                <p className="font-semibold text-blue-300 mb-1">Executive Summary:</p>
                {aiReport.executiveSummary}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Key Academic Strengths:
                  </span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {aiReport.keyStrengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-500/30 space-y-2">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Areas Needing Support:
                  </span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {aiReport.areasNeedingSupport.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-2.5">
                <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Actionable Parent Advice: </strong>
                  {aiReport.parentActionableAdvice}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Recent CBT Test Logs Table */}
      {(activeTab === 'tests' || activeTab === 'overview') && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                Child's Recent CBT Test Scorecards
              </h2>
            </div>
            <span className="text-xs text-slate-400">Showing last {testAttempts.length} tests</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Test Title</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Percentile</th>
                  <th className="py-2.5 px-3">AI Diagnostic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {testAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-semibold text-white">{att.testTitle}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">
                      {new Date(att.startedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-blue-400">
                      {att.score} / {att.maxScore}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-400">{att.accuracy}%</td>
                    <td className="py-3 px-3 font-mono text-purple-400">{att.percentile} %ile</td>
                    <td className="py-3 px-3 text-slate-300">
                      <span className="text-[11px] text-amber-300">
                        {att.aiAnalysis?.weakTopics?.[0] || 'Good balance across sections'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
