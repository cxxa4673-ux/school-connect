import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Question } from '../../types';
import { Bookmark, Trash2, Sparkles, BookOpen, CircleCheck as CheckCircle2, Circle as XCircle, Circle as HelpCircle } from 'lucide-react';

export const BookmarksView: React.FC = () => {
  const { bookmarks, toggleBookmark, triggerAIQuickPrompt, setCurrentView } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<'All' | 'Physics' | 'Chemistry' | 'Mathematics'>('All');
  const [showSolution, setShowSolution] = useState<{ [qId: string]: boolean }>({});

  const filteredBookmarks = bookmarks.filter((b) => {
    if (selectedSubject !== 'All' && b.question.subject !== selectedSubject) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/30 text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Saved Doubts & Bookmarks
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Saved & Challenging Questions ({bookmarks.length})
          </h1>
          <p className="text-xs text-slate-300">
            Revise difficult questions, tricky formulas, and faculty notes anytime.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('pyq')}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold"
        >
          Explore More PYQs
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        {(['All', 'Physics', 'Chemistry', 'Mathematics'] as const).map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              selectedSubject === sub ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {filteredBookmarks.length === 0 ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-slate-400 text-xs">No bookmarked questions in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookmarks.map(({ question: q }) => {
            const isExp = showSolution[q.id];
            return (
              <div
                key={q.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">{q.subject}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300 font-semibold">{q.chapter}</span>
                    <span className="text-slate-500 font-mono">({q.examType} {q.year})</span>
                  </div>

                  <button
                    onClick={() => toggleBookmark(q)}
                    className="text-slate-400 hover:text-rose-400 flex items-center gap-1 text-xs transition"
                    title="Remove from Bookmarks"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                  {q.questionText}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                        idx === q.correctOptionIndex
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-bold'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center font-mono text-[10px] font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <button
                    onClick={() => setShowSolution((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    {isExp ? 'Hide Solution' : 'View Full Solution'}
                  </button>

                  <button
                    onClick={() => triggerAIQuickPrompt(`Explain this bookmarked question in detail: "${q.questionText}"`)}
                    className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask Connect AI Tutor</span>
                  </button>
                </div>

                {isExp && (
                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 space-y-2 mt-2">
                    <span className="font-bold text-white block">Step-by-step Solution:</span>
                    <p className="whitespace-pre-line leading-relaxed">{q.explanation}</p>
                    {q.formulaUsed && (
                      <span className="inline-block text-[11px] font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 mt-1">
                        Formula: {q.formulaUsed}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
