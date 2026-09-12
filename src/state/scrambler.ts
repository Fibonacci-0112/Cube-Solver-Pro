/**
 * Keeps a scramble ready at all times.
 *
 * A random-state 3x3 scramble means solving a random cube, which can take a
 * few hundred milliseconds. Rather than make the timer wait, the next scramble
 * is generated in the background while the current one is being solved.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  generateScramble,
  prepareScrambler,
  type PuzzleId,
  type ScrambleResult,
} from '../cube/scramble';
import type { PrepareProgress } from '../cube/kociemba';

export interface ScrambleQueue {
  current: ScrambleResult | null;
  /** True while the solver's lookup tables are being built. */
  preparing: boolean;
  progress: PrepareProgress | null;
  /** Move to the next scramble and start preparing another. */
  advance: () => void;
  /** Replace the current scramble without recording anything. */
  regenerate: () => void;
}

export function useScrambleQueue(puzzle: PuzzleId): ScrambleQueue {
  const [current, setCurrent] = useState<ScrambleResult | null>(null);
  const [preparing, setPreparing] = useState(true);
  const [progress, setProgress] = useState<PrepareProgress | null>(null);
  const upcoming = useRef<ScrambleResult[]>([]);
  const active = useRef(puzzle);

  /** Generate off the critical path so a slow search never blocks a keypress. */
  const fillAhead = useCallback((forPuzzle: PuzzleId) => {
    setTimeout(() => {
      if (active.current !== forPuzzle) return;
      if (upcoming.current.length >= 1) return;
      try {
        upcoming.current.push(generateScramble(forPuzzle));
      } catch {
        // Tables are not ready yet; the next advance will try again.
      }
    }, 0);
  }, []);

  useEffect(() => {
    active.current = puzzle;
    upcoming.current = [];
    setCurrent(null);
    setPreparing(true);
    setProgress(null);

    let cancelled = false;
    void (async () => {
      await prepareScrambler(puzzle, (p) => {
        if (!cancelled) setProgress(p);
      });
      if (cancelled || active.current !== puzzle) return;
      setCurrent(generateScramble(puzzle));
      setPreparing(false);
      fillAhead(puzzle);
    })();

    return () => {
      cancelled = true;
    };
  }, [puzzle, fillAhead]);

  const advance = useCallback(() => {
    const next = upcoming.current.shift() ?? generateScramble(active.current);
    setCurrent(next);
    fillAhead(active.current);
  }, [fillAhead]);

  const regenerate = useCallback(() => {
    setCurrent(generateScramble(active.current));
  }, []);

  return { current, preparing, progress, advance, regenerate };
}
