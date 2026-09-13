/**
 * The Android shell.
 *
 * Same tree, same state, same solver as the other two; it differs only in how
 * the export file leaves the device.
 */

import { createPlatform } from '@cube/platform';
import { mount } from '@cube/ui';
import { createAndroidFileTransfer } from './files';

const container = document.getElementById('root');
if (!container) throw new Error('index.html is missing its root element');

void createPlatform({
  shell: 'android',
  version: __APP_VERSION__,
  files: createAndroidFileTransfer(),
}).then((platform) => {
  mount(container, platform);
});
