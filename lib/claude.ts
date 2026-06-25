import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

export const CLAUDE_SONNET_MODEL = 'claude-3-5-sonnet-20241022';

function readEnvValue(key: string): string | undefined {
  const fromProcess = process.env[key]?.trim();
  if (fromProcess) {
    return fromProcess;
  }

  const envFileCandidates = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env'),
  ];

  for (const envFile of envFileCandidates) {
    try {
      const contents = fs.readFileSync(envFile, 'utf8');
      const match = new RegExp(`^${key}=(.*)$`, 'm').exec(contents);
      if (match?.[1]) {
        return match[1].trim().replace(/^['"]|['"]$/g, '');
      }
    } catch {
      // Ignore missing env files and keep checking the next candidate.
    }
  }

  return undefined;
}

export function getAnthropicClient(): Anthropic | null {
  const anthropicKey = readEnvValue('ANTHROPIC_API_KEY');
  if (!anthropicKey) {
    return null;
  }

  return new Anthropic({ apiKey: anthropicKey });
}

export function isClaudeConfigured(): boolean {
  return Boolean(readEnvValue('ANTHROPIC_API_KEY'));
}

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

export function buildFallbackRoastResponse(resumeText: string) {
  const hasNumbers = /\d/.test(resumeText);
  const hasBullets = /(^|\n)\s*([-*]|\d+\.)\s/.test(resumeText);
  const hasActionLanguage = /\b(led|built|launched|owned|improved|increased|reduced|managed|created|designed|shipped)\b/i.test(resumeText);
  const hasFiller = /\b(responsible for|helped with|worked on|assisted|various|etc\.?|team player)\b/i.test(resumeText);

  const overallSummary = hasNumbers
    ? 'This resume has a useful foundation, but it still needs sharper outcomes and clearer proof. Lead with measurable wins, trim the filler, and make the top of the page immediately persuasive.'
    : 'This resume is trying to be impressive, but it is still reading like a generic list of duties. Turn it into a story of impact with stronger verbs, cleaner bullets, and concrete proof.';

  const sections = [
    {
      sectionName: 'Big picture',
      critique: hasNumbers
        ? 'You already have evidence, but it is not being framed aggressively enough to command attention.'
        : 'The overall story is too vague. Recruiters need to understand your value in seconds, not after several paragraphs.',
      strengths: hasNumbers ? ['You included measurable information.', 'You appear to have real experience.'] : ['You have enough content to build a strong narrative.', 'The resume is not empty.'],
      recommendations: [
        'Open with your strongest achievement instead of a generic summary.',
        'Make the first third of the page instantly scannable.',
      ],
    },
    {
      sectionName: 'Bullet quality',
      critique: hasBullets
        ? 'Your bullets have structure, but many still feel too safe and too long.'
        : 'The resume needs sharper bullet formatting so each achievement is easy to skim.',
      strengths: hasActionLanguage ? ['You use action-oriented language.', 'The resume shows momentum and initiative.'] : ['There is some evidence of initiative.', 'The content has a clear topic.'],
      recommendations: [
        'Start each bullet with a strong action verb and a result.',
        'Keep each bullet to one achievement with no filler.',
      ],
    },
    {
      sectionName: 'Impact and proof',
      critique: hasFiller
        ? 'The wording is still too generic in places, which weakens confidence in the impact.'
        : 'The resume should push harder on outcomes, metrics, and proof of scale.',
      strengths: hasNumbers ? ['The resume includes numbers that support credibility.', 'Your achievements seem tangible.'] : ['The resume has enough substance for a strong rewrite.', 'You are clearly communicating experience.'],
      recommendations: [
        'Add metrics wherever possible: revenue, time, scope, growth, or efficiency.',
        'Replace vague phrases with clear evidence of what changed.',
      ],
    },
  ];

  const topFixes = [
    'Rewrite your top three bullets so each starts with a strong action verb and ends with a measurable result.',
    'Cut filler phrases like “responsible for” and “helped with” so every line sounds more direct.',
    'Add a short summary section that sells your value in one sharp sentence before the experience begins.',
  ];

  return { overallSummary, sections, topFixes };
}
