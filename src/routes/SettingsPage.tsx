/**
 * Settings, plus the import and export controls — which matter more here than
 * in most apps, because there is no account and no sync. The export file is the
 * only way history moves between the Windows app and the web app.
 */

import { useRef, useState } from 'react';
import { useApp } from '../state/app';

export function SettingsPage() {
  const settings = useApp((s) => s.settings);
  const persistent = useApp((s) => s.persistent);
  const updateSettings = useApp((s) => s.updateSettings);
  const exportData = useApp((s) => s.exportData);
  const importData = useApp((s) => s.importData);
  const resetTrainerStats = useApp((s) => s.resetTrainerStats);
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const onExport = async () => {
    const json = await exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cube-solver-pro-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage('Exported. Keep that file somewhere safe — it is your only backup.');
  };

  const onImport = async (file: File) => {
    const replace = window.confirm(
      'Replace everything currently stored?\n\n' +
        'OK replaces your existing sessions and solves.\n' +
        'Cancel adds the imported ones alongside what you already have.',
    );
    try {
      const result = await importData(await file.text(), replace ? 'replace' : 'merge');
      const from = result.source === 'cstimer' ? ' from csTimer' : '';
      setMessage(
        `Imported ${result.solves.length} solves across ${result.sessions.length} sessions${from}.`,
      );
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <div className="page page-narrow">
      <header className="page-header">
        <h1>Settings</h1>
      </header>

      {!persistent && (
        <div className="card notice-warning" style={{ marginBottom: 16 }}>
          <strong>This device is not saving your solves.</strong>
          <p style={{ marginBottom: 0 }}>
            The browser would not open its local database, which usually means private browsing
            or blocked site data. The app works, but everything is lost when you close it. Export
            before you finish if you want to keep anything.
          </p>
        </div>
      )}

      <div className="stack">
        <section className="card">
          <h2>Appearance</h2>
          <label className="setting">
            <span>Theme</span>
            <select
              value={settings.theme}
              onChange={(e) => void updateSettings({ theme: e.target.value as 'system' | 'light' | 'dark' })}
            >
              <option value="system">Match the system</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label className="setting">
            <span>
              Hide everything but the timer while solving
              <small>Keeps the scramble and your times out of the corner of your eye.</small>
            </span>
            <input
              type="checkbox"
              checked={settings.zenMode}
              onChange={(e) => void updateSettings({ zenMode: e.target.checked })}
            />
          </label>
          <label className="setting">
            <span>
              Hide the running time
              <small>Some people go faster when they cannot watch the clock.</small>
            </span>
            <input
              type="checkbox"
              checked={settings.hideTimeWhileRunning}
              onChange={(e) => void updateSettings({ hideTimeWhileRunning: e.target.checked })}
            />
          </label>
        </section>

        <section className="card">
          <h2>Timing</h2>
          <label className="setting">
            <span>
              Inspection
              <small>
                A countdown before the solve, as in competition. Going over fifteen seconds adds
                two, and over seventeen is a DNF.
              </small>
            </span>
            <input
              type="checkbox"
              checked={settings.inspection}
              onChange={(e) => void updateSettings({ inspection: e.target.checked })}
            />
          </label>
          <label className="setting">
            <span>Inspection length</span>
            <span className="row">
              <input
                type="number"
                min={5}
                max={60}
                value={settings.inspectionSeconds}
                onChange={(e) =>
                  void updateSettings({ inspectionSeconds: Number(e.target.value) || 15 })
                }
                style={{ width: 80 }}
              />
              <span className="muted">seconds</span>
            </span>
          </label>
          <label className="setting">
            <span>
              Hold before starting
              <small>How long the spacebar must be down before the timer will start.</small>
            </span>
            <span className="row">
              <input
                type="number"
                min={0}
                max={1000}
                step={50}
                value={settings.holdToStartMs}
                onChange={(e) => void updateSettings({ holdToStartMs: Number(e.target.value) || 0 })}
                style={{ width: 90 }}
              />
              <span className="muted">ms</span>
            </span>
          </label>
        </section>

        <section className="card">
          <h2>Your data</h2>
          <p>
            Everything is stored on this device only. There is no account and nothing is uploaded.
            Use the export file to move your history to another machine or to keep a backup.
          </p>
          <div className="row">
            <button className="primary" onClick={() => void onExport()}>Export everything</button>
            <button onClick={() => fileInput.current?.click()}>Import a file</button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json,.txt"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onImport(file);
                e.target.value = '';
              }}
            />
          </div>
          <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>
            Import accepts this app’s export files and csTimer exports.
          </p>
          {message && <p className="notice" style={{ marginTop: 12, marginBottom: 0 }}>{message}</p>}
        </section>

        <section className="card">
          <h2>Trainer progress</h2>
          <p>
            Clears every algorithm’s attempt count, best time and learning status. Your solves are
            not affected.
          </p>
          <button
            className="danger"
            onClick={() => {
              if (window.confirm('Reset all algorithm trainer progress? This cannot be undone.')) {
                void resetTrainerStats();
              }
            }}
          >
            Reset trainer progress
          </button>
        </section>

        <section className="card">
          <h2>Getting around</h2>
          <ul className="shortcut-list">
            <li><kbd>Space</kbd> hold, then release, to start the timer</li>
            <li><kbd>Any key</kbd> stops a running solve</li>
            <li><kbd>Esc</kbd> cancels inspection or a hold</li>
          </ul>
          <button className="ghost" onClick={() => void updateSettings({ tourSeen: false })}>
            Show the welcome tour again
          </button>
        </section>
      </div>
    </div>
  );
}
