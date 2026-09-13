import { useEffect } from 'react';
import { HashRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useApp } from './state/app';
import { TimerPage } from './routes/TimerPage';
import { StatsPage } from './routes/StatsPage';
import { TrainerPage } from './routes/TrainerPage';
import { AlgorithmsPage } from './routes/AlgorithmsPage';
import { TutorialsPage } from './routes/TutorialsPage';
import { SettingsPage } from './routes/SettingsPage';
import { WelcomeTour } from './components/WelcomeTour';

const LINKS = [
  { to: '/timer', label: 'Timer', icon: '⏱' },
  { to: '/stats', label: 'Statistics', icon: '📈' },
  { to: '/trainer', label: 'Trainer', icon: '🎯' },
  { to: '/algorithms', label: 'Algorithms', icon: '🧩' },
  { to: '/tutorials', label: 'Tutorials', icon: '📖' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

/** Applies the chosen theme, or steps aside and lets the system decide. */
function useTheme() {
  const theme = useApp((s) => s.settings.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);
}

export default function App() {
  const ready = useApp((s) => s.ready);
  const init = useApp((s) => s.init);
  useTheme();

  useEffect(() => {
    void init();
  }, [init]);

  if (!ready) {
    return (
      <div className="booting">
        <div className="booting-inner">Opening your cube history…</div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="app">
        <nav className="nav">
          <div className="nav-brand">
            <span aria-hidden="true">🧊</span> Cube Solver Pro
          </div>
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className="nav-link">
              <span aria-hidden="true">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
          <div className="nav-spacer" />
          <p className="nav-note">
            Your solves are stored on this device only. Export them from Settings to keep a backup.
          </p>
        </nav>

        <main className="page-host">
          <Routes>
            <Route path="/" element={<Navigate to="/timer" replace />} />
            <Route path="/timer" element={<TimerPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/trainer" element={<TrainerPage />} />
            <Route path="/algorithms" element={<AlgorithmsPage />} />
            <Route path="/tutorials/*" element={<TutorialsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/timer" replace />} />
          </Routes>
        </main>

        <WelcomeTour />
      </div>
    </HashRouter>
  );
}
