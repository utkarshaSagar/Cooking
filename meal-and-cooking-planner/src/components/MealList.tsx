import React, { useState } from 'react';
import { Clock, Flame, Check, Scale, UtensilsCrossed } from 'lucide-react';
import { MealPlan, Meal } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface MealListProps {
  meals: MealPlan;
  householdSize: number;
}

export default function MealList({ meals, householdSize }: MealListProps) {
  const [activeTab, setActiveTab] = useState<'breakfast' | 'lunch' | 'dinner'>('dinner');
  const [scalableMultiplier, setScalableMultiplier] = useState<number>(householdSize);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  const mealTypes: { key: 'breakfast' | 'lunch' | 'dinner'; label: string; icon: string }[] = [
    { key: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { key: 'lunch', label: 'Lunch & Fuel', icon: '🥗' },
    { key: 'dinner', label: 'Dinner & Unwind', icon: '🍲' },
  ];

  const currentMeal: Meal = meals[activeTab];

  // Helper code to parse numerical quantities from ingredient strings and scale them cleanly
  const scaleIngredient = (ing: string, multiplier: number) => {
    // Basic regex scaling lookup
    const ratio = multiplier / householdSize;
    if (ratio === 1) return ing;
    
    // Attempt to match numbers (including fractions like 1/2 or decimals)
    const numRegex = /^(\d+(\.\d+)?|\d+\/\d+)\s*(cups|tbsp|tsp|g|kg|ml|oz|lbs|pieces|units|cans|cloves|heads|cans)?\b/i;
    const match = ing.match(numRegex);
    if (match) {
      const numericStr = match[1];
      let val = 0;
      if (numericStr.includes('/')) {
        const parts = numericStr.split('/');
        val = parseFloat(parts[0]) / parseFloat(parts[1]);
      } else {
        val = parseFloat(numericStr);
      }
      
      const scaledVal = (val * ratio).toFixed(scaledDecimalPlaces(val * ratio));
      return ing.replace(numericStr, scaledVal);
    }
    
    return `${ing} (Scaled for ${multiplier} auth)`;
  };

  const scaledDecimalPlaces = (val: number): number => {
    if (val % 1 === 0) return 0;
    if ((val * 2) % 1 === 0) return 1; // .5
    return 2;
  };

  const toggleCheck = (ingKey: string) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [ingKey]: !prev[ingKey]
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex flex-col gap-6"
      id="meal-planning-flow-card"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-150 pb-4 gap-4" id="meal-tabs-header">
        <div>
          <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
            Vibe-Tailored Meal Flow
          </h3>
          <p className="text-xs text-stone-500">Perfect portions scaled to your current household requirement.</p>
        </div>

        {/* Portion scaling controls */}
        <div className="flex items-center gap-2.5 bg-stone-50 border border-stone-150 px-3 py-1.5 rounded-full" id="meal-scale-controls">
          <Scale className="w-4 h-4 text-stone-600" />
          <span className="text-xs font-semibold text-stone-700">Portion Scale:</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setScalableMultiplier(m => Math.max(1, m - 1))}
              className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 text-xs flex items-center justify-center font-bold hover:bg-stone-300 transition-colors"
              id="decrease-scale-btn"
            >
              -
            </button>
            <span className="text-xs font-bold text-stone-900 w-4 text-center">{scalableMultiplier}</span>
            <button 
              onClick={() => setScalableMultiplier(m => Math.min(12, m + 1))}
              className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 text-xs flex items-center justify-center font-bold hover:bg-stone-300 transition-colors"
              id="increase-scale-btn"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="grid grid-cols-3 gap-2" id="meal-tab-buttons-container">
        {mealTypes.map(({ key, label, icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`py-3 px-3 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-semibold tracking-wide border transition-all ${
                isActive 
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                  : "bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-350"
              }`}
              id={`meal-tab-btn-${key}`}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-center">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Meal Showcase */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col lg:flex-row gap-6 mt-2"
          id={`active-meal-detail-${activeTab}`}
        >
          {/* Meal Intro Block */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                {activeTab} Selection
              </span>
              <h4 className="text-xl font-bold text-stone-900 mt-2 mb-3">
                {currentMeal.name}
              </h4>
              <p className="text-sm text-stone-600 leading-relaxed mb-6">
                {currentMeal.description}
              </p>
            </div>

            {/* Quick stats tags row */}
            <div className="grid grid-cols-3 gap-3 bg-stone-50 p-4 border border-stone-100 rounded-xl" id="meal-quick-stats-grid">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-stone-400" />
                <div>
                  <span className="block text-[10px] text-stone-400 uppercase font-semibold">Prep</span>
                  <span className="text-xs font-bold text-stone-700">{currentMeal.prepTime}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-stone-400" />
                <div>
                  <span className="block text-[10px] text-stone-400 uppercase font-semibold">Cook</span>
                  <span className="text-xs font-bold text-stone-700">{currentMeal.cookTime}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-stone-400" />
                <div>
                  <span className="block text-[10px] text-stone-400 uppercase font-semibold">Calories</span>
                  <span className="text-xs font-bold text-stone-700">{currentMeal.calories}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scaled Ingredients Checklist */}
          <div className="flex-1 bg-stone-50/40 rounded-xl p-5 border border-stone-100">
            <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Ingredients List</span>
              <span className="text-[10px] text-stone-500 font-normal">Check components to prep</span>
            </h5>
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1" id="meal-ingredients-checklist">
              {currentMeal.ingredients.map((ing, index) => {
                const scaledIng = scaleIngredient(ing, scalableMultiplier);
                const ingKey = `${activeTab}-${index}`;
                const isChecked = !!checkedIngredients[ingKey];
                return (
                  <div 
                    key={index}
                    onClick={() => toggleCheck(ingKey)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                      isChecked ? "bg-stone-100/70 opacity-60" : "bg-white hover:bg-stone-100/40"
                    }`}
                    id={`ingredient-item-${ingKey}`}
                  >
                    <div className={`w-4 h-4 mt-0.5 border rounded flex items-center justify-center transition-colors ${
                      isChecked 
                        ? "bg-emerald-600 border-emerald-600" 
                        : "border-stone-300"
                    }`}>
                      {isChecked && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                    </div>
                    <span className={`text-xs text-stone-700 ${isChecked ? "line-through text-stone-600" : ""}`}>
                      {scaledIng}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
