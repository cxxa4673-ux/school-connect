import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Library, BookOpen, CircleCheck as CheckCircle2, Sparkles, Circle as HelpCircle, Search, ExternalLink, ChevronRight } from 'lucide-react';

export const NCERTHub: React.FC = () => {
  const { currentExam, triggerAIQuickPrompt } = useApp();

  const [selectedClass, setSelectedClass] = useState<'Class 12' | 'Class 11'>('Class 12');
  const [selectedSubject, setSelectedSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'Biology'>('Physics');

  const ncertChapters = [
    {
      id: 'ncert_1',
      title: 'Ray Optics and Optical Instruments (Chapter 9)',
      subject: 'Physics',
      classLevel: 'Class 12',
      keyLinesCount: 38,
      exemplarCount: 16,
      aiTrapWarning: 'Sign convention in Lens Maker equation & total internal reflection critical angle derivations are frequent NTA traps.',
      readSnippet: 'Light travels along a straight line in a homogenous transparent medium. The direction of propagation of light is called a ray of light...',
    },
    {
      id: 'ncert_2',
      title: 'Aldehydes, Ketones and Carboxylic Acids (Chapter 12)',
      subject: 'Chemistry',
      classLevel: 'Class 12',
      keyLinesCount: 45,
      exemplarCount: 22,
      aiTrapWarning: 'Nucleophilic addition-elimination mechanism with ammonia derivatives is frequently asked in NEET & JEE.',
      readSnippet: 'Carbonyl compounds are of utmost importance in organic synthesis. In aldehydes, the carbonyl group is bonded to a carbon and hydrogen...',
    },
    {
      id: 'ncert_3',
      title: 'Integrals (Chapter 7)',
      subject: 'Mathematics',
      classLevel: 'Class 12',
      keyLinesCount: 28,
      exemplarCount: 20,
      aiTrapWarning: 'King rule definite integral properties and integrals of rational functions using partial fractions.',
      readSnippet: 'Integration is the inverse process of differentiation. Instead of differentiating a function, we are given the derivative of a function and asked to find its original function...',
    },
    {
      id: 'ncert_4',
      title: 'Electrostatic Potential and Capacitance (Chapter 2)',
      subject: 'Physics',
      classLevel: 'Class 12',
      keyLinesCount: 34,
      exemplarCount: 18,
      aiTrapWarning: 'Dielectric insertion with battery connected vs disconnected cases.',
      readSnippet: 'When an external force does work in taking a body from a point to another against a force like spring force or gravitational force, that work gets stored as potential energy...',
    },
  ];

  const filteredChapters = ncertChapters.filter(
    (c) => c.classLevel === selectedClass && c.subject === selectedSubject
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/30 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              NCERT Textbook & Exemplar Hub
            </span>
            <span className="text-xs text-slate-400 font-mono">100% Syllabus Aligned</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Line-by-Line NCERT Highlights & Exemplars
          </h1>
          <p className="text-xs text-slate-300">
            Crucial NCERT textbook lines, boxed diagrams, solved examples, and direct exam-trap diagnostics.
          </p>
        </div>

        <button
          onClick={() => triggerAIQuickPrompt('Explain NCERT Chapter 9 Ray Optics line-by-line summary and critical formulas for NEET/JEE.')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>Ask AI for NCERT Line Summary</span>
        </button>
      </div>

      {/* Select Class & Subject */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setSelectedClass('Class 12')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedClass === 'Class 12' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Class 12 NCERT
          </button>
          <button
            onClick={() => setSelectedClass('Class 11')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedClass === 'Class 11' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Class 11 NCERT
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
          {(['Physics', 'Chemistry', 'Mathematics', 'Biology'] as const).map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-2.5 py-1 rounded transition ${
                selectedSubject === sub ? 'bg-slate-700 text-emerald-300 font-bold' : 'text-slate-400'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Chapters Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredChapters.map((ch) => (
          <div
            key={ch.id}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {ch.subject} • {ch.classLevel}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {ch.keyLinesCount} High-Yield Lines
                </span>
              </div>

              <h3 className="text-sm font-bold text-white leading-snug">{ch.title}</h3>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 italic">
                "{ch.readSnippet}"
              </div>

              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">
                <strong>NCERT Exam Trap: </strong>
                {ch.aiTrapWarning}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-400 font-mono">{ch.exemplarCount} Exemplar Problems</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerAIQuickPrompt(`Generate 5 NCERT Exemplar type questions with detailed solutions for ${ch.title}`)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
                >
                  Solve Exemplar with AI
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
