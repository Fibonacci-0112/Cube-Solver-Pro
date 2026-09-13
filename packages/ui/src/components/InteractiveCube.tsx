/**
 * A cube you can turn in the app, for the guided solves.
 *
 * The state is recomputed from the move list rather than mutated, which makes
 * undo free and guarantees the picture always matches the moves listed under it.
 */

import { useCallback, useMemo, useState } from 'react';
import {
  type CubieCube,
  faceletsToCubie,
  generateScramble,
  prepareScramblerSync,
  PuzzleCube,
} from '@cube/core';
import { CubeNet } from './CubeDiagram';

export interface CubeSandbox {
  cube: PuzzleCube;
  cubie: CubieCube;
  scramble: string;
  moves: string[];
  apply: (alg: string) => void;
  undo: () => void;
  reset: () => void;
  newScramble: () => void;
  clearMoves: () => void;
}

export function useCubeSandbox(): CubeSandbox {
  const [scramble, setScramble] = useState('');
  const [moves, setMoves] = useState<string[]>([]);

  const cube = useMemo(() => {
    const puzzle = PuzzleCube.solved(3);
    const alg = [scramble, ...moves].filter(Boolean).join(' ');
    return alg ? puzzle.applyAlg(alg) : puzzle;
  }, [scramble, moves]);

  const cubie = useMemo(() => faceletsToCubie(cube.facelets()), [cube]);

  const apply = useCallback((alg: string) => {
    setMoves((previous) => [...previous, ...alg.trim().split(/\s+/).filter(Boolean)]);
  }, []);

  const newScramble = useCallback(() => {
    prepareScramblerSync('333');
    setScramble(generateScramble('333').text);
    setMoves([]);
  }, []);

  return {
    cube,
    cubie,
    scramble,
    moves,
    apply,
    undo: useCallback(() => setMoves((p) => p.slice(0, -1)), []),
    reset: useCallback(() => {
      setScramble('');
      setMoves([]);
    }, []),
    newScramble,
    clearMoves: useCallback(() => setMoves([]), []),
  };
}

const FACES = ['U', 'D', 'L', 'R', 'F', 'B'];
const ROTATIONS = ['y', "y'", 'x', "x'"];

export function CubeControls({ sandbox }: { sandbox: CubeSandbox }) {
  return (
    <div className="cube-controls">
      <div className="cube-keys">
        {FACES.map((face) => (
          <div className="cube-key-row" key={face}>
            {['', "'", '2'].map((suffix) => (
              <button
                key={suffix}
                className="mono cube-key"
                onClick={() => sandbox.apply(face + suffix)}
              >
                {face + suffix}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="row cube-extra">
        {ROTATIONS.map((rotation) => (
          <button key={rotation} className="mono ghost" onClick={() => sandbox.apply(rotation)}>
            {rotation}
          </button>
        ))}
        <div className="nav-spacer" />
        <button className="ghost" onClick={sandbox.undo} disabled={sandbox.moves.length === 0}>
          Undo
        </button>
      </div>
    </div>
  );
}

export function CubeView({ sandbox, cell = 15 }: { sandbox: CubeSandbox; cell?: number }) {
  return (
    <div className="cube-view">
      <CubeNet cube={sandbox.cube} cell={cell} />
    </div>
  );
}

export function MoveHistory({ sandbox }: { sandbox: CubeSandbox }) {
  if (sandbox.moves.length === 0) {
    return <p className="muted" style={{ margin: 0 }}>No moves yet.</p>;
  }
  return (
    <p className="mono move-history">
      {sandbox.moves.join(' ')}{' '}
      <span className="muted">
        ({sandbox.moves.length} move{sandbox.moves.length === 1 ? '' : 's'})
      </span>
    </p>
  );
}
