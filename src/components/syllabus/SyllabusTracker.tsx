import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubjectName, SyllabusChapter, StudentSyllabusProgress } from '../../types';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  User,
  Users,
  Heart,
  GraduationCap,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  CheckCheck,
  TrendingUp,
} from 'lucide-react';

export const SyllabusTracker: React.FC = () => {
  const {
    currentUser,
    currentExam,
    syllabus,
    studentSyllabusRecords,
    toggleTopicCompletion,
    updateStudentSyllabusTopic,
    triggerAIQuickPrompt,
    openChatWithTeacher,
    openChatWithParent,
    setCurrentView,
  } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<SubjectName | 'All'>('All');
  const [expandedChapters, setExpandedChapters] = useState<{ [chId: string]: boolean }>({
    ch_phy_1: true,
    ch_chem_1: true,
  });

  // For Parent View: select child
  const [selectedChildId, setSelectedChildId] = useState<string>(
    currentUser.linkedChildIds?.[0] || 'SC-STU-4821'
  );

  // For Teacher View: selected student for deep inspect
  const [selectedStudentForTeacher, setSelectedStudentForTeacher] = useState<string>('SC-STU-4821');
  const [teacherSearch, setTeacherSearch] = useState('');

  const toggleChapterExpand = (id: string) => {
    setExpandedChapters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ==========================================
  // 1. SCHOOL ADMIN VIEW (Confidentiality Rule)
  // ==========================================
  if (currentUser.role === 'institution_admin') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Access & Privacy Policy Enforced
            </span>
            <h2 className="text-2xl font-black text-white">Student Syllabus Micro-Tracking Restricted</h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              As per the School-Connect visibility and communication blueprint, individual chapter-by-chapter and topic micro-trackers are confidential and visible strictly to the <strong>Student</strong>, their <strong>Linked Parent</strong>, and their respective <strong>Subject Faculty</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-left max-w-lg mx-auto space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Layers className="w-4 h-4" />
              <span>Institutional Aggregate Dashboard</span>
            </div>
            <p>
              School Administrators can view cohort-level analytics, batch pass rates, and teacher syllabus completion milestones from the main Institution Portal.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setCurrentView('institution-portal')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2"
            >
              <span>Go to Institution Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. PARENT VIEW (Live Child Syllabus Progress)
  // ==========================================
  if (currentUser.role === 'parent') {
    const linkedChildRecords = studentSyllabusRecords.filter((rec) =>
      currentUser.linkedChildIds?.includes(rec.studentId) || rec.studentId === 'SC-STU-4821'
    );

    const activeChildRecord =
      linkedChildRecords.find((r) => r.studentId === selectedChildId) || linkedChildRecords[0];

    const childChapters = activeChildRecord?.chapters || syllabus;
    const filteredChildChapters = childChapters.filter((ch) => {
      if (selectedSubject !== 'All' && ch.subject !== selectedSubject) return false;
      return true;
    });

    const totalTopics = childChapters.reduce((acc, ch) => acc + ch.topics.length, 0);
    const completedTopics = childChapters.reduce(
      (acc, ch) => acc + ch.topics.filter((t) => t.completed).length,
      0
    );
    const childSyllabusPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Parent Header Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Heart className="w-3 h-3 text-emerald-400" />
                <span>Parent Live Mirror • Syllabus Monitor</span>
              </span>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Live Synced</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              {activeChildRecord?.studentName || 'Aarav Sharma'}'s Academic Syllabus Tracker
            </h1>
            <p className="text-xs text-slate-300">
              Real-time chapter completion, micro-topic milestones, and subject preparedness for {activeChildRecord?.targetExam || 'JEE Advanced 2026'}.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Completed</span>
              <span className="text-2xl font-black text-emerald-400">{childSyllabusPercent}%</span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-xs text-white">
              {completedTopics}/{totalTopics}
            </div>
          </div>
        </div>

        {/* Child Selector & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Monitoring Student:</span>
            <div className="flex items-center gap-2">
              {linkedChildRecords.map((child) => (
                <button
                  key={child.studentId}
                  onClick={() => setSelectedChildId(child.studentId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
                    selectedChildId === child.studentId
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{child.studentName} ({child.studentId})</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={openChatWithParent}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat with {activeChildRecord?.studentName?.split(' ')[0] || 'Child'}</span>
          </button>
        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['Physics', 'Chemistry', 'Mathematics'] as const).map((sub) => {
            const subData = activeChildRecord?.subjectProgress[sub];
            const pct = subData?.percentage || 0;
            return (
              <div key={sub} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{sub}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{pct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>{subData?.completedTopics || 0} of {subData?.totalTopics || 0} topics</span>
                  <span className="text-slate-500">Active: {subData?.lastActiveDate || 'Today'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
          {(['All', 'Physics', 'Chemistry', 'Mathematics'] as const).map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                selectedSubject === sub ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Chapter Breakdown */}
        <div className="space-y-4">
          {filteredChildChapters.map((ch) => {
            const completedCount = ch.topics.filter((t) => t.completed).length;
            const totalInChapter = ch.topics.length;
            const pct = Math.round((completedCount / totalInChapter) * 100);
            const isExpanded = expandedChapters[ch.id];

            return (
              <div
                key={ch.id}
                className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm transition"
              >
                <div
                  onClick={() => toggleChapterExpand(ch.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {ch.subject}
                        </span>
                        <span className="text-xs font-bold text-white">{ch.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>Weightage: <strong className="text-amber-400">{ch.weightagePercent}% ({ch.expectedQuestions} Qs)</strong></span>
                        <span>•</span>
                        <span>{completedCount}/{totalInChapter} topics completed by {activeChildRecord?.studentName?.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-32 hidden sm:block">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Progress</span>
                        <span className="font-mono font-bold text-emerald-400">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        ch.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : ch.status === 'Needs Revision'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {ch.status}
                    </span>

                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-slate-950/60 border-t border-slate-800 space-y-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Live Student Checklist Status:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {ch.topics.map((topic) => (
                        <div
                          key={topic.id}
                          className={`p-3 rounded-lg border flex items-center justify-between ${
                            topic.completed
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border ${
                                topic.completed
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-slate-600 bg-slate-800'
                              }`}
                            >
                              {topic.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                            <span className={topic.completed ? 'line-through opacity-80' : ''}>
                              {topic.name}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono">
                            {topic.completed ? (
                              <span className="text-emerald-400 font-bold">Done</span>
                            ) : (
                              <span className="text-amber-400">Pending</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. TEACHER VIEW (Enrolled Students & Subject Tracking)
  // ==========================================
  if (currentUser.role === 'teacher') {
    const teacherSubject: SubjectName = currentUser.department || 'Physics';

    const enrolledRecords = studentSyllabusRecords.filter((rec) => {
      if (teacherSearch) {
        const q = teacherSearch.toLowerCase();
        return (
          rec.studentName.toLowerCase().includes(q) ||
          rec.studentId.toLowerCase().includes(q) ||
          rec.batchName.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const activeStudent =
      enrolledRecords.find((r) => r.studentId === selectedStudentForTeacher) || enrolledRecords[0];

    const studentChapters = (activeStudent?.chapters || syllabus).filter(
      (c) => c.subject === teacherSubject
    );

    const totalSubjectTopics = studentChapters.reduce((acc, c) => acc + c.topics.length, 0);
    const completedSubjectTopics = studentChapters.reduce(
      (acc, c) => acc + c.topics.filter((t) => t.completed).length,
      0
    );
    const subjectPercent =
      totalSubjectTopics > 0 ? Math.round((completedSubjectTopics / totalSubjectTopics) * 100) : 0;

    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Teacher Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border border-blue-500/30 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-blue-400" />
                <span>Subject Faculty Syllabus Portal</span>
              </span>
              <span className="text-xs text-blue-300 font-mono font-bold">
                {teacherSubject} • Class 12th Batch Alpha
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              Enrolled Students Syllabus Progress & Mastery Matrix
            </h1>
            <p className="text-xs text-slate-300">
              Track {teacherSubject} syllabus completion for enrolled students and clear micro-topic doubts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openChatWithTeacher(teacherSubject)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open 1-on-1 Doubt Clearing</span>
            </button>
          </div>
        </div>

        {/* Enrolled Students Row */}
        <div className="space-y-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Enrolled Students in {teacherSubject} ({enrolledRecords.length})
              </h3>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search enrolled student..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {enrolledRecords.map((stu) => {
              const isSelected = stu.studentId === activeStudent?.studentId;
              const stuProgress = stu.subjectProgress[teacherSubject]?.percentage || 0;

              return (
                <div
                  key={stu.studentId}
                  onClick={() => setSelectedStudentForTeacher(stu.studentId)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-xs text-blue-300 shrink-0">
                      {stu.studentName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{stu.studentName}</h4>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {stu.studentId} • {stu.batchName}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold font-mono text-blue-300">{stuProgress}%</span>
                    <span className="text-[9px] text-slate-500 block">Syllabus</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Student Chapter Breakdown */}
        {activeStudent && (
          <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{activeStudent.studentName}'s {teacherSubject} Checklist</span>
                  <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                    {subjectPercent}% Complete
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  You can inspect or toggle topics completed in class sessions.
                </p>
              </div>

              <button
                onClick={() =>
                  openChatWithTeacher(
                    teacherSubject,
                    currentUser.name,
                    `Hello ${activeStudent.studentName}, I was reviewing your ${teacherSubject} syllabus progress.`
                  )
                }
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message Student</span>
              </button>
            </div>

            <div className="space-y-3">
              {studentChapters.map((ch) => {
                const completedCount = ch.topics.filter((t) => t.completed).length;
                const totalInChapter = ch.topics.length;
                const pct = Math.round((completedCount / totalInChapter) * 100);
                const isExpanded = expandedChapters[ch.id];

                return (
                  <div
                    key={ch.id}
                    className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm"
                  >
                    <div
                      onClick={() => toggleChapterExpand(ch.id)}
                      className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white">{ch.name}</span>
                          <span className="text-[11px] text-slate-400 ml-2 font-mono">
                            ({completedCount}/{totalInChapter} completed)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold font-mono text-blue-400">{pct}%</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-3.5 bg-slate-900/60 border-t border-slate-800 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {ch.topics.map((topic) => (
                            <div
                              key={topic.id}
                              onClick={() =>
                                updateStudentSyllabusTopic(activeStudent.studentId, ch.id, topic.id)
                              }
                              className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                                topic.completed
                                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                    topic.completed
                                      ? 'bg-emerald-500 border-emerald-500 text-white'
                                      : 'border-slate-600 bg-slate-800'
                                  }`}
                                >
                                  {topic.completed && <CheckCircle2 className="w-3 h-3" />}
                                </div>
                                <span className={topic.completed ? 'line-through opacity-80' : ''}>
                                  {topic.name}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-500">
                                {topic.completed ? 'Mastered' : 'Pending'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 4. STUDENT VIEW (Personal Multi-Subject Tracker)
  // ==========================================
  const filteredChapters = syllabus.filter((ch) => {
    if (selectedSubject !== 'All' && ch.subject !== selectedSubject) return false;
    return true;
  });

  const totalTopics = syllabus.reduce((acc, ch) => acc + ch.topics.length, 0);
  const completedTopics = syllabus.reduce(
    (acc, ch) => acc + ch.topics.filter((t) => t.completed).length,
    0
  );
  const syllabusPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/30 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Personal Syllabus Tracker
            </span>
            <span className="text-xs text-slate-400 font-mono">{currentExam} 2026</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Complete Syllabus & Topic Completion Tracker
          </h1>
          <p className="text-xs text-slate-300">
            Track micro-topic coverage, high-yield exam weightage, and spaced revision statuses.
          </p>
        </div>

        {/* Big Percentage Widget */}
        <div className="flex items-center gap-4 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Overall Preparedness</span>
            <span className="text-2xl font-black text-indigo-300">{syllabusPercent}%</span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 flex items-center justify-center font-bold text-xs text-white">
            {completedTopics}/{totalTopics}
          </div>
        </div>
      </div>

      {/* Filter Tabs - Horizontal Scrolling Carousel on Mobile */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-1 border-b border-slate-800 text-xs font-semibold">
        {(['All', 'Physics', 'Chemistry', 'Mathematics'] as const).map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all active:scale-95 min-h-[38px] shrink-0 ${
              selectedSubject === sub
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold shadow-md shadow-indigo-500/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {sub === 'All' ? '✨ All Subjects' : sub === 'Physics' ? '⚡ Physics' : sub === 'Chemistry' ? '🧪 Chemistry' : '📐 Mathematics'}
          </button>
        ))}
      </div>

      {/* Chapters Accordion List - Compact on Mobile */}
      <div className="space-y-3">
        {filteredChapters.map((ch) => {
          const completedCount = ch.topics.filter((t) => t.completed).length;
          const totalInChapter = ch.topics.length;
          const pct = Math.round((completedCount / totalInChapter) * 100);
          const isExpanded = expandedChapters[ch.id];

          return (
            <div
              key={ch.id}
              className={`rounded-2xl border transition-all duration-200 shadow-sm ${
                isExpanded ? 'bg-slate-900 border-indigo-500/50 ring-1 ring-indigo-500/20' : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div
                onClick={() => toggleChapterExpand(ch.id)}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99] transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {ch.subject}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white truncate">{ch.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span className="text-amber-300 font-semibold">{ch.weightagePercent}% wt ({ch.expectedQuestions} Qs)</span>
                      <span>•</span>
                      <span>{completedCount}/{totalInChapter} topics</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Compact percentage pill on mobile */}
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-indigo-400 block">{pct}%</span>
                    <div className="w-16 sm:w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-300 shadow-sm shadow-indigo-500/50"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Topics Breakdown */}
              {isExpanded && (
                <div className="p-4 bg-slate-950/60 border-t border-slate-800 space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Micro-Topics Checklist:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {ch.topics.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => toggleTopicCompletion(ch.id, topic.id)}
                        className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                          topic.completed
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              topic.completed
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-600 bg-slate-800'
                            }`}
                          >
                            {topic.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className={topic.completed ? 'line-through opacity-80' : ''}>
                            {topic.name}
                          </span>
                        </div>

                        {topic.confidenceLevel && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {topic.confidenceLevel}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() =>
                        openChatWithTeacher(
                          ch.subject,
                          undefined,
                          `Ma'am/Sir, I have a doubt in chapter ${ch.name}. Could you please guide me on the high-yield topics?`
                        )
                      }
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Ask Faculty Doubt on {ch.name}</span>
                    </button>

                    <button
                      onClick={() => triggerAIQuickPrompt(`Generate a 5-question diagnostic test on chapter: ${ch.name}`)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Take Chapter AI Diagnostic</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
