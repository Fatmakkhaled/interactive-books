# Interactive Books

A React + TypeScript reading app built with Vite. Browse and search three classic books, filter by genre, read selected chapter excerpts, adjust text size, and switch themes. Reading position is saved in browser local storage when available.

The included texts are short public-domain excerpts, not complete books. No account, API key, database, or external service is needed. All fonts and artwork render locally.

## Development

Use Node.js 24 and npm 11 (the cloud environment provides both).

```sh
cd /workspace/interactive-books
npm ci --no-audit --no-fund
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

## Checks

```sh
npm run lint
npm run build
```

The build runs the TypeScript compiler and produces `dist/`. To serve the production build:

```sh
npm run preview -- --host 0.0.0.0 --port 4173 --strictPort
```

App code is in `src/App.tsx`; book content is defined in its `books` array. Styles are in `src/App.css` and `src/index.css`.
