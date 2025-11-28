import { GoogleGenAI } from "@google/genai";
import { ExperimentRecord } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found via process.env.API_KEY");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateLabReport = async (record: ExperimentRecord): Promise<string> => {
  const ai = createClient();
  if (!ai) return "Error: API Key is missing. Please configure the environment.";

  const prompt = `
    You are a Physics Laboratory Assistant. Analyze the following Trifilar Pendulum experiment data:

    Parameters:
    - Disk Mass (m0): ${record.m0} kg
    - Object Mass (m1): ${record.m1} kg
    - Suspension Radius on Disk (R): ${record.R} m
    - Suspension Radius on Top (r): ${record.r} m
    - Vertical Height (H): ${record.H} m
    
    Measurements:
    - Period Empty (T0): ${record.T0} s
    - Period with Object (T1): ${record.T1} s

    Calculated Results:
    - Moment of Inertia (Disk I0): ${record.calculatedI0.toFixed(6)} kg·m²
    - Moment of Inertia (Object I1): ${record.calculatedI1.toFixed(6)} kg·m²

    Please provide a brief lab report including:
    1. Validation of the results (Are they physically reasonable for a typical lab setup?).
    2. Potential sources of error in this specific setup (mention air resistance, wire length uncertainty, small angle approximation).
    3. A brief conclusion on the relationship between Period (T) and Moment of Inertia (I).
    
    Keep the tone academic but concise. Format as Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate report. Please check your network or API key.";
  }
};

export const askPhysicsQuestion = async (question: string): Promise<string> => {
  const ai = createClient();
  if (!ai) return "Error: API Key is missing.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Context: Trifilar Pendulum Experiment (Three-line pendulum). Question: ${question}. Keep answer under 100 words.`,
    });
    return response.text || "No answer.";
  } catch (error) {
    return "Error fetching answer.";
  }
};