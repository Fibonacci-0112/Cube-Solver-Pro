/**
 * The whole interface, and the one function a shell needs to put it on screen.
 *
 * Every platform renders this same tree. A shell's job is to open a window, say
 * which platform it is, and call `mount`; it contributes no screens of its own,
 * which is what stops the three builds drifting into three different apps.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Platform } from '@cube/platform';
import App from './App';
import { setPlatform } from './state/app';
import './styles/index.css';

export { default as App } from './App';
export { setPlatform, platform, useApp, sessionsForPuzzle } from './state/app';

export function mount(container: HTMLElement, platform: Platform): void {
  setPlatform(platform);
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
