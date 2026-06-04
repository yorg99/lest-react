# AGENTS

## Fast start
- Install: `pnpm install` (see "Lockfiles"). Dev: `npm run dev`. Verify: `npm run build`. Preview build: `npm run preview`.
- No `test`, `lint`, `typecheck`, or formatter scripts. `npm run build` is the only verification gate.
- No CI config, no Husky, no README. Netlify deploys from `dist/` via `netlify.toml` (`npm run build` + SPA fallback `/* -> /index.html`).

## Lockfiles
- Repo ships `bun.lock` AND `pnpm-lock.yaml`. There is NO `package-lock.json`. Current `node_modules` was installed by pnpm (`.modules.yaml` present). Prefer `pnpm install` to match the committed state; don't touch the other lockfile unless intentionally migrating.

## Architecture (single-page Vite + React 18)
- Entrypoint: `src/main.jsx` -> `src/App.jsx`. Build outDir `dist` (`vite.config.js`).
- `src/App.jsx` orchestrates everything: Supabase auth bootstrap + listener, initial history load, 1 Hz polling (`setInterval`, no Realtime), KPI math, CSV export, reset, modal wiring.
- Active sign-in UI is `src/components/LoginScreen.jsx` (plain CSS classes from `src/index.css`).
- Live UI components in `src/components/` (`Header`, `SensorCard`, `InfoPanel`, `MiniCards`, `ChartPanel`, `StatusBar`, `SettingsModal`) are styled by `src/index.css` CSS variables + custom classes.

## Dead code — already removed
- The shadcn-style scaffold was deleted: `src/lib/utils.js`, `src/components/AuthPanel.jsx`, and the entire `src/components/ui/` directory (badge, button, card, dialog, input, label, tabs). Nothing in `App.jsx` or the live components imported them; they only cross-referenced each other. None of the missing deps (`clsx`, `tailwind-merge`, `@radix-ui/*`, `lucide-react`, `class-variance-authority`) need to be installed.
- Tailwind IS configured (`tailwind.config.js`, `postcss.config.cjs`, deps installed) and `src/index.css` is processed through PostCSS, but the live tree uses legacy CSS classes (e.g. `.login-screen`, `.sensor-card`). Mixing Tailwind utilities into existing components is fine, but check `src/index.css` first — most visual tokens live there as CSS variables (`--bg`, `--cyan`, etc.).

## Supabase data contract
- Client + URL + anon JWT are read in `src/lib/supabase.js` from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, with the previously committed values as fallbacks. Configure the env vars in Netlify (or a local `.env.local`, which is `.gitignore`d) to override; the anon key is safe to commit, never commit a service-role key.
- Required table `public.data` with columns used by queries: `id` (int, ordering key), `temperature` (float, "Siemens" reference), `pt100_temp` (float, nullable — overlay/filter math depends on this), `humidity` (float), `created_at` (timestamptz). The current AGENTS history note that omits `pt100_temp` is stale — `App.jsx`, `ChartPanel.jsx`, and the CSV exporter all read it.
- Initial load + `resetSession`: `select(...).order('id', desc).limit(HISTORY_LIMIT)` where `HISTORY_LIMIT = 2000` (`src/App.jsx:13`). Pulls the 2000 newest rows, then `.reverse()` to ascending. Anything older is dropped on the floor — bump the limit if you need a longer window. Polling uses `.limit(1)` on the same select every 1000 ms. "ESP online" = `(now - created_at) < 10 s`.
- Auth uses `signInWithPassword` (LoginScreen). Without a session the app renders `LoginScreen` and skips both effects.

## CSV / upload quirks
- CSV export lives in `App.jsx#exportCSV` (not in `Header.jsx`). Columns: `Timestamp,ID,Temperature,PT100,PT100_Filtered,Ecart_T,Humidite`. The "PT100 Filtered" column is a cumulative running mean of valid `pt100_temp` values, computed identically in `ChartPanel.jsx` — keep the two implementations in sync if you edit either.
- The Header previously advertised a "Charger Profil" upload (`.csv`/`.xlsx`); it was a silent no-op (parsed rows went nowhere). Button removed; if real ingestion is wanted later, treat it as a feature change.

## UI / copy conventions
- UI copy is French; keep tone and accents when editing user-visible strings.
- Emoji are used as iconography in tabs, toasts, and status text (e.g. `📊`, `✅`, `⚠️`). Match the surrounding style instead of swapping for lucide icons (that path is part of the dead ui/* scaffold).
- Fonts (`DM Mono`, `Syne`) are loaded via Google Fonts in `index.html`; CSS references them through `--font-mono` / `--font-main`.

## Edit map (where work usually lands)
- `src/App.jsx` — auth, polling, KPI math (`uc`, `U`, `hom`, `slope`), CSV export, reset.
- `src/lib/supabase.js` — client + `formatTS` (fr-FR time-of-day only).
- `src/components/ChartPanel.jsx` — Chart.js v4 wiring (registered manually), tabs (`chart` / `table` / `uncert`), PT100 filtered-average logic.
- `src/components/SettingsModal.jsx`, `SensorCard.jsx`, `MiniCards.jsx`, `InfoPanel.jsx`, `StatusBar.jsx` — presentational, driven by props from `App.jsx`.
