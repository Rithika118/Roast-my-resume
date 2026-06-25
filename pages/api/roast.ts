import type { NextApiRequest, NextApiResponse } from 'next';
import {
  CLAUDE_SONNET_MODEL,
  buildFallbackRoastResponse,
  buildResumeRoastPrompt,
  getAnthropicClient,
  isClaudeConfigured,
} from '../../lib/claude';

function getFallbackRoastResponse(resumeText: string) {
  if (typeof buildFallbackRoastResponse === 'function') {
    return buildFallbackRoastResponse(resumeText);
  }

  return {
    overallSummary: 'This resume needs sharper proof, cleaner bullet writing, and stronger outcomes to stand out.',
    sections: [
      {
        sectionName: 'Big picture',
        critique: 'The overall story is too vague and needs clearer value upfront.',
        strengths: ['You have enough content to build a strong narrative.'],
        recommendations: ['Lead with your strongest achievement.'],
      },
    ],
    topFixes: ['Strengthen your opening summary.', 'Make each bullet more specific and outcome-focused.'],
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: { message: 'Only POST is allowed for roast requests.' } });
  }

  const body = req.body;
  const resumeText = typeof body?.text === 'string' ? body.text.trim() : '';

  if (!resumeText) {
    return res.status(400).json({ error: { message: 'Resume text is required.' } });
  }

  const anthropicClient = getAnthropicClient();

  if (!isClaudeConfigured() || !anthropicClient) {
    return res.status(200).json(getFallbackRoastResponse(resumeText));
  }

  try {
    const prompt = buildResumeRoastPrompt(resumeText);

    const response = await anthropicClient.messages.create({
      model: CLAUDE_SONNET_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200,
    });

    const rawText = Array.isArray(response?.content)
      ? response.content
          .filter((block: unknown) =>
            typeof block === 'object' && block !== null && (block as any).type === 'text' && typeof (block as any).text === 'string'
          )
          .map((block: any) => (block as any).text)
          .join('\n')
          .trim()
      : '';

    if (!rawText) {
      return res.status(502).json({ error: { message: 'Received empty response from Claude.' } });
    }

    let parsed;

    try {
      parsed = JSON.parse(rawText);
    } catch (parseError) {
      console.error('Claude JSON parse failed:', parseError, 'rawText:', rawText);
      return res.status(502).json({
        error: {
          message: 'Claude returned invalid JSON. Please try again or simplify your resume text.',
        },
      });
    }

    const hasValidStructure =
      parsed &&
      typeof parsed.overallSummary === 'string' &&
      Array.isArray(parsed.sections) &&
      Array.isArray(parsed.topFixes);

    if (!hasValidStructure) {
      return res.status(502).json({
        error: {
          message: 'Claude returned JSON that did not match the expected roast schema.',
        },
      });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Roast API failed:', error);
    return res.status(200).json(getFallbackRoastResponse(resumeText));
  }
}
