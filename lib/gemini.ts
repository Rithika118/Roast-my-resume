import { GoogleGenerativeAI } from "@google/generative-ai";

export const GEMINI_MODEL = "gemini-2.5-flash";

function getApiKey() {
  return process.env.GEMINI_API_KEY;
}

export function isGeminiConfigured() {
  return Boolean(getApiKey());
}

export function getGeminiModel() {
  const apiKey = getApiKey();

  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
  });
}

export function buildResumeRoastPrompt(resumeText: string): string {
  return `
You are a brutal but constructive career coach.

Analyze the resume.

Return ONLY valid JSON.

{
  "overallSummary":"",
  "sections":[
    {
      "sectionName":"",
      "critique":"",
      "strengths":[],
      "recommendations":[]
    }
  ],
  "topFixes":["","",""]
}

Resume:

${resumeText}
`;
}
