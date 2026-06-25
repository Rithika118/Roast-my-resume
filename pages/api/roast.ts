import type { NextApiRequest, NextApiResponse } from 'next';
import { anthropicClient, CLAUDE_SONNET_MODEL, buildResumeRoastPrompt, isClaudeConfigured } from '../../lib/claude';

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

  if (!isClaudeConfigured || !anthropicClient) {
    return res.status(503).json({
      error: {
        message: 'Claude AI is not configured yet. Add ANTHROPIC_API_KEY to your environment to enable roasting.',
      },
    });
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
    return res.status(500).json({
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred while generating the roast.',
      },
    });
  }
}
