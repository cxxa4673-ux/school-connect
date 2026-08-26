import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Test, ExamType } from '../../types';
import { Timer, Play, Sparkles, Award, Clock, Circle as HelpCircle, Layers, ChevronRight, Search, CircleCheck as CheckCircle2 } from 'lucide-react';

export const TestSeriesList: React.FC = () => {
  const { tests, startCBTTest, currentExam, setCurrentExam } = useApp();

  const [selectedType, setSelectedType] = useState<'All' | 'Full Mock' | 'Chapter Test' | 'PYQ Paper' | 'AI Booster'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTests = tests.filter((t) => {
    if (selectedType !== 'All' && t.testType !== selectedType) return false;
    if (searchQuery) {
      const text = (t.title + ' ' + t.targetExam).toLowerCase();
      if (!text.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950 border border-blue-500/30 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Test Series & CBT Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">Authentic NTA CBT Interface</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Standard Mock Tests & AI Boosters
          </h1>
          <p className="text-xs text-slate-300">
            Real-time timer countdowns, negative marking simulation (+4 / -1), and instant AI weakness diagnosis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const fullMock = tests.find((t) => t.testType === 'Full Mock') || tests[0];
              startCBTTest(fullMock);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Quick Mock Test</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(['All', 'Full Mock', 'Chapter Test', 'PYQ Paper', 'AI Booster'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                selectedType === type
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search test name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Test Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map((test) => {
          const isAIBooster = test.testType === 'AI Booster';
          return (
            <div
              key={test.id}
              className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 transition ${
                isAIBooster
                  ? 'bg-gradient-to-br from-amber-950/30 to-slate-900 border-amber-500/40 hover:border-amber-500/60'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      isAIBooster
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}
                  >
                    {test.testType}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{test.targetExam}</span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{test.title}</h3>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {test.instructions || 'Standard examination format with real-time timer countdown.'}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-slate-800/80 border border-slate-700/80">
                    <span className="text-[10px] text-slate-400 block">Questions</span>
                    <span className="font-bold text-white font-mono">{test.totalQuestions}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-800/80 border border-slate-700/80">
                    <span className="text-[10px] text-slate-400 block">Time</span>
                    <span className="font-bold text-emerald-400 font-mono">{test.durationMinutes}m</span>
                  </div>
                  <div className="p-2 rounded bg-slate-800/80 border border-slate-700/80">
                    <span className="text-[10px] text-slate-400 block">Total Marks</span>
                    <span className="font-bold text-blue-400 font-mono">{test.totalMarks}</span>
                  </div>
                </div>

                <button
                  onClick={() => startCBTTest(test)}
                  className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition ${
                    isAIBooster
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${isAIBooster ? 'fill-slate-950' : 'fill-white'}`} />
                  <span>Start CBT Test</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
