/**
 * Getting the export file off an Android device.
 *
 * This is the one place a shell has to disagree with the others. A browser
 * download — an anchor with a `download` attribute — is inert inside a WebView:
 * nothing happens, and nothing reports that nothing happened, so the app would
 * look like it had exported and quietly not have. Android instead writes the
 * file into the app's cache directory and hands that file to the system share
 * sheet, which is how a phone expects to move a file to Drive, email or another
 * device.
 *
 * Reading a file back needs no special handling: a file input opens the system
 * picker inside a WebView exactly as it does in a tab.
 */

import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { pickTextFile } from '@cube/platform';
import type { FileTransfer, SaveOutcome } from '@cube/platform';

export function createAndroidFileTransfer(): FileTransfer {
  return {
    async save(suggestedName, contents): Promise<SaveOutcome> {
      const { uri } = await Filesystem.writeFile({
        path: suggestedName,
        data: contents,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      try {
        await Share.share({
          title: 'Cube Improver backup',
          url: uri,
          dialogTitle: 'Save or send your solve history',
        });
        return 'shared';
      } catch {
        // Android does not reliably distinguish a dismissed share sheet from a
        // failure, so both land here. The file is written either way; reporting
        // "cancelled" only decides whether the app claims success on screen.
        return 'cancelled';
      }
    },

    open(accept) {
      return pickTextFile(accept);
    },
  };
}
