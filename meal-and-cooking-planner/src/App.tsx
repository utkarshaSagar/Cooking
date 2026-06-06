import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Sparkles, 
  RotateCcw, 
  FileText, 
  HelpCircle, 
  Settings, 
  AlertCircle,
  TrendingDown,
  Lock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PlanGenerationResult, UserPreferences } from './types';
import { SampleMealPlan } from './data';

// Component imports
import BudgetSummary from './components/BudgetSummary';
import MealList from './components/MealList';
import GroceryList from './components/GroceryList';
import CookingTodoList from './components/CookingTodoList';

export default function App() {
  // Main state setup
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietaryPreference: 'Standard / Balanced',
    allergies: [],
    budgetLimit: 40,
    cookingSkill: 'intermediate',
    dailySchedule: 'Work from home - flexible intervals',
    householdSize: 2
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PlanGenerationResult | null>(null);
  const [errorStatus, setErrorStatus] = useState<{ message: string; details?: string; isConfigError?: boolean } | null>(null);
  const [appliedSwaps, setAppliedSwaps] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'mealflow' | 'shopping' | 'timeline'>('mealflow');

  // Load a initial welcome preview using our gorgeous Sample Meal Plan
  // This explicitly prevents the user from seeing an empty page ("why is there no preview?")
  useEffect(() => {
    // We preload with sample plan to greet the user with an immediately useful, interactive view!
    setResult(JSON.parse(JSON.stringify(SampleMealPlan)));
  }, []);

  // Common Allergies Checklist Options
  const allergyList = [
    { id: 'nuts', label: 'Peanuts/Nuts' },
    { id: 'dairy', label: 'Dairy Product' },
    { id: 'gluten', label: 'Gluten/Wheat' },
    { id: 'seafood', label: 'Seafood/Shellfish' },
    { id: 'eggs', label: 'Organic Eggs' },
    { id: 'soy', label: 'Soy/Tofu' }
  ];

  // Dietary Profiles Presets for instant user clicks
  const dietPresets = [
    { name: 'Standard / Balanced', emoji: '🍽️' },
    { name: 'High Protein Active', emoji: '🥩' },
    { name: 'Vegetarian Fresh', emoji: '🥦' },
    { name: 'Strict Vegan', emoji: '🌱' },
    { name: 'Mediterranean Diet', emoji: '🍋' },
    { name: 'Low Carb Keto-friendly', emoji: '🥑' }
  ];

  // Daily Schedule / Vibes Presets to tailor the chronological kitchen timeline
  const schedulePresets = [
    { name: 'Super Busy Day (12h work desk schedule, need quick meals)', id: 'busy' },
    { name: 'Work from home - flexible intervals (can do light checked cook)', id: 'wfh' },
    { name: 'Relaxed schedule (calm sunday prepping, enjoy multiple steps)', id: 'relaxed' },
    { name: 'Commuter / Outdoor routine (easy portable lunchboxes, batching)', id: 'commute' }
  ];

  const handleAllergyToggle = (allergyLabel: string) => {
    setPreferences(prev => {
      const exists = prev.allergies.includes(allergyLabel);
      return {
        ...prev,
        allergies: exists 
          ? prev.allergies.filter(item => item !== allergyLabel)
          : [...prev.allergies, allergyLabel]
      };
    });
  };

  const handleGeneratePlan = async (e?: React.FormEvent, forceSample = false) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorStatus(null);
    setAppliedSwaps({});

    if (forceSample) {
      // Simulate slightly for smooth UI transitions
      setTimeout(() => {
        setResult(JSON.parse(JSON.stringify(SampleMealPlan)));
        setPreferences(prev => ({ ...prev, budgetLimit: 40, householdSize: 2, dailySchedule: 'Work from home - flexible intervals' }));
        setIsLoading(false);
      }, 750);
      return;
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to communicate with AI planner.', {
          cause: data
        });
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      const isConfigError = err.cause?.isConfigError || false;
      setErrorStatus({
        message: err.message || 'An unexpected error occurred during cookbook generation.',
        details: err.cause?.details || 'Please verify network signals and standard parameters.',
        isConfigError
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Interactive Swap handler directly updating state in real-time
  const handleSwapApplied = (original: string, substitute: string, costDifference: number) => {
    if (!result) return;

    // Track active swaps
    setAppliedSwaps(prev => ({
      ...prev,
      [original]: substitute
    }));

    // Clone result to update budget and recipes in place!
    const updatedResult = { ...result };
    
    // 1. Deduct cost difference
    updatedResult.budgetFeasibility.totalEstimatedCost = Math.max(
      0, 
      updatedResult.budgetFeasibility.totalEstimatedCost + costDifference
    );

    // 2. Adjust budgetStatus if it makes them under budget now!
    if (updatedResult.budgetFeasibility.totalEstimatedCost <= preferences.budgetLimit) {
      updatedResult.budgetFeasibility.budgetStatus = 'under_budget';
    }

    // 3. Swap inside the meal ingredients list visually so recipe cards reflect the swap!
    const swapInIngredients = (ingredients: string[]) => {
      return ingredients.map(ing => {
        if (ing.toLowerCase().includes(original.toLowerCase())) {
          return ing.replace(new RegExp(original, 'gi'), substitute);
        }
        return ing;
      });
    };

    updatedResult.meals.breakfast.ingredients = swapInIngredients(updatedResult.meals.breakfast.ingredients);
    updatedResult.meals.lunch.ingredients = swapInIngredients(updatedResult.meals.lunch.ingredients);
    updatedResult.meals.dinner.ingredients = swapInIngredients(updatedResult.meals.dinner.ingredients);

    setResult(updatedResult);
  };

  // Allow adjusting the budget limit slider live
  const handleAdjustBudgetLimit = (newLimit: number) => {
    setPreferences(prev => ({ ...prev, budgetLimit: newLimit }));
    
    // Dynamically update status gauge in real-time based on new constraint!
    if (result) {
      const updatedResult = { ...result };
      const currentCost = updatedResult.budgetFeasibility.totalEstimatedCost;
      if (currentCost > newLimit) {
        updatedResult.budgetFeasibility.budgetStatus = 'over_budget';
      } else if (currentCost === newLimit) {
        updatedResult.budgetFeasibility.budgetStatus = 'on_budget';
      } else {
        updatedResult.budgetFeasibility.budgetStatus = 'under_budget';
      }
      setResult(updatedResult);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-emerald-100 selection:text-emerald-950 pb-16">
      
      {/* Elegantly minimal, non-slop header anchor */}
      <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 py-3.5 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center" id="header-bar-container">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 text-white p-2 rounded-xl flex items-center justify-center shadow-sm">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight font-display text-stone-950 sm:text-base">PortionPrep AI</h1>
              <span className="text-[10px] text-stone-500 font-medium tracking-wide border-l border-stone-200 pl-2 block sm:inline sm:border-l-0 sm:pl-0">Promptwars Challenge Special Edition</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <a 
              href="https://ai.studio/build" 
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors hidden sm:block"
            >
              Google AI Studio
            </a>
            <span className="text-xs text-stone-300 hidden sm:block">|</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Active Server Proxy
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input form configs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 space-y-6" id="input-preferences-pane">
            <div>
              <h2 className="text-base font-extrabold text-stone-950 font-display flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-stone-400" />
                Customize Daily Parameters
              </h2>
              <p className="text-xs text-stone-505 leading-relaxed mt-1">
                Configure your diet, schedule, and portion sizing. PortionPrep AI custom-aligns the kitchen timeline so prep tasks suit your availability.
              </p>
            </div>

            <form onSubmit={(e) => handleGeneratePlan(e, false)} className="space-y-5" id="planner-form">
              {/* Portion Portions size & Household count */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Household portions
                  </label>
                  <div className="flex items-center gap-2 bg-stone-50 border border-stone-150 p-1.5 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => setPreferences(prev => ({ ...prev, householdSize: Math.max(1, prev.householdSize - 1) }))}
                      className="w-8 h-8 rounded-lg bg-white shadow-sm border border-stone-200 text-stone-800 flex items-center justify-center font-bold hover:bg-stone-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-stone-900 flex-1 text-center">{preferences.householdSize} pax</span>
                    <button 
                      type="button"
                      onClick={() => setPreferences(prev => ({ ...prev, householdSize: Math.min(10, prev.householdSize + 1) }))}
                      className="w-8 h-8 rounded-lg bg-white shadow-sm border border-stone-200 text-stone-800 flex items-center justify-center font-bold hover:bg-stone-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Skill Selector */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Kitchen skill
                  </label>
                  <select 
                    value={preferences.cookingSkill}
                    onChange={(e) => setPreferences(prev => ({ ...prev, cookingSkill: e.target.value as any }))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  >
                    <option value="beginner">🍳 Beginner</option>
                    <option value="intermediate">🔪 Intermediate</option>
                    <option value="advanced">🔥 Chef Professional</option>
                  </select>
                </div>
              </div>

              {/* Target Limit Budget slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Maximum daily budget
                  </label>
                  <span className="text-sm font-extrabold text-stone-950 font-mono">${preferences.budgetLimit} USD</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-stone-400">$10</span>
                  <input 
                    type="range" 
                    min="15" 
                    max="100" 
                    step="5"
                    value={preferences.budgetLimit}
                    onChange={(e) => setPreferences(prev => ({ ...prev, budgetLimit: Number(e.target.value) }))}
                    className="flex-1 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <span className="text-xs font-mono text-stone-400">$100</span>
                </div>
              </div>

              {/* Dietary Presets grids */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
                  Dietary profile
                </label>
                <div className="grid grid-cols-2 gap-2" id="diet-presets-container">
                  {dietPresets.map(({ name, emoji }) => {
                    const isSelected = preferences.dietaryPreference === name;
                    return (
                      <button
                        type="button"
                        key={name}
                        onClick={() => setPreferences(prev => ({ ...prev, dietaryPreference: name }))}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected 
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                            : "bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300"
                        }`}
                        id={`diet-preset-btn-${name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <span className="text-sm">{emoji}</span>
                        <span className="text-[11px] font-bold truncate leading-none">{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Daily Schedule Tailoring */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Daily Vibe & Schedule
                </label>
                <div className="space-y-2" id="schedule-presets-container">
                  {schedulePresets.map((sc) => {
                    const isSelected = preferences.dailySchedule === sc.name;
                    return (
                      <div
                        key={sc.id}
                        onClick={() => setPreferences(prev => ({ ...prev, dailySchedule: sc.name }))}
                        className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-emerald-50 text-emerald-950 border-emerald-400" 
                            : "bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? "border-emerald-600 bg-emerald-600" : "border-stone-400"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-[11px] font-semibold leading-normal">{sc.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Exclusion Allergies */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Precautionary Allergies (Excluded entirely)
                </label>
                <div className="flex flex-wrap gap-1.5" id="allergies-badge-selector">
                  {allergyList.map((al) => {
                    const isExcluded = preferences.allergies.includes(al.label);
                    return (
                      <button
                        type="button"
                        key={al.id}
                        onClick={() => handleAllergyToggle(al.label)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                          isExcluded 
                            ? "bg-rose-50 text-rose-800 border-rose-300" 
                            : "bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-305"
                        }`}
                        id={`allergy-toggle-btn-${al.id}`}
                      >
                        {isExcluded ? "✕ " : "+ "}
                        {al.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Generation CTA buttons */}
              <div className="pt-3 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs tracking-wider uppercase transition-all shadow-[0_2px_10px_rgba(16,185,129,0.2)] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  id="submit-plan-generation-btn"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                      <span>Optimizing recipe databases...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-100" />
                      <span>Generate Smart Customized Flow</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleGeneratePlan(undefined, true)}
                  disabled={isLoading}
                  className="w-full bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  id="load-sample-cookbook-btn"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset / Load Interactive Sample Data</span>
                </button>
              </div>
            </form>
          </div>

          {/* Secure details card */}
          <div className="bg-stone-100/70 border border-stone-200 rounded-2xl p-4 flex gap-3 items-start" id="security-assurance-box">
            <Lock className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-[11px] font-extrabold text-stone-700 uppercase tracking-widest leading-none">Security Preserved</h4>
              <p className="text-[10px] text-stone-500 leading-normal">
                Your AI-Powered meal workflow does not expose secrets. All requests are proxied securely server-side inside Cloud sandbox environments.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Results viewport */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Error Alert Box */}
          {errorStatus && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-stone-900 text-white rounded-2xl p-6 border border-stone-800 space-y-4"
              id="error-config-prompt-alert"
            >
              <div className="flex gap-3">
                <AlertCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm tracking-tight text-white">Full-Stack Porting Notice</h3>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {errorStatus.message}
                  </p>
                  {errorStatus.isConfigError && (
                    <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2 mt-3">
                      <p className="text-[11px] text-emerald-400 font-mono font-bold leading-normal">
                        To enable server-side cooking generation, follow these quick steps:
                      </p>
                      <ol className="text-[11px] text-stone-450 space-y-1.5 list-decimal pl-4 leading-relaxed">
                        <li>Locate the <strong>Settings</strong> menu in the Google AI Studio sidebar workspace.</li>
                        <li>Select <strong>Secrets</strong> inside the panels.</li>
                        <li>Add your <strong>GEMINI_API_KEY</strong> with its secret values.</li>
                        <li>The applet automatically synchronizes and loads secure queries on reload!</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleGeneratePlan(undefined, true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-4 py-2 rounded-lg transition-all"
                >
                  Load Interactive Sandbox Mode instead
                </button>
              </div>
            </motion.div>
          )}

          {/* Loading View */}
          {isLoading && !errorStatus && (
            <div className="bg-white rounded-2xl p-12 border border-stone-100 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-emerald-100 border-t-emerald-600 animate-spin rounded-full" />
                <ChefHat className="w-5 h-5 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-stone-900 font-display">Tuning portions & prices...</h3>
                <p className="text-xs text-stone-450 max-w-sm">
                  Gemini is cross-referencing protein macros, calculating grocery total pricing multipliers, and configuring your timeline prep times perfectly.
                </p>
              </div>
            </div>
          )}

          {/* Content Presenter */}
          {!isLoading && result && (
            <div className="space-y-6">
              
              {/* Dynamic Budget gauge summary */}
              <BudgetSummary 
                feasibility={result.budgetFeasibility} 
                limit={preferences.budgetLimit}
                onAdjustLimit={handleAdjustBudgetLimit}
              />

              {/* Mini results navigation bar */}
              <div className="flex bg-white p-1 rounded-xl border border-stone-200" id="results-view-tabs">
                <button
                  onClick={() => setActiveTab('mealflow')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'mealflow' 
                      ? "bg-stone-105 text-stone-900 font-bold bg-stone-100" 
                      : "text-stone-500 hover:text-stone-850"
                  }`}
                >
                  🍳 Meal Flow
                </button>
                <button
                  onClick={() => setActiveTab('shopping')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'shopping' 
                      ? "bg-stone-105 text-stone-900 font-bold bg-stone-100" 
                      : "text-stone-500 hover:text-stone-850"
                  }`}
                >
                  🛒 Grocery Checklist
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'timeline' 
                      ? "bg-stone-105 text-stone-900 font-bold bg-stone-100" 
                      : "text-stone-500 hover:text-stone-850"
                  }`}
                >
                  🕒 Prep Timelines
                </button>
              </div>

              {/* Conditional viewport render */}
              <div id="results-viewport">
                {activeTab === 'mealflow' && (
                  <MealList 
                    meals={result.meals} 
                    householdSize={preferences.householdSize} 
                  />
                )}
                {activeTab === 'shopping' && (
                  <GroceryList 
                    groceryList={result.groceryList} 
                    substitutions={result.substitutions}
                    onSwapApplied={handleSwapApplied}
                    appliedSwaps={appliedSwaps}
                  />
                )}
                {activeTab === 'timeline' && (
                  <CookingTodoList 
                    todoList={result.cookingTodoList} 
                    scheduleName={preferences.dailySchedule}
                  />
                )}
              </div>

            </div>
          )}

          {/* Quick empty screen help (if user resets selection completely) */}
          {!isLoading && !result && !errorStatus && (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-100 min-h-[400px] flex flex-col justify-center items-center space-y-3">
              <ChefHat className="w-10 h-10 text-stone-300" />
              <h3 className="text-base font-bold text-stone-900 font-display">No plan generated yet</h3>
              <p className="text-xs text-stone-450 max-w-xs leading-relaxed">
                Choose your diet profiles, target budgets, and allergies to generate a cohesive cooking schedule!
              </p>
              <button
                onClick={() => handleGeneratePlan(undefined, true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs mt-2"
              >
                Load Interactive Preview
              </button>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
