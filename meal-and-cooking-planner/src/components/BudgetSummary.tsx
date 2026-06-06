import React from 'react';
import { DollarSign, CheckCircle2, AlertTriangle, HelpCircle, Lightbulb } from 'lucide-react';
import { BudgetFeasibility } from '../types';
import { motion } from 'motion/react';

interface BudgetSummaryProps {
  feasibility: BudgetFeasibility;
  limit: number;
  onAdjustLimit?: (newLimit: number) => void;
}

export default function BudgetSummary({ feasibility, limit, onAdjustLimit }: BudgetSummaryProps) {
  const { totalEstimatedCost, budgetStatus, analysis, savingsTips } = feasibility;
  
  const percentage = Math.min(Math.round((totalEstimatedCost / limit) * 100), 150);
  
  let statusColor = "bg-green-500 text-green-950 border-green-200";
  let statusText = "Under Budget";
  let statusIcon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
  let progressBarColor = "bg-emerald-500";
  let ringBorderColor = "border-emerald-500";

  if (budgetStatus === 'over_budget' || totalEstimatedCost > limit) {
    statusColor = "bg-rose-100 text-rose-900 border-rose-300";
    statusText = "Over Budget";
    statusIcon = <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />;
    progressBarColor = "bg-rose-500";
    ringBorderColor = "border-rose-500";
  } else if (budgetStatus === 'on_budget' || totalEstimatedCost === limit) {
    statusColor = "bg-amber-100 text-amber-900 border-amber-300";
    statusText = "Perfect Match";
    statusIcon = <HelpCircle className="w-5 h-5 text-amber-600" />;
    progressBarColor = "bg-amber-500";
    ringBorderColor = "border-amber-500";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-8 items-stretch"
      id="budget-summary-card"
    >
      {/* Cost Gauge Tracker */}
      <div className="flex-1 flex flex-col justify-between" id="cost-tracker-section">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-stone-500">Budget Feasibility Check</span>
            <div className={`px-3 py-1 flex items-center gap-1.5 rounded-full text-xs font-semibold border ${statusColor}`} id="budget-status-badge">
              {statusIcon}
              {statusText}
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-extrabold text-stone-950 font-sans tracking-tight">
              ${totalEstimatedCost.toFixed(2)}
            </span>
            <span className="text-stone-400">/ ${limit} budget limit</span>
          </div>

          {/* Progress bar container */}
          <div className="w-full bg-stone-100 h-3.5 rounded-full overflow-hidden mb-6 relative" id="budget-progress-container">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${progressBarColor}`}
            />
            {percentage > 100 && (
              <div className="absolute right-0 top-0 h-full w-4 bg-rose-600 animate-ping rounded-full" />
            )}
          </div>
        </div>

        {/* Dynamic Budget Slider adjustment directly in results, making it highly interactive */}
        <div className="bg-stone-50 rounded-xl p-4 border border-stone-100" id="budget-adjustment-slider">
          <div className="flex justify-between text-xs font-semibold text-stone-600 mb-2">
            <span>Tweak Target Budget Limit:</span>
            <span className="text-stone-900">${limit}</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="150" 
            step="5"
            value={limit} 
            onChange={(e) => onAdjustLimit && onAdjustLimit(Number(e.target.value))}
            className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
            id="budget-limit-slider-input"
          />
          <div className="flex justify-between text-[10px] text-stone-400 mt-1">
            <span>$10 min</span>
            <span>$150 max</span>
          </div>
        </div>
      </div>

      {/* Analysis and recommendations panel */}
      <div className="flex-1 flex flex-col justify-between border-t md:border-t-0 md:border-l border-stone-100 pt-6 md:pt-0 md:pl-8" id="budget-analysis-section">
        <div>
          <h4 className="text-sm font-semibold text-stone-950 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Plan Analysis
          </h4>
          <p className="text-sm text-stone-600 leading-relaxed mb-4">
            {analysis}
          </p>
        </div>

        {savingsTips && savingsTips.length > 0 && (
          <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-100" id="savings-tips-box">
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-emerald-800 tracking-wide uppercase">Savings & Preparation Tips</span>
            </div>
            <ul className="space-y-1.5">
              {savingsTips.slice(0, 3).map((tip, idx) => (
                <li key={idx} className="text-xs text-stone-700 flex items-start gap-1.5" id={`saving-tip-item-${idx}`}>
                  <span className="text-emerald-500 font-bold mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}
