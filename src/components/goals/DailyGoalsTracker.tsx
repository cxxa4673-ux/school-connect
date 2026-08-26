import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyGoal } from '../../types';
import { SquareCheck as CheckSquare, Plus, Flame, CircleCheck as CheckCircle2, Calendar, Sparkles, Layers, Award } from 'lucide-react';

export const DailyGoalsTracker: React.FC = () => {
  const { dailyGoals, toggleGoal, addDailyGoal, triggerAIQuickPrompt, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [targetCount, setTargetCount] = useState(20);
  const [unit, setUnit] = useState('Questions');
  const [category, setCategory] = useState<'PYQ' | 'Mock Test' | 'Revision' | 'Lecture'>('PYQ');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const newGoal: DailyGoal = {
      id: `goal_${Date.now()}`,
      userId: currentUser.id,
      title,
      targetCount,
      completedCount: 0,
      unit,
      category,
      isDone: false,
      date: new Date().toISOString().split('T')[0],
    };
    addDailyGoal(newGoal);
    setTitle('');
    setIsAdding(false);
  };

  const completedGoalsCount = dailyGoals.filter((g) => g.isDone).length;
  const progressPct = dailyGoals.length > 0 ? Math.round((completedGoalsCount / dailyGoals.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/30 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Daily Target Tracker
            </span>
            <span className="text-xs text-slate-400 font-mono">Daily Disciplines</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
            <span>Daily Study Goals & Streak</span>
            <Flame className="w-6 h-6 text-amber-400 fill-amber-400" />
          </h1>
          <p className="text-xs text-slate-300">
            Set daily question targets, maintain study streaks, and build consistent exam readiness.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Close Goal Creator' : 'Add New Daily Goal'}</span>
        </button>
      </div>

      {/* Progress Bar & Streak Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Current Study Streak</span>
            <div className="text-xl font-black text-white">6 Days in a Row</div>
            <span className="text-[10px] text-emerald-400 font-semibold">+1.5 hrs logged today</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4 sm:col-span-2">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Today's Goal Completion</span>
              <span className="font-mono text-emerald-400 font-bold">{completedGoalsCount} of {dailyGoals.length} Done ({progressPct}%)</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* New Goal Creator Form */}
      {isAdding && (
        <form onSubmit={handleAddGoal} className="p-5 rounded-xl bg-slate-900 border border-slate-700 space-y-4 text-xs animate-scaleUp">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">Create Custom Daily Target</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Goal Description</label>
              <input
                type="text"
                placeholder="e.g. Solve 25 Organic Chemistry PYQs"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
              >
                <option value="PYQ">PYQ Practice</option>
                <option value="Mock Test">Mock Test</option>
                <option value="Revision">Revision</option>
                <option value="Lecture">Video Lecture</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Target Quantity</label>
              <input
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
          >
            Save Target
          </button>
        </form>
      )}

      {/* Goals List */}
      <div className="space-y-3">
        {dailyGoals.map((goal) => (
          <div
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
              goal.isDone
                ? 'bg-slate-900/60 border-slate-800 text-slate-500'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                  goal.isDone
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-600 bg-slate-800'
                }`}
              >
                {goal.isDone && <CheckCircle2 className="w-4 h-4" />}
              </div>

              <div>
                <span className={`text-sm font-semibold ${goal.isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                  {goal.title}
                </span>
                <span className="block text-xs text-slate-400 font-mono mt-0.5">
                  Target: {goal.completedCount}/{goal.targetCount} {goal.unit}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                {goal.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
