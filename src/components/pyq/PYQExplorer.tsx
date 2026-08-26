import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Question, SubjectName } from '../../types';
import { explainQuestionAI, QuestionExplanationResponse } from '../../services/aiService';
import { Search, ListFilter as Filter, CircleCheck as CheckCircle2, Circle as XCircle, Bookmark, Sparkles, Circle as HelpCircle, Clock, Layers, Award, ChevronDown, RotateCcw, BookOpen } from 'lucide-react';

export const PYQExplorer: React.FC = () => {
  const { questions, toggleBookmark, isBookmarked, currentExam, triggerAIQuickPrompt } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<SubjectName | 'All'>('All');
  const [selectedYear, setSelectedYear] = useState<number | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // User interaction state per question
  const [userSelectedOptions, setUserSelectedOptions] = useState<{ [qId: string]: number }>({});
  const [showExplanations, setShowExplanations] = useState<{ [qId: string]: boolean }>({});
  const [aiExplanations, setAiExplanations] = useState<{ [qId: string]: QuestionExplanationResponse }>({});
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);

  const availableYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019];

  const filteredQuestions = questions.filter((q) => {
    if (selectedSubject !== 'All' && q.subject !== selectedSubject) return false;
    if (selectedYear !== 'All' && q.year !== selectedYear) return false;
    if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
    if (searchQuery) {
      const qText = (q.questionText + ' ' + q.chapter + ' ' + q.topic).toLowerCase();
      if (!qText.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  const handleSelectOption = (qId: string, optIdx: number) => {
    setUserSelectedOptions((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleToggleExplanation = (qId: string) => {
    setShowExplanations((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleFetchAIExplanation = async (q: Question) => {
    if (aiExplanations[q.id]) {
      handleToggleExplanation(q.id);
      return;
    }
    setLoadingAiId(q.id);
    try {
      const res = await explainQuestionAI(
        q.questionText,
        q.options,
        q.correctOptionIndex,
        q.subject,
        q.chapter
      );
      setAiExplanations((prev) => ({ ...prev, [q.id]: res }));
      setShowExplanations((prev) => ({ ...prev, [q.id]: true }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAiId(null);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* Header & Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                PYQ Practice Bank
              </span>
              <span className="text-xs text-slate-400 font-mono">Real Exam Questions</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white mt-1">
              Previous Year Questions ({filteredQuestions.length} Found)
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chapter, topic, formula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
          {/* Subject Pills (Scrollable on small mobile) */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700 overflow-x-auto max-w-full custom-scrollbar shrink-0">
            {(['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'] as const).map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-2.5 py-1 rounded-md transition font-medium whitespace-nowrap text-xs ${
                  selectedSubject === sub
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'All' ? 'All' : Number(e.target.value))}
              className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none text-xs"
            >
              <option value="All">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr} Papers
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none text-xs"
            >
              <option value="All">Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const userChoice = userSelectedOptions[q.id];
          const hasAnswered = userChoice !== undefined;
          const isCorrect = userChoice === q.correctOptionIndex;
          const bookmarked = isBookmarked(q.id);
          const showExp = showExplanations[q.id];
          const aiExp = aiExplanations[q.id];

          return (
            <div
              key={q.id}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-4 hover:border-slate-700 transition"
            >
              {/* Question Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-blue-400 font-mono">Q{idx + 1}.</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {q.examType} {q.year}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    {q.shiftOrSet || `${q.year} Main`}
                  </span>
                  <span className="text-[11px] text-slate-400">•</span>
                  <span className="text-[11px] text-slate-300 font-medium">{q.chapter}</span>
                  <span className="text-[11px] text-slate-500 font-normal">({q.topic})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      q.difficulty === 'Easy'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : q.difficulty === 'Medium'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                    }`}
                  >
                    {q.difficulty}
                  </span>

                  <button
                    onClick={() => toggleBookmark(q)}
                    className={`p-1.5 rounded-lg border transition ${
                      bookmarked
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title={bookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Question Statement */}
              <div className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed select-text whitespace-pre-line">
                {q.questionText}
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {q.options.map((opt, optIdx) => {
                  let optStyle = 'bg-slate-800/70 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600';

                  if (hasAnswered) {
                    if (optIdx === q.correctOptionIndex) {
                      optStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                    } else if (optIdx === userChoice) {
                      optStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 font-bold';
                    } else {
                      optStyle = 'bg-slate-900 border-slate-800 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`p-3 rounded-lg border text-left text-xs transition flex items-start gap-2.5 ${optStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-[10px] font-mono shrink-0 font-bold">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1 mt-0.5 leading-snug">{opt}</span>
                      {hasAnswered && optIdx === q.correctOptionIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {hasAnswered && optIdx === userChoice && optIdx !== q.correctOptionIndex && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Answer Status & Explanation Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  {hasAnswered && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {isCorrect ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Correct (+4 Marks)
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Incorrect (-1 Mark)
                        </span>
                      )}
                    </div>
                  )}
                  {q.formulaUsed && (
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      Formula: {q.formulaUsed}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFetchAIExplanation(q)}
                    disabled={loadingAiId === q.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>{loadingAiId === q.id ? 'Analyzing...' : 'AI Step-by-Step Breakdown'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleExplanation(q.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition"
                  >
                    {showExp ? 'Hide Solution' : 'View Solution'}
                  </button>
                </div>
              </div>

              {/* Solution & AI Explanation Box */}
              {showExp && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs text-slate-300 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      Detailed Answer & Solution:
                    </span>
                    <span className="text-emerald-400 font-bold font-mono">
                      Correct: Option {String.fromCharCode(65 + q.correctOptionIndex)} ({q.options[q.correctOptionIndex]})
                    </span>
                  </div>

                  <div className="whitespace-pre-line leading-relaxed font-sans text-slate-200">
                    {q.explanation}
                  </div>

                  {aiExp && (
                    <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/30 space-y-2 mt-3 text-xs">
                      <div className="font-bold text-blue-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>Connect AI Intuition & Shortcut Trick</span>
                      </div>
                      <p className="text-slate-300 font-medium">{aiExp.intuition}</p>
                      <div className="text-amber-300 font-mono text-[11px] bg-slate-900 p-2 rounded border border-slate-800">
                        <strong>Shortcut Trick:</strong> {aiExp.shortcutTrick}
                      </div>
                      <div className="text-rose-300 text-[11px]">
                        <strong>Common Pitfall:</strong> {aiExp.commonPitfall}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
