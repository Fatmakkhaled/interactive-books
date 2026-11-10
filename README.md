# Innovation University — Interactive Library

A purple-and-white university course library built with React, TypeScript, and Vite. It brings together 21 externally hosted interactive books, grouped by academic level.

## Features

- Foundation and separate Level 1, Level 2, and Level 3 sections.
- Search by title, subject, or course code (including codes typed with spaces).
- Bookmark courses and browse a personal saved collection. Bookmarks stay in browser local storage when available; storage restrictions do not prevent browsing.
- Direct links to the supplied interactive books, opening in a new tab.
- A reading-robot welcome banner, card tilt, scroll reveals, bookmark feedback, and smooth filter entrances.
- Live support for operating-system reduced-motion preferences.
- A manually browsable course spotlight with direct learning links.
- Continue learning from up to three recently opened courses. This is local opening history, not reading progress inside externally hosted books; users can clear it.
- A purple-and-white reading robot in the main welcome banner. It blinks, turns pages, reacts to course searches and saved-book browsing, and cycles five expressions by click, tap, Enter, or Space. Its motion follows the device’s reduced-motion setting. It is labeled “Your little study buddy.”
- Responsive layouts and keyboard-accessible controls.

Course data is in `src/courses.ts`. BS100 is inferred from the supplied Mathematics (0) URL. Other courses are grouped by the first digit of their numerical code. CF311 and CF312 intentionally retain the same supplied destination; UR121 retains the supplied destination whose hostname contains `ur113`.

The header pairs `public/university-emblem.png`, a purple emblem extracted from the supplied university branding, with the university name rendered as readable text. It also uses the emblem as the favicon. The original full logo asset is retained in `public/university-logo.png`. Course titles, body text, navigation, and labels use larger sizes for comfortable laptop reading.

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

That helper is retained outside the Git checkout. It checks all course link destinations, level counts, search, bookmarks, storage failure handling, and mobile layouts.

## Hosting

Vercel can build this Vite project with `npm run build` and serve `dist/`. The course library itself needs no API keys or database. Books remain hosted at their original destinations; the optional AI assistant uses the server function described below.

## AI feature paused

The AI Study Assistant and its promotional entry points are removed from the active library. There is no public `/api/study` function and the Vite development server no longer registers an AI endpoint. No API key is needed to browse the library or interact with the robot.

The previous components, provider adapter, and tests are retained for a possible future return. The former endpoint is now `server/disabled-study-handler.ts`, outside Vercel's API directory; `vercel.json` no longer registers it. These retained files are not imported by the active application. The existing `npm test` command verifies that retained implementation using simulated provider responses, not a live student feature.

Restoring the assistant would require deliberately reinstating the API route, Vite server middleware, and interface entry points. Existing cloud-secret requirements from earlier setup are unused while AI is paused and can be removed in environment settings if desired. Saved hosting variables are not read by the active site.
