# Innovation University — Interactive Library

A purple-and-white university course library built with React, TypeScript, and Vite. It brings together 19 externally hosted interactive books, grouped by academic level.

## Features

- Foundation and separate Level 1, Level 2, and Level 3 sections.
- Search by title, subject, or course code (including codes typed with spaces).
- Bookmark courses and browse a personal saved collection. Bookmarks stay in browser local storage when available; storage restrictions do not prevent browsing.
- Direct links to the supplied interactive books, opening in a new tab.
- Floating hero books, pointer-follow artwork, card tilt, scroll reveals, bookmark feedback, and smooth filter entrances.
- A persistent pause-motion control and live support for operating-system reduced-motion preferences.
- A manually browsable course spotlight with direct learning links.
- Continue learning from up to three recently opened courses. This is local opening history, not reading progress inside externally hosted books; users can clear it.
- A purple-and-white reading robot beside the Study Assistant. It blinks, turns pages, reacts to notes, loading, results and errors, and cycles five expressions by click, tap, Enter, or Space. Its motion control shares the library preference and respects reduced-motion settings.
- Responsive layouts and keyboard-accessible controls.

Course data is in `src/courses.ts`. BS100 is inferred from the supplied Mathematics (0) URL. Other courses are grouped by the first digit of their numerical code. CF311 and CF312 intentionally retain the same supplied destination; UR121 retains the supplied destination whose hostname contains `ur113`.

The current identity uses a text wordmark and a generic library symbol. The official university logo still needs to be supplied; it is not included in the repository.

## Development

Use Node.js 24 and npm 11.

```sh
cd /workspace/interactive-books
npm ci --no-audit --no-fund
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

## Validation

```sh
npm run lint
npm run build
```

The build runs TypeScript and generates `dist/`. In the prepared cloud environment, the additional browser check can be run with the dev server running:

```sh
node /workspace/interactive-books-tools/university-smoke-test.mjs
node /workspace/interactive-books-tools/motion-smoke-test.mjs
```

That helper is retained outside the Git checkout. It checks all 19 link destinations, level counts, search, bookmarks, storage failure handling, and mobile layouts.

## Hosting

Vercel can build this Vite project with `npm run build` and serve `dist/`. The course library itself needs no API keys or database. Books remain hosted at their original destinations; the optional AI assistant uses the server function described below.

## AI Study Assistant

The library includes summaries, explanations, flashcards, practice quizzes, and source-grounded questions. Students can paste 120–30,000 characters of material or extract text from a PDF locally in their browser (10 MB, up to 60 pages). Scanned PDFs need text recognition before use. The selected course provides context; the service does not fetch externally hosted books.

### Activate on Vercel

In the Vercel project's **Settings → Environment Variables**, securely add:

- `GEMINI_API_KEY`: your Google AI Studio API key. Enable it for the intended deployment environments. Create it at https://aistudio.google.com/apikey without enabling paid billing.
- `STUDY_AI_MODEL` (optional): defaults to `gemini-flash-latest`, the Flash alias used by Google’s current official SDK examples. It uses Gemini’s `generateContent` API with structured JSON output. Remove any old `gpt-4.1-mini` override. Model availability and free-tier quotas depend on your Google project, region, and Google’s current offering.

Redeploy after adding or changing these settings. Do not use a `VITE_` prefix, put keys in Git, or send credentials in chat. Vercel builds `api/study.ts` as a Node.js server function alongside the Vite site. Node.js 24 is required. To stay on the free tier, keep billing disabled on the Google project. This app does not enable billing, upgrade a plan, or fall back to a paid provider. The API key itself does not reveal whether project billing is enabled; verify that setting in Google AI Studio. Free quotas can be shared across students and may run out. A quota error should be retried after the provider’s reset, without enabling billing. If the selected model is not available for free on your project, choose a currently supported free-tier Gemini text model in AI Studio and set `STUDY_AI_MODEL` accordingly.

The assistant shows a setup message and disables generation if the server has no key. An invalid key or exhausted provider quota produces an explicit error. Configuring the cloud coding environment's secret does not configure Vercel; they are separate systems.

### Local development

Set `GEMINI_API_KEY` securely in the server process or an ignored `.env.local` file. The Vite development server exposes the same `/api/study` handler; restart it after changing credentials. Never expose server values through Vite `define` or browser-prefixed environment variables. In the managed cloud environment, use `NODE_USE_ENV_PROXY=1 npm run dev -- --host 0.0.0.0 --port 5173 --strictPort` so Node.js 24 fetches use the inherited proxy and its credential bindings. HTTPS access to `generativelanguage.googleapis.com` is required. `npm run preview` serves static output and does not run the AI API; use Vite development mode or a Vercel deployment to test the assistant.

### Data and limits

The app sends extracted text only when Generate is selected. It does not persist notes, PDFs, or AI answers in browser storage or a database. Google processes the submitted material. Its free-tier data-use terms differ from paid tiers and may permit use to improve products; review the current Gemini API terms before sharing university materials, and avoid confidential or personal student information. The old OpenAI `store` option does not apply to Gemini. The code does not log prompts or credentials.

Source excerpts are numbered by the server and returned with the answer. Every generated section, flashcard, and quiz item must reference an existing excerpt; unknown references and incomplete outputs are rejected. References support verification, but they do not guarantee factual accuracy. Students should check important claims against course materials. Quizzes provide practice feedback, not formal assessment.

Requests are bounded to 30,000 source characters, 1,000 question characters, 4,500 output tokens, a 45-second upstream timeout, and six generations per minute per address **per running server instance**. This in-memory limiter is not a global quota across Vercel instances. For public university use, keep Google project billing disabled and configure Vercel Firewall rate limits or authenticated access appropriate to the deployment.

### Tests

```sh
npm test
npm run lint
npm run build
```

Server tests exercise input bounds, numbered sources, structured request configuration, malformed/refused/truncated responses, provider failures, method and origin checks, missing configuration, payload limits, and per-instance rate limits. They use simulated Gemini provider responses and do not make billable AI calls. Tests also check Google API-key errors, blocked and truncated replies, model validation, header authentication, and excluding thought parts from student-facing output.

The prepared cloud environment also retains `/workspace/interactive-books-tools/study-smoke-test.mjs`, which tests the student interface with simulated AI responses and an actual PDF text-extraction fixture. It does not verify real inference. The existing library and motion browser checks remain available beside it.
