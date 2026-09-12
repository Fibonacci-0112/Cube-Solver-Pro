/**
 * The session's solves, most recent first, with the penalty controls a cuber
 * reaches for straight after stopping the timer.
 */

import { useState } from 'react';
import { useApp } from '../state/app';
import { formatSolve, type Penalty, type Solve } from '../stats/solves';

export function SolveList({ solves, limit }: { solves: Solve[]; limit?: number }) {
  const setPenalty = useApp((s) => s.setPenalty);
  const setComment = useApp((s) => s.setComment);
  const deleteSolve = useApp((s) => s.deleteSolve);
  const [openId, setOpenId] = useState<string | null>(null);

  const ordered = [...solves].reverse();
  const shown = limit ? ordered.slice(0, limit) : ordered;
  const open = shown.find((s) => s.id === openId) ?? null;

  if (solves.length === 0) {
    return <div className="empty">No solves yet. Hold the spacebar to start.</div>;
  }

  const togglePenalty = (solve: Solve, penalty: Penalty) => {
    void setPenalty(solve.id, solve.penalty === penalty ? 'none' : penalty);
  };

  return (
    <div className="solve-list">
      <div className="solve-chips">
        {shown.map((solve, index) => (
          <button
            key={solve.id}
            className={`solve-chip mono ${solve.id === openId ? 'is-open' : ''} ${
              solve.penalty === 'dnf' ? 'is-dnf' : ''
            }`}
            onClick={() => setOpenId(solve.id === openId ? null : solve.id)}
            title={solve.scramble || undefined}
          >
            <span className="solve-index">{solves.length - index}.</span>
            {formatSolve(solve)}
            {solve.comment && <span className="solve-note" aria-label="has a note">•</span>}
          </button>
        ))}
      </div>

      {open && (
        <div className="solve-detail card">
          <div className="row solve-detail-head">
            <strong className="mono">{formatSolve(open)}</strong>
            <div className="nav-spacer" />
            <button
              className={open.penalty === 'plus2' ? 'primary' : ''}
              onClick={() => togglePenalty(open, 'plus2')}
            >
              +2
            </button>
            <button
              className={open.penalty === 'dnf' ? 'primary' : ''}
              onClick={() => togglePenalty(open, 'dnf')}
            >
              DNF
            </button>
            <button
              className="danger"
              onClick={() => {
                void deleteSolve(open.id);
                setOpenId(null);
              }}
            >
              Delete
            </button>
            <button className="ghost" onClick={() => setOpenId(null)}>
              Close
            </button>
          </div>
          {open.scramble && <div className="solve-scramble mono">{open.scramble}</div>}
          <input
            className="solve-comment"
            placeholder="Add a note (what went wrong, what to work on)"
            defaultValue={open.comment ?? ''}
            onBlur={(e) => void setComment(open.id, e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
