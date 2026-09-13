export type {
  AppInfo,
  FileTransfer,
  ImportMode,
  Platform,
  SaveOutcome,
  Shell,
  Store,
} from './types';

export { createMemoryStore } from './storage/memory';
export { openStore } from './storage/indexeddb';
export { createBrowserFileTransfer, pickTextFile } from './files/browser';

import { openStore } from './storage/indexeddb';
import { createBrowserFileTransfer } from './files/browser';
import type { FileTransfer, Platform, Shell } from './types';

/**
 * Assembles a platform from the shared pieces. A shell that needs its own
 * behaviour passes it in — Android does, for saving files — and everything it
 * does not override comes from the implementations above.
 */
export async function createPlatform(options: {
  shell: Shell;
  version: string;
  files?: FileTransfer;
}): Promise<Platform> {
  return {
    info: { shell: options.shell, version: options.version },
    store: await openStore(),
    files: options.files ?? createBrowserFileTransfer(),
  };
}
