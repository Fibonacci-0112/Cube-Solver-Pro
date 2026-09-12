/**
 * Launches the packaged app in the real Electron shell and checks the things
 * the custom `app://` scheme exists to make work: a secure origin, a service
 * worker, a local database, and a scramble actually being generated.
 *
 * Run with:  npx electron scripts/smoke-electron.cjs
 * (on a headless machine, prefix with `xvfb-run -a`)
 */
const path = require('node:path');
const { app, BrowserWindow } = require('electron');

require(path.join(__dirname, '..', 'dist-electron', 'main.cjs'));

const checks = [];
const check = (name, passed, detail) => {
  checks.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

app.whenReady().then(() => {
  setTimeout(async () => {
    const [win] = BrowserWindow.getAllWindows();
    if (!win) {
      check('a window opens', false);
      app.exit(1);
      return;
    }
    const run = (js) => win.webContents.executeJavaScript(js);

    try {
      check('served over the app scheme', win.webContents.getURL().startsWith('app://'));
      check('the page is a secure context', await run('window.isSecureContext'));
      check('React mounted', await run("!!document.querySelector('#root')?.children.length"));
      // The desktop build deliberately does not register one; see main.tsx.
      check(
        'no service worker in the desktop build',
        !(await run('!!navigator.serviceWorker.controller')),
      );
      check(
        'IndexedDB is usable',
        await run(`new Promise((resolve) => {
          const request = indexedDB.open('smoke-test', 1);
          request.onsuccess = () => { request.result.close(); resolve(true); };
          request.onerror = () => resolve(false);
        })`),
      );

      // Wait for the solver tables, then confirm a real scramble appeared.
      await new Promise((r) => setTimeout(r, 6000));
      const scramble = await run(
        "document.querySelector('.scramble-text')?.textContent?.trim() ?? ''",
      );
      check('a scramble was generated', scramble.split(/\s+/).length >= 15, scramble.slice(0, 60));
    } catch (error) {
      check('checks ran without error', false, error.message);
    }

    const failed = checks.filter((c) => !c.passed).length;
    console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
    app.exit(failed === 0 ? 0 : 1);
  }, 4000);
});
