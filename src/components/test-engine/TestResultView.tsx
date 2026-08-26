import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TestAttempt } from '../../types';
import { Award, TrendingUp, CircleCheck as CheckCircle2, Circle as XCircle, TriangleAlert as AlertTriangle, Sparkles, Clock, RotateCcw, BookOpen, ArrowRight, ChevronDown, Layers, FileQuestionMark as FileQuestion, Circle as HelpCircle, Share2, MessageSquare } from 'lucide-react';

export const TestResultView: React.FC = () => {
  const { testAttempts, currentAttempt, tests, startCBTTest, setCurrentView, triggerAIQuickPrompt, openChatWithTeacher } = useApp();

  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Correct' | 'Incorrect' | 'Unattempted'>('All');
  const [expandedSolutions, setExpandedSolutions] = useState<{ [qId: string]: boolean }>({});

  const latestAttempt: TestAttempt | undefined = currentAttempt || testAttempts[0];

  if (!latestAttempt) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-lg font-bold text-white">No Test Results Found</h2>
        <button
          onClick={() => setCurrentView('test-series')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Take a CBT Mock Test
        </button>
      </div>
    );
  }

  const testConfig = tests.find((t) => t.id === latestAttempt.testId) || tests[0];
  const questions = testConfig?.questions || [];

  const toggleSolution = (qId: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const filteredQuestions = questions.filter((q) => {
    if (filterSubject !== 'All' && q.subject !== filterSubject) return false;
    const resp = latestAttempt.questionResponses?.[q.id];
    if (filterStatus === 'Correct' && (!resp || resp.selectedOption !== q.correctOptionIndex)) return false;
    if (filterStatus === 'Incorrect' && (!resp || resp.selectedOption === undefined || resp.selectedOption === q.correctOptionIndex)) return false;
    if (filterStatus === 'Unattempted' && resp && resp.selectedOption !== undefined) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner: Scorecard Summary */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Scorecard Evaluated
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(latestAttempt.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              {latestAttempt.testTitle}
            </h1>
            <p className="text-xs text-slate-300">
              Exam: {latestAttempt.targetExam} • Candidate: {latestAttempt.userName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => startCBTTest(testConfig)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Test</span>
            </button>
            <button
              onClick={() => setCurrentView('test-series')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition"
            >
              <span>Back to Tests</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 5 Big Score Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-5">
          <div className="text-center sm:text-left">
            <span className="text-[11px] font-medium text-slate-400 uppercase">Total Marks</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-0.5">
              {latestAttempt.score} <span className="text-xs text-slate-400 font-normal">/ {latestAttempt.maxScore}</span>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <span className="text-[11px] font-medium text-slate-400 uppercase">Estimated Percentile</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 mt-0.5">
              {latestAttempt.percentile} <span className="text-xs font-mono font-normal">%ile</span>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <span className="text-[11px] font-medium text-slate-400 uppercase">Accuracy</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-0.5">
              {latestAttempt.accuracy}%
            </div>
          </div>

          <div className="text-center sm:text-left">
            <span className="text-[11px] font-medium text-slate-400 uppercase">Attempted / Total</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-0.5">
              {latestAttempt.attemptedQuestions} <span className="text-xs text-slate-400 font-normal">/ {latestAttempt.totalQuestions}</span>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <span className="text-[11px] font-medium text-slate-400 uppercase">Correct / Wrong</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-200 mt-0.5">
              <span className="text-emerald-400">{latestAttempt.correctAnswers}</span> / <span className="text-rose-400">{latestAttempt.incorrectAnswers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Pro-Active Weakness Diagnostic Banner */}
      {latestAttempt.aiAnalysis && (
        <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-blue-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                Connect AI Pro-Active Weakness Diagnostic
              </h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium font-mono">
              Auto-Generated
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 leading-relaxed">
            <strong className="text-blue-300 block mb-1">AI Recommendation & Strategy:</strong>
            {latestAttempt.aiAnalysis.recommendation || 'Focus on reviewing missed concepts and practicing timed questions.'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Weak Topics */}
            <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-500/30 space-y-1.5">
              <span className="font-bold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Detected Weak Areas:
              </span>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {latestAttempt.aiAnalysis.weakTopics?.map((t, idx) => (
                  <li key={idx} className="font-medium text-rose-200">{t}</li>
                ))}
              </ul>
            </div>

            {/* Strengths */}
            <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-500/30 space-y-1.5">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <HelpCircle className="w-4 h-4" />
                Speed & Pacing Insight:
              </span>
              <p className="text-slate-300 leading-relaxed">
                {latestAttempt.aiAnalysis.speedInsight || 'Good steady pace observed.'}
              </p>
            </div>

            {/* Spaced Repetition Advice */}
            <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 space-y-1.5">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Suggested Revision Queue:
              </span>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {latestAttempt.aiAnalysis.suggestedRevisionQueue?.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick AI Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={() => triggerAIQuickPrompt(`Generate a 5-question high yield quiz targeting: ${latestAttempt.aiAnalysis?.weakTopics?.join(', ')}`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch 1-Click AI Booster Practice on Mistakes</span>
            </button>
            <button
              onClick={() => triggerAIQuickPrompt(`Give me a 1-page formula and trick revision sheet for ${latestAttempt.aiAnalysis?.weakTopics?.[0] || 'Physics'}`)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Get Formula Sheet for Weak Topics
            </button>
          </div>
        </div>
      )}

      {/* Subject-Wise Performance Table */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
          Subject-Wise Performance Breakdown
        </h2>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <th className="py-2.5 px-3">Subject Section</th>
              <th className="py-2.5 px-3">Attempted</th>
              <th className="py-2.5 px-3">Correct</th>
              <th className="py-2.5 px-3">Accuracy</th>
              <th className="py-2.5 px-3">Marks Obtained</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {Object.entries(latestAttempt.subjectScores || {}).map(([sub, scoreObj]) => {
              const acc = scoreObj.attempted > 0 ? Math.round((scoreObj.correct / scoreObj.attempted) * 100) : 0;
              return (
                <tr key={sub} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-white">{sub}</td>
                  <td className="py-3 px-3 text-slate-300 font-mono">{scoreObj.attempted}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold font-mono">{scoreObj.correct}</td>
                  <td className="py-3 px-3 font-bold text-blue-400">{acc}%</td>
                  <td className="py-3 px-3 font-bold text-slate-100 font-mono">
                    {scoreObj.score} / {scoreObj.total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Question-By-Question Detailed Solutions Review */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            Question-by-Question Detailed Review & Solutions ({filteredQuestions.length})
          </h2>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none"
            >
              <option value="All">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e: any) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Correct">Correct Only</option>
              <option value="Incorrect">Incorrect Only</option>
              <option value="Unattempted">Unattempted Only</option>
            </select>
          </div>
        </div>

        {/* Questions Render */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const resp = latestAttempt.questionResponses?.[q.id];
            const userChoice = resp?.selectedOption;
            const hasAnswered = userChoice !== undefined;
            const isCorrect = userChoice === q.correctOptionIndex;
            const isExp = expandedSolutions[q.id];

            return (
              <div
                key={q.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-400 font-mono">Q{idx + 1}.</span>
                    <span className="text-slate-300 font-semibold">{q.chapter}</span>
                    <span className="text-slate-500 font-normal">({q.topic})</span>
                  </div>

                  <div>
                    {hasAnswered ? (
                      isCorrect ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+4)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect (-1)
                        </span>
                      )
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                        Unattempted (0)
                      </span>
                    )}
                  </div>
                </div>

                {/* Statement */}
                <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed select-text">
                  {q.questionText}
                </p>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, optIdx) => {
                    const isRight = optIdx === q.correctOptionIndex;
                    const isChosen = optIdx === userChoice;

                    let badge = 'bg-slate-800/60 border-slate-700 text-slate-300';
                    if (isRight) badge = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                    else if (isChosen && !isRight) badge = 'bg-rose-950/60 border-rose-500 text-rose-200 font-bold';

                    return (
                      <div key={optIdx} className={`p-2.5 rounded-lg border flex items-center gap-2 ${badge}`}>
                        <span className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center font-mono text-[10px] font-bold">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isRight && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        {isChosen && !isRight && <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {/* Action footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <button
                    onClick={() => toggleSolution(q.id)}
                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{isExp ? 'Hide Step-by-Step Solution' : 'View Step-by-Step Solution'}</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openChatWithTeacher(
                        q.subject,
                        q.subject === 'Physics' ? 'Dr. Vandana Rao' : q.subject === 'Chemistry' ? 'Prof. Rajiv Saxena' : 'Er. Anand Verma',
                        `Sir/Ma'am, I have a doubt regarding this ${q.subject} test question from chapter ${q.chapter} (${q.topic}): "${q.questionText}"`
                      )}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Ask Faculty Doubt</span>
                    </button>

                    <button
                      onClick={() => triggerAIQuickPrompt(`Explain the solution and intuition for this question: "${q.questionText}"`)}
                      className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Tutor</span>
                    </button>
                  </div>
                </div>

                {/* Solution Body */}
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
      </div>
    </div>
  );
};
