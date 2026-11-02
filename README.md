# Innovation University — Interactive Library

A purple-and-white university course library built with React, TypeScript, and Vite. It brings together 19 externally hosted interactive books, grouped by academic level.

## Features

- Foundation and separate Level 1, Level 2, and Level 3 sections.
- Search by title, subject, or course code (including codes typed with spaces).
- Bookmark courses and browse a personal saved collection. Bookmarks stay in browser local storage when available; storage restrictions do not prevent browsing.
- Direct links to the supplied interactive books, opening in a new tab.
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
```

That helper is retained outside the Git checkout. It checks all 19 link destinations, level counts, search, bookmarks, storage failure handling, and mobile layouts.

## Hosting

Vercel can build this Vite project with `npm run build` and serve `dist/`. No API keys, server backend, or database are needed. Books remain hosted at their original destinations.
