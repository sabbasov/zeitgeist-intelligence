
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "./types";

/**
 * Analyzes communication logs using Gemini 3 Flash.
 * Initializes the AI client inside the function to ensure it uses the latest environment configuration.
 */
export const analyzeChatLogs = async (logs: string): Promise<AnalysisResult> => {
  // Always use this initialization pattern for robustness.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following communication logs and extract:
    1. PULSE: A high-level mood and momentum summary.
    2. BLOCKERS: Specific friction points. Assign each an 'impact' weight (0-100). CRITICAL: The sum of all blocker impacts MUST equal exactly 100.
    3. ACTION PLAN: Concrete, executable next steps.
    
    Logs: ${logs}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pulse: {
            type: Type.STRING,
            description: "A short, punchy summary of current momentum.",
          },
          blockers: {
            type: Type.ARRAY,
            items: { 
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                impact: { type: Type.NUMBER, description: "Weighting of this blocker. Total sum across all blockers must be 100." }
              },
              required: ["text", "impact"]
            },
            description: "Blockers preventing progress.",
          },
          actionItems: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Specific next steps.",
          },
        },
        required: ["pulse", "blockers", "actionItems"],
      },
    },
  });

  // Extract the text content from the response and parse it.
  const text = response.text || "{}";
  return JSON.parse(text.trim()) as AnalysisResult;
};
