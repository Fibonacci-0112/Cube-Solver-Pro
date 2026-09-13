/**
 * Electron main process.
 *
 * The built app is served over a custom `app://` scheme rather than from
 * `file://`. Registering it as a standard, secure scheme gives the page a real
 * origin, which is what lets the service worker and local database work exactly
 * as they do on the web — the same build then runs in both places with no
 * conditional code.
 */

import { app, BrowserWindow, Menu, net, protocol, shell } from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SCHEME = 'app';
const devServer = process.env.VITE_DEV_SERVER_URL;

/** Where the built web app lives, relative to the compiled main process. */
const webRoot = path.join(__dirname, '..', 'dist');

protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME,
    privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true },
  },
]);

function serveBuiltApp(): void {
  protocol.handle(SCHEME, async (request) => {
    const { pathname } = new URL(request.url);
    const relative = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
    const resolved = path.normalize(path.join(webRoot, relative));

    // Refuse anything that climbs out of the build directory.
    if (!resolved.startsWith(webRoot)) {
      return new Response('Not found', { status: 404 });
    }
    return net.fetch(pathToFileURL(resolved).toString());
  });
}

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 380,
    minHeight: 520,
    backgroundColor: '#1a1a19',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Painting only once the first frame is ready avoids a white flash before
  // the dark theme loads.
  window.once('ready-to-show', () => window.show());

  // Links to anywhere else open in the user's browser, never in the app frame.
  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });
  window.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(`${SCHEME}://`) && url !== devServer) {
      event.preventDefault();
      void shell.openExternal(url);
    }
  });

  void window.loadURL(devServer ?? `${SCHEME}://local/index.html`);
  return window;
}

function buildMenu(): void {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: 'File',
        submenu: [{ role: 'quit' }],
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
    ]),
  );
}

// One window at a time; a second launch focuses the one already open.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const [window] = BrowserWindow.getAllWindows();
    if (window) {
      if (window.isMinimized()) window.restore();
      window.focus();
    }
  });

  void app.whenReady().then(() => {
    if (!devServer) serveBuiltApp();
    buildMenu();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
