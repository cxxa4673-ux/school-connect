import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { sendAIChatMessage } from '../../services/aiService';
import { ExamType } from '../../types';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Plus,
  ArrowUp,
  Search,
  Calendar,
  MessageSquare,
  ChevronDown,
  ArrowLeft,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Mic,
  MicOff,
  Clock,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  BookOpen,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const ConnectAIAssistant: React.FC = () => {
  const {
    isAIAssistantOpen,
    setIsAIAssistantOpen,
    aiMessages,
    addAIMessage,
    currentUser,
    currentExam,
    setCurrentExam,
    testAttempts,
    tests,
    activeAIWeakness,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedAttemptForReview, setSelectedAttemptForReview] = useState<any | null>(null);
  const [isFullChatView, setIsFullChatView] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isFullChatView || aiMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isFullChatView, isLoading]);

  // Voice speech synthesis cleanup
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Voice recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice dictation is not supported on this browser. Please type your query.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '').replace(/\[.*?\]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    setIsFullChatView(true);
    setIsExamDropdownOpen(false);

    const userMsg = {
      id: `msg_${Date.now()}`,
      sender: 'user' as const,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addAIMessage(userMsg);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const responseText = await sendAIChatMessage(
        [...aiMessages, userMsg],
        currentUser.role,
        currentExam
      );

      const botMsg = {
        id: `msg_bot_${Date.now()}`,
        sender: 'assistant' as const,
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      addAIMessage(botMsg);
    } catch {
      const errorMsg = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant' as const,
        text: `I have analyzed your ${currentExam} query. To excel, focus on targeted PYQs and review your incorrect test answers daily.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      addAIMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Exam mistake analysis helper
  const handleAnalyzeAttempt = (attempt: any) => {
    const testTitle = attempt.testTitle || 'Mock Test';
    const accuracy = attempt.accuracyPercent || Math.round((attempt.correctAnswers / (attempt.totalQuestions || 1)) * 100);
    const wrong = attempt.incorrectAnswers || (attempt.totalQuestions - attempt.correctAnswers - (attempt.unattempted || 0));
    
    const analysisPrompt = `Please analyze my performance in ${testTitle} for ${currentExam}. I scored ${attempt.score}/${attempt.totalMarks || 100} with ${attempt.correctAnswers} correct and ${wrong} incorrect answers (${accuracy}% accuracy). Help me understand my mistakes, which chapters I should revise first, and give me 3 high-yield tips to avoid negative marking!`;
    
    setIsExamDropdownOpen(false);
    handleSendMessage(analysisPrompt);
  };

  // Dynamic prompts based on selected exam & study context
  const getPromptAssistList = () => {
    const defaultPrompts = [
      `Make a 30-day study plan for ${currentExam}`,
      'Solve this: 3x + 5 = 20 and explain step-by-step',
      `How should I study for ${currentExam} while working or attending classes?`,
      `What is the high-weightage syllabus for ${currentExam}?`,
      `Give me a 10-question practice quiz on high-yield topics`,
      'How to stay motivated and avoid silly negative marking errors?',
      'Explain the shortcut formulas for fast numerical solving',
    ];

    if (currentExam === 'JEE Main' || currentExam === 'JEE Advanced') {
      return [
        'Make a 30-day revision plan for JEE Main 2026',
        'Solve this: Find the limit as x->0 of (sin x - x)/x^3',
        'Explain King property in Definite Integrals with example',
        'Compare acidic strength order of substituted benzoic acids',
        'Give step-by-step derivation of Carnot Engine efficiency',
        'Analyze my mistakes in the recent physics mock test',
      ];
    } else if (currentExam === 'NEET UG') {
      return [
        'Make a 45-day Biology NCERT line-by-line revision strategy',
        'Mnemonics to remember Plant Kingdom classification',
        'High-yield Physics formula sheet for NEET',
        'How to score 160+ in Chemistry for NEET 2026',
        'Give a 10-question quiz on Genetics & Inheritance',
        'Explain negative marking elimination techniques',
      ];
    } else if (currentExam === 'SSC CGL') {
      return [
        'Make a 30-day study plan for SSC CGL Tier 1',
        'Solve this: A train 150m long passes a pole in 15 seconds. Speed?',
        'Give me a 10-question quiz on Indian Polity & Constitution',
        'High-frequency English idioms & vocabulary for SSC',
        'Shortcut tricks for Quantitative Aptitude speed maths',
        'How to score 45+ in General Awareness section',
      ];
    } else if (currentExam === 'UPSC CSE') {
      return [
        'How should I study for UPSC while working full time?',
        'Give me a 10-question quiz on Indian Polity (Articles & Amendments)',
        '3-step framework for mains answer writing on Environment',
        'Current affairs revision schedule for UPSC Prelims',
        'Summarize recent Supreme Court landmark judgments',
        'How to improve CSAT reading comprehension speed',
      ];
    }
    return defaultPrompts;
  };

  const availableExams: ExamType[] = [
    'JEE Main',
    'JEE Advanced',
    'NEET UG',
    'SSC CGL',
    'UPSC CSE',
    'CBSE Class 12',
    'CBSE Class 10',
    'NDA / CDS',
  ];

  return (
    <>
      {/* 1. PERSISTENT FLOATING TRIGGER BUTTON (VISIBLE IN ALL MODES) */}
      {!isAIAssistantOpen && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3 select-none pointer-events-auto">
          <button
            id="floating-gemini-ai-button"
            onClick={() => setIsAIAssistantOpen(true)}
            className="group relative flex items-center justify-center p-3 sm:p-3.5 lg:px-4 lg:py-3 rounded-full bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 hover:from-teal-400 hover:via-cyan-500 hover:to-blue-500 text-white font-medium shadow-2xl shadow-cyan-600/50 hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/40"
            title="Open AI Mentor"
            aria-label="Open AI Mentor"
          >
            {/* Glowing Pulse Ring */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 opacity-60 blur-md group-hover:opacity-100 animate-pulse" />

            <div className="relative flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              </div>
              <span className="hidden lg:inline font-bold tracking-tight text-xs text-white drop-shadow-sm">
                AI Mentor
              </span>
              <span className="hidden xl:inline text-[10px] px-1.5 py-0.5 rounded-full bg-black/30 border border-white/20 text-cyan-200 font-mono">
                {currentExam}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* 2. FULL AI MENTOR DRAWER / SCREEN (MATCHING SCREENSHOT AESTHETIC) */}
      {isAIAssistantOpen && (
        <>
          {/* Backdrop for click outside */}
          <div
            id="gemini-ai-backdrop"
            onClick={() => {
              setIsAIAssistantOpen(false);
              setIsExamDropdownOpen(false);
            }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[55] transition-opacity duration-300 animate-fadeIn"
            aria-hidden="true"
          />

          <div
            id="ai-mentor-sheet"
            className="fixed inset-y-0 right-0 z-[60] w-full sm:w-[480px] lg:w-[500px] bg-slate-50 dark:bg-slate-950 shadow-2xl flex flex-col justify-between select-none overflow-hidden transition-all duration-300 font-sans border-l border-slate-200 dark:border-slate-800"
          >
            {/* 1. TOP HEADER REGION */}
            {!isFullChatView ? (
              /* HOME / HUB HEADER WITH GRADIENT, GREETING, START CHAT & MASCOT */
              <div className="relative bg-gradient-to-b from-[#168a9f] via-[#20a3ba] to-[#168a9f] text-white p-4 sm:p-5 pt-4 pb-6 rounded-b-[2rem] shadow-lg shrink-0">
                
                {/* Top Row: My Exams Pill Dropdown + Search + Calendar + Close */}
                <div className="flex items-center justify-between gap-2 relative z-20">
                  {/* Left: My Exams Pill */}
                  <div className="relative">
                    <button
                      onClick={() => setIsExamDropdownOpen(!isExamDropdownOpen)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold shadow-sm border border-white/25 transition active:scale-95"
                    >
                      <span>My Exams</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExamDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* My Exams Dropdown Menu & Test History */}
                    {isExamDropdownOpen && (
                      <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 p-3 z-50 animate-fadeIn space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                            <Award className="w-4 h-4 text-cyan-600" />
                            <span>Attempted Tests & Mistake Help</span>
                          </div>
                          <span className="text-[10px] bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                            {testAttempts.length} Tests
                          </span>
                        </div>

                        {/* Attempted Tests List */}
                        <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                          {testAttempts.length > 0 ? (
                            testAttempts.map((att) => {
                              const total = att.totalQuestions || 30;
                              const correct = att.correctAnswers;
                              const incorrect = att.incorrectAnswers || (total - correct - (att.unattempted || 0));
                              const accuracy = att.accuracyPercent || Math.round((correct / (total || 1)) * 100);

                              return (
                                <div
                                  key={att.id}
                                  onClick={() => handleAnalyzeAttempt(att)}
                                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-cyan-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer transition group"
                                >
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[170px]">
                                      {att.testTitle || 'Full Mock Test'}
                                    </span>
                                    <span className="font-bold text-cyan-600 dark:text-cyan-400">
                                      {att.score} pts
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="w-3 h-3" /> {correct}
                                      </span>
                                      <span className="flex items-center gap-0.5 text-rose-500">
                                        <XCircle className="w-3 h-3" /> {incorrect}
                                      </span>
                                      <span>• {accuracy}%</span>
                                    </div>
                                    <span className="text-cyan-600 dark:text-cyan-400 font-medium group-hover:underline flex items-center gap-0.5 text-[10px]">
                                      Analyze <ChevronRight className="w-2.5 h-2.5" />
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                              <p>No tests attempted yet.</p>
                              <p className="text-[10px] mt-1 text-cyan-600 dark:text-cyan-400">
                                Take a mock test in CBT Engine to get automated mistake analysis!
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Switch Target Exam */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                            Change Target Exam:
                          </span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {availableExams.slice(0, 6).map((exam) => (
                              <button
                                key={exam}
                                onClick={() => {
                                  setCurrentExam(exam);
                                  setIsExamDropdownOpen(false);
                                }}
                                className={`text-[11px] px-2 py-1 rounded-lg text-left truncate transition ${
                                  currentExam === exam
                                    ? 'bg-cyan-600 text-white font-bold'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                              >
                                {exam}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Search + Calendar with Red Dot + Close */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsSearchOpen(!isSearchOpen)}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition active:scale-95"
                      title="Search doubts"
                    >
                      <Search className="w-4 h-4" />
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => handleSendMessage(`What is today's high-priority study schedule and upcoming mock tests for ${currentExam}?`)}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition active:scale-95"
                        title="Daily Study Calendar"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      {/* Red Notification Dot as seen in screenshot */}
                      <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-500 border border-white" />
                    </div>

                    <button
                      onClick={() => setIsAIAssistantOpen(false)}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition active:scale-95 ml-1"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Search Bar Input (if search toggled) */}
                {isSearchOpen && (
                  <div className="mt-3 animate-fadeIn">
                    <input
                      type="text"
                      placeholder="Search past doubts or topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          handleSendMessage(searchQuery);
                          setIsSearchOpen(false);
                        }
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/90 text-slate-800 text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                      autoFocus
                    />
                  </div>
                )}

                {/* HERO WHITE CARD: "Good Morning, Aspirant" + "+ Start Chat" + Mascot */}
                <div className="mt-4 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xl text-slate-800 dark:text-white flex items-center justify-between relative overflow-hidden border border-slate-100/50 dark:border-slate-800">
                  <div className="space-y-3 z-10">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                        {getGreeting()},{' '}
                        <span className="text-cyan-500 font-extrabold">
                          {currentUser?.name ? currentUser.name.split(' ')[0] : 'Aspirant'}
                        </span>
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Ready for {currentExam} 2026 preparation?
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsFullChatView(true);
                        if (aiMessages.length === 0) {
                          handleSendMessage(`Hello Mentor! I am preparing for ${currentExam}. Guide me with today's high-yield study plan.`);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#35b8cf] hover:bg-[#2aa3b9] text-white text-xs font-bold shadow-md shadow-cyan-500/30 transition active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Start Chat</span>
                    </button>
                  </div>

                  {/* Illustrated Mascot */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center select-none pointer-events-none">
                    <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md">
                      <rect x="25" y="45" width="48" height="75" rx="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="3" />
                      <rect x="73" y="45" width="48" height="75" rx="6" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
                      <line x1="73" y1="45" x2="73" y2="120" stroke="#0284c7" strokeWidth="4" />
                      
                      <polygon points="75,8 140,28 75,44 10,28" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />
                      <rect x="58" y="30" width="34" height="12" rx="2" fill="#0f172a" />
                      <circle cx="75" cy="26" r="3.5" fill="#fbbf24" />
                      <path d="M75,26 Q115,28 115,48" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
                      <circle cx="115" cy="50" r="3" fill="#fbbf24" />

                      <ellipse cx="44" cy="72" rx="3.5" ry="5.5" fill="#0f172a" />
                      <ellipse cx="58" cy="72" rx="3.5" ry="5.5" fill="#0f172a" />
                      <circle cx="45" cy="70" r="1.5" fill="#ffffff" />
                      <circle cx="59" cy="70" r="1.5" fill="#ffffff" />
                      <circle cx="36" cy="80" r="4" fill="#f472b6" opacity="0.6" />
                      <circle cx="65" cy="80" r="4" fill="#f472b6" opacity="0.6" />
                      <path d="M46,82 Q51,88 56,82" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />

                      <ellipse cx="90" cy="72" rx="3.5" ry="5.5" fill="#ffffff" />
                      <ellipse cx="104" cy="72" rx="3.5" ry="5.5" fill="#ffffff" />
                      <circle cx="91" cy="70" r="1.5" fill="#0f172a" />
                      <circle cx="105" cy="70" r="1.5" fill="#0f172a" />
                      <path d="M92,82 Q97,88 102,82" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />

                      <path d="M25,75 Q5,65 10,50 Q18,48 25,60" fill="#38bdf8" stroke="#0284c7" strokeWidth="2.5" />
                      <circle cx="10" cy="50" r="5" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />

                      <ellipse cx="48" cy="128" rx="8" ry="5" fill="#38bdf8" stroke="#0284c7" strokeWidth="2.5" />
                      <ellipse cx="98" cy="128" rx="8" ry="5" fill="#38bdf8" stroke="#0284c7" strokeWidth="2.5" />
                      <line x1="48" y1="120" x2="48" y2="128" stroke="#0284c7" strokeWidth="3" />
                      <line x1="98" y1="120" x2="98" y2="128" stroke="#0284c7" strokeWidth="3" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              /* CLEAN DEDICATED TOP BAR DURING ACTIVE CHAT SESSION (MAX SPACE FOR CHAT) */
              <div className="bg-gradient-to-r from-[#168a9f] via-[#20a3ba] to-[#168a9f] text-white p-3.5 px-4 flex items-center justify-between shadow-md shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsFullChatView(false)}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition active:scale-95 flex items-center gap-1 text-xs font-semibold"
                    title="Back to Hub"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Hub</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-amber-300" />
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#168a9f]" />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold tracking-tight">AI Mentor</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-black/25 rounded-full font-mono text-cyan-200">
                          {currentExam}
                        </span>
                      </div>
                      <span className="text-[10px] text-cyan-100 block -mt-0.5">
                        Online • 24x7 Academic Assistant
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => addAIMessage({ id: `clr_${Date.now()}`, sender: 'system' as any, text: '--- New Topic Started ---', timestamp: '' })}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95"
                    title="New Topic"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setIsAIAssistantOpen(false)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50 dark:bg-slate-950">

              {/* IF IN ACTIVE FULL CHAT STREAM */}
              {isFullChatView ? (
                <div className="space-y-4 pt-1">
                  {aiMessages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    const isCopied = copiedMsgId === msg.id;
                    const isSpeaking = speakingMsgId === msg.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 text-xs leading-relaxed ${
                          isUser ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                            isUser
                              ? 'bg-cyan-600 text-white'
                              : 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white'
                          }`}
                        >
                          {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl max-w-[85%] space-y-2 shadow-sm ${
                            isUser
                              ? 'bg-[#20a3ba] text-white rounded-tr-none shadow-cyan-600/20'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                          }`}
                        >
                          <div className="whitespace-pre-line select-text font-normal leading-relaxed text-xs sm:text-sm">
                            {msg.text}
                          </div>

                          {!isUser && (
                            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                              <span className="font-mono">{msg.timestamp}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleSpeakMessage(msg.id, msg.text)}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-cyan-600 transition"
                                  title="Listen with voice"
                                >
                                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-cyan-600" /> : <Volume2 className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleCopyMessage(msg.id, msg.text)}
                                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-cyan-600 transition"
                                  title="Copy text"
                                >
                                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="flex gap-2.5 text-xs">
                      <div className="w-7 h-7 rounded-full bg-cyan-600 text-white flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 animate-spin" />
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce delay-150" />
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce delay-300" />
                        </div>
                        <span className="text-[11px]">AI Mentor is writing detailed solution...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              ) : (
                /* HOMEPAGE SECTIONS: MISTAKE CARD + PROMPT ASSIST + CHAT HISTORY */
                <>
                  {/* RECENT EXAM MISTAKE HELPER CARD (If tests exist) */}
                  {testAttempts.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent border border-cyan-500/20 text-slate-800 dark:text-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold text-cyan-700 dark:text-cyan-300 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4" />
                          <span>Last Attempted Test Analysis</span>
                        </div>
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-full">
                          Auto-Diagnose
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                        You recently completed{' '}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {testAttempts[testAttempts.length - 1].testTitle || 'Full Mock Test'}
                        </strong>
                        . Click to get instant solutions and explanation for all incorrect questions!
                      </p>
                      <button
                        onClick={() => handleAnalyzeAttempt(testAttempts[testAttempts.length - 1])}
                        className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Diagnose My Mistakes & Improve</span>
                      </button>
                    </div>
                  )}

                  {/* PROMPT ASSIST SECTION (Exact Cyan Vertical Bar + Chips) */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      {/* Cyan bar | */}
                      <div className="w-1 h-4 bg-[#20a3ba] rounded-full" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                        Prompt Assist
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {getPromptAssistList().map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(prompt)}
                          className="text-[11px] sm:text-xs text-left px-3.5 py-2 rounded-full bg-[#f0f9fb] dark:bg-slate-900 text-[#168a9f] dark:text-cyan-300 hover:bg-[#e0f3f7] dark:hover:bg-slate-800 border border-[#d2eff5] dark:border-slate-800 font-medium transition active:scale-95 cursor-pointer flex items-center gap-1.5 group"
                        >
                          <span>{prompt}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CHAT HISTORY SECTION (Exact Cyan Vertical Bar + View All + Empty State) */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Cyan bar | */}
                        <div className="w-1 h-4 bg-[#20a3ba] rounded-full" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                          Chat History
                        </h3>
                      </div>

                      {aiMessages.length > 0 && (
                        <button
                          onClick={() => setIsFullChatView(true)}
                          className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5"
                        >
                          <span>View All</span>
                          <span className="text-sm">→</span>
                        </button>
                      )}
                    </div>

                    {/* Chat History Container Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                      {aiMessages.length > 0 ? (
                        <div className="space-y-2 text-left">
                          {aiMessages.slice(-3).map((msg) => (
                            <div
                              key={msg.id}
                              onClick={() => setIsFullChatView(true)}
                              className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 last:border-none"
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <MessageSquare className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                                <span className="text-xs text-slate-700 dark:text-slate-300 truncate font-medium max-w-[260px]">
                                  {msg.text}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                {msg.timestamp}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 flex flex-col items-center justify-center space-y-2 text-slate-400 dark:text-slate-500">
                          {/* Two speech bubbles icon matching screenshot */}
                          <div className="relative">
                            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                            <MessageSquare className="w-5 h-5 text-cyan-400 absolute -bottom-1 -right-1" />
                          </div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            No recent chats yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* BOTTOM FLOATING INPUT / SEARCH PORTION (MATCHING SCREENSHOT ROUNDED DOCK) */}
            <div className="p-3 sm:p-4 bg-transparent shrink-0">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 px-3 shadow-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-2">
                {/* Plus (+) Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    const prompt = `Give me a quick 5-question test on ${currentExam} high-yield topics right now!`;
                    handleSendMessage(prompt);
                  }}
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-cyan-50 hover:text-cyan-600 flex items-center justify-center shrink-0 transition active:scale-95 border border-slate-200 dark:border-slate-700"
                  title="Quick 5-Q practice or actions"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {/* Text Input Field */}
                <input
                  type="text"
                  placeholder="Ask anything..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputMessage.trim()) {
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none px-1"
                />

                {/* Voice Mic Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`p-2 rounded-full transition ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400'
                  }`}
                  title={isListening ? 'Listening...' : 'Voice Search'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Circular Up Arrow Send Button (↑) */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="w-9 h-9 rounded-full bg-[#35b8cf] hover:bg-[#2aa3b9] disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/30 transition active:scale-95 disabled:shadow-none"
                  title="Send"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

          </div>
        </>
      )}
    </>
  );
};
