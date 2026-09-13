/**
 * File transfer for the two shells that have a real browser download stack:
 * the web app, and Electron — where Chromium shows its own save dialog, so the
 * ordinary anchor download is already the native experience.
 *
 * Android is the exception and supplies its own `save`; see apps/android.
 */

import type { FileTransfer, SaveOutcome } from '../types';

export function createBrowserFileTransfer(): FileTransfer {
  return {
    async save(suggestedName, contents): Promise<SaveOutcome> {
      const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = suggestedName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      return 'saved';
    },

    open(accept) {
      return pickTextFile(accept);
    },
  };
}

/**
 * Reading a file works the same everywhere, Android included: a file input opens
 * the system picker inside a WebView just as it does in a tab. Only writing one
 * back out needs platform-specific handling.
 */
export function pickTextFile(accept: string): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';

    const finish = (value: string | null) => {
      input.remove();
      resolve(value);
    };

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) {
        finish(null);
        return;
      }
      void file.text().then(finish, () => finish(null));
    });
    // Chromium fires this when the picker is dismissed without a choice. All
    // three shells are Chromium, so the promise always settles.
    input.addEventListener('cancel', () => finish(null));

    document.body.appendChild(input);
    input.click();
  });
}
