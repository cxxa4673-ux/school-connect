import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Question, Test, ResourceItem } from '../../types';
import { GraduationCap, BookOpen, Plus, Star, CircleCheck as CheckCircle2, Circle as HelpCircle, FileText, DollarSign, Sparkles, Award, Layers } from 'lucide-react';

interface TeacherDashboardProps {
  initialTab?: 'overview' | 'batches' | 'create-question' | 'create-test' | 'marketplace' | 'doubts';
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ initialTab = 'overview' }) => {
  const {
    currentUser,
    addNewQuestion,
    createTest,
    questions,
    institution,
    setCurrentView,
    openChatWithTeacher,
    setActiveChannelId,
    marketplaceItems,
    addMarketplaceItem,
    removeMarketplaceItem,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'batches' | 'create-question' | 'create-test' | 'marketplace' | 'doubts'>(initialTab);

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

  // ===== CREATE TEST FORM STATE =====
  const [testTitle, setTestTitle] = useState('');
  const [testDuration, setTestDuration] = useState(60);
  const [testMarks, setTestMarks] = useState(100);
  const [testExam, setTestExam] = useState<'JEE Main' | 'JEE Advanced' | 'NEET UG' | 'CBSE Class 12'>('JEE Main');
  const [testType, setTestType] = useState<'Full Mock' | 'Chapter Test' | 'PYQ Paper' | 'Institution Assessment'>('Chapter Test');
  const [testSubject, setTestSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'Biology' | 'All'>('Physics');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [createTestMsg, setCreateTestMsg] = useState<string | null>(null);

  // ===== ADD RESOURCE FORM STATE =====
  const [resTitle, setResTitle] = useState('');
  const [resTag, setResTag] = useState('JEE Main');
  const [resPrice, setResPrice] = useState('Free');
  const [resType, setResType] = useState<'Notes' | 'Course' | 'Test Series' | 'Formula Sheet' | 'Practice Set'>('Notes');
  const [showAddResource, setShowAddResource] = useState(false);

  const toggleQuestionSelection = (qid: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qid) ? prev.filter((id) => id !== qid) : [...prev, qid]
    );
  };

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    const chosen = questions.filter((q) => selectedQuestionIds.includes(q.id));
    if (!testTitle.trim() || chosen.length === 0) {
      setCreateTestMsg('⚠️ Enter a title and select at least 1 question.');
      return;
    }
    const test: Test = {
      id: `test_fac_${Date.now()}`,
      title: testTitle.trim(),
      durationMinutes: testDuration,
      totalMarks: testMarks,
      targetExam: testExam,
      testType,
      subject: testSubject,
      questions: chosen,
      instructions: ['Read each question carefully.', 'Each correct answer carries equal marks.', 'No negative marking in this paper.'],
      authorName: currentUser.name,
      difficulty: 'Moderate',
      attemptsCount: 0,
      avgScore: 0,
    };
    createTest(test);
    setCreateTestMsg(`✅ "${test.title}" (${chosen.length} Qs) published! Find it in Test Series.`);
    setTestTitle('');
    setSelectedQuestionIds([]);
    setShowAddResource(false);
    setTimeout(() => setCreateTestMsg(null), 4000);
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) return;
    const item: ResourceItem = {
      id: `res_${Date.now()}`,
      title: resTitle.trim(),
      tag: resTag.trim() || 'General',
      price: resPrice.trim() || 'Free',
      downloads: 0,
      rating: 5,
      authorName: currentUser.name,
      createdAt: new Date().toISOString(),
      contentType: resType,
    };
    addMarketplaceItem(item);
    setResTitle('');
    setShowAddResource(false);
  };

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
          onClick={() => setActiveTab('create-test')}
          className={`px-3.5 py-1.5 rounded-lg transition ${
            activeTab === 'create-test' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          + Create Test
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
                  <button
                    onClick={() => setCurrentView('test-series')}
                    className="flex-1 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition"
                  >
                    Assign Practice Drill
                  </button>
                  <button
                    onClick={() => setCurrentView('teacher-batches')}
                    className="py-1.5 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                  >
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

      {/* Tab: Create Test (compose from question bank) */}
      {activeTab === 'create-test' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Compose a Test from the Question Bank</h2>
            <span className="text-[11px] text-slate-400">{selectedQuestionIds.length} question(s) selected</span>
          </div>

          {createTestMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs">
              {createTestMsg}
            </div>
          )}

          <form onSubmit={handleCreateTest} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Test Title</label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="e.g. Physics Rotational Motion Chapter Test"
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min={5}
                  max={240}
                  value={testDuration}
                  onChange={(e) => setTestDuration(Number(e.target.value) || 60)}
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Total Marks</label>
                <input
                  type="number"
                  min={10}
                  value={testMarks}
                  onChange={(e) => setTestMarks(Number(e.target.value) || 100)}
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Target Exam</label>
                <select value={testExam} onChange={(e: any) => setTestExam(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
                  <option>JEE Main</option>
                  <option>JEE Advanced</option>
                  <option>NEET UG</option>
                  <option>CBSE Class 12</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Test Type</label>
                <select value={testType} onChange={(e: any) => setTestType(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
                  <option>Full Mock</option>
                  <option>Chapter Test</option>
                  <option>PYQ Paper</option>
                  <option>Institution Assessment</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Subject</label>
                <select value={testSubject} onChange={(e: any) => setTestSubject(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>Mathematics</option>
                  <option>Biology</option>
                  <option>All</option>
                </select>
              </div>
            </div>

            {/* Question picker */}
            <div>
              <label className="block text-slate-400 mb-1.5">Select questions to include ({questions.length} in bank)</label>
              <div className="max-h-72 overflow-y-auto round-lg border border-slate-800 rounded-lg divide-y divide-slate-800">
                {questions.map((q) => (
                  <label key={q.id} className={`flex items-start gap-3 p-3 cursor-pointer transition ${selectedQuestionIds.includes(q.id) ? 'bg-blue-600/10' : 'hover:bg-slate-800/50'}`}>
                    <input
                      type="checkbox"
                      checked={selectedQuestionIds.includes(q.id)}
                      onChange={() => toggleQuestionSelection(q.id)}
                      className="mt-0.5 accent-blue-500"
                    />
                    <span className="flex-1">
                      <span className="text-[11px] text-slate-300 font-semibold">{q.subject} · {q.chapter}</span>
                      <span className="block text-[11px] text-slate-400 mt-0.5 line-clamp-2">{q.questionText}</span>
                    </span>
                  </label>
                ))}
                {questions.length === 0 && (
                  <p className="p-3 text-xs text-slate-500">Question bank is empty. Add questions first via "+ Add Question / PYQ".</p>
                )}
              </div>
            </div>

            <button type="submit" className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs">
              Publish Test to Test Series
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
            <button
              onClick={() => setShowAddResource((v) => !v)}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
            >
              {showAddResource ? 'Cancel' : '+ Add New Resource'}
            </button>
          </div>

          {/* Add resource form (real, functional) */}
          {showAddResource && (
            <form onSubmit={handleAddResource} className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Resource Title</label>
                  <input
                    type="text"
                    value={resTitle}
                    onChange={(e) => setResTitle(e.target.value)}
                    placeholder="e.g. Rotational Motion Formula Sheet"
                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tag</label>
                  <input
                    type="text"
                    value={resTag}
                    onChange={(e) => setResTag(e.target.value)}
                    placeholder="e.g. JEE Main"
                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Price</label>
                  <input
                    type="text"
                    value={resPrice}
                    onChange={(e) => setResPrice(e.target.value)}
                    placeholder="Free or ₹299"
                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Content Type</label>
                  <select
                    value={resType}
                    onChange={(e: any) => setResType(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                  >
                    <option>Notes</option>
                    <option>Course</option>
                    <option>Test Series</option>
                    <option>Formula Sheet</option>
                    <option>Practice Set</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold">
                Publish Resource
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {marketplaceItems.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                    {item.tag}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">{item.price}</span>
                </div>

                <h3 className="text-xs font-bold text-white leading-snug">{item.title}</h3>
                <p className="text-[10px] text-slate-500">
                  by {item.authorName} · {item.contentType}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>{item.downloads} downloads</span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {item.rating}
                  </span>
                </div>
                <button
                  onClick={() => removeMarketplaceItem(item.id)}
                  className="w-full py-1.5 rounded-md bg-slate-800 hover:bg-rose-500/20 border border-slate-700 text-rose-300 text-[11px] font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
            {marketplaceItems.length === 0 && (
              <p className="col-span-3 text-slate-500 text-xs">
                No resources yet. Click "+ Add New Resource" to publish your first one.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
