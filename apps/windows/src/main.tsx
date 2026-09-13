/**
 * The Windows shell.
 *
 * Identical to the web entry point apart from the missing service worker: the
 * files are already on disk behind Electron's `app://` protocol, so caching
 * them would gain nothing and a stale cache could outlive an app update.
 */

import { createPlatform } from '@cube/platform';
import { mount } from '@cube/ui';

const container = document.getElementById('root');
if (!container) throw new Error('index.html is missing its root element');

void createPlatform({ shell: 'windows', version: __APP_VERSION__ }).then((platform) => {
  mount(container, platform);
});
