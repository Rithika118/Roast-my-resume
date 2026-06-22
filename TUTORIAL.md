# RoastMyResume — Tutorial

Step-by-step guide for **Finlatics Full Stack Web Development — Project 2**.

Each phase follows a **prompt architecture** pattern: define intent, specialization, behavior, styling, and output format before writing code. This keeps AI-assisted development consistent and predictable.

---

## Table of Contents

1. [Setup](#1-setup)
2. [Phase 1 — Single-page UI](#2-phase-1--single-page-ui)
3. [Phase 2 — AI Roast API (Claude)](#3-phase-2--ai-roast-api-claude)
4. [Phase 3 — PDF Upload](#4-phase-3--pdf-upload)
5. [Phase 4 — Authentication](#5-phase-4--authentication)
6. [Phase 5 — Database & Feedback Page](#6-phase-5--database--feedback-page)
7. [Deploy to Production](#7-deploy-to-production)

---

## 1. Setup

### Step 1.1 — Install Node.js

Download and install Node.js 18+ from [nodejs.org](https://nodejs.org/). Verify:

```bash
node --version
npm --version
```

### Step 1.2 — Install dependencies

```bash
cd finlaticswebdev_project2-main
npm install
```

### Step 1.3 — Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the RoastMyResume home page.

### Step 1.4 — Confirm Tailwind is working

The page uses a dark slate background (`bg-slate-950`) and fuchsia accents. If styles look unstyled, check that `pages/_app.js` imports `../styles/globals.css` and that `globals.css` includes the Tailwind directives.

---

## 2. Phase 1 — Single-page UI

**Status:** ✅ Implemented in `pages/index.js`

### Prompt architecture

| Field | Value |
|-------|-------|
| **Intent** | Single-page interface for an AI resume roaster SaaS |
| **Specialization** | Hero with product name, resume text area, submit button, and result state |
| **Behavior** | Validate 200-character minimum; disable submit while loading; fade results in smoothly |
| **Styling** | Tailwind CSS — modern, minimal, playful fuchsia accent |
| **Output format** | Plain text roast with witty feedback, then exactly 3 practical fixes |

### Step 2.1 — Build the hero section

Create three centered blocks at the top of the page:

- A small badge: `AI resume roaster SaaS`
- An `<h1>` with **Roast** + **My** (fuchsia) + **Resume**
- A tagline and short description explaining what the app does

Use Tailwind classes: `max-w-5xl`, `text-center`, `font-black`, `text-fuchsia-400` for the accent.

### Step 2.2 — Build the input card

Wrap a `<form>` in a rounded card (`rounded-2xl border border-slate-800 bg-slate-900/80`):

1. Add a heading **Paste your resume** and a note about the 200-character minimum.
2. Add a live character counter badge that turns green when `≥ 200` characters.
3. Add a large `<textarea>` (`h-72`, `resize-none`, dark background).
4. Add a submit button labeled **Roast my resume**.

### Step 2.3 — Add validation logic

```javascript
const minimumCharacters = 200;
const trimmedResume = resume.trim();
const characterCount = trimmedResume.length;
const hasEnoughText = characterCount >= minimumCharacters;
```

- Disable the button when `!hasEnoughText || isLoading`.
- Show helper text: `Add X more characters` when the user has started typing but hasn't reached 200.

### Step 2.4 — Add loading state

On submit:

1. Set `isLoading = true`, clear previous results.
2. Show a spinner and **Roasting...** on the button.
3. After processing, set `isLoading = false` and show results.

Phase 1 uses a `setTimeout` (~900 ms) with client-side logic. Phase 2 replaces this with a real API call.

### Step 2.5 — Build the mock roast generator

Analyze the pasted resume with regex checks:

- **Numbers** — `/\d/` — are metrics present?
- **Bullet shape** — bullet points or numbered lists?
- **Action verbs** — led, built, launched, improved, etc.
- **Filler phrases** — "responsible for", "helped with", etc.
- **Skills section** — skills/technologies/tools keywords

Return witty feedback notes plus **exactly 3 tailored fixes**.

### Step 2.6 — Build the results section

After roasting:

1. Show a **Roast comeback** block with the witty feedback text.
2. Below a divider, show **3 Main Fixes** as a numbered list with fuchsia circle badges.
3. Apply the `animate-fade-in` class (defined in `styles/globals.css`) for a smooth slide-up entrance.
4. Add `aria-live="polite"` for accessibility.

### Step 2.7 — Verify Phase 1

1. Paste fewer than 200 characters → button stays disabled.
2. Paste 200+ characters → button enables as **Roast my resume**.
3. Click submit → spinner appears, then results fade in.
4. Confirm **3 Main Fixes** appear at the bottom with numbered items.

---

## 3. Phase 2 — AI Roast API (Claude)

**Files to implement:** `lib/claude.js`, `pages/api/roast.js`, update `pages/index.js`

### Prompt architecture

| Field | Value |
|-------|-------|
| **Intent** | Server-side AI roast via Claude API |
| **Specialization** | POST endpoint accepting resume text, returning roast + 3 fixes |
| **Behavior** | Validate input server-side; handle API errors gracefully |
| **Output format** | JSON: `{ roast: string, fixes: string[] }` |

### Step 3.1 — Get an API key

1. Sign up at [console.anthropic.com](https://console.anthropic.com/).
2. Create an API key.
3. Add it to `.env.local`:

```env
ANTHROPIC_API_KEY=your_key_here
```

### Step 3.2 — Implement `lib/claude.js`

Create a function that:

1. Accepts resume text as input.
2. Sends a prompt to Claude asking for witty roast feedback and exactly 3 fixes.
3. Parses the response into `{ roast, fixes }`.

Example prompt structure:

```
You are a brutally honest but helpful resume coach. Roast this resume with witty
feedback. Then provide exactly 3 practical, specific fixes as a numbered list.

Resume:
{resumeText}

Respond in JSON format:
{ "roast": "...", "fixes": ["fix1", "fix2", "fix3"] }
```

### Step 3.3 — Implement `pages/api/roast.js`

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resume } = req.body;
  if (!resume || resume.trim().length < 200) {
    return res.status(400).json({ error: 'Resume must be at least 200 characters' });
  }

  try {
    const result = await roastResume(resume.trim());
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate roast' });
  }
}
```

### Step 3.4 — Connect the frontend

In `pages/index.js`, replace the `setTimeout` mock with:

```javascript
const response = await fetch('/api/roast', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ resume: trimmedResume }),
});
const data = await response.json();
setRoast(data.roast);
setFixes(data.fixes);
```

### Step 3.5 — Verify Phase 2

1. Paste a resume and submit.
2. Confirm the roast comes from Claude (more varied than the mock).
3. Test with `< 200` characters → API returns 400.
4. Test with invalid API key → graceful error message.

---

## 4. Phase 3 — PDF Upload

**Files to implement:** `lib/pdfParser.js`, `pages/api/upload.js`, `pages/upload.js`, `components/UploadDropzone.jsx`

### Prompt architecture

| Field | Value |
|-------|-------|
| **Intent** | Let users upload a PDF resume instead of pasting text |
| **Specialization** | Drag-and-drop dropzone, PDF text extraction, redirect to roast |
| **Behavior** | Accept PDF only; max file size limit; show extraction progress |
| **Styling** | Match Phase 1 dark theme; dashed border dropzone |

### Step 4.1 — Install PDF parsing library

```bash
npm install pdf-parse
```

### Step 4.2 — Implement `lib/pdfParser.js`

Export a `parsePDF(buffer)` function that returns extracted plain text from a PDF buffer using `pdf-parse`.

### Step 4.3 — Implement `pages/api/upload.js`

1. Accept multipart file upload (use `formidable` or Next.js built-in parsing).
2. Validate file type is PDF and size is under a limit (e.g. 5 MB).
3. Extract text with `parsePDF`.
4. Return `{ text: extractedText }`.

### Step 4.4 — Build `components/UploadDropzone.jsx`

- Drag-and-drop zone with dashed border.
- Click to open file picker (accept `.pdf`).
- Show file name and upload progress.
- On success, pass extracted text to the roast flow (redirect to `/` with text pre-filled, or roast directly).

### Step 4.5 — Build `pages/upload.js`

Compose the upload page:

1. Hero section (shorter than home).
2. `UploadDropzone` component.
3. Link back to paste-text flow on home page.

### Step 4.6 — Verify Phase 3

1. Navigate to `/upload`.
2. Drop a PDF resume → text is extracted.
3. Confirm extracted text can be roasted (via home page or direct API call).

---

## 5. Phase 4 — Authentication

**Files to implement:** `pages/api/auth/[...newAuth].js`

### Prompt architecture

| Field | Value |
|-------|-------|
| **Intent** | User accounts so roasts can be saved and retrieved |
| **Specialization** | Sign up, sign in, sign out via API routes |
| **Behavior** | Secure sessions; protect roast history endpoints |
| **Styling** | Minimal auth forms matching the dark theme |

### Step 5.1 — Choose an auth approach

Options for this project:

- **NextAuth.js** (recommended) — handles sessions, providers, and callbacks.
- **Custom JWT** — sign/verify tokens in API routes.

Install if using NextAuth:

```bash
npm install next-auth
```

### Step 5.2 — Implement auth API routes

In `pages/api/auth/[...newAuth].js`, configure your auth provider(s):

- Email/password credentials, or
- OAuth (Google, GitHub).

### Step 5.3 — Add auth UI

Update `components/Header.jsx`:

- Show **Sign in** / **Sign out** based on session state.
- Link to a simple login/register form or modal.

### Step 5.4 — Protect routes

Require authentication before:

- Saving roasts to the database (Phase 5).
- Viewing `/feedback/[id]` for saved results.

### Step 5.5 — Verify Phase 4

1. Register a new account.
2. Sign in and confirm session persists on refresh.
3. Sign out and confirm protected routes redirect.

---

## 6. Phase 5 — Database & Feedback Page

**Files to implement:** `lib/db.js`, `pages/feedback/[id].js`, `components/FeedbackCard.jsx`, `components/ScoreCircle.jsx`

### Prompt architecture

| Field | Value |
|-------|-------|
| **Intent** | Persist roast results and display them on a detail page |
| **Specialization** | Save roast + fixes + score; feedback card UI with score circle |
| **Behavior** | Auto-save after roast; unique ID per roast; user-scoped access |
| **Output format** | Feedback page with score, roast text, fixes list, timestamp |

### Step 6.1 — Set up the database

Choose one:

- **MongoDB** with Mongoose
- **PostgreSQL** with Prisma
- **Supabase** (PostgreSQL + auth)

Add connection URL to `.env.local`:

```env
DATABASE_URL=your_database_connection_string
```

### Step 6.2 — Implement `lib/db.js`

Create a connection helper and define a `Roast` model/schema:

```javascript
{
  id: string,
  userId: string,       // from Phase 4 auth
  resumeText: string,
  roast: string,
  fixes: string[],
  score: number,        // 0–100
  createdAt: Date,
}
```

### Step 6.3 — Save roasts after API response

After a successful `/api/roast` call, save the result to the database and return `{ id, roast, fixes, score }`.

### Step 6.4 — Build `components/ScoreCircle.jsx`

A circular badge showing the resume score (0–100) with color coding:

- Red: 0–40
- Yellow: 41–70
- Green: 71–100

### Step 6.5 — Build `components/FeedbackCard.jsx`

Display a single feedback item: roast summary, score, date, and a link to the full detail page.

### Step 6.6 — Build `pages/feedback/[id].js`

1. Fetch roast by `id` from the database (scoped to the authenticated user).
2. Show `ScoreCircle`, full roast text, and the 3 fixes.
3. Handle 404 if the ID doesn't exist or user lacks access.

### Step 6.7 — Verify Phase 5

1. Roast a resume while signed in → result is saved.
2. Visit `/feedback/[id]` → full detail page loads.
3. Confirm another user cannot access your saved roasts.

---

## 7. Deploy to Production

### Step 7.1 — Build locally

```bash
npm run build
```

Fix any build errors before deploying.

### Step 7.2 — Deploy to Vercel

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Add environment variables in the Vercel dashboard:
   - `ANTHROPIC_API_KEY`
   - `DATABASE_URL`
   - Auth secrets (e.g. `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
4. Deploy.

### Step 7.3 — Smoke test production

1. Open your live URL.
2. Paste a resume and roast it.
3. Upload a PDF (if Phase 3 is done).
4. Sign in and confirm saved feedback persists.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Styles not loading | Confirm `_app.js` imports `globals.css`; restart `npm run dev` |
| `N` badge in bottom-left corner | Next.js dev indicator — disabled via `devIndicators: false` in `next.config.js`; restart dev server |
| API returns 500 | Check `.env.local` has valid `ANTHROPIC_API_KEY`; restart dev server after adding env vars |
| Port 3000 in use | Run `npm run dev -- -p 3001` or stop the other process |
| Build fails | Run `npm run build` locally and read the error output |

---

## Quick Reference — npm Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Serve production build
```

---

## Next Steps

After completing all phases, consider these enhancements:

- Resume score algorithm based on AI analysis
- Side-by-side before/after bullet rewrites
- Export roast as PDF
- Shareable public roast links
- Rate limiting on the API to control Claude costs

Good luck building RoastMyResume!
