# AGENTS

## Fast start
- Install deps: `npm install`
- Dev server: `npm run dev`
- Main verification step: `npm run build`
- Local preview of prod build: `npm run preview`
- No `test`, `lint`, or `typecheck` scripts are defined in `package.json`.

## High-signal repo facts
- Single-package Vite React app; entrypoint is `src/main.jsx` -> `src/App.jsx`.
- Main dashboard is currently custom CSS-driven (`src/index.css` classes + variables), not Tailwind utility composition.
- `AuthPanel.jsx` and `src/components/ui/*` exist, but they are not wired into `src/App.jsx` right now.
- `AuthPanel.jsx`/`src/components/ui/*` import libraries (Radix, lucide, class-variance-authority, clsx, tailwind-merge) that are not listed in `package.json`; add deps before wiring those files into the runtime path.
- Supabase client is hardcoded in `src/lib/supabase.js` (URL + anon key), not env-driven.
- Data reads expect table `data` with `id`, `temperature`, `humidity`, `created_at`.
- "Live" updates are 1s polling in `src/App.jsx` (`setInterval`), not Supabase Realtime subscriptions.

## Editing map
- `src/App.jsx`: orchestration (history fetch, 1 Hz polling, KPI calculations, CSV export, reset flow, panel wiring).
- `src/components/Header.jsx`: export button + file upload parser (`.csv,.xlsx` accepted, but parsing is text/CSV via `FileReader.readAsText`).
- `src/components/ChartPanel.jsx`: chart/table/uncertainty tabs and Chart.js config.
- `src/components/SensorCard.jsx`, `src/components/InfoPanel.jsx`, `src/components/MiniCards.jsx`, `src/components/StatusBar.jsx`: display blocks fed by `App` state.

## Deployment/build constraints
- Vite output directory is `dist` (`vite.config.js`).
- Netlify publishes `dist` and uses SPA fallback redirect (`/* -> /index.html`) in `netlify.toml`; preserve this if adding client routes.
- UI copy is French (with accents/emojis); keep wording and tone consistent when editing text.
