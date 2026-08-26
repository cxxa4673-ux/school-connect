import React from 'react';
import { useApp } from '../../context/AppContext';
import { History, TrendingUp, Award, Clock, ArrowRight, Sparkles, Calendar, CircleCheck as CheckCircle2 } from 'lucide-react';

export const TestHistoryView: React.FC = () => {
  const { testAttempts, viewAttemptResult, setCurrentView } = useApp();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-800 text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              CBT Test Logs
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            My Tests History & Scorecards
          </h1>
          <p className="text-xs text-slate-300">
            Review detailed solutions, accuracy trends, and percentile growth over time.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('test-series')}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
        >
          Take New Test
        </button>
      </div>

      {testAttempts.length === 0 ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <p className="text-slate-400 text-xs">You haven't completed any tests yet.</p>
          <button
            onClick={() => setCurrentView('test-series')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
          >
            Explore Test Series
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {testAttempts.map((attempt) => (
            <div
              key={attempt.id}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-400 font-mono">
                    {attempt.targetExam}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(attempt.completedAt).toLocaleDateString()} at{' '}
                    {new Date(attempt.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{attempt.testTitle}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                  <span>Correct: <strong className="text-emerald-400">{attempt.correctAnswers}</strong></span>
                  <span>Wrong: <strong className="text-rose-400">{attempt.incorrectAnswers}</strong></span>
                  <span>Unattempted: {attempt.unattempted}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Score</span>
                  <div className="text-xl font-black text-blue-400">
                    {attempt.score} <span className="text-xs text-slate-400 font-normal">/ {attempt.maxScore}</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-bold">{attempt.accuracy}% Accuracy</span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Percentile</span>
                  <div className="text-xl font-black text-purple-400 font-mono">
                    {attempt.percentile} %ile
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{Math.round(attempt.timeSpentSeconds / 60)} min spent</span>
                </div>

                <button
                  onClick={() => viewAttemptResult(attempt)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                >
                  <span>Scorecard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
