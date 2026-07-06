import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Endpoint to handle the decision analysis
app.post("/api/decide", async (req, res) => {
  const { dilemma, options, context, weightPreferences } = req.body;

  if (!dilemma || !options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({
      error: "Invalid request. Please provide a dilemma and at least two options.",
    });
  }

  try {
    const ai = getAiClient();

    // Prepare prompt instruction
    const prompt = `
      Analyze the following decision-making dilemma and the provided options to help the user make an informed decision.
      
      Dilemma: "${dilemma}"
      Options to analyze: ${options.map(opt => `"${opt}"`).join(", ")}
      ${context ? `User-provided personal context/priorities: "${context}"` : ""}
      ${weightPreferences ? `User weight preferences: ${JSON.stringify(weightPreferences)}` : ""}

      Please generate:
      1. A detailed Pros & Cons list for each option, including individual weights (1-5), impact levels (high, medium, low), and categories (e.g., Financial, Personal, Career, Happiness).
      2. A SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for each option.
      3. A side-by-side comparison table matrix with key criteria (e.g., cost, effort, stress, happiness) and ratings/descriptions for each option.
      4. A weighted Verdict recommending the best option, a matching score percentage, a detailed explanatory summary, and a provocative "Devil's Advocate" argument challenging the decision to avoid confirmation bias.
    `;

    // Request structured JSON response matching the DecisionResult schema
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert strategic advisor, executive decision coach, and master of analytical objectivity. Your goal is to dissect the user's choices with rigorous logic, balancing short-term and long-term implications, risk management, and human happiness. Do not make up facts; align with the user's context. Always output strictly valid JSON conforming exactly to the response schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: {
              type: Type.OBJECT,
              properties: {
                recommendedOption: {
                  type: Type.STRING,
                  description: "The name of the recommended option, which must be exactly one of the provided options.",
                },
                matchScore: {
                  type: Type.INTEGER,
                  description: "An overall matching score percentage (0-100) reflecting how well this option fits user criteria.",
                },
                analysisText: {
                  type: Type.STRING,
                  description: "A comprehensive, highly polished strategic explanation summarizing the pros/cons and context-fit that led to this choice.",
                },
                devilsAdvocate: {
                  type: Type.STRING,
                  description: "A compelling, critical counter-argument challenging the leading choice. Push the user to question their assumptions or see the hidden risks of this choice.",
                },
              },
              required: ["recommendedOption", "matchScore", "analysisText", "devilsAdvocate"],
            },
            optionsAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  optionName: {
                    type: Type.STRING,
                    description: "The exact name of this option.",
                  },
                  pros: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING, description: "A concise pro point." },
                        impact: {
                          type: Type.STRING,
                          enum: ["high", "medium", "low"],
                          description: "Visual weight / importance of this pro.",
                        },
                        score: {
                          type: Type.INTEGER,
                          description: "Score from 1 (minor pro) to 5 (massive game-changing pro).",
                        },
                        category: {
                          type: Type.STRING,
                          description: "E.g., Career, Financial, Personal, Wellness, Time.",
                        },
                      },
                      required: ["text", "impact", "score", "category"],
                    },
                  },
                  cons: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING, description: "A concise con point." },
                        impact: {
                          type: Type.STRING,
                          enum: ["high", "medium", "low"],
                          description: "Visual weight / severity of this con.",
                        },
                        score: {
                          type: Type.INTEGER,
                          description: "Score from 1 (minor annoyance) to 5 (major risk/con).",
                        },
                        category: {
                          type: Type.STRING,
                          description: "E.g., Career, Financial, Personal, Wellness, Time.",
                        },
                      },
                      required: ["text", "impact", "score", "category"],
                    },
                  },
                  swot: {
                    type: Type.OBJECT,
                    properties: {
                      strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Strengths (Internal positives)." },
                      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Weaknesses (Internal negatives)." },
                      opportunities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Opportunities (External positives)." },
                      threats: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Threats (External negatives)." },
                    },
                    required: ["strengths", "weaknesses", "opportunities", "threats"],
                  },
                },
                required: ["optionName", "pros", "cons", "swot"],
              },
            },
            comparisonCriteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterion: {
                    type: Type.STRING,
                    description: "A dimension of comparison (e.g. Stress Level, Cost/Expense, Joy & Fun, Long-term Value).",
                  },
                  ratings: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        optionName: { type: Type.STRING, description: "Name of the option." },
                        rating: { type: Type.INTEGER, description: "1 to 5 score for this criterion (5 is best/most positive, 1 is worst/most negative)." },
                        description: { type: Type.STRING, description: "Brief justification for this score." },
                      },
                      required: ["optionName", "rating", "description"],
                    },
                  },
                },
                required: ["criterion", "ratings"],
              },
            },
          },
          required: ["verdict", "optionsAnalysis", "comparisonCriteria"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from the Gemini model.");
    }

    const decisionResult = JSON.parse(text.trim());
    return res.json(decisionResult);
  } catch (error: any) {
    console.error("Gemini API decision analysis error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during decision analysis.",
    });
  }
});

async function startServer() {
  // Integrate Vite for dev, serve static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
