# RoastMyResume — Project 2

**Finlatics Full Stack Web Development — Project 2**

RoastMyResume is an AI-powered resume feedback SaaS. Users paste or upload their resume and receive brutally honest, witty critique plus three actionable fixes to improve their job applications.

This repository is the starter scaffold for Project 2. Phase 1 (single-page UI with client-side mock roasting) is implemented. Later phases add a real AI backend, PDF upload, authentication, and persistent feedback storage.

For step-by-step build instructions, see [TUTORIAL.md](./TUTORIAL.md).

---

## Features

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1** | ✅ Complete | Single-page UI — hero, resume textarea, roast button, animated results with 3 fixes |
| **Phase 2** | \/ Scaffolded | `/api/roast` — Claude AI integration via `lib/claude.js` |
| **Phase 3** | 🔲 Scaffolded | PDF upload page, dropzone component, and `/api/upload` |
| **Phase 4** | 🔲 Scaffolded | User authentication via `/api/auth/[...newAuth]` |
| **Phase 5** | 🔲 Scaffolded | Database persistence, feedback detail page, score UI |

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (Pages Router)
- **UI:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com/)
- **AI (Phase 2+):** Anthropic Claude API (`lib/claude.js`)
- **Database (Phase 5+):** Configured in `lib/db.js`

---

## Project Structure

```
finlaticswebdev_project2/
├── components/
│   ├── FeedbackCard.jsx      # Displays a single feedback item (Phase 5)
│   ├── Header.jsx            # Site navigation header
│   ├── ScoreCircle.jsx       # Visual score indicator (Phase 5)
│   └── UploadDropzone.jsx    # Drag-and-drop file upload (Phase 3)
├── lib/
│   ├── claude.js             # Claude API client (Phase 2)
│   ├── db.js                 # Database connection helper (Phase 5)
│   └── pdfParser.js          # PDF text extraction (Phase 3)
├── pages/
│   ├── _app.js               # App wrapper + global styles
│   ├── index.js              # Main roast UI (Phase 1) ✅
│   ├── upload.js             # PDF upload page (Phase 3)
│   ├── feedback/
│   │   └── [id].js           # Saved feedback detail (Phase 5)
│   └── api/
│       ├── roast.js          # POST resume → AI roast (Phase 2)
│       ├── upload.js         # POST PDF → extracted text (Phase 3)
│       └── auth/
│           └── [...newAuth].js  # Auth routes (Phase 4)
├── styles/
│   └── globals.css           # Tailwind directives + fade-in animation
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── TUTORIAL.md               # Step-by-step build guide
└── package.json
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (comes with Node.js)

### Installation

```bash
# Clone or download the repository, then:
cd finlaticswebdev_project2-main

npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build

```bash
npm run build
npm start
```

---

## Environment Variables (Phase 2+)

Create a `.env.local` file in the project root when you reach Phase 2:

```env
ANTHROPIC_API_KEY=your_claude_api_key_here
```

Additional variables for later phases (database URL, auth secrets) are documented in [TUTORIAL.md](./TUTORIAL.md).

> **Never commit `.env` or `.env.local` files.** They are listed in `.gitignore`.

---

## Phase 1 Overview (Current App)

The home page (`pages/index.js`) is a single React component with three sections:

1. **Hero** — Product badge, **RoastMyResume** title (fuchsia accent), tagline, and description.
2. **Input card** — Large textarea with a live character counter (200-character minimum), and a **Roast my resume** submit button.
3. **Results** — Roast feedback fades in after submission, followed by a numbered **3 Main Fixes** list.

### Behavior

- Submit is disabled until at least **200 characters** (trimmed) are pasted.
- Button shows a spinner and **Roasting...** while loading.
- Phase 1 uses client-side pattern matching to generate a mock roast (~900 ms delay).
- Results animate in with a slide-up fade via `.animate-fade-in` in `globals.css`.

### Prompt architecture

Phase 1 is driven by a `phaseOnePromptArchitecture` object that encodes intent, specialization, behavior, styling, and output format — the same pattern used across all phases in this project.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create an optimized production build |
| `npm start` | Serve the production build |

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Main roast interface (Phase 1) |
| `/upload` | PDF upload page (Phase 3) |
| `/feedback/[id]` | View a saved roast result (Phase 5) |
| `/api/roast` | AI roast API endpoint (Phase 2) |
| `/api/upload` | PDF upload API endpoint (Phase 3) |
| `/api/auth/*` | Authentication API (Phase 4) |

---

## Deployment

This project deploys cleanly to [Vercel](https://vercel.com/) (recommended for Next.js):

1. Push your code to GitHub.
2. Import the repository in Vercel.
3. Add environment variables (`ANTHROPIC_API_KEY`, etc.) in the Vercel dashboard.
4. Deploy.

---

## Course Context

This project is part of the **Finlatics Full Stack Development with AI** experience program. You will build and ship five real AI-powered applications using Next.js, APIs, databases, and modern deployment practices.

- **Project 2:** RoastMyResume (this repo)
- Instructor: Anuj Rai

Learn more at [finlatics.com](https://www.finlatics.com).

---

## License

Educational use — Finlatics Web Development Program.
