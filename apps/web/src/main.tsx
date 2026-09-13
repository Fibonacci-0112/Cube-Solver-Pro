/**
 * The web shell.
 *
 * The only one of the three that registers a service worker: here the files
 * come over the network, so caching them is what makes the app installable and
 * usable without a connection.
 */

import { createPlatform } from '@cube/platform';
import { mount } from '@cube/ui';

const container = document.getElementById('root');
if (!container) throw new Error('index.html is missing its root element');

void createPlatform({ shell: 'web', version: __APP_VERSION__ }).then((platform) => {
  mount(container, platform);
});

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch(() => {
        // Offline support is a bonus; the app works fine without it.
      });
  });
}
