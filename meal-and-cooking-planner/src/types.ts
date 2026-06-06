export interface Meal {
  name: string;
  description: string;
  prepTime: string;
  cookTime: string;
  calories: string;
  ingredients: string[];
}

export interface MealPlan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

export interface GroceryItem {
  item: string;
  quantity: string;
  category: string;
  estimatedCost: number;
  essential: boolean;
}

export interface Substitution {
  originalItem: string;
  substituteItem: string;
  reason: string;
  costDiff: number; // positive if substitute is more expensive, negative if cheaper
}

export interface BudgetFeasibility {
  totalEstimatedCost: number;
  budgetStatus: 'under_budget' | 'on_budget' | 'over_budget';
  analysis: string;
  savingsTips: string[];
}

export interface CookingTodoTask {
  timeSlot: string;
  task: string;
  description: string;
  durationMin: number;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
}

export interface PlanGenerationResult {
  meals: MealPlan;
  groceryList: GroceryItem[];
  substitutions: Substitution[];
  budgetFeasibility: BudgetFeasibility;
  cookingTodoList: CookingTodoTask[];
}

export interface UserPreferences {
  dietaryPreference: string;
  allergies: string[];
  budgetLimit: number;
  cookingSkill: 'beginner' | 'intermediate' | 'advanced';
  dailySchedule: string; // e.g., "Very busy - 12h workday", "Work from home - flexible", "Relaxed weekend"
  householdSize: number;
}
