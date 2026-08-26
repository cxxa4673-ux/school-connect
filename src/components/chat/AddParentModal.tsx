import React, { useState } from 'react';
import {
  X,
  Search,
  Users,
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Phone,
  Send,
  UserCheck,
  Award,
  CalendarCheck,
} from 'lucide-react';
import {
  STUDENT_PARENT_DIRECTORY,
  StudentParentDirectoryItem,
  TEACHER_CLASSES,
} from '../../data/mockData';

interface AddParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectParent: (item: StudentParentDirectoryItem) => void;
  onAddByUniqueId: (parentId: string) => { success: boolean; message: string };
  existingParentIds?: string[];
  activeClassId?: string;
}

export const AddParentModal: React.FC<AddParentModalProps> = ({
  isOpen,
  onClose,
  onSelectParent,
  onAddByUniqueId,
  existingParentIds = [],
  activeClassId = 'class_12_a',
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(activeClassId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uniqueIdInput, setUniqueIdInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const filteredItems = STUDENT_PARENT_DIRECTORY.filter((item) => {
    const matchesClass = selectedClassId === 'all' || item.classId === selectedClassId;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.parentName.toLowerCase().includes(q) ||
      item.studentName.toLowerCase().includes(q) ||
      item.rollNo.toLowerCase().includes(q) ||
      item.parentSchoolConnectId.toLowerCase().includes(q) ||
      item.studentSchoolConnectId.toLowerCase().includes(q);
    return matchesClass && matchesSearch;
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

  return (
    <div
      id="add-parent-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="add-parent-modal-card"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-snug">
                Student Parents Directory
              </h2>
              <p className="text-xs text-blue-100">
                Connect with parents to share performance, attendance & progress updates
              </p>
            </div>
          </div>
          <button
            id="close-add-parent-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick ID connect & Search */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/80 space-y-3 shrink-0">
          <form onSubmit={handleIdSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Sparkles className="w-4 h-4 text-indigo-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="parent-unique-id-input"
                type="text"
                value={uniqueIdInput}
                onChange={(e) => {
                  setUniqueIdInput(e.target.value);
                  if (feedback) setFeedback(null);
                }}
                placeholder="Enter Parent ID or Student ID (e.g. SC-PAR-1102 or SC-STU-4821)"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <button
              id="add-parent-by-id-btn"
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
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

          {/* Search and Class Filter Tabs */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-parent-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, parent name, or roll no..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setSelectedClassId('all')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedClassId === 'all'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All Classes
              </button>
              {TEACHER_CLASSES.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedClassId === cls.id
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cls.shortName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Directory List with Prominent Student-Parent Relationship */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Student &amp; Parent Mapping ({filteredItems.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Respective Student info linked to each parent
            </span>
          </div>

          {filteredItems.map((item) => {
            const hasChat =
              existingParentIds.includes(item.parentId) ||
              existingParentIds.includes(item.parentSchoolConnectId);
            return (
              <div
                key={item.id}
                id={`parent-card-${item.id}`}
                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all shadow-xs hover:shadow-sm"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  {/* Parent Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={item.parentAvatar}
                      alt={item.parentName}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        item.status === 'Online'
                          ? 'bg-emerald-500'
                          : item.status === 'Active today'
                          ? 'bg-blue-400'
                          : 'bg-slate-300'
                      }`}
                    />
                  </div>

                  {/* Parent & Respective Student Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.parentName}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {item.parentRelation}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {item.parentSchoolConnectId}
                      </span>
                    </div>

                    {/* Respective Student Highlight Box */}
                    <div className="mt-1.5 bg-indigo-50/80 border border-indigo-100 rounded-lg px-2.5 py-1.5 flex items-center gap-2.5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={item.studentAvatar}
                          alt={item.studentName}
                          referrerPolicy="no-referrer"
                          className="w-5 h-5 rounded-full object-cover border border-indigo-200"
                        />
                        <span className="text-xs font-semibold text-indigo-950">
                          {item.studentName}
                        </span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-indigo-800 font-medium">
                        {item.standardClass} ({item.rollNo})
                      </span>
                      {item.lastTestScore && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] font-medium text-emerald-700 flex items-center gap-0.5">
                            <Award className="w-3 h-3" />
                            {item.lastTestScore}
                          </span>
                        </>
                      )}
                      {item.attendanceRate && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] font-medium text-blue-700 flex items-center gap-0.5">
                            <CalendarCheck className="w-3 h-3" />
                            {item.attendanceRate} Attd
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {item.parentPhone}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-slate-600">{item.batchName}</span>
                    </div>
                  </div>
                </div>

                {/* Connect / Message Button */}
                <button
                  id={`select-parent-btn-${item.id}`}
                  onClick={() => {
                    onSelectParent(item);
                    onClose();
                  }}
                  className={`shrink-0 self-end sm:self-center px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                    hasChat
                      ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
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
                      Message Parent
                    </>
                  )}
                </button>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No parent found matching the search criteria. Try a different query or switch class.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Teacher-Parent Academic Link</span>
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
