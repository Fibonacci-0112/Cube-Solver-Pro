/**
 * Bundles the Electron main and preload scripts.
 *
 * They are written in TypeScript but must run as CommonJS in the Electron
 * process, so esbuild converts them rather than adding a second tsconfig.
 */
import { build } from 'esbuild';

const common = {
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  external: ['electron'],
  logLevel: 'info',
};

await build({ ...common, entryPoints: ['electron/main.ts'], outfile: 'dist-electron/main.cjs' });
await build({ ...common, entryPoints: ['electron/preload.ts'], outfile: 'dist-electron/preload.cjs' });
