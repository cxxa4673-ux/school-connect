import React, { useState } from 'react';
import { UserPlus, Search, Check, Sparkles, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CLASSMATE_DIRECTORY, ClassmateInfo } from '../../data/mockData';

interface AddClassmateModalProps {
  onClose: () => void;
}

export const AddClassmateModal: React.FC<AddClassmateModalProps> = ({ onClose }) => {
  const { addPeerChatByUniqueId, currentUser } = useApp();
  const [uniqueIdInput, setUniqueIdInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [directorySearch, setDirectorySearch] = useState('');

  const handleAddById = (idToAdd: string) => {
    setFeedback(null);
    const res = addPeerChatByUniqueId(idToAdd);
    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const filteredDirectory = CLASSMATE_DIRECTORY.filter((cm) => {
    if (cm.schoolConnectId === currentUser.schoolConnectId) return false;
    if (!directorySearch) return true;
    const q = directorySearch.toLowerCase();
    return (
      cm.name.toLowerCase().includes(q) ||
      cm.schoolConnectId.toLowerCase().includes(q) ||
      cm.standardClass.toLowerCase().includes(q) ||
      cm.batchName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Start Chat with Classmate</h3>
              <p className="text-xs text-slate-400">Connect using unique School-Connect ID</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input by Custom Unique ID */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300">
            Enter School-Connect Unique ID (e.g., SC-STU-4822):
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="SC-STU-XXXX"
                value={uniqueIdInput}
                onChange={(e) => setUniqueIdInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddById(uniqueIdInput);
                }}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 uppercase font-bold"
              />
            </div>
            <button
              type="button"
              onClick={() => handleAddById(uniqueIdInput)}
              disabled={!uniqueIdInput.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 shrink-0"
            >
              <span>Add & Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {feedback && (
            <div
              className={`p-2.5 rounded-xl text-xs font-semibold ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-950/40 border border-red-500/30 text-red-300'
              }`}
            >
              {feedback.text}
            </div>
          )}
        </div>

        {/* Directory Suggestions */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Apex Academy Classmates Directory</span>
            </h4>
            <span className="text-[10px] text-slate-500">Class 12</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search classmates by name or ID..."
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800/40">
            {filteredDirectory.map((cm) => (
              <div
                key={cm.id}
                className="pt-2 flex items-center justify-between gap-3 group hover:bg-slate-800/40 p-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={cm.avatar}
                      alt={cm.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                        cm.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-white truncate">{cm.name}</h5>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {cm.schoolConnectId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{cm.standardClass}</p>
                    <p className="text-[10px] text-slate-500 truncate">{cm.bio}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddById(cm.schoolConnectId)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Info notice */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            School-Connect peer chats are end-to-end moderated for academic safety. You can share formulas, notes, test doubts, and voice explanations.
          </span>
        </div>
      </div>
    </div>
  );
};
