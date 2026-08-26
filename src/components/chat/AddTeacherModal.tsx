import React, { useState } from 'react';
import { X, Search, UserCheck, BookOpen, GraduationCap, Sparkles, MessageSquare, CircleCheck as CheckCircle2, ShieldCheck, Star, Clock, Send } from 'lucide-react';
import { TEACHERS_DIRECTORY, TeacherDirectoryItem } from '../../data/mockData';
import { SubjectName } from '../../types';

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTeacher: (teacher: TeacherDirectoryItem) => void;
  onAddByUniqueId: (teacherId: string) => { success: boolean; message: string };
  existingTeacherIds?: string[];
  childName?: string;
}

export const AddTeacherModal: React.FC<AddTeacherModalProps> = ({
  isOpen,
  onClose,
  onSelectTeacher,
  onAddByUniqueId,
  existingTeacherIds = [],
  childName = 'Aarav Sharma',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectName | 'All'>('All');
  const [uniqueIdInput, setUniqueIdInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const subjects: Array<SubjectName | 'All'> = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'];

  const filteredTeachers = TEACHERS_DIRECTORY.filter((tch) => {
    const matchesSubject = selectedSubject === 'All' || tch.subject === selectedSubject;
    const matchesSearch =
      tch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tch.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tch.schoolConnectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tch.qualifications.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const handleIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uniqueIdInput.trim()) return;
    const result = onAddByUniqueId(uniqueIdInput.trim());
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setTimeout(() => {
        setFeedback(null);
        setUniqueIdInput('');
        onClose();
      }, 1000);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const getSubjectBadgeColor = (subject: SubjectName) => {
    switch (subject) {
      case 'Physics':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Chemistry':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Mathematics':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Biology':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      id="add-teacher-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="add-teacher-modal-card"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-snug">
                Child&apos;s Subject Teachers
              </h2>
              <p className="text-xs text-emerald-100">
                Direct faculty messaging & doubt discussions for {childName}
              </p>
            </div>
          </div>
          <button
            id="close-add-teacher-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Add By ID / Search Controls */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 space-y-3 shrink-0">
          <form onSubmit={handleIdSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Sparkles className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="teacher-unique-id-input"
                type="text"
                value={uniqueIdInput}
                onChange={(e) => {
                  setUniqueIdInput(e.target.value);
                  if (feedback) setFeedback(null);
                }}
                placeholder="Enter Teacher School-Connect ID (e.g. SC-TCH-3120)"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
              />
            </div>
            <button
              id="add-teacher-by-id-btn"
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              Connect
            </button>
          </form>

          {feedback && (
            <div
              className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              {feedback.message}
            </div>
          )}

          {/* Search & Subject Filter Tabs */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-teacher-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teacher by name or specialization..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedSubject === sub
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Teachers List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Assigned School Faculty ({filteredTeachers.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Apex Science Academy • Kota
            </span>
          </div>

          {filteredTeachers.map((teacher) => {
            const hasChat = existingTeacherIds.includes(teacher.id) || existingTeacherIds.includes(teacher.schoolConnectId);
            return (
              <div
                key={teacher.id}
                id={`teacher-card-${teacher.id}`}
                className="pt-3 first:pt-0 flex items-start justify-between gap-3 group hover:bg-slate-50/80 p-2.5 rounded-xl transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        teacher.status === 'Online'
                          ? 'bg-emerald-500'
                          : teacher.status === 'In Lecture'
                          ? 'bg-amber-500'
                          : 'bg-slate-300'
                      }`}
                      title={teacher.status}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {teacher.name}
                      </h4>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getSubjectBadgeColor(
                          teacher.subject
                        )}`}
                      >
                        {teacher.subject}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                      <BookOpen className="w-3 h-3 text-slate-400" />
                      <span>{teacher.qualifications}</span>
                      <span className="text-slate-300">•</span>
                      <span>{teacher.experience} Exp</span>
                    </p>

                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {teacher.bio}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-mono">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold text-[10px]">
                        {teacher.schoolConnectId}
                      </span>
                      <span className="flex items-center gap-1 text-amber-600 font-sans font-medium">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        {teacher.rating} ({teacher.totalReviews})
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 font-sans">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {teacher.status}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  id={`select-teacher-btn-${teacher.id}`}
                  onClick={() => {
                    onSelectTeacher(teacher);
                    onClose();
                  }}
                  className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                    hasChat
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {hasChat ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      Open Chat
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-3.5 h-3.5" />
                      Message
                    </>
                  )}
                </button>
              </div>
            );
          })}

          {filteredTeachers.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No teachers found matching your search. Try searching by ID or selecting another subject.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Parent Communication Portal</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
