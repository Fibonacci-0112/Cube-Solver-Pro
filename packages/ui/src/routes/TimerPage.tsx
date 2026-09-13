/**
 * The timer: scramble, stopwatch, and the running statistics for the session.
 */

import { useCallback, useMemo, useState } from 'react';
import { useApp, sessionsForPuzzle } from '../state/app';
import { useScrambleQueue } from '../state/scrambler';
import { useTimer, useTimerKeyboard, type TimerResult } from '../state/useTimer';
import {
  average,
  best,
  formatTime,
  PUZZLE_IDS,
  type PuzzleId,
  PUZZLES,
  summarise,
} from '@cube/core';
import { CubeNet } from '../components/CubeDiagram';
import { SolveList } from '../components/SolveList';
import { StatGrid } from '../components/StatGrid';

export function TimerPage() {
  const settings = useApp((s) => s.settings);
  const sessions = useApp((s) => s.sessions);
  const currentSessionId = useApp((s) => s.currentSessionId);
  const solves = useApp((s) => s.solves);
  const setPuzzle = useApp((s) => s.setPuzzle);
  const selectSession = useApp((s) => s.selectSession);
  const createSession = useApp((s) => s.createSession);
  const addSolve = useApp((s) => s.addSolve);

  const puzzle = settings.currentPuzzle;
  const queue = useScrambleQueue(puzzle);
  const [showPreview, setShowPreview] = useState(false);

  const onComplete = useCallback(
    (result: TimerResult) => {
      void addSolve({
        puzzle,
        scramble: queue.current?.text ?? '',
        timeMs: Math.round(result.timeMs),
        penalty: result.penalty,
      });
      queue.advance();
    },
    [addSolve, puzzle, queue],
  );

  const timer = useTimer({
    inspection: settings.inspection,
    inspectionSeconds: settings.inspectionSeconds,
    holdToStartMs: settings.holdToStartMs,
    onComplete,
    disabled: queue.preparing || !queue.current,
  });
  useTimerKeyboard(timer, true);

  const summary = useMemo(() => summarise(solves), [solves]);
  const sessionOptions = sessionsForPuzzle(sessions, puzzle);
  const solving = timer.phase === 'running';
  const hidden = solving && settings.zenMode;

  const display = (() => {
    if (timer.phase === 'inspection') {
      const seconds = timer.displayMs / 1000;
      return seconds <= 0 ? '0' : Math.ceil(seconds).toString();
    }
    if (solving && settings.hideTimeWhileRunning) return 'solving…';
    return formatTime(timer.displayMs);
  })();

  const statusText = (() => {
    if (queue.preparing) {
      const label = queue.progress?.label ?? 'starting up';
      return `Preparing the ${PUZZLES[puzzle].name} scrambler — ${label}…`;
    }
    if (timer.phase === 'running') return 'Press any key to stop';
    if (timer.armed) return 'Release to start';
    if (timer.holding) return 'Keep holding…';
    if (timer.phase === 'inspection') return 'Hold space when you are ready';
    if (settings.inspection) return 'Press space to begin inspection';
    return 'Hold space, then release to start';
  })();

  const onNewSession = () => {
    const name = window.prompt('Name for the new session', `Session ${sessionOptions.length + 1}`);
    if (name?.trim()) void createSession(name.trim());
  };

  return (
    <div className="timer-page">
      <div className="timer-toolbar" hidden={hidden}>
        <label className="field">
          <span>Puzzle</span>
          <select value={puzzle} onChange={(e) => void setPuzzle(e.target.value as PuzzleId)}>
            {PUZZLE_IDS.map((id) => (
              <option key={id} value={id}>
                {PUZZLES[id].name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Session</span>
          <select
            value={currentSessionId ?? ''}
            onChange={(e) => void selectSession(e.target.value)}
          >
            {sessionOptions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>
        </label>

        <button className="ghost" onClick={onNewSession}>
          New session
        </button>

        <span className="timer-method muted">
          {PUZZLES[puzzle].method === 'random-state'
            ? 'Random-state scrambles'
            : `${PUZZLES[puzzle].moveCount} random moves`}
        </span>
      </div>

      <div className="scramble" hidden={hidden}>
        {queue.preparing ? (
          <span className="muted">Building the solver’s tables, one moment…</span>
        ) : (
          <span className="scramble-text mono">{queue.current?.text}</span>
        )}
        <div className="scramble-actions">
          <button className="ghost" onClick={queue.regenerate} disabled={queue.preparing}>
            New scramble
          </button>
          <button className="ghost" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? 'Hide preview' : 'Show preview'}
          </button>
        </div>
        {showPreview && queue.current && (
          <div className="scramble-preview">
            <CubeNet cube={queue.current.state} cell={puzzle === '777' ? 9 : 13} />
          </div>
        )}
      </div>

      <div
        className={[
          'timer-face',
          timer.armed ? 'is-armed' : '',
          timer.holding && !timer.armed ? 'is-holding' : '',
          timer.phase === 'inspection' ? 'is-inspecting' : '',
          timer.pendingPenalty !== 'none' ? `penalty-${timer.pendingPenalty}` : '',
        ].join(' ')}
        onPointerDown={(e) => {
          e.preventDefault();
          timer.press(e.timeStamp);
        }}
        onPointerUp={(e) => timer.release(e.timeStamp)}
        onPointerLeave={(e) => timer.release(e.timeStamp)}
        role="button"
        tabIndex={0}
        aria-label="Solve timer"
      >
        <div className="timer-value mono">{display}</div>
        <div className="timer-status">
          {timer.pendingPenalty === 'plus2' && <strong className="warn">+2 — over 15 seconds</strong>}
          {timer.pendingPenalty === 'dnf' && <strong className="bad">DNF — over 17 seconds</strong>}
          {timer.pendingPenalty === 'none' && statusText}
        </div>
      </div>

      <div className="timer-bottom" hidden={hidden}>
        <StatGrid
          items={[
            { label: 'solves', value: String(summary.count) },
            { label: 'best', value: formatTime(best(solves) as number | undefined) },
            { label: 'ao5', value: statText(average(solves, 5)) },
            { label: 'ao12', value: statText(average(solves, 12)) },
          ]}
        />
        <SolveList solves= {solves} limit={12} />
      </div>
    </div>
  );
}

const statText = (value: ReturnType<typeof average>): string =>
  value === undefined ? '—' : value === 'DNF' ? 'DNF' : formatTime(value);
