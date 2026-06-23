import { useMemo, useState } from 'react';

export default function ResumeRoasterApp() {
  const phaseOnePromptArchitecture = useMemo(
    () => ({
      phase: 'Phase 1',
      intent: 'Single-page interface for an AI resume roaster SaaS.',
      specialization:
        'Hero with product name, resume text area, submit button, and result state.',
      behavior:
        'Validate a 200-character minimum, disable submit while loading, and fade results in smoothly.',
      styling:
        'Tailwind CSS, modern, minimal, with a playful accent color.',
      outputFormat:
        'Plain text roast with witty feedback, then exactly 3 practical fixes at the end.',
    }),
    []
  );

  const [resume, setResume] = useState('');
  const [roast, setRoast] = useState('');
  const [fixes, setFixes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const minimumCharacters = 200;
  const trimmedResume = resume.trim();
  const characterCount = trimmedResume.length;
  const hasEnoughText = characterCount >= minimumCharacters;
  const charactersNeeded = Math.max(minimumCharacters - characterCount, 0);

  const buildRoast = () => {
    const hasNumbers = /\d/.test(trimmedResume);
    const hasBulletShape = /(^|\n)\s*([-*]|\d+\.)\s/.test(trimmedResume);
    const hasActionLanguage =
      /\b(led|built|launched|owned|improved|increased|reduced|managed|created|designed)\b/i.test(
        trimmedResume
      );
    const hasFiller =
      /\b(responsible for|helped with|worked on|assisted|various|etc\.?)\b/i.test(
        trimmedResume
      );
    const hasSkillsSection = /\b(skills|technologies|tools|competencies)\b/i.test(
      trimmedResume
    );

    const notes = [
      hasNumbers
        ? 'You brought numbers, which is excellent. Now attach them to outcomes so they do more than stand around looking official.'
        : 'This resume is operating on vibes where metrics should be. Add numbers for scope, impact, speed, revenue, cost, or volume.',
      hasBulletShape
        ? 'The bullet structure is there. Tighten each line so the strongest result arrives before the reader gets bored.'
        : 'Right now it reads like a job description in a trench coat. Break it into crisp bullets with one achievement per line.',
      hasActionLanguage
        ? 'You have action verbs. Push them to the start of bullets and make the result impossible to miss.'
        : 'Your verbs need a gym membership. Start bullets with stronger action words like led, built, improved, shipped, or reduced.',
    ];

    const fixes = [
      hasNumbers
        ? 'Rewrite your top 3 bullets as: [Action verb] + [what you did] + [measurable result] (e.g. "Reduced onboarding time by 35% across 120 new hires").'
        : 'Add at least 3 quantified wins — team size, budget, revenue, time saved, users served, or percentage improvements.',
      hasBulletShape
        ? 'Cut every bullet to one line. Lead with the outcome, then briefly explain how you achieved it.'
        : 'Convert dense paragraphs into 4–6 bullet points per role, each focused on one achievement.',
      hasFiller
        ? 'Delete filler phrases like "responsible for" and "helped with" — replace them with direct action verbs and results.'
        : hasSkillsSection
          ? 'Move your strongest skills into the experience bullets where you actually used them, not just a laundry list at the bottom.'
          : 'Add a short skills section with 6–10 tools relevant to the job you want, grouped by category.',
    ];

    const roastText = `${notes.join('\n\n')}

Overall: This resume has a career story hiding in it, but it is being far too polite. Lead with measurable wins, cut filler phrases, and make the first third loud enough for a busy recruiter to understand in ten seconds.`;

    return { roastText, fixes };
  };

  const buttonLabel = isLoading
    ? 'Roasting...'
    : hasEnoughText
      ? 'Roast my resume'
      : `Add ${charactersNeeded} more characters`;

    const handlePdfUpload = async (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("PDF must be under 5MB");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    setResume(data.text);
  } catch (error) {
    alert(error.message);
  }
};
  
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!hasEnoughText || isLoading) return;

    setIsLoading(true);
    setShowResults(false);
    setRoast('');
    setFixes([]);

    window.setTimeout(() => {
      const { roastText, fixes: mainFixes } = buildRoast();
      setRoast(roastText);
      setFixes(mainFixes);
      setIsLoading(false);
      setShowResults(true);
    }, 900);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-5 pb-10 pt-14 text-center sm:px-8 lg:pt-20">
        <p className="rounded-full border border-fuchsia-400/40 bg-fuchsia-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-fuchsia-300">
          AI resume roaster SaaS
        </p>
        <h1 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
          Roast<span className="text-fuchsia-400">My</span>Resume
        </h1>
        <p className="mt-4 max-w-2xl text-xl font-medium text-slate-300 sm:text-2xl">
          Brutally honest feedback with just enough charm to keep you employable.
        </p>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400">
          Paste your resume below and get a playful roast that calls out vague
          claims, weak bullets, and missing metrics — plus the fixes that
          actually help.
        </p>
      </section>

      <section className="mx-auto w-full max-w-3xl px-5 sm:px-8">
        <form
          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-fuchsia-950/20 backdrop-blur sm:p-8"
          onSubmit={handleSubmit}
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-left text-lg font-semibold text-white">
                Paste your resume
              </h2>
              <p className="mt-1 text-left text-sm text-slate-400">
                Minimum {minimumCharacters} characters required.
              </p>
            </div>
            <span
              className={`w-fit rounded-full px-3 py-1 text-sm font-medium tabular-nums ${
                hasEnoughText
                  ? 'bg-emerald-400/15 text-emerald-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {characterCount} / {minimumCharacters}
            </span>
          </div>

          <input
               type="file"
               accept=".pdf,application/pdf"
               onChange={handlePdfUpload}
               className="mb-4 block w-full text-sm text-slate-300"
          />
                 
          <textarea
            className="h-72 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-base leading-7 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/30 sm:h-80"
            onChange={(event) => setResume(event.target.value)}
            placeholder="Paste your resume text here..."
            value={resume}
          />

          <button
            className="mt-5 w-full rounded-xl bg-fuchsia-500 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-fuchsia-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
            disabled={!hasEnoughText || isLoading}
            type="submit"
          >
            {isLoading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {buttonLabel}
              </span>
            ) : (
              buttonLabel
            )}
          </button>

          {!hasEnoughText && characterCount > 0 && (
            <p className="mt-3 text-left text-sm text-slate-500">
              {charactersNeeded} more character{charactersNeeded === 1 ? '' : 's'}{' '}
              needed to unlock the roast.
            </p>
          )}
        </form>
      </section>

      {roast && (
        <section
          aria-live="polite"
          className={`mx-auto w-full max-w-3xl px-5 pb-16 pt-10 sm:px-8 ${
            showResults ? 'animate-fade-in' : 'opacity-0'
          }`}
        >
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg sm:p-8">
            <h2 className="mb-4 text-lg font-semibold text-fuchsia-400">
              Roast comeback
            </h2>
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-200 sm:text-base">
              {roast}
            </pre>

            {fixes.length > 0 && (
              <div className="mt-8 border-t border-slate-700 pt-6">
                <h3 className="mb-4 text-lg font-semibold text-emerald-400">
                  3 Main Fixes
                </h3>
                <ol className="space-y-4">
                  {fixes.map((fix, index) => (
                    <li
                      key={index}
                      className="flex gap-3 text-sm leading-7 text-slate-200 sm:text-base"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/20 text-sm font-bold text-fuchsia-300">
                        {index + 1}
                      </span>
                      <span>{fix}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
