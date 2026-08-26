import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, Video, FileText, Sparkles, Download, Play, CircleCheck as CheckCircle2, Layers, ChevronRight, Search } from 'lucide-react';

export const StudyHub: React.FC = () => {
  const { currentExam, triggerAIQuickPrompt } = useApp();

  const [activeTab, setActiveTab] = useState<'notes' | 'formulas' | 'mindmaps' | 'lectures'>('notes');
  const [selectedSubject, setSelectedSubject] = useState<'All' | 'Physics' | 'Chemistry' | 'Mathematics'>('All');

  const studyResources = [
    {
      id: 'res_1',
      title: 'Ray Optics & Optical Instruments: Complete Derivations & Sign Convention Guide',
      subject: 'Physics',
      type: 'notes',
      readTime: '15 min read',
      downloads: 1420,
      badge: 'High Yield',
      preview: 'Covers Cartesian sign conventions, Lens Maker formula derivation, chromatic aberration, and compound microscope magnification.',
    },
    {
      id: 'res_2',
      title: 'Aldehydes, Ketones & Carboxylic Acids: Name Reactions & Mechanism Cheat Sheet',
      subject: 'Chemistry',
      type: 'formulas',
      readTime: '10 min read',
      downloads: 2150,
      badge: 'Formula Pack',
      preview: 'Aldol condensation, Cannizzaro, Clemmensen, Wolff-Kishner, and Hell-Volhard-Zelinsky (HVZ) reactions with step-by-step intermediates.',
    },
    {
      id: 'res_3',
      title: 'Definite Integrals & King Property: 25 High-Frequency PYQ Archetypes',
      subject: 'Mathematics',
      type: 'mindmaps',
      readTime: '20 min read',
      downloads: 980,
      badge: 'Mind Map',
      preview: 'Master integral properties: f(a+b-x), periodic properties, Leibniz integral rule, and estimation of definite integrals.',
    },
    {
      id: 'res_4',
      title: 'Electrostatics & Gauss Law: Visual Vector Fields & Flux Integral Masterclass',
      subject: 'Physics',
      type: 'lectures',
      readTime: '45 min video',
      downloads: 1890,
      badge: 'Video Lecture',
      preview: 'Solid angle concepts, flux through non-symmetrical surfaces, and conducting sphere charge distributions.',
    },
  ];

  const filteredResources = studyResources.filter((r) => {
    if (activeTab !== 'notes' && r.type !== activeTab) return false;
    if (selectedSubject !== 'All' && r.subject !== selectedSubject) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950 border border-blue-500/30 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Study Repository
            </span>
            <span className="text-xs text-slate-400 font-mono">Curated for {currentExam} 2026</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Study Material, Formula Sheets & Lectures
          </h1>
          <p className="text-xs text-slate-300">
            Interactive chapter revision guides, formula mind-maps, and pro-active AI assistance.
          </p>
        </div>

        <button
          onClick={() => triggerAIQuickPrompt('Provide a concise formula sheet with key derivation tricks for Ray Optics.')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
        >
          <Sparkles className="w-4 h-4 text-blue-200" />
          <span>Ask AI for Custom Formula Sheet</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto max-w-full custom-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'notes' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chapter Notes
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'formulas' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Formula Cheat Sheets
          </button>
          <button
            onClick={() => setActiveTab('mindmaps')}
            className={`px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'mindmaps' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Visual Mind Maps
          </button>
          <button
            onClick={() => setActiveTab('lectures')}
            className={`px-3 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === 'lectures' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Video Lectures
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs overflow-x-auto custom-scrollbar shrink-0">
          {(['All', 'Physics', 'Chemistry', 'Mathematics'] as const).map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-2.5 py-1 rounded-md transition font-medium whitespace-nowrap ${
                selectedSubject === sub ? 'bg-slate-800 text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {res.subject} • {res.badge}
                </span>
                <span className="text-xs font-mono text-slate-400">{res.readTime}</span>
              </div>

              <h3 className="text-sm font-bold text-white leading-snug">{res.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{res.preview}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-400">{res.downloads} Aspirants Studied</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerAIQuickPrompt(`Give me an interactive quiz and study guide on: ${res.title}`)}
                  className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300"
                  title="AI Study Guide"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={() => triggerAIQuickPrompt(`Summarize key concepts from ${res.title}`)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition"
                >
                  Open Study Guide
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
