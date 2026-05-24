# AGENTS

## Fast start
- Install deps: `npm install` (prefer npm; see "lockfiles" below)
- Dev server: `npm run dev`
- Main verification step: `npm run build`
- Local preview of prod build: `npm run preview`
- No `test`, `lint`, or `typecheck` scripts are defined in `package.json`.

## Lockfiles
- This repo contains both `package-lock.json` and `bun.lock`. Use `npm install` (package-lock.json) unless you intentionally migrate to Bun. Do not update/remove the other lockfile casually.

## High-signal repo facts / gotchas
- Single-package Vite + React app. Entrypoint: `src/main.jsx` -> `src/App.jsx`. Build outDir is `dist` (vite.config.js).
- The visible UI is primarily driven by `src/index.css` (CSS variables + custom classes). Many small UI primitives live under `src/components/ui/*` and use Tailwind-style utility classes, but the app is not uniformly migrated to Tailwind — check `src/index.css` first before converting styles.
- Several UI primitives and the `AuthPanel` import runtime packages that are NOT listed in `package.json`. If you plan to enable/wire these components, install the missing deps first:

  npm install @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-slot lucide-react class-variance-authority clsx tailwind-merge

- Supabase client is hardcoded at `src/lib/supabase.js` (project URL + anon key). That allows the app to connect out-of-the-box, but:
  - treat committed keys as public; do not commit private keys. If you move to env vars, add them to Netlify (or your host) instead of committing.
  - runtime data depends on that Supabase project existing and containing a `data` table (see below).
- Database shape expected by the UI: table `data` with columns `id` (int), `temperature` (number), `humidity` (number) and `created_at` (ISO timestamp). Queries use `.select('id, temperature, humidity, created_at')`, order by `id desc`, `.limit()` and a 1-second poll for the latest row. If you need to run the UI locally with sample data, seed rows matching those columns.
- Auth flow: the app uses `supabase.auth.getSession()` and `supabase.auth.onAuthStateChange()`; sign-in uses `signInWithPassword()` and `signUp()` (signUp may not return a session until email confirmation). Expect the login screen if there's no session.
- File upload in `src/components/Header.jsx` sets `accept=".csv,.xlsx"` but parses files as plain text (splits lines and columns). `.xlsx` will NOT be parsed correctly — install `xlsx` (SheetJS) and update parser if you need Excel support.
- Live updates are implemented by polling (`setInterval` every 1000ms) in `src/App.jsx` — the app does NOT currently use Supabase Realtime subscriptions.

## Editing map (high-value files)
- `src/App.jsx` — orchestration: auth bootstrap, history load, 1 Hz polling, KPI calculations, CSV export, reset flow, panel wiring.
- `src/lib/supabase.js` — Supabase client + small date formatter. Key is hardcoded here.
- `src/components/Header.jsx` — Export CSV, file upload parser (naive CSV), logout button.
- `src/components/ChartPanel.jsx` — chart/table/uncertainty tabs and Chart.js wiring.
- `src/components/AuthPanel.jsx` + `src/components/ui/*` — UI primitives (Radix wrappers, CVA usage). They are present but will break at runtime unless the missing deps above are installed.

## Build / deploy notes
- Vite build (`npm run build`) outputs into `dist`. Netlify config (`netlify.toml`) publishes `dist` and includes a SPA fallback (`/* -> /index.html`) — keep that redirect if you add client-side routes.
- `npm run build` is the main verification step used by CI; `npm run preview` serves the production build locally.
- When adding or upgrading dependencies: run `npm install` and commit `package-lock.json`. Leave `bun.lock` alone unless you intentionally switch to Bun.

## Small style/security reminders
- UI copy is French; keep tone when editing text.
- Do not commit private keys. If you replace the hardcoded Supabase key with environment variables, configure them in your hosting environment (Netlify) rather than committing them to the repo.
