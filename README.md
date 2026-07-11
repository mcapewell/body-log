# Body-Log

A simple, **private, offline-first PWA** for tracking bodybuilding body measurements over time.
No accounts, no server — all your data lives locally on your device in IndexedDB.

## Features

- **Quick logging** of the essentials: bodyweight, body-fat %, chest, waist, arms, thighs, plus a note per session.
- **Dashboard** with the latest value per metric and **7-day / 30-day trend deltas** (↑ / ↓).
- **History** of every session — tap to edit or delete.
- **Progress charts** per metric with 30d / 90d / all ranges.
- **Units toggle** — metric (kg, cm) ⇄ imperial (lb, in). Values are stored in metric and converted only for display.
- **Reminders** — an in-app nudge when you're due to measure, plus best-effort OS notifications where the browser supports them.
- **Backup** — export/import your data as JSON.
- **Installable & offline** — a full PWA with a service worker; works with no connection.

> **On reminders:** a local-only PWA has no server to push scheduled notifications reliably across
> browsers, so the guaranteed reminder is the in-app nudge banner. OS notifications are attempted via
> the Periodic Background Sync API where available (installed PWA on Chromium) and are a no-op elsewhere.

## Tech

React 18 · Vite 6 · TypeScript · vite-plugin-pwa (Workbox) · idb · Chart.js · Vitest.

## Development

```bash
npm install
npm run dev        # start the dev server
npm run test       # run unit tests (unit conversion + trend math)
npm run build      # typecheck + production build
npm run preview    # serve the production build locally
```

## Icons

App icons are generated (no image tooling needed) with:

```bash
node scripts/generate-icons.mjs
```

## Deployment

Hosted on **GitHub Pages** via `.github/workflows/deploy.yml`: every push to `main`
runs the tests, builds, and publishes `dist/` to Pages. A one-time setup step is
required in the repo — **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The site is a project page served under a sub-path, so `vite.config.ts` sets
`base = '/body-log/'` and the router uses `import.meta.env.BASE_URL`. The build copies
`index.html` to `404.html` so deep-link refreshes resolve to the SPA. If you rename the
repo or move to a custom domain, update `base` accordingly.

Live app: https://mcapewell.github.io/body-log/

## Data & privacy

Everything is stored in your browser's IndexedDB. Nothing is sent anywhere. Use **Settings → Backup →
Export JSON** to keep a copy or move to another device (import replaces the current data).
