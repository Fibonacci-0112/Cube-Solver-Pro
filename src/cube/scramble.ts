/**
 * Scramble generation for 2x2 through 7x7.
 *
 * 2x2 and 3x3 get random-state scrambles: pick a state uniformly at random,
 * solve it, and reverse the solution. Every state is then equally likely, which
 * is the property that makes a scramble fair and is what the WCA requires.
 *
 * 4x4 and up use random moves of the length the WCA specifies. Random-state
 * scrambling is impractical at those sizes, and random moves of that length are
 * long enough to leave no usable structure behind.
 */

import { AXIS, FACE_NAMES, type Face } from './geometry';
import { formatAlg, type Move } from './notation';
import { PuzzleCube } from './puzzle';
import { randomCubie, type CubieCube } from './cubie';
import {
  invertMoveIndices,
  movesToText,
  prepareSolver,
  prepareSolverSync,
  solveCube,
  type PrepareProgress,
} from './kociemba';
import { prepare222, random222, solve222 } from './solver222';

export type PuzzleId = '222' | '333' | '444' | '555' | '666' | '777';

export const PUZZLE_IDS: readonly PuzzleId[] = ['222', '333', '444', '555', '666', '777'];

export interface PuzzleInfo {
  id: PuzzleId;
  name: string;
  /** Cube size, n, for an n x n x n puzzle. */
  size: number;
  /** How the scramble is produced, shown in the UI so the method is not a mystery. */
  method: 'random-state' | 'random-move';
  /** Move count for random-move scrambles, as specified by the WCA. */
  moveCount?: number;
}

export const PUZZLES: Record<PuzzleId, PuzzleInfo> = {
  '222': { id: '222', name: '2x2x2', size: 2, method: 'random-state' },
  '333': { id: '333', name: '3x3x3', size: 3, method: 'random-state' },
  '444': { id: '444', name: '4x4x4', size: 4, method: 'random-move', moveCount: 45 },
  '555': { id: '555', name: '5x5x5', size: 5, method: 'random-move', moveCount: 60 },
  '666': { id: '666', name: '6x6x6', size: 6, method: 'random-move', moveCount: 80 },
  '777': { id: '777', name: '7x7x7', size: 7, method: 'random-move', moveCount: 100 },
};

/** How many layers deep a scramble for this size is allowed to turn. */
const maxWidth = (size: number): number => (size <= 3 ? 1 : size <= 5 ? 2 : 3);

/**
 * Random-move scramble. Rejects a move on the face just turned, and a move that
 * returns to the face before last on the same axis, since `R L R` and the like
 * say nothing that a shorter sequence does not.
 */
export function randomMoveScramble(
  size: number,
  length: number,
  random: () => number = Math.random,
): Move[] {
  const width = maxWidth(size);
  const moves: Move[] = [];
  let previous: Face | null = null;
  let beforePrevious: Face | null = null;

  while (moves.length < length) {
    const face = FACE_NAMES[Math.floor(random() * 6)];
    if (face === previous) continue;
    if (previous && AXIS[face] === AXIS[previous] && face === beforePrevious) continue;

    const depth = 1 + Math.floor(random() * width);
    const amount = 1 + Math.floor(random() * 3);
    moves.push({ face, span: { kind: 'layers', from: 1, to: depth }, amount });

    beforePrevious = previous;
    previous = face;
  }
  return moves;
}

/** Builds whatever tables the given puzzle needs. Safe to call repeatedly. */
export async function prepareScrambler(
  puzzle: PuzzleId,
  onProgress?: (progress: PrepareProgress) => void,
): Promise<void> {
  if (puzzle === '333') {
    await prepareSolver(onProgress);
  } else if (puzzle === '222') {
    onProgress?.({ step: 0, total: 1, label: 'corner states' });
    prepare222();
    onProgress?.({ step: 1, total: 1, label: 'ready' });
  }
}

/** Synchronous table build, for tests and non-interactive callers. */
export function prepareScramblerSync(puzzle: PuzzleId): void {
  if (puzzle === '333') prepareSolverSync();
  else if (puzzle === '222') prepare222();
}

export interface ScrambleResult {
  puzzle: PuzzleId;
  text: string;
  /** The state the scramble produces, for previews and for verification. */
  state: PuzzleCube;
}

/**
 * Generates a scramble. For 2x2 and 3x3 the tables must already be built via
 * {@link prepareScrambler}; the puzzle's own solver is what makes the scramble
 * random-state rather than random-move.
 */
export function generateScramble(
  puzzle: PuzzleId,
  random: () => number = Math.random,
): ScrambleResult {
  const info = PUZZLES[puzzle];

  if (puzzle === '333') {
    const target: CubieCube = randomCubie(random);
    const solution = solveCube(target);
    if (!solution) throw new Error('no 3x3 solution found within the search limits');
    const text = movesToText(invertMoveIndices(solution));
    return { puzzle, text, state: PuzzleCube.solved(3).applyAlg(text) };
  }

  if (puzzle === '222') {
    const target = random222(random);
    const text = movesToText(invertMoveIndices(solve222(target)));
    // A solved state gives an empty scramble; retry rather than hand one out.
    if (!text) return generateScramble(puzzle, random);
    return { puzzle, text, state: PuzzleCube.solved(2).applyAlg(text) };
  }

  const moves = randomMoveScramble(info.size, info.moveCount ?? 40, random);
  const text = formatAlg(moves);
  return { puzzle, text, state: PuzzleCube.solved(info.size).applyAll(moves) };
}
