import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Served as a GitHub Pages project site at https://<user>.github.io/body-log/,
// so everything must resolve under this sub-path. Change this if the repo is
// renamed or moved to a custom domain / user page (then '/').
const base = '/body-log/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Body Log — Measurements Tracker',
        short_name: 'Body Log',
        description: 'Private, offline-first bodybuilding measurements tracker.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        id: base,
        start_url: base,
        scope: base,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // SPA fallback so client-side routes resolve from the cached shell.
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
});
