/**
 * Session statistics: the headline numbers, how the times are moving, how they
 * are spread, and the full list underneath.
 */

import { useMemo } from 'react';
import { useApp, sessionsForPuzzle } from '../state/app';
import { DistributionChart, TrendChart } from '../components/Charts';
import { SolveList } from '../components/SolveList';
import { StatGrid } from '../components/StatGrid';
import { formatStat, PUZZLES, summarise } from '@cube/core';

export function StatsPage() {
  const settings = useApp((s) => s.settings);
  const sessions = useApp((s) => s.sessions);
  const currentSessionId = useApp((s) => s.currentSessionId);
  const solves = useApp((s) => s.solves);
  const selectSession = useApp((s) => s.selectSession);
  const renameSession = useApp((s) => s.renameSession);
  const deleteSession = useApp((s) => s.deleteSession);
  const clearSession = useApp((s) => s.clearSession);

  const summary = useMemo(() => summarise(solves), [solves]);
  const options = sessionsForPuzzle(sessions, settings.currentPuzzle);
  const session = sessions.find((s) => s.id === currentSessionId);

  const onRename = () => {
    if (!session) return;
    const name = window.prompt('Rename this session', session.name);
    if (name?.trim()) void renameSession(session.id, name.trim());
  };

  const onClear = () => {
    if (!session) return;
    if (window.confirm(`Delete all ${solves.length} solves in “${session.name}”? This cannot be undone.`)) {
      void clearSession(session.id);
    }
  };

  const onDelete = () => {
    if (!session) return;
    if (window.confirm(`Delete the session “${session.name}” and its solves? This cannot be undone.`)) {
      void deleteSession(session.id);
    }
  };

  return (
    <div className="page page-wide">
      <header className="page-header">
        <h1>Statistics</h1>
        <p>
          Everything here is for the session selected below, on {PUZZLES[settings.currentPuzzle].name}.
          Averages drop the fastest and slowest solves, and a DNF counts as the slowest.
        </p>
      </header>

      <div className="row" style={{ marginBottom: 16 }}>
        <label className="field">
          <span>Session</span>
          <select value={currentSessionId ?? ''} onChange={(e) => void selectSession(e.target.value)}>
            {options.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <button className="ghost" onClick={onRename}>Rename</button>
        <button className="ghost" onClick={onClear} disabled={solves.length === 0}>Clear solves</button>
        <button className="danger" onClick={onDelete}>Delete session</button>
      </div>

      <StatGrid
        items={[
          { label: 'solves', value: String(summary.count), hint: 'Total attempts in this session' },
          { label: 'completed', value: String(summary.solved), hint: 'Attempts that were not a DNF' },
          { label: 'best', value: formatStat(summary.best) },
          { label: 'mean', value: formatStat(summary.mean), hint: 'Every solve, nothing dropped' },
          { label: 'ao5', value: formatStat(summary.ao5) },
          { label: 'ao12', value: formatStat(summary.ao12) },
          { label: 'ao50', value: formatStat(summary.ao50) },
          { label: 'ao100', value: formatStat(summary.ao100) },
          { label: 'best ao5', value: formatStat(summary.bestAo5) },
          { label: 'best ao12', value: formatStat(summary.bestAo12) },
        ]}
      />

      <div className="stack" style={{ marginTop: 20 }}>
        <div className="card">
          <TrendChart solves={solves} />
        </div>
        <div className="card">
          <DistributionChart solves={solves} />
        </div>
        <div className="card">
          <h3>Every solve</h3>
          <SolveList solves={solves} />
        </div>
      </div>
    </div>
  );
}
