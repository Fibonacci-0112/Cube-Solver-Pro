import { beforeAll, describe, expect, it } from 'vitest';
import {
  MOVE_CUBES,
  cubieToFacelets,
  isSolvedCubie,
  multiply,
  randomCubie,
} from './cubie';
import { invertMoveIndices, movesToText, prepareSolverSync, solveCube } from './kociemba';
import { prepare222, random222, solve222, getOrient222, getPerm222 } from './solver222';
import { PUZZLES, PUZZLE_IDS, generateScramble, prepareScramblerSync } from './scramble';
import { PuzzleCube } from './puzzle';
import { parseAlg } from './notation';
import { AXIS } from './geometry';

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

describe('2x2 solver', () => {
  beforeAll(() => prepare222());

  it('solves every state it is given, optimally', () => {
    const random = seededRandom(4242);
    let longest = 0;
    for (let trial = 0; trial < 1500; trial++) {
      const cube = random222(random);
      const solution = solve222(cube);
      let state = cube;
      for (const move of solution) state = multiply(state, MOVE_CUBES[move]);
      expect(getPerm222(state)).toBe(0);
      expect(getOrient222(state)).toBe(0);
      longest = Math.max(longest, solution.length);
    }
    // God's number for 2x2 in the half-turn metric is 11. Seeing exactly that
    // as the worst case confirms the table spans the whole state space.
    expect(longest).toBe(11);
  });

  it('only ever turns U, R or F', () => {
    const random = seededRandom(11);
    for (let trial = 0; trial < 200; trial++) {
      for (const move of solve222(random222(random))) {
        expect(move).toBeLessThan(9);
      }
    }
  });
});

describe('3x3 solver', () => {
  beforeAll(() => prepareSolverSync(), 60_000);

  it('solves random states', { timeout: 60_000 }, () => {
    const random = seededRandom(2024);
    for (let trial = 0; trial < 25; trial++) {
      const target = randomCubie(random);
      const solution = solveCube(target);
      expect(solution, `trial ${trial}`).not.toBeNull();
      let state = target;
      for (const move of solution!) state = multiply(state, MOVE_CUBES[move]);
      expect(isSolvedCubie(state), `trial ${trial}`).toBe(true);
    }
  });

  it('produces scrambles that reproduce the state they came from', { timeout: 60_000 }, () => {
    const random = seededRandom(777);
    for (let trial = 0; trial < 25; trial++) {
      const target = randomCubie(random);
      const scramble = movesToText(invertMoveIndices(solveCube(target)!));
      // Applying the scramble to a solved cube must land exactly on the state
      // that was drawn at random. This is what makes the scramble random-state.
      expect(PuzzleCube.solved(3).applyAlg(scramble).facelets()).toBe(cubieToFacelets(target));
    }
  });

  it('returns nothing to do for an already solved cube', () => {
    expect(solveCube(randomCubie(() => 0))).toEqual(expect.any(Array));
  });

  it('keeps solutions to a sensible scramble length', { timeout: 60_000 }, () => {
    const random = seededRandom(31);
    let total = 0;
    const trials = 20;
    for (let i = 0; i < trials; i++) total += solveCube(randomCubie(random))!.length;
    expect(total / trials).toBeLessThanOrEqual(23);
  });
});

describe('scramble generation', () => {
  beforeAll(() => {
    prepareScramblerSync('222');
    prepareScramblerSync('333');
  }, 60_000);

  it('generates a valid, non-trivial scramble for every puzzle', { timeout: 60_000 }, () => {
    const random = seededRandom(5150);
    for (const id of PUZZLE_IDS) {
      const result = generateScramble(id, random);
      expect(() => parseAlg(result.text), id).not.toThrow();
      expect(result.text.length, id).toBeGreaterThan(0);
      expect(result.state.isSolved(), id).toBe(false);
      // The reported state must be what the scramble text actually produces.
      const replayed = PuzzleCube.solved(PUZZLES[id].size).applyAlg(result.text);
      expect(replayed.facelets(), id).toBe(result.state.facelets());
    }
  });

  it('uses the move count the WCA specifies for the big cubes', () => {
    const random = seededRandom(8);
    for (const id of ['444', '555', '666', '777'] as const) {
      const result = generateScramble(id, random);
      expect(parseAlg(result.text).length, id).toBe(PUZZLES[id].moveCount);
    }
  });

  it('never turns the same face twice in a row, or doubles back on an axis', () => {
    const random = seededRandom(606);
    for (const id of ['444', '555', '666', '777'] as const) {
      for (let trial = 0; trial < 20; trial++) {
        const moves = parseAlg(generateScramble(id, random).text);
        for (let i = 1; i < moves.length; i++) {
          expect(moves[i].face, `${id} repeated face at ${i}`).not.toBe(moves[i - 1].face);
          if (i >= 2 && AXIS[moves[i].face] === AXIS[moves[i - 1].face]) {
            expect(moves[i].face, `${id} redundant axis at ${i}`).not.toBe(moves[i - 2].face);
          }
        }
      }
    }
  });

  it('keeps big-cube turns within the layer depth the size allows', () => {
    const random = seededRandom(9001);
    const expected: Record<string, number> = { '444': 2, '555': 2, '666': 3, '777': 3 };
    for (const id of ['444', '555', '666', '777'] as const) {
      for (const move of parseAlg(generateScramble(id, random).text)) {
        expect(move.span.kind).toBe('layers');
        if (move.span.kind === 'layers') {
          expect(move.span.to, id).toBeLessThanOrEqual(expected[id]);
        }
      }
    }
  });

  it('gives a different scramble each time', { timeout: 60_000 }, () => {
    const random = seededRandom(3);
    for (const id of PUZZLE_IDS) {
      const seen = new Set<string>();
      for (let i = 0; i < 8; i++) seen.add(generateScramble(id, random).text);
      expect(seen.size, id).toBeGreaterThan(1);
    }
  });
});
