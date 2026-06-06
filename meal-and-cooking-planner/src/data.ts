import { PlanGenerationResult } from './types';

export const SampleMealPlan: PlanGenerationResult = {
  meals: {
    breakfast: {
      name: "Smashed Avocado & Protein Feta Toast",
      description: "Creamy mashed hash-avocado spread over warm toasted artisanal sourdough bread, topped with mineral organic Greek feta crumbles, red chili flakes, and custom pumpkin seeds for slow-burning energy.",
      prepTime: "5 mins",
      cookTime: "5 mins",
      calories: "380 kcal",
      ingredients: ["1 Slice Sourdough Bread", "0.5 Ripened Hass Avocado", "30g Organic Feta Cheese", "1 tsp Red Chili Pepper Flakes", "1 tbsp Toasted Pumpkin Seeds", "1 Lemon wedge"]
    },
    lunch: {
      name: "Crispy Roasted Chickpea & Lemon-Tahini Salad",
      description: "An incredibly fast, high-fiber workday powerhouse. Oven-crisped chickpeas tossed with garden cucumbers, diced cherry tomatoes, fresh baby kale, and drizzled with a velvety lemon zest and organic tahini dressing.",
      prepTime: "10 mins",
      cookTime: "12 mins",
      calories: "510 kcal",
      ingredients: ["200g Cooked Chickpeas", "2 cups Chopped Kale", "100g Halved Cherry Tomatoes", "0.5 English Cucumber", "2 tbsp Premium Tahini Paste", "1 Lemon", "1 tbsp Olive Oil"]
    },
    dinner: {
      name: "Seared Lemon Herb Salmon with Quinoa & Asparagus",
      description: "A gorgeous, antioxidant-rich evening entree. Wild-caught ocean salmon fillet pan-seared with fresh rosemary in olive oil, served over fluffy vegetable quinoa and snappy sautéed green asparagus tips.",
      prepTime: "10 mins",
      cookTime: "15 mins",
      calories: "620 kcal",
      ingredients: ["1 Wild Salmon Fillet (180g)", "0.5 cup Tricolor Quinoa", "150g Fresh Asparagus tips", "2 Garlic cloves", "1.5 tbsp Cold-Pressed Olive Oil", "Fresh Rosemary sprig"]
    }
  },
  groceryList: [
    { item: "Wild Salmon Fillet", quantity: "1 Portion (180g)", category: "Seafood & Protein", estimatedCost: 12.50, essential: true },
    { item: "Organic Feta Cheese", quantity: "1 tub (150g)", category: "Dairy & Cheese", estimatedCost: 3.80, essential: false },
    { item: "Ripened Hass Avocado", quantity: "2 units", category: "Produce", estimatedCost: 2.20, essential: true },
    { item: "Sourdough Bread Loaf", quantity: "1 loaf", category: "Bakery", estimatedCost: 4.50, essential: true },
    { item: "Organic Tricolor Quinoa", quantity: "1 box (500g)", category: "Grains & Pantry", estimatedCost: 3.90, essential: true },
    { item: "Canned Butter Chickpeas", quantity: "1 can (400g)", category: "Pantry Cans", estimatedCost: 1.20, essential: true },
    { item: "Velvety Sesame Tahini", quantity: "1 jar", category: "Pantry Dressings", estimatedCost: 4.80, essential: true },
    { item: "Fresh Garden Kale & Cucumbers", quantity: "1 bundle", category: "Produce", estimatedCost: 3.00, essential: true },
    { item: "Fresh Asparagus spears", quantity: "1 bunch", category: "Produce", estimatedCost: 3.50, essential: false },
    { item: "Ocean Cherry Tomatoes", quantity: "1 pint", category: "Produce", estimatedCost: 2.50, essential: true }
  ],
  substitutions: [
    {
      originalItem: "Wild Salmon Fillet",
      substituteItem: "Organic Firm Tofu Block",
      reason: "To save on premium seafood costs or customize for plant-based requests.",
      costDiff: -9.00
    },
    {
      originalItem: "Fresh Asparagus spears",
      substituteItem: "Crispy Asparagus Beans / Frozen Broccoli Florette",
      reason: "Asparagus is a seasonal luxury; broccoli is incredibly affordable and matches fibers.",
      costDiff: -2.00
    },
    {
      originalItem: "Organic Feta Cheese",
      substituteItem: "Skip Feta Supplement",
      reason: "Flexible item; skipping it entirely saves budget while main toast energy remains high.",
      costDiff: -3.80
    }
  ],
  budgetFeasibility: {
    totalEstimatedCost: 42.40,
    budgetStatus: "under_budget",
    analysis: "Excellent balance! Your meal plan uses seasonal luxury ingredients like wild salmon and fresh asparagus but offsets them with economical pantry pillars like quinoa and canned chickpeas. Overall, the meal plan is nutritious and satisfies your target limit.",
    savingsTips: [
      "Buy tricolor quinoa in bulk bins to shave off 30% packaging markup.",
      "Opt for frozen salmon portions if fresh wild fillets are out of premium seasons.",
      "Store avocado halves face-down in lemon zest water to prevent micro-browning."
    ]
  },
  cookingTodoList: [
    {
      timeSlot: "08:15 AM",
      task: "Morning Toast Assembly",
      description: "Toast sourdough bread, smash avocado with lemon juice, and lay feta crumbles with chili garnish.",
      durationMin: 7,
      priority: "medium"
    },
    {
      timeSlot: "12:10 PM",
      task: "Workday Quick Salad Mix",
      description: "Drain chickpeas, chop fresh kale, cucumber and halving cherry tomatoes. Shake tahini paste and lemon juice with water for quick emulsion, then toss together.",
      durationMin: 12,
      priority: "high"
    },
    {
      timeSlot: "05:30 PM",
      task: "Prep Evening Quinoa Cook",
      description: "Rinse tricolor quinoa under running water to clear bitter saponins. Bring to boil and simmer for 15 minutes in salted water.",
      durationMin: 5,
      priority: "low"
    },
    {
      timeSlot: "06:15 PM",
      task: "Pan-Sear Salmon fillet & Greens",
      description: "Dry wild salmon skin with towels, season. Sear skin-down for 4 minutes in hot olive oil, add rosemary and garlic cloves. Sauté snappy asparagus alongside during last minutes.",
      durationMin: 15,
      priority: "high"
    }
  ]
};
