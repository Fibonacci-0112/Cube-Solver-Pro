/**
 * A cube you turn in the app, that watches what you are doing and tells you the
 * next step. It reads the actual state rather than following a script, so you
 * can turn it anywhere, make a mess, and it will still know where you are.
 */

import { useState } from 'react';
import { CubeControls, CubeView, MoveHistory, useCubeSandbox } from '../components/InteractiveCube';
import { analyse, type Method } from '@cube/core';

export function GuidedSolve({ method }: { method: Method }) {
  const sandbox = useCubeSandbox();
  const [showAlgorithm, setShowAlgorithm] = useState(true);
  const advice = analyse(sandbox.cubie, method);

  return (
    <div className="guided">
      <div className="guided-top">
        <CubeView sandbox={sandbox} />
        <div className="guided-advice card">
          <div className="row">
            <h3 style={{ margin: 0 }}>{advice.step}</h3>
            {advice.progress && (
              <span className="muted">
                {advice.progress.done} of {advice.progress.total}
              </span>
            )}
          </div>
          <p>{advice.detail}</p>

          {advice.caseName && (
            <p className="guided-case">
              You are looking at <strong>{advice.caseName}</strong>.
            </p>
          )}

          {advice.setup && (
            <div className="lesson-algbox">
              <div className="field-label">First turn the cube</div>
              <div className="mono lesson-algbox-text">{advice.setup}</div>
            </div>
          )}

          {advice.algorithm &&
            (showAlgorithm ? (
              <div className="lesson-algbox">
                <div className="field-label">Algorithm</div>
                <div className="mono lesson-algbox-text">{advice.algorithm}</div>
                <div className="row" style={{ marginTop: 8 }}>
                  <button
                    className="ghost"
                    onClick={() => sandbox.apply(`${advice.setup ?? ''} ${advice.algorithm}`)}
                  >
                    Do it for me
                  </button>
                  <button className="ghost" onClick={() => setShowAlgorithm(false)}>
                    Hide algorithms
                  </button>
                </div>
              </div>
            ) : (
              <button className="ghost" onClick={() => setShowAlgorithm(true)}>
                Show the algorithm
              </button>
            ))}

          {advice.solved && <p className="guided-solved">Nicely done.</p>}
        </div>
      </div>

      <div className="card guided-controls">
        <div className="row" style={{ marginBottom: 10 }}>
          <button className="primary" onClick={sandbox.newScramble}>Scramble</button>
          <button onClick={sandbox.clearMoves} disabled={sandbox.moves.length === 0}>
            Back to the scramble
          </button>
          <button className="ghost" onClick={sandbox.reset}>Solved cube</button>
        </div>
        {sandbox.scramble && (
          <p className="mono guided-scramble">
            <span className="muted">Scramble: </span>
            {sandbox.scramble}
          </p>
        )}
        <CubeControls sandbox={sandbox} />
        <MoveHistory sandbox={sandbox} />
      </div>
    </div>
  );
}
