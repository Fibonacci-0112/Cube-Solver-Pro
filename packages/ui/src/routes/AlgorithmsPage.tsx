/**
 * A reference for every algorithm in the app, with the case drawn from the
 * cube state rather than from a stored picture, and room to record your own
 * algorithm where you prefer a different one.
 */

import { useMemo, useState } from 'react';
import {
  ALG_SETS,
  algFor,
  buildDrill,
  formatTime,
  groupsOf,
  pairFacelets,
  parseAlg,
} from '@cube/core';
import { CubePerspective, LastLayerDiagram } from '../components/CubeDiagram';
import { useApp } from '../state/app';

export function AlgorithmsPage() {
  const trainerStats = useApp((s) => s.trainerStats);
  const updateTrainerStat = useApp((s) => s.updateTrainerStat);
  const [setId, setSetId] = useState('pll');
  const [group, setGroup] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const set = ALG_SETS.find((s) => s.id === setId)!;
  const groups = useMemo(() => groupsOf(set), [set]);
  const shown = group ? set.cases.filter((c) => c.group === group) : set.cases;

  const saveCustom = (caseId: string) => {
    const value = draft.trim();
    if (value) {
      try {
        parseAlg(value);
      } catch (e) {
        setError((e as Error).message);
        return;
      }
    }
    void updateTrainerStat(set.id, caseId, { customAlg: value || undefined });
    setEditing(null);
    setError(null);
  };

  return (
    <div className="page page-wide">
      <header className="page-header">
        <h1>Algorithms</h1>
        <p>
          {set.description} Every picture is drawn from the real cube state the algorithm solves,
          so what you see is what you will be looking at.
        </p>
      </header>

      <div className="row" style={{ marginBottom: 12 }}>
        {ALG_SETS.map((s) => (
          <button
            key={s.id}
            className={s.id === setId ? 'primary' : ''}
            onClick={() => {
              setSetId(s.id);
              setGroup(null);
            }}
          >
            {s.name} <span className="muted">({s.cases.length})</span>
          </button>
        ))}
      </div>

      <div className="row filter-row" style={{ marginBottom: 18 }}>
        <button className={group === null ? 'primary' : 'ghost'} onClick={() => setGroup(null)}>
          All
        </button>
        {groups.map((name) => (
          <button
            key={name}
            className={group === name ? 'primary' : 'ghost'}
            onClick={() => setGroup(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="alg-grid">
        {shown.map((algCase) => {
          const stat = trainerStats[`${set.id}:${algCase.id}`];
          const alg = algFor(algCase, stat);
          const drill = buildDrill(alg, () => 0);
          return (
            <article className="card alg-card" key={algCase.id}>
              <div className="alg-card-top">
                {set.id === 'f2l' ? (
                  <CubePerspective
                    cube={drill.state}
                    emphasis={pairFacelets(drill.cubie)}
                    size={104}
                    label={`${algCase.name}: where the pair is`}
                  />
                ) : (
                  <LastLayerDiagram
                    cube={drill.cubie}
                    mode={set.id === 'oll' ? 'orientation' : 'permutation'}
                    arrows={set.id === 'pll'}
                    cell={26}
                  />
                )}
                <div>
                  <div className="row" style={{ gap: 6 }}>
                    <strong>{algCase.name}</strong>
                    <button
                      className="ghost star"
                      aria-pressed={stat?.starred ?? false}
                      onClick={() => void updateTrainerStat(set.id, algCase.id, { starred: !stat?.starred })}
                      title="Star this case"
                    >
                      {stat?.starred ? '★' : '☆'}
                    </button>
                  </div>
                  <div className="muted alg-group">{algCase.group}</div>
                  {stat && stat.attempts > 0 && (
                    <div className="muted alg-stat">
                      {stat.attempts}× {stat.bestMs !== undefined && <>· best {formatTime(stat.bestMs)}</>}
                    </div>
                  )}
                </div>
              </div>

              {editing === algCase.id ? (
                <div className="alg-edit">
                  <input
                    className="mono"
                    value={draft}
                    autoFocus
                    placeholder={algCase.algs[0]}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveCustom(algCase.id)}
                  />
                  {error && <div className="bad alg-error">{error}</div>}
                  <div className="row">
                    <button className="primary" onClick={() => saveCustom(algCase.id)}>Save</button>
                    <button className="ghost" onClick={() => { setEditing(null); setError(null); }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mono alg-text">{alg}</div>
                  {stat?.customAlg && <div className="muted alg-note">your own</div>}
                  {algCase.algs.length > 1 && !stat?.customAlg && (
                    <div className="alg-alternatives">
                      {algCase.algs.slice(1).map((alternative) => (
                        <div className="mono alg-text alt" key={alternative}>{alternative}</div>
                      ))}
                    </div>
                  )}
                  <button
                    className="ghost alg-edit-button"
                    onClick={() => {
                      setEditing(algCase.id);
                      setDraft(stat?.customAlg ?? '');
                      setError(null);
                    }}
                  >
                    {stat?.customAlg ? 'Edit your algorithm' : 'Use a different algorithm'}
                  </button>
                </>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
