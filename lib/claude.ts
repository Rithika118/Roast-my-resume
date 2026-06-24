import Anthropic from '@anthropic-ai/sdk';
const anthropicKey = process.env.ANTHROPIC_API_KEY;

console.log('ANTHROPIC_API_KEY exists:', !!anthropicKey);
console.log('Key length:', anthropicKey?.length);
export const anthropicClient = anthropicKey
  ? new Anthropic({ apiKey: anthropicKey })
  : null;

export const isClaudeConfigured = Boolean(anthropicKey);
export const CLAUDE_SONNET_MODEL = 'claude-3-5-sonnet-20241022';

export function buildResumeRoastPrompt(resumeText: string): string {
  return `You are a brutal but constructive career coach...

Return only valid JSON.

Schema:
{
  "overallSummary": "",
  "sections": [
    {
      "sectionName": "",
      "critique": "",
      "strengths": [],
      "recommendations": []
    }
  ],
  "topFixes": ["", "", ""]
}

Resume:
${resumeText}`;
}
