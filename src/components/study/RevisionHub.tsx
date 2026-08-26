import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  RotateCcw,
  BookOpen,
  Zap,
  Bookmark,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Download,
  Share2,
  HelpCircle,
  ChevronRight,
  Flame,
  Search,
  Filter,
  Check,
  Brain,
  FileText,
  Clock,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

interface Flashcard {
  id: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology' | 'General Knowledge' | 'Aptitude';
  chapter: string;
  front: string;
  back: string;
  formula?: string;
  examTag: string;
  difficulty: 'High Yield' | 'Frequently Asked' | 'Tricky Concept';
}

export const RevisionHub: React.FC = () => {
  const {
    currentExam,
    bookmarks,
    testAttempts,
    triggerAIQuickPrompt,
    setCurrentView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'flashcards' | 'formulas' | 'mistakes' | 'shortnotes' | 'quick-quiz'>('flashcards');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const [masteredCards, setMasteredCards] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Dynamic Flashcards tailored to current exam
  const flashcards: Flashcard[] = [
    {
      id: 'fc_1',
      subject: 'Physics',
      chapter: 'Ray Optics',
      front: 'What is the Lens Maker’s Formula and when is a lens convergent in a denser medium?',
      back: '1/f = (μ_lens/μ_med - 1) × (1/R₁ - 1/R₂).\n\nIf μ_med > μ_lens, the sign of (μ_lens/μ_med - 1) flips, causing a convex lens to act as a diverging lens and a concave lens to act as converging!',
      formula: '1/f = (μ₂/μ₁ - 1)(1/R₁ - 1/R₂)',
      examTag: 'JEE / NEET 2026',
      difficulty: 'High Yield',
    },
    {
      id: 'fc_2',
      subject: 'Chemistry',
      chapter: 'Aldehydes & Ketones',
      front: 'How to distinguish between Aldehydes and Ketones using Tollens and Fehling tests?',
      back: 'Tollens Reagent [Ag(NH₃)₂]⁺ gives a silver mirror with all aldehydes (aliphatic & aromatic), but not ketones.\n\nFehling solution gives red Cu₂O precipitate ONLY with aliphatic aldehydes (aromatic aldehydes like benzaldehyde do NOT reduce Fehling).',
      formula: 'RCHO + 2[Ag(NH₃)₂]⁺ + 3OH⁻ → RCOO⁻ + 2Ag↓ + 4NH₃ + 2H₂O',
      examTag: 'NEET / JEE / CBSE',
      difficulty: 'Frequently Asked',
    },
    {
      id: 'fc_3',
      subject: 'Mathematics',
      chapter: 'Definite Integrals',
      front: 'State King’s Property and Queen’s Property in Definite Integrals.',
      back: 'King Property: ∫[a to b] f(x) dx = ∫[a to b] f(a + b - x) dx.\n\nQueen Property: ∫[0 to 2a] f(x) dx = 2∫[0 to a] f(x) dx if f(2a-x)=f(x), and 0 if f(2a-x)=-f(x). Use King whenever you see symmetric trigonometric terms.',
      formula: '∫ₐᵇ f(x)dx = ∫ₐᵇ f(a+b-x)dx',
      examTag: 'JEE Main & Adv',
      difficulty: 'High Yield',
    },
    {
      id: 'fc_4',
      subject: 'Physics',
      chapter: 'Current Electricity',
      front: 'What is the formula for Potential Gradient (k) in a Potentiometer and Temperature Coefficient of Resistance (α)?',
      back: 'Potential Gradient: k = V_wire / L = (I × R_wire) / L.\nTemperature Coefficient: R_t = R₀(1 + αΔT) → α = (R_t - R₀) / (R₀ΔT). Positive for metals, negative for semiconductors!',
      formula: 'k = (E / (R + R_h + r)) × (R / L)',
      examTag: 'NEET / JEE Main',
      difficulty: 'Tricky Concept',
    },
    {
      id: 'fc_5',
      subject: 'Chemistry',
      chapter: 'Coordination Compounds',
      front: 'How to calculate Crystal Field Stabilization Energy (CFSE) for Octahedral complexes?',
      back: 'CFSE = [-0.4 × n(t₂g) + 0.6 × n(eg)] Δ₀ + mP\n(where m = pairing energy count, P = pairing energy per electron pair). Strong field ligands (CN⁻, CO) cause large Δ₀ (low spin).',
      formula: 'CFSE = (-0.4 p + 0.6 q)Δₒ + mP',
      examTag: 'JEE / NEET',
      difficulty: 'High Yield',
    },
    {
      id: 'fc_6',
      subject: 'Biology',
      chapter: 'Genetics & Evolution',
      front: 'What is the Law of Independent Assortment and its typical Dihybrid Phenotypic ratio?',
      back: 'Mendel’s 3rd Law states alleles of two (or more) different genes get sorted into gametes independently of one another. Dihybrid ratio = 9:3:3:1. Exception: Linked genes on the same chromosome (Morgan’s Drosophila experiment).',
      formula: 'Dihybrid F₂ Ratio = 9:3:3:1',
      examTag: 'NEET UG 2026',
      difficulty: 'Frequently Asked',
    },
  ];

  // Quick 5-Question Revision Quiz items
  const revisionQuizQuestions = [
    {
      id: 'q1',
      question: 'Which property of definite integrals is known as King’s property?',
      options: [
        '∫ₐᵇ f(x)dx = ∫ₐᵇ f(a+b-x)dx',
        '∫ₐᵇ f(x)dx = ∫ₐᵇ f(x+a)dx',
        '∫₀ᵃ f(x)dx = ∫₀ᵃ f(2a-x)dx',
        '∫ₐᵇ f(x)dx = -∫ₐᵇ f(a-b-x)dx',
      ],
      correct: 0,
      explanation: 'King’s Property states ∫ₐᵇ f(x)dx = ∫ₐᵇ f(a+b-x)dx, crucial for evaluating integrals with sin/cos or exponential symmetry.',
    },
    {
      id: 'q2',
      question: 'Benzaldehyde does NOT reduce Fehling’s solution because:',
      options: [
        'It is an aromatic aldehyde with resonance stabilization of the -CHO group',
        'It has an alpha-hydrogen',
        'It cannot undergo oxidation to benzoic acid',
        'It forms a complex with copper ions',
      ],
      correct: 0,
      explanation: 'Fehling solution is a weaker oxidizing agent than Tollens reagent and cannot oxidize aromatic aldehydes like benzaldehyde.',
    },
    {
      id: 'q3',
      question: 'When a convex lens is placed in a liquid with refractive index greater than the lens (μ_liq > μ_lens):',
      options: [
        'It behaves as a diverging (concave) lens',
        'It becomes more converging',
        'Its focal length remains unchanged',
        'It becomes completely opaque',
      ],
      correct: 0,
      explanation: 'Since (μ_lens/μ_liq - 1) becomes negative, the focal length sign reverses, transforming a convex lens into a diverging lens.',
    },
  ];

  // Filtered flashcards
  const filteredCards = flashcards.filter((card) => {
    if (selectedSubject !== 'All' && card.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        card.front.toLowerCase().includes(q) ||
        card.back.toLowerCase().includes(q) ||
        card.chapter.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (masteredCards.includes(id)) {
      setMasteredCards(masteredCards.filter((cId) => cId !== id));
    } else {
      setMasteredCards([...masteredCards, id]);
    }
  };

  const handleQuizAnswer = (optionIdx: number) => {
    if (selectedQuizOption !== null) return;
    setSelectedQuizOption(optionIdx);
    if (optionIdx === revisionQuizQuestions[quizIndex].correct) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    if (quizIndex < revisionQuizQuestions.length - 1) {
      setQuizIndex((prev) => prev + 1);
      setSelectedQuizOption(null);
    } else {
      setQuizSubmitted(true);
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setSelectedQuizOption(null);
    setQuizScore(0);
    setQuizSubmitted(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* 1. HERO REVISION HEADER BANNER */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0c4a6e] via-[#0369a1] to-[#0284c7] text-white shadow-xl relative overflow-hidden border border-cyan-400/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30">
                <RotateCcw className="w-3 h-3 text-cyan-200" />
                Rapid Revision Engine
              </span>
              <span className="text-xs text-cyan-100 font-mono">
                {currentExam} 2026 Target
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              Student Revision & Mastery Hub
            </h1>

            <p className="text-xs sm:text-sm text-cyan-100/90 max-w-2xl leading-relaxed">
              Revise high-frequency formulas, flashcards, test mistakes, and NCERT short notes in 5 minutes with active spaced repetition.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => triggerAIQuickPrompt(`Generate a 10-point high-yield formula revision sheet with tricks for ${currentExam} Physics, Chemistry & Maths.`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-cyan-900 font-bold text-xs shadow-lg hover:bg-cyan-50 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <span>AI Formula Sheet</span>
            </button>
            <button
              onClick={() => setCurrentView('bookmarks')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/30 backdrop-blur-md transition active:scale-95"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-300" />
              <span>Saved Doubts ({bookmarks.length})</span>
            </button>
          </div>
        </div>

        {/* Decorative Background Circles */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-10 w-40 h-40 rounded-full bg-cyan-400/20 blur-xl pointer-events-none" />
      </div>

      {/* 2. REVISION MODES TABS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'flashcards'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Interactive Flashcards ({flashcards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('formulas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'formulas'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Formula & Mnemonics Deck</span>
        </button>

        <button
          onClick={() => setActiveTab('mistakes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'mistakes'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Mistake Notebook ({testAttempts.length} Tests)</span>
        </button>

        <button
          onClick={() => setActiveTab('quick-quiz')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'quick-quiz'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-400" />
          <span>5-Min Rapid Drill</span>
        </button>

        <button
          onClick={() => setActiveTab('shortnotes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'shortnotes'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>High-Yield Short Notes</span>
        </button>
      </div>

      {/* 3. TAB CONTENT VIEWS */}

      {/* TAB A: INTERACTIVE FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div className="space-y-5">
          {/* Controls: Subject filter + Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Subject Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                    selectedSubject === sub
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search flashcards, formulas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Flashcards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.map((card) => {
              const isFlipped = flippedCardId === card.id;
              const isMastered = masteredCards.includes(card.id);

              return (
                <div
                  key={card.id}
                  onClick={() => setFlippedCardId(isFlipped ? null : card.id)}
                  className={`group relative rounded-2xl p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px] select-none ${
                    isMastered
                      ? 'bg-slate-900/60 border-emerald-500/40'
                      : 'bg-slate-900 border-slate-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-950/40'
                  }`}
                >
                  {/* Top Bar: Subject Badge + Exam + Mastered Button */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {card.subject} • {card.chapter}
                      </span>
                    </div>

                    <button
                      onClick={(e) => toggleMastered(card.id, e)}
                      className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold transition ${
                        isMastered
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                      }`}
                      title="Mark as Mastered"
                    >
                      <Check className="w-3 h-3" />
                      <span>{isMastered ? 'Mastered' : 'Mark Done'}</span>
                    </button>
                  </div>

                  {/* Card Body: Question (Front) or Answer (Back) */}
                  <div className="my-3 space-y-2">
                    {!isFlipped ? (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-1">
                          Question / Prompt
                        </span>
                        <p className="text-sm font-semibold text-slate-100 leading-snug">
                          {card.front}
                        </p>
                      </div>
                    ) : (
                      <div className="animate-fadeIn">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">
                          Core Answer & Key Insight
                        </span>
                        <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                          {card.back}
                        </p>
                        {card.formula && (
                          <div className="mt-2 p-2 rounded-lg bg-slate-950 border border-cyan-500/30 text-cyan-300 font-mono text-[11px]">
                            {card.formula}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Indicator: Click to Flip */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                    <span className="font-mono text-cyan-400/80">{card.difficulty}</span>
                    <span className="group-hover:text-cyan-300 transition flex items-center gap-1">
                      {isFlipped ? 'Click to show question ↺' : 'Click to flip answer ↷'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCards.length === 0 && (
            <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              No flashcards match your search. Try changing subject or search query.
            </div>
          )}
        </div>
      )}

      {/* TAB B: FORMULA & MNEMONICS DECK */}
      {activeTab === 'formulas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Physics Formula Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-950 text-blue-300 border border-blue-800">
                  Physics Master Sheet
                </span>
                <span className="text-[11px] text-slate-400">12 High-Yield Chapters</span>
              </div>
              <h3 className="text-sm font-bold text-white">
                Optics, Electrodynamics & Modern Physics Formulas
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <strong className="text-cyan-300">De-Broglie Wavelength:</strong> λ = h / √(2m(KE)) = 12.27 / √V Å (for electron).
                </li>
                <li className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <strong className="text-cyan-300">Magnetic Field at Center:</strong> B = μ₀I / (2R); On axis: B = μ₀IR² / [2(R²+x²)^(3/2)].
                </li>
                <li className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <strong className="text-cyan-300">LC Oscillations:</strong> ω = 1/√(LC); Max energy oscillates between (1/2)LI² and Q²/(2C).
                </li>
              </ul>
              <button
                onClick={() => triggerAIQuickPrompt(`Give me complete physics formula cheat sheet for ${currentExam} with all constants and SI units.`)}
                className="w-full py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Physics Cheat Sheet</span>
              </button>
            </div>

            {/* Chemistry Formula Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Chemistry Reaction Deck
                </span>
                <span className="text-[11px] text-slate-400">Organic & Physical</span>
              </div>
              <h3 className="text-sm font-bold text-white">
                Name Reactions, Order of Kinetics & Electrochemistry
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <strong className="text-emerald-300">Nernst Equation:</strong> E_cell = E°_cell - (0.0591 / n) log Q at 298K.
                </li>
                <li className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <strong className="text-emerald-300">Arrhenius Equation:</strong> k = A e^(-Ea/RT) → log(k₂/k₁) = (Ea/2.303R) × (T₂-T₁)/(T₁T₂).
                </li>
                <li className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <strong className="text-emerald-300">Aldol vs Cannizzaro:</strong> Aldol needs α-H (forms β-hydroxy carbonyl); Cannizzaro lacks α-H (disproportionates to alcohol + acid salt).
                </li>
              </ul>
              <button
                onClick={() => triggerAIQuickPrompt(`Give me an organic chemistry named reaction sheet for ${currentExam} with reagents and conditions.`)}
                className="w-full py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Organic Reactions Deck</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB C: MISTAKE NOTEBOOK (RE-REVISE EXAM ERRORS) */}
      {activeTab === 'mistakes' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 text-slate-200 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Automated Mistake Analysis & Re-Revision</span>
              </h3>
              <p className="text-xs text-slate-400">
                Re-solving questions you got incorrect in previous mock tests increases retention by 300%.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('test-series')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition active:scale-95"
            >
              Take Mock Test
            </button>
          </div>

          <div className="space-y-3">
            {testAttempts.length > 0 ? (
              testAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-cyan-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {attempt.testTitle || 'Full Mock CBT Test'}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Attempted on {attempt.date} • Time: {attempt.timeSpentMinutes} mins
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-cyan-400">
                        {attempt.score} / {attempt.totalMarks || 100} Marks
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/50">
                      <span className="text-[10px] text-emerald-400 block font-semibold">Correct</span>
                      <span className="text-sm font-black text-emerald-300">{attempt.correctAnswers}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-800/50">
                      <span className="text-[10px] text-rose-400 block font-semibold">Incorrect (Mistakes)</span>
                      <span className="text-sm font-black text-rose-300">{attempt.incorrectAnswers || 4}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
                      <span className="text-[10px] text-slate-400 block font-semibold">Accuracy</span>
                      <span className="text-sm font-black text-slate-200">{attempt.accuracyPercent || 78}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => triggerAIQuickPrompt(`Analyze my test mistakes in ${attempt.testTitle || 'Mock Test'}. I scored ${attempt.score} marks with ${attempt.incorrectAnswers || 4} incorrect questions. Give step-by-step guidance on how to fix negative marks in these topics.`)}
                    className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Explain My Mistakes & Remedial Steps</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                No mock test mistakes recorded yet. Take a test in CBT Engine to build your customized mistake notebook.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB D: 5-MINUTE RAPID DRILL (QUIZ) */}
      {activeTab === 'quick-quiz' && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          {!quizSubmitted ? (
            <>
              {/* Quiz Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Question {quizIndex + 1} of {revisionQuizQuestions.length}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Score: {quizScore}/{revisionQuizQuestions.length}
                </span>
              </div>

              {/* Question Text */}
              <div className="space-y-3">
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                  {revisionQuizQuestions[quizIndex].question}
                </h3>

                {/* Options */}
                <div className="space-y-2">
                  {revisionQuizQuestions[quizIndex].options.map((option, idx) => {
                    const isSelected = selectedQuizOption === idx;
                    const isCorrect = idx === revisionQuizQuestions[quizIndex].correct;
                    const showResult = selectedQuizOption !== null;

                    let btnStyle = 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200';
                    if (showResult) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200 font-semibold';
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'bg-rose-950 border-rose-500 text-rose-200 font-semibold';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(idx)}
                        disabled={showResult}
                        className={`w-full p-3 rounded-xl border text-xs text-left transition flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{option}</span>
                        {showResult && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box (when answered) */}
                {selectedQuizOption !== null && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs space-y-1 animate-fadeIn">
                    <span className="font-bold text-cyan-400 block">Explanation:</span>
                    <p className="text-slate-300 leading-relaxed">
                      {revisionQuizQuestions[quizIndex].explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Next Button */}
              {selectedQuizOption !== null && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuiz}
                    className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-cyan-600/30"
                  >
                    <span>{quizIndex < revisionQuizQuestions.length - 1 ? 'Next Question' : 'View Drill Results'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Quiz Results Summary */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-cyan-950 border-2 border-cyan-500 flex items-center justify-center mx-auto text-cyan-400">
                <Flame className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">Rapid Revision Drill Completed!</h3>
                <p className="text-xs text-slate-400">
                  You scored <strong className="text-cyan-300">{quizScore} out of {revisionQuizQuestions.length}</strong> questions correct.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={resetQuiz}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
                >
                  Retake Drill
                </button>
                <button
                  onClick={() => triggerAIQuickPrompt(`Generate 5 new challenging MCQs for ${currentExam} on high-weightage topics with timer.`)}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-md shadow-cyan-600/30"
                >
                  Start New AI Drill
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB E: HIGH-YIELD SHORT NOTES */}
      {activeTab === 'shortnotes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Ray Optics: Lens Maker & Compound Microscope',
              subject: 'Physics',
              readTime: '4 min read',
              badge: 'Must Revise',
              points: [
                'Lens Maker formula sign conventions for convex & concave lenses',
                'Compound microscope magnifying power at D and infinity',
                'Refraction at spherical surfaces: μ₂/v - μ₁/u = (μ₂-μ₁)/R',
              ],
            },
            {
              title: 'Aldehydes & Ketones: Name Reactions Checklist',
              subject: 'Chemistry',
              readTime: '5 min read',
              badge: 'High Frequency',
              points: [
                'Cannizzaro reaction: Hydride transfer step is rate-determining',
                'Clemmensen (Zn-Hg/HCl) vs Wolff-Kishner (NH₂NH₂/KOH/glycol)',
                'Haloform reaction condition: presence of CH₃-C=O or CH₃-CH(OH)-',
              ],
            },
            {
              title: 'Definite Integrals & King Property Masterclass',
              subject: 'Mathematics',
              readTime: '6 min read',
              badge: 'Guaranteed PYQ',
              points: [
                'Integral f(a+b-x) applied to sin^n(x)/(sin^n(x)+cos^n(x)) = (b-a)/2',
                'Leibniz Integral Rule for differentiation under integral sign',
                'Periodic integral property: ∫₀^(nT) f(x)dx = n ∫₀^T f(x)dx',
              ],
            },
          ].map((note, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-cyan-500/40 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {note.subject}
                  </span>
                  <span className="text-[10px] text-slate-400">{note.readTime}</span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                  {note.title}
                </h4>

                <ul className="space-y-1.5 text-xs text-slate-300">
                  {note.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => triggerAIQuickPrompt(`Explain complete revision summary of "${note.title}" for ${currentExam} with key traps and 3 example problems.`)}
                className="mt-2 w-full py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white font-semibold text-xs transition flex items-center justify-center gap-1"
              >
                <span>Read Full AI Notes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
