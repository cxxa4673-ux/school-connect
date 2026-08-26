import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Test, QuestionResponse, TestAttempt, SubjectName } from '../../types';
import { getWeaknessAnalysis } from '../../services/aiService';
import confetti from 'canvas-confetti';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  FileText,
  Send,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';

export const CBTTestEngine: React.FC = () => {
  const { activeTest, submitTestAttempt, currentUser, setCurrentView } = useApp();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);
  const [responses, setResponses] = useState<{ [qId: string]: QuestionResponse }>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (activeTest && !initialized) {
      setSecondsRemaining(activeTest.durationMinutes * 60);
      const initial: { [qId: string]: QuestionResponse } = {};
      activeTest.questions.forEach((q, idx) => {
        initial[q.id] = {
          selectedOption: undefined,
          isMarkedForReview: false,
          status: idx === 0 ? 'not_answered' : 'not_visited',
          timeSpentSeconds: 0,
        };
      });
      setResponses(initial);
      setInitialized(true);
    }
    if (!activeTest) {
      setInitialized(false);
    }
  }, [activeTest, initialized]);

  if (!activeTest || !initialized) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-lg font-bold text-white">No Active Test Selected</h2>
        <button
          onClick={() => setCurrentView('test-series')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Browse Test Series
        </button>
      </div>
    );
  }

  const questions = activeTest.questions;
  const currentQ = questions[currentIdx];
  const currentResp = responses[currentQ.id];

  // Subject sections
  const subjectList: SubjectName[] = Array.from(new Set(questions.map((q) => q.subject)));
  const currentSubject = currentQ.subject;

  // Countdown timer
  useEffect(() => {
    if (secondsRemaining <= 0) {
      handleSubmitTest();
      return;
    }
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
      // Track time spent on current question
      setResponses((prev) => ({
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          timeSpentSeconds: (prev[currentQ.id]?.timeSpentSeconds || 0) + 1,
        },
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, currentQ.id]);

  const formatTimer = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Option selection
  const handleSelectOption = (optIdx: number) => {
    setResponses((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedOption: optIdx,
      },
    }));
  };

  const handleClearResponse = () => {
    setResponses((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedOption: undefined,
        status: 'not_answered',
      },
    }));
  };

  const handleSaveAndNext = () => {
    setResponses((prev) => {
      const hasAnswer = prev[currentQ.id]?.selectedOption !== undefined;
      return {
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          isMarkedForReview: false,
          status: hasAnswer ? 'answered' : 'not_answered',
        },
      };
    });

    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      // Update next question to not_answered if it was not_visited
      const nextQ = questions[nextIdx];
      if (responses[nextQ.id]?.status === 'not_visited') {
        setResponses((prev) => ({
          ...prev,
          [nextQ.id]: { ...prev[nextQ.id], status: 'not_answered' },
        }));
      }
    }
  };

  const handleMarkForReviewAndNext = () => {
    setResponses((prev) => {
      const hasAnswer = prev[currentQ.id]?.selectedOption !== undefined;
      return {
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          isMarkedForReview: true,
          status: hasAnswer ? 'answered_and_marked' : 'marked_for_review',
        },
      };
    });

    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      const nextQ = questions[nextIdx];
      if (responses[nextQ.id]?.status === 'not_visited') {
        setResponses((prev) => ({
          ...prev,
          [nextQ.id]: { ...prev[nextQ.id], status: 'not_answered' },
        }));
      }
    }
  };

  const handleJumpToQuestion = (idx: number) => {
    const targetQ = questions[idx];
    if (responses[targetQ.id]?.status === 'not_visited') {
      setResponses((prev) => ({
        ...prev,
        [targetQ.id]: { ...prev[targetQ.id], status: 'not_answered' },
      }));
    }
    setCurrentIdx(idx);
  };

  // Calculate summary counts
  const respList = Object.values(responses) as QuestionResponse[];
  const answeredCount = respList.filter((r) => r.selectedOption !== undefined).length;
  const markedForReviewCount = respList.filter((r) => r.isMarkedForReview).length;
  const notAnsweredCount = respList.filter((r) => r.status === 'not_answered').length;
  const notVisitedCount = respList.filter((r) => r.status === 'not_visited').length;

  // Submit test and evaluate
  const handleSubmitTest = async () => {
    setIsSubmitting(true);
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    let score = 0;

    const subjectScores: TestAttempt['subjectScores'] = {};
    const incorrectDetails: any[] = [];

    questions.forEach((q) => {
      const resp = responses[q.id];
      if (!subjectScores[q.subject]) {
        subjectScores[q.subject] = { attempted: 0, correct: 0, score: 0, total: 0 };
      }
      subjectScores[q.subject]!.total += 4;

      if (resp && resp.selectedOption !== undefined) {
        subjectScores[q.subject]!.attempted += 1;
        if (resp.selectedOption === q.correctOptionIndex) {
          correct += 1;
          score += 4;
          subjectScores[q.subject]!.correct += 1;
          subjectScores[q.subject]!.score += 4;
          resp.isCorrect = true;
        } else {
          incorrect += 1;
          score -= 1;
          subjectScores[q.subject]!.score -= 1;
          resp.isCorrect = false;
          incorrectDetails.push({
            subject: q.subject,
            chapter: q.chapter,
            topic: q.topic,
            timeSpent: resp.timeSpentSeconds,
          });
        }
      } else {
        unattempted += 1;
      }
    });

    const totalQuestions = questions.length;
    const attemptedCount = correct + incorrect;
    const accuracy = attemptedCount > 0 ? Math.round((correct / attemptedCount) * 100) : 0;
    const maxScore = totalQuestions * 4;
    const percentile = Math.min(99.9, Math.max(50.0, +(score / (maxScore || 1) * 100 + 15).toFixed(1)));

    // Trigger celebratory confetti if score is solid
    if (accuracy >= 70) {
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {
        // ignore
      }
    }

    const partialAttempt: Partial<TestAttempt> = {
      testId: activeTest.id,
      testTitle: activeTest.title,
      userId: currentUser.id,
      userName: currentUser.name,
      targetExam: activeTest.targetExam,
      startedAt: new Date(Date.now() - (activeTest.durationMinutes * 60 - secondsRemaining) * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      totalQuestions,
      attemptedQuestions: attemptedCount,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unattempted,
      score,
      maxScore,
      accuracy,
      percentile,
      timeSpentSeconds: activeTest.durationMinutes * 60 - secondsRemaining,
      subjectScores,
      questionResponses: responses,
    };

    // Auto-run AI weakness diagnostic
    let aiDiagnostic;
    try {
      aiDiagnostic = await getWeaknessAnalysis({ ...partialAttempt, ...({ incorrectDetails } as any) }, currentUser);
    } catch (e) {
      console.warn('AI diagnostic during submit:', e);
    }

    const fullAttempt: TestAttempt = {
      ...(partialAttempt as TestAttempt),
      id: `attempt_${Date.now()}`,
      aiAnalysis: aiDiagnostic,
    };

    submitTestAttempt(fullAttempt);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* Top Exam Header Bar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-xs uppercase tracking-wide">
            CBT Exam Engine
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-md">
              {activeTest.title}
            </h1>
            <span className="text-[10px] text-slate-400 font-mono">
              Exam: {activeTest.targetExam} • Total Marks: {activeTest.totalMarks}
            </span>
          </div>
        </div>

        {/* Center Countdown Timer */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono font-bold text-sm ${
          secondsRemaining < 300
            ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
            : 'bg-slate-800 border-slate-700 text-emerald-400'
        }`}>
          <Clock className="w-4 h-4" />
          <span>{formatTimer(secondsRemaining)}</span>
          <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">Remaining</span>
        </div>

        {/* Right Tools & Submit Action */}
        <div className="flex items-center gap-2">
          {/* Mobile Palette Toggle Button */}
          <button
            onClick={() => setIsMobilePaletteOpen(!isMobilePaletteOpen)}
            className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/40 text-xs font-semibold"
            title="Toggle Question Palette"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Q-Grid</span>
          </button>

          <button
            onClick={() => setIsPaperModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Question Paper</span>
          </button>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submit Test</span>
            <span className="sm:hidden">Submit</span>
          </button>
        </div>
      </header>

      {/* Subject Section Bar */}
      <div className="h-10 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">
          Sections:
        </span>
        {subjectList.map((sub) => {
          const isCurrentSection = currentSubject === sub;
          return (
            <button
              key={sub}
              onClick={() => {
                const firstIdxOfSubject = questions.findIndex((q) => q.subject === sub);
                if (firstIdxOfSubject !== -1) handleJumpToQuestion(firstIdxOfSubject);
              }}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                isCurrentSection
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Section {sub}
            </button>
          );
        })}
      </div>

      {/* Main Exam Workspace: Question Area (Left) & Palette (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Active Question Viewer */}
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-4 max-w-4xl">
            {/* Question Info Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-400 font-mono text-sm">
                  Question No. {currentIdx + 1}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-300 font-semibold">{currentQ.chapter}</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono font-bold">
                  +4.0
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono font-bold">
                  -1.0
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed select-text whitespace-pre-line">
              {currentQ.questionText}
            </div>

            {/* Options List */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = currentResp?.selectedOption === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition flex items-start gap-3.5 min-h-[48px] active:scale-[0.99] cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/25 border-blue-500 text-white font-semibold shadow-inner ring-1 ring-blue-500/50'
                        : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-blue-600 border-blue-400 text-white shadow-sm shadow-blue-500/50'
                          : 'border-slate-600 bg-slate-800 text-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Footer - Fixed/Sticky Thumb Zone on Mobile */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3.5 mt-6 border-t border-slate-800/90 bg-slate-950/90 backdrop-blur-md sticky bottom-0 z-20 -mx-4 -mb-4 p-4 sm:static sm:m-0 sm:p-0 sm:border-t safe-area-pb">
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <button
                onClick={handleMarkForReviewAndNext}
                className="flex-1 sm:flex-initial px-3 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition active:scale-95 min-h-[42px]"
              >
                <span className="hidden sm:inline">Mark for Review & Next</span>
                <span className="sm:hidden">Mark & Next</span>
              </button>

              <button
                onClick={handleClearResponse}
                className="px-3 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-300 text-xs font-medium transition active:scale-95 min-h-[42px]"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium disabled:opacity-30 transition active:scale-95 min-h-[42px] min-w-[42px] flex items-center justify-center"
                title="Previous Question"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleSaveAndNext}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition active:scale-95 min-h-[42px]"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Authentic Question Palette Sidebar (Responsive Drawer on Mobile, Persistent on Desktop) */}
        <div
          className={`w-full lg:w-72 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 flex flex-col justify-between shrink-0 overflow-y-auto custom-scrollbar transition-all duration-300 ${
            isMobilePaletteOpen ? 'block' : 'hidden lg:flex'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Question Palette
              </h2>
              <div className="flex items-center gap-2">
                <span className="font-mono text-blue-400 text-xs">{questions.length} Total</span>
                <button
                  onClick={() => setIsMobilePaletteOpen(false)}
                  className="lg:hidden text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center font-mono text-[9px] font-bold">
                  {answeredCount}
                </span>
                <span className="text-slate-300">Answered</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-rose-600 text-white flex items-center justify-center font-mono text-[9px] font-bold">
                  {notAnsweredCount}
                </span>
                <span className="text-slate-300">Not Answered</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-purple-600 text-white flex items-center justify-center font-mono text-[9px] font-bold">
                  {markedForReviewCount}
                </span>
                <span className="text-slate-300">Marked for Review</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-slate-700 text-slate-300 flex items-center justify-center font-mono text-[9px] font-bold">
                  {notVisitedCount}
                </span>
                <span className="text-slate-300">Not Visited</span>
              </div>
            </div>

            {/* Palette Number Grid (1..N) */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Choose a Question:
              </span>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const resp = responses[q.id];
                  const isCurrent = idx === currentIdx;
                  let colorClass = 'bg-slate-800 text-slate-300 hover:bg-slate-700';

                  if (resp) {
                    if (resp.status === 'answered') colorClass = 'bg-emerald-600 text-white font-bold';
                    else if (resp.status === 'not_answered') colorClass = 'bg-rose-600 text-white font-bold';
                    else if (resp.status === 'marked_for_review') colorClass = 'bg-purple-600 text-white font-bold';
                    else if (resp.status === 'answered_and_marked') colorClass = 'bg-purple-600 text-white font-bold ring-2 ring-emerald-400';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`h-8 rounded text-xs font-mono font-bold transition flex items-center justify-center ${colorClass} ${
                        isCurrent ? 'ring-2 ring-white scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
            >
              Submit CBT Test
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4 shadow-2xl animate-scaleUp">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-400" />
              <span>Confirm Test Submission</span>
            </h2>

            <div className="space-y-2 text-xs bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Total Questions:</span>
                <span className="font-bold text-white">{questions.length}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Answered:</span>
                <span>{answeredCount}</span>
              </div>
              <div className="flex justify-between text-purple-400">
                <span>Marked for Review:</span>
                <span>{markedForReviewCount}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>Unattempted / Not Answered:</span>
                <span>{questions.length - answeredCount}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Once submitted, Connect AI will instantly evaluate your accuracy, percentile, and generate a customized Weakness Report.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Back to Test
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleSubmitTest}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {isSubmitting ? 'Evaluating with AI...' : 'Yes, Submit Test Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Paper Modal */}
      {isPaperModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                Full Question Paper Preview
              </h2>
              <button
                onClick={() => setIsPaperModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs text-slate-300 pr-2">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex justify-between font-bold text-blue-400">
                    <span>Q{idx + 1}. {q.subject} - {q.chapter}</span>
                    <span>{q.difficulty}</span>
                  </div>
                  <p className="text-slate-100">{q.questionText}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
