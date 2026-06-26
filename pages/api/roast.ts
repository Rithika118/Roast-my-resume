import type { NextApiRequest, NextApiResponse } from "next";
import {
  buildResumeRoastPrompt,
  getGeminiModel,
  isGeminiConfigured,
} from "../../lib/gemini";

function getFallback(resumeText: string) {
  return {
    overallSummary:
      "Resume received but AI service is not configured properly.",
    sections: [
      {
        sectionName: "System Note",
        critique:
          "Gemini API is not configured or failed to respond. Showing fallback response.",
        strengths: ["Your app is working end-to-end."],
        recommendations: ["Fix API key setup in environment variables."],
      },
    ],
    topFixes: [
      "Add valid GEMINI_API_KEY in .env.local and Vercel",
      "Redeploy after environment update",
      "Test API route again",
    ],
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const body = req.body;
    const resumeText =
      typeof body?.text === "string" ? body.text.trim() : "";

    if (!resumeText) {
      return res.status(400).json({ error: "Resume text is required" });
    }

    const model = getGeminiModel();

    if (!isGeminiConfigured() || !model) {
      return res.status(500).json(getFallback(resumeText));
    }

    const prompt = buildResumeRoastPrompt(resumeText);

    const result = await model.generateContent(prompt);

    let rawText = result.response.text().trim();

    // ⚠️ Gemini sometimes returns ```json ... ```
    rawText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      console.error("JSON parse error:", rawText);
      return res.status(502).json({
        error: "Invalid JSON from Gemini",
        raw: rawText,
      });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("API failed:", error);
    return res.status(500).json(getFallback(""));
  }
}
