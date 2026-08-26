import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Question } from '../../types';
import { GraduationCap, BookOpen, Plus, Star, CircleCheck as CheckCircle2, Circle as HelpCircle, FileText, DollarSign, Sparkles, Award, Layers } from 'lucide-react';

interface TeacherDashboardProps {
  initialTab?: 'overview' | 'batches' | 'create-question' | 'marketplace' | 'doubts';
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ initialTab = 'overview' }) => {
  const {
    currentUser,
    addNewQuestion,
    questions,
    institution,
    setCurrentView,
    openChatWithTeacher,
    setActiveChannelId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'batches' | 'create-question' | 'marketplace' | 'doubts'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // New Question Form state
  const [newSubject, setNewSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'Biology'>('Physics');
  const [newChapter, setNewChapter] = useState('Ray Optics & Optical Instruments');
  const [newTopic, setNewTopic] = useState('Lens Maker Formula & Combination');
  const [newYear, setNewYear] = useState(2025);
  const [newExam, setNewExam] = useState<'JEE Main' | 'JEE Advanced' | 'NEET UG' | 'CBSE Class 12'>('JEE Main');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [opt4, setOpt4] = useState('');
  const [correctIdx, setCorrectIdx] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [formulaUsed, setFormulaUsed] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText || !opt1 || !opt2 || !opt3 || !opt4) return;

    const q: Question = {
      id: `q_user_${Date.now()}`,
      subject: newSubject,
      chapter: newChapter,
      topic: newTopic,
      examType: newExam,
      year: newYear,
      shiftOrSet: `${newYear} Faculty Curated Set`,
      questionText: newQuestionText,
      questionType: 'single_correct',
      options: [opt1, opt2, opt3, opt4],
      correctOptionIndex: correctIdx,
      explanation,
      formulaUsed,
      difficulty,
      tags: ['Teacher Verified', newSubject, 'NTA CBT Standard'],
    };

    addNewQuestion(q);
    setSavedMsg('Question successfully published to School-Connect Practice Bank!');
    setNewQuestionText('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setOpt4('');
    setExplanation('');
    setTimeout(() => setSavedMsg(null), 3000);
  };

  const sampleMarketplaceItems = [
    {
      id: 'prod_1',
      title: 'Ray Optics 100 Most Expected High-Yield Questions with AI Video Solutions',
      price: '₹299',
      isFree: false,
      downloads: 420,
      rating: 4.9,
      tag: 'JEE Advanced',
    },
    {
      id: 'prod_2',
      title: 'Complete Organic Chemistry Reaction Mechanisms Mind Map Cheat Sheet',
      price: 'Free',
      isFree: true,
      downloads: 1250,
      rating: 4.95,
      tag: 'JEE Main & NEET',
    },
    {
      id: 'prod_3',
      title: 'Calculus & Definite Integration King Property Speed Hacks (2020-2025 PYQs)',
      price: '₹199',
      isFree: false,
      downloads: 310,
      rating: 4.85,
      tag: 'Class 12 Boards / JEE',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Teacher Profile Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/30 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-14 h-14 rounded-xl object-cover border border-purple-400/50"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Faculty & Content Creator Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {currentUser.schoolConnectId}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
              {currentUser.name}
            </h1>
            <p className="text-xs text-slate-300">
              {currentUser.qualifications || 'Ph.D. in Physics (IIT Delhi) • 14+ Years Experience'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-1 text-amber-400 font-bold text-sm justify-end">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>4.9 / 5.0</span>
            </div>
            <span className="text-[10px] text-slate-400">184 Verified Student Reviews</span>
          </div>
          <button
            onClick={() => setActiveTab('create-question')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Question / Test</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-lg transition ${
            activeTab === 'overview' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Faculty Overview
        </button>
        <button
          onClick={() => setActiveTab('batches')}
          className={`px-3.5 py-1.5 rounded-lg transition ${
            activeTab === 'batches' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Batches & Students
        </button>
        <button
          onClick={() => setActiveTab('create-question')}
          className={`px-3.5 py-1.5 rounded-lg transition ${
            activeTab === 'create-question' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          + Add Question / PYQ
        </button>
        <button
          onClick={() => setActiveTab('doubts')}
          className={`px-3.5 py-1.5 rounded-lg transition ${
            activeTab === 'doubts' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Student Doubts Queue (1)
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-3.5 py-1.5 rounded-lg transition ${
            activeTab === 'marketplace' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Content Marketplace (Freemium)
        </button>
      </div>

      {/* Tab: Batches */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">
              Assigned Batches & Student Performance Roster
            </h2>
            <span className="text-xs text-purple-400 font-semibold">Apex Science Academy</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {institution.batches.map((batch) => (
              <div key={batch.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                      {batch.targetExam}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">{batch.name}</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-bold">{batch.studentCount} Aspirants</span>
                </div>

                <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-slate-800">
                  <p className="flex justify-between">
                    <span className="text-slate-400">Class:</span> <strong>{batch.standardClass}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Avg Physics Accuracy:</span> <strong className="text-emerald-400">82.4%</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">{batch.schedule}</p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button className="flex-1 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition">
                    Assign Practice Drill
                  </button>
                  <button className="py-1.5 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition">
                    Student Roster
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Doubts */}
      {activeTab === 'doubts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Active Student Doubts & Inquiries</span>
            </h2>
            <span className="text-xs text-slate-400">1 Unresolved Doubt</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">Aarav Sharma</span>
                  <span className="text-[10px] text-blue-400 font-mono">SC-STU-4821</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                    Ray Optics • Lens Maker Formula
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">12 min ago</span>
              </div>
              <p className="text-xs text-slate-200">
                "Ma'am, in Lens Maker formula with plano-convex lens, why does R2 become infinity when the flat surface is on the right? If the light ray hits the curved surface first, how does refractive index order change?"
              </p>

              <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Connect AI auto-drafted solution available
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveChannelId('chan_stu_tch_phy');
                      setCurrentView('doubt-chat');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold flex items-center gap-1 transition active:scale-95"
                  >
                    <span>Open 1-on-1 Chat</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveChannelId('chan_stu_tch_phy');
                      setCurrentView('doubt-chat');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition active:scale-95"
                  >
                    Reply in Doubt Router
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Teaching Stats</span>
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Total Questions Curated:</span>
                <span className="font-bold text-white">{questions.length + 42}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Active Learners:</span>
                <span className="font-bold text-emerald-400">1,480 Students</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Assigned Institution:</span>
                <span className="font-bold text-blue-400">Apex Science Academy</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Recent Student Doubts Queue</span>
            </h2>
            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-slate-800/70 border border-slate-700/80 text-xs flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Aarav Sharma (SC-STU-4821)</span>
                    <span className="text-[10px] text-blue-400 font-semibold px-1.5 py-0.5 rounded bg-blue-500/10">Ray Optics</span>
                  </div>
                  <p className="text-slate-300 mt-1">
                    "Ma'am, in Lens Maker formula with plano-convex lens, why does R2 become infinity when the flat surface is on the right?"
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveChannelId('chan_stu_tch_phy');
                    setCurrentView('doubt-chat');
                  }}
                  className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold shrink-0 transition active:scale-95"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Create Question Form */}
      {activeTab === 'create-question' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <Plus className="w-4 h-4 text-purple-400" />
            <span>Curate New CBT Exam / PYQ Question</span>
          </h2>

          {savedMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{savedMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Subject</label>
                <select
                  value={newSubject}
                  onChange={(e: any) => setNewSubject(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Exam</label>
                <select
                  value={newExam}
                  onChange={(e: any) => setNewExam(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                >
                  <option value="JEE Main">JEE Main</option>
                  <option value="JEE Advanced">JEE Advanced</option>
                  <option value="NEET UG">NEET UG</option>
                  <option value="CBSE Class 12">CBSE Class 12</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Year / Shift</label>
                <input
                  type="number"
                  value={newYear}
                  onChange={(e) => setNewYear(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e: any) => setDifficulty(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Chapter Name</label>
                <input
                  type="text"
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Specific Micro-Topic</label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Question Text (Markdown & Formula formatted)</label>
              <textarea
                rows={3}
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Enter complete question statement..."
                className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Option 1</label>
                <input
                  type="text"
                  value={opt1}
                  onChange={(e) => setOpt1(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Option 2</label>
                <input
                  type="text"
                  value={opt2}
                  onChange={(e) => setOpt2(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Option 3</label>
                <input
                  type="text"
                  value={opt3}
                  onChange={(e) => setOpt3(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Option 4</label>
                <input
                  type="text"
                  value={opt4}
                  onChange={(e) => setOpt4(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Correct Option</label>
                <select
                  value={correctIdx}
                  onChange={(e) => setCorrectIdx(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400 font-bold"
                >
                  <option value={0}>Option 1</option>
                  <option value={1}>Option 2</option>
                  <option value={2}>Option 3</option>
                  <option value={3}>Option 4</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Key Formula Used</label>
                <input
                  type="text"
                  value={formulaUsed}
                  onChange={(e) => setFormulaUsed(e.target.value)}
                  placeholder="e.g. 1/f = (μ-1)(1/R1 - 1/R2)"
                  className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Detailed Step-by-Step Solution & Teacher Notes</label>
              <textarea
                rows={3}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain the intuition and derivation..."
                className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition"
            >
              Publish to Question Bank
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Marketplace */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">
              Your Freemium Study Materials & Courses
            </h2>
            <button className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold">
              + Add New Resource
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleMarketplaceItems.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                    {item.tag}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">{item.price}</span>
                </div>

                <h3 className="text-xs font-bold text-white leading-snug">{item.title}</h3>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>{item.downloads} downloads</span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {item.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
