/**
 * One build, three shells.
 *
 * Every target compiles the same `@cube/ui` tree from the same sources; the
 * shells differ only in how the finished bundle is delivered to a window. That
 * is the whole reason the app can claim three platforms without three codebases,
 * so the differences are kept here, in one visible list, rather than spread
 * through the app as environment checks.
 *
 * The service worker is the one real divergence. On the web it is what makes the
 * app installable and usable offline. Inside Electron and inside the Android
 * WebView the assets are already local, so a worker would cache local files over
 * a local protocol for no gain — and a stale cache could outlive an app update,
 * leaving a shipped binary serving code from the previous release.
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export type Shell = 'web' | 'windows' | 'android';

const resolve = (path: string) => fileURLToPath(new URL(path, import.meta.url));

const { version } = createRequire(import.meta.url)('./package.json') as { version: string };

/**
 * Packages are aliased to their TypeScript sources rather than to built output.
 * There is no publish step and no consumer outside this repo, so a build step
 * per package would only add a stale-artifact failure mode: edit core, forget to
 * rebuild, debug the old code.
 */
export const workspaceAliases = {
  '@cube/core': resolve('./packages/core/src/index.ts'),
  '@cube/platform': resolve('./packages/platform/src/index.ts'),
  '@cube/ui': resolve('./packages/ui/src/index.tsx'),
};

export function createViteConfig(shell: Shell): UserConfig {
  return defineConfig({
    // Relative asset URLs work for all three: a web deploy at the site root,
    // Electron's `app://` protocol, and Capacitor's local file server.
    base: './',
    // Icons and the favicon are the same on every platform, so they live once
    // at the repository root rather than being copied into each shell.
    publicDir: resolve('./public'),
    resolve: { alias: workspaceAliases },
    plugins: [
      react(),
      ...(shell === 'web'
        ? [
            VitePWA({
              registerType: 'autoUpdate',
              injectRegister: null,
              includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
              workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
                // The Kociemba pruning tables push the bundle past the 2 MiB default.
                maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
              },
              manifest: {
                name: 'Cube Improver',
                short_name: 'Cube Improver',
                description: 'Speedcubing timer, scramble generator and algorithm trainer.',
                theme_color: '#0f1117',
                background_color: '#0f1117',
                display: 'standalone',
                orientation: 'any',
                start_url: '.',
                icons: [
                  { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                  { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                  {
                    src: 'icons/icon-512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'maskable',
                  },
                ],
              },
            }),
          ]
        : []),
    ],
    define: {
      // One version number for all three stores, read from the root manifest so
      // a release cannot ship a desktop build claiming a different version from
      // the phone build cut at the same moment.
      __APP_VERSION__: JSON.stringify(version),
      __CUBE_SHELL__: JSON.stringify(shell),
    },
    build: { outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 1500 },
  });
}
