import React, { useState } from 'react';
import { CalendarClock, CheckSquare, Clock, ShieldCheck, Timer } from 'lucide-react';
import { CookingTodoTask } from '../types';
import { motion } from 'motion/react';

interface CookingTodoListProps {
  todoList: CookingTodoTask[];
  scheduleName: string;
}

export default function CookingTodoList({ todoList, scheduleName }: CookingTodoListProps) {
  const [tasks, setTasks] = useState<CookingTodoTask[]>(
    todoList.map(task => ({ ...task, completed: false }))
  );

  const toggleTask = (index: number) => {
    setTasks(prev => prev.map((t, i) => i === index ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalActiveMinutes = tasks.filter(t => !t.completed).reduce((sum, t) => sum + t.durationMin, 0);

  const getPriorityBadgeClass = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return "bg-rose-50 border border-rose-150 text-rose-800";
      case 'medium':
        return "bg-amber-50 border border-amber-150 text-amber-800";
      case 'low':
        return "bg-slate-50 border border-slate-150 text-slate-700";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col gap-6"
      id="cooking-todo-list-card"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-150 pb-4 gap-4" id="todo-header">
        <div>
          <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-emerald-600" />
            Chronological Kitchen Timeline
          </h3>
          <p className="text-xs text-stone-500">
            Tailored to schedule preset: <strong className="text-stone-700 font-semibold">{scheduleName}</strong>
          </p>
        </div>

        {/* Task progress indicator */}
        <div className="flex items-center gap-3 bg-stone-50 border border-stone-150 px-3.5 py-1.5 rounded-full" id="todo-progress-indicator">
          <Timer className="w-3.5 h-3.5 text-stone-500" />
          <span className="text-xs font-semibold text-stone-600">
            {completedCount}/{totalCount} Completed
          </span>
          <div className="w-16 bg-stone-200 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="todo-stats-grid">
        <div className="bg-stone-50 p-4 border border-stone-100 rounded-xl text-center">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Remaining Cooking Time</span>
          <span className="text-2xl font-extrabold text-stone-950 font-mono tracking-tight">{totalActiveMinutes} mins</span>
        </div>
        <div className="bg-stone-50 p-4 border border-stone-100 rounded-xl text-center">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Daily Culinary Progress</span>
          <span className="text-2xl font-extrabold text-stone-950 font-mono tracking-tight">{progressPercent}%</span>
        </div>
        <div className="bg-emerald-50/40 p-4 border border-emerald-100 rounded-xl text-center flex flex-col justify-center items-center">
          <ShieldCheck className="w-5 h-5 text-emerald-700 mb-0.5" />
          <span className="text-xs font-bold text-emerald-800">Fully Optimized</span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-stone-500">No tasks planned. Try generating!</div>
      ) : (
        <div className="space-y-3.5" id="timeline-steps-list">
          {tasks.map((task, idx) => {
            const isCompleted = task.completed;
            return (
              <div 
                key={idx}
                onClick={() => toggleTask(idx)}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all ${
                  isCompleted 
                    ? "bg-stone-50/60 border-stone-200 opacity-60" 
                    : "bg-white border-stone-200 shadow-sm hover:border-stone-300"
                }`}
                id={`timeline-step-item-${idx}`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Time box */}
                  <div className={`p-2 rounded-lg text-center font-mono w-[84px] shrink-0 ${
                    isCompleted ? "bg-stone-100 text-stone-400" : "bg-stone-900 text-stone-50"
                  }`} id={`timeSlot-indicator-${idx}`}>
                    <span className="block text-xs font-extrabold tracking-tight">{task.timeSlot}</span>
                  </div>

                  {/* Description check box block */}
                  <div className="space-y-1">
                    <h4 className={`text-sm font-bold text-stone-800 flex items-center gap-2 ${isCompleted ? "line-through text-stone-400" : ""}`}>
                      <span>{task.task}</span>
                    </h4>
                    <p className={`text-xs text-stone-600 leading-relaxed ${isCompleted ? "line-through text-stone-400" : ""}`}>
                      {task.description}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-stone-100 pt-2.5 sm:pt-0" id="step-task-meta">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-stone-500">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{task.durationMin} mins</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getPriorityBadgeClass(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
