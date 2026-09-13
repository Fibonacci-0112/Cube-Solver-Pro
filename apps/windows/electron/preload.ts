/**
 * Preload script.
 *
 * The app is an ordinary web page and needs nothing from Electron, so this
 * exposes only the version string for the Settings page. Keeping the bridge
 * this narrow is what makes running with sandboxing and context isolation
 * switched on straightforward.
 */

import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('desktop', {
  version: process.env.npm_package_version ?? '',
  platform: process.platform,
});
