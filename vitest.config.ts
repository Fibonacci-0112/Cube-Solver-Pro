/**
 * One test run across every package.
 *
 * Almost all of it is `@cube/core`, which is the point: the cube model, the
 * solver, case recognition, statistics and the diagram geometry are all plain
 * functions, so they are tested once here rather than three times on three
 * devices. What is left for a real phone or a real desktop window is the thin
 * layer that opens a window and saves a file.
 */

import { defineConfig } from 'vitest/config';
import { workspaceAliases } from './vite.shared';

export default defineConfig({
  resolve: { alias: workspaceAliases },
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/*/src/**/*.test.{ts,tsx}'],
  },
});
