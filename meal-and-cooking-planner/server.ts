import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON parser limit
app.use(express.json({ limit: "10mb" }));

// Initialize Gemini client with proper telemetry header instruction
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("WARNING: GEMINI_API_KEY is not set or using placeholder.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Define structured response schema using @google/genai Type enum
const mealSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Name of the dish" },
    description: { type: Type.STRING, description: "Short appetizing description" },
    prepTime: { type: Type.STRING, description: "Prep time, e.g. '10 mins'" },
    cookTime: { type: Type.STRING, description: "Cook time, e.g. '15 mins'" },
    calories: { type: Type.STRING, description: "Estimated calories per serving" },
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Ingredients list with scaled quantities for household size"
    }
  },
  required: ["name", "description", "prepTime", "cookTime", "calories", "ingredients"]
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    meals: {
      type: Type.OBJECT,
      properties: {
        breakfast: mealSchema,
        lunch: mealSchema,
        dinner: mealSchema
      },
      required: ["breakfast", "lunch", "dinner"]
    },
    groceryList: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING, description: "Name of the ingredient" },
          quantity: { type: Type.STRING, description: "Amount needed, e.g. '500g' or '3 units'" },
          category: { type: Type.STRING, description: "Supermarket aisle/category, e.g., Produce, Dairy, Pantry" },
          estimatedCost: { type: Type.NUMBER, description: "Estimated cost in USD (numeric)" },
          essential: { type: Type.BOOLEAN, description: "Whether this ingredient is essential or could be skipped/substituted to save money" }
        },
        required: ["item", "quantity", "category", "estimatedCost", "essential"]
      }
    },
    substitutions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          originalItem: { type: Type.STRING, description: "Original ingredient to substitute" },
          substituteItem: { type: Type.STRING, description: "Recommended replacement" },
          reason: { type: Type.STRING, description: "Why this substitution works (diet, cost or allergy reason)" },
          costDiff: { type: Type.NUMBER, description: "Estimated price change in USD, negative is cheaper (e.g. -1.50 means it saves $1.50)" }
        },
        required: ["originalItem", "substituteItem", "reason", "costDiff"]
      }
    },
    budgetFeasibility: {
      type: Type.OBJECT,
      properties: {
        totalEstimatedCost: { type: Type.NUMBER, description: "Sum of all essential grocery items in USD" },
        budgetStatus: {
          type: Type.STRING,
          description: "Must be exactly one of: 'under_budget', 'on_budget', 'over_budget'"
        },
        analysis: { type: Type.STRING, description: "Explanation of how feasible this plan is with the budget, or how the schedule impacted the choices" },
        savingsTips: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Smart shopping strategies or batch tips"
        }
      },
      required: ["totalEstimatedCost", "budgetStatus", "analysis", "savingsTips"]
    },
    cookingTodoList: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          timeSlot: { type: Type.STRING, description: "Specific chronological time slot block, e.g., '07:30 AM', '12:00 PM', '06:30 PM'" },
          task: { type: Type.STRING, description: "Actionable culinary task name" },
          description: { type: Type.STRING, description: "What to do, incorporating schedule context (e.g., prep now because dinner requires slow cooking)" },
          durationMin: { type: Type.NUMBER, description: "Vibe duration in minutes" },
          priority: {
            type: Type.STRING,
            description: "Task priority, must be exactly one of: 'high', 'medium', 'low'"
          }
        },
        required: ["timeSlot", "task", "description", "durationMin", "priority"]
      }
    }
  },
  required: ["meals", "groceryList", "substitutions", "budgetFeasibility", "cookingTodoList"]
};

// API Endpoint to generate a tailored meal and cooking plan
app.post("/api/generate", async (req, res) => {
  try {
    const {
      dietaryPreference,
      allergies = [],
      budgetLimit,
      cookingSkill,
      dailySchedule,
      householdSize = 1,
    } = req.body;

    if (!budgetLimit || isNaN(Number(budgetLimit))) {
      return res.status(400).json({ error: "A valid budget limit is required." });
    }

    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      return res.status(500).json({
        error: "Missing API Key",
        details: "Please add your Gemini API Key in the Settings > Secrets panel of Google AI Studio.",
        isConfigError: true
      });
    }

    const prompt = `
      You are a world-class culinary planner and budget optimizer.
      Generate a customized daily chef meal plan, matched grocery list, smart client substitutions, budget safety analysis, and a highly streamlined, realistic chronological culinary to-do list based on these parameters:
      
      - Dietary Preference: ${dietaryPreference || "None / Standard"}
      - Allergies to Strictly Exclude: ${allergies.length > 0 ? allergies.join(", ") : "None"}
      - Maximum Daily Budget Limit: $${budgetLimit} USD
      - User Cooking Level: ${cookingSkill || "intermediate"}
      - Household size (scale quantities for this number of people): ${householdSize} people
      - User's Daily Schedule/Mental State: "${dailySchedule || "Balanced workday"}"
      
      RULES FOR BEST OUTCOMES:
      1. Meal choices MUST reflect the user's daily schedule/mental state. If they are extremely busy, don't demand complex culinary techniques or long simmer times during core hours. Set breakfast and lunch to quick-assembly, and outline structural preparation tasks (like pre-chopping or quick prep) at optimal times in the Chronological Cooking To-Do List.
      2. Budget Safety: Estimate realistic US grocery costs. Total essential groceries MUST be calculated accurately. If the total is close to or over the limit, provide budget-friendly substitutions (e.g., using cheaper seasonal vegetables, non-branded basics, dry beans instead of canned, or chicken thighs instead of breasts) and explain how they save money.
      3. Strict Allergies: Do NOT include any ingredient matching of user's allergies in any meal list.
      4. Accurate status: check if the total cost of all grocery list essentials is strictly less than, equal to, or greater than the user's budgetLimit ($${budgetLimit}) and set 'budgetStatus' to 'under_budget', 'on_budget', or 'over_budget' accordingly.
      
      Let's build a delightful, seamless schedule for the user!
    `;

    console.log("Calling Gemini API...");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // low temperature for precise budget reasoning and structured layout
        systemInstruction: "You are a professional culinary AI assistant designed to generate structured nutrition and culinary workflow plans. Strictly output JSON matching the provided schema."
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty response received from the AI model.");
    }

    const resultData = JSON.parse(textOutput.trim());
    return res.json(resultData);
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return res.status(500).json({
      error: "Failed to generate meal plan.",
      details: error.message || String(error)
    });
  }
});

// Setup Vite development server or production assets serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production static assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started successfully. Running on http://localhost:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to start Express-Vite backend:", err);
});
