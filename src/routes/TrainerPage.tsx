/**
 * The algorithm trainer: shows a case, times how long you take to solve it, and
 * keeps a per-case record so it can spend your practice where it is needed.
 */

import { useCallback, useMemo, useState } from 'react';
import { ALG_SETS } from '../algs';
import { algFor, buildDrill, groupsOf, pickCase } from '../algs/drill';
import type { AlgCase } from '../algs/types';
import { CubeNet, LastLayerDiagram } from '../components/CubeDiagram';
import { useApp } from '../state/app';
import { useTimer, useTimerKeyboard } from '../state/useTimer';
import { formatTime } from '../stats/solves';

type Status = 'unseen' | 'learning' | 'known';
const STATUSES: Status[] = ['unseen', 'learning', 'known'];

export function TrainerPage() {
  const settings = useApp((s) => s.settings);
  const trainerStats = useApp((s) => s.trainerStats);
  const trainerStatFor = useApp((s) => s.trainerStatFor);
  const recordAttempt = useApp((s) => s.recordAttempt);
  const updateTrainerStat = useApp((s) => s.updateTrainerStat);

  const [setId, setSetId] = useState('pll');
  const [groups, setGroups] = useState<string[] | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([...STATUSES]);
  const [starredOnly, setStarredOnly] = useState(false);
  const [current, setCurrent] = useState<AlgCase | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const set = ALG_SETS.find((s) => s.id === setId)!;
  const allGroups = useMemo(() => groupsOf(set), [set]);

  const statOf = useCallback(
    (algCase: AlgCase) => trainerStats[`${set.id}:${algCase.id}`],
    [trainerStats, set.id],
  );

  const pool = useMemo(
    () =>
      set.cases.filter((algCase) => {
        const stat = statOf(algCase);
        if (groups && !groups.includes(algCase.group)) return false;
        if (starredOnly && !stat?.starred) return false;
        return statuses.includes(stat?.status ?? 'unseen');
      }),
    [set, groups, statuses, starredOnly, statOf],
  );

  const drill = useMemo(
    () => (current ? buildDrill(algFor(current, statOf(current))) : null),
    // A new drill is wanted per case shown, not per keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current],
  );

  const nextCase = useCallback(() => {
    setRevealed(false);
    setCurrent((previous) => pickCase(pool, statOf, Math.random, previous?.id));
  }, [pool, statOf]);

  const onComplete = useCallback(
    ({ timeMs }: { timeMs: number }) => {
      if (!current) return;
      void recordAttempt(set.id, current.id, Math.round(timeMs), false);
      setLastResult(formatTime(timeMs));
      setRevealed(true);
    },
    [current, recordAttempt, set.id],
  );

  const timer = useTimer({
    inspection: false,
    inspectionSeconds: settings.inspectionSeconds,
    holdToStartMs: settings.holdToStartMs,
    onComplete,
    disabled: !current,
  });
  useTimerKeyboard(timer, Boolean(current));

  const markUnknown = () => {
    if (!current) return;
    void recordAttempt(set.id, current.id, 0, true);
    setLastResult('Marked as not known');
    setRevealed(true);
  };

  const stat = current ? trainerStatFor(set.id, current.id) : null;

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <div className="page page-wide">
      <header className="page-header">
        <h1>Algorithm trainer</h1>
        <p>
          Set up the case on your cube with the moves shown, then hold space and solve it. The
          trainer keeps a time per case and comes back more often to the ones costing you most.
        </p>
      </header>

      <div className="card trainer-filters">
        <div className="row">
          {ALG_SETS.map((s) => (
            <button
              key={s.id}
              className={s.id === setId ? 'primary' : ''}
              onClick={() => {
                setSetId(s.id);
                setGroups(null);
                setCurrent(null);
                setRevealed(false);
              }}
            >
              {s.name} <span className="muted">({s.cases.length})</span>
            </button>
          ))}
        </div>

        <div className="row filter-row">
          <span className="filter-label">Shapes</span>
          <button
            className={groups === null ? 'primary' : 'ghost'}
            onClick={() => setGroups(null)}
          >
            All
          </button>
          {allGroups.map((group) => (
            <button
              key={group}
              className={groups?.includes(group) ? 'primary' : 'ghost'}
              onClick={() => {
                const next = toggle(groups ?? [], group);
                setGroups(next.length === 0 ? null : next);
              }}
            >
              {group}
            </button>
          ))}
        </div>

        <div className="row filter-row">
          <span className="filter-label">Progress</span>
          {STATUSES.map((status) => (
            <button
              key={status}
              className={statuses.includes(status) ? 'primary' : 'ghost'}
              onClick={() => setStatuses(toggle(statuses, status))}
            >
              {status}
            </button>
          ))}
          <button
            className={starredOnly ? 'primary' : 'ghost'}
            onClick={() => setStarredOnly((v) => !v)}
          >
            ★ starred only
          </button>
          <div className="nav-spacer" />
          <span className="muted">{pool.length} cases selected</span>
        </div>
      </div>

      {pool.length === 0 ? (
        <div className="empty">
          Nothing matches those filters. Widen the shapes or progress settings above.
        </div>
      ) : !current ? (
        <div className="card trainer-start">
          <p>Ready when you are — {pool.length} cases in the pool.</p>
          <button className="primary" onClick={nextCase}>Start drilling</button>
        </div>
      ) : (
        <div className="trainer-drill">
          <div className="card trainer-case">
            <div className="trainer-diagram">
              {set.id === 'f2l' ? (
                <CubeNet cube={drill!.state} cell={16} />
              ) : (
                <LastLayerDiagram
                  cube={drill!.cubie}
                  mode={set.id === 'oll' ? 'orientation' : 'permutation'}
                  cell={26}
                />
              )}
            </div>
            <div className="trainer-case-body">
              <div className="row">
                <h2 style={{ margin: 0 }}>{revealed ? current.name : 'Which case is it?'}</h2>
                <button
                  className="ghost star"
                  aria-pressed={stat?.starred ?? false}
                  onClick={() => void updateTrainerStat(set.id, current.id, { starred: !stat?.starred })}
                  title="Star this case"
                >
                  {stat?.starred ? '★' : '☆'}
                </button>
              </div>
              <p className="muted" style={{ marginBottom: 8 }}>{current.group}</p>

              <div className="trainer-setup">
                <span className="field-label">Set it up with</span>
                <div className="mono scramble-text">{drill!.setup}</div>
              </div>

              {revealed ? (
                <div className="trainer-answer">
                  <span className="field-label">Algorithm</span>
                  <div className="mono scramble-text">{algFor(current, stat ?? undefined)}</div>
                </div>
              ) : (
                <button className="ghost" onClick={() => setRevealed(true)}>Show the algorithm</button>
              )}

              {stat && stat.attempts > 0 && (
                <p className="muted trainer-history">
                  {stat.attempts} attempt{stat.attempts === 1 ? '' : 's'}
                  {stat.bestMs !== undefined && <> · best {formatTime(stat.bestMs)}</>}
                  {stat.lastMs !== undefined && <> · last {formatTime(stat.lastMs)}</>}
                  {stat.dnfs > 0 && <> · {stat.dnfs} not known</>}
                </p>
              )}
            </div>
          </div>

          <div
            className={`timer-face trainer-timer ${timer.armed ? 'is-armed' : ''} ${
              timer.holding && !timer.armed ? 'is-holding' : ''
            }`}
            onPointerDown={(e) => {
              e.preventDefault();
              timer.press();
            }}
            onPointerUp={() => timer.release()}
            role="button"
            tabIndex={0}
            aria-label="Case timer"
          >
            <div className="timer-value mono">{formatTime(timer.displayMs)}</div>
            <div className="timer-status">
              {timer.phase === 'running'
                ? 'Press any key when it is solved'
                : timer.armed
                  ? 'Release to start'
                  : 'Hold space, then release to start'}
            </div>
          </div>

          <div className="row trainer-actions">
            <button className="primary" onClick={nextCase}>Next case</button>
            <button onClick={markUnknown}>I didn’t know it</button>
            <div className="nav-spacer" />
            <label className="field">
              <span>Mark as</span>
              <select
                value={stat?.status ?? 'unseen'}
                onChange={(e) =>
                  void updateTrainerStat(set.id, current.id, { status: e.target.value as Status })
                }
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
            {lastResult && <span className="muted">{lastResult}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
