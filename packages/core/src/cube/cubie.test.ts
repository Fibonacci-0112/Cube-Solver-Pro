import { describe, expect, it } from 'vitest';
import {
  CORNER_FACELETS,
  EDGE_FACELETS,
  MOVE_CUBES,
  MOVE_NAMES,
  cubieToFacelets,
  faceletsToCubie,
  invertCubie,
  isSolvedCubie,
  multiply,
  randomCubie,
  solvedCubie,
  type CubieCube,
} from './cubie';
import { PuzzleCube } from './puzzle';
import { parseAlg } from './notation';

/** Deterministic generator so a failure can be reproduced exactly. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function randomMoveIndices(random: () => number, length: number): number[] {
  const moves: number[] = [];
  let lastFace = -1;
  while (moves.length < length) {
    const move = Math.floor(random() * 18);
    const face = Math.floor(move / 3);
    if (face === lastFace) continue;
    lastFace = face;
    moves.push(move);
  }
  return moves;
}

describe('piece-to-facelet mapping', () => {
  // The conventional tables, as used by every Kociemba implementation. Ours are
  // derived from the 3D model instead of typed in, so this pins the convention.
  it('matches the standard corner facelet table', () => {
    expect(CORNER_FACELETS.map((f) => [...f])).toEqual([
      [8, 9, 20],
      [6, 18, 38],
      [0, 36, 47],
      [2, 45, 11],
      [29, 26, 15],
      [27, 44, 24],
      [33, 53, 42],
      [35, 17, 51],
    ]);
  });

  it('matches the standard edge facelet table', () => {
    expect(EDGE_FACELETS.map((f) => [...f])).toEqual([
      [5, 10],
      [7, 19],
      [3, 37],
      [1, 46],
      [32, 16],
      [28, 25],
      [30, 43],
      [34, 52],
      [23, 12],
      [21, 41],
      [50, 39],
      [48, 14],
    ]);
  });
});

describe('cubie model', () => {
  it('agrees with the sticker model on random scrambles', () => {
    const random = seededRandom(20240912);
    for (let trial = 0; trial < 500; trial++) {
      const moves = randomMoveIndices(random, 25);
      const puzzle = PuzzleCube.solved(3);
      let cubie = solvedCubie();
      for (const move of moves) {
        puzzle.applyAll(parseAlg(MOVE_NAMES[move]));
        cubie = multiply(cubie, MOVE_CUBES[move]);
      }
      expect(cubieToFacelets(cubie), moves.map((m) => MOVE_NAMES[m]).join(' ')).toBe(
        puzzle.facelets(),
      );
    }
  });

  it('round-trips between cubie and facelet form', () => {
    const random = seededRandom(7);
    for (let trial = 0; trial < 200; trial++) {
      const cube = randomCubie(random);
      const again = faceletsToCubie(cubieToFacelets(cube));
      expect([...again.cp]).toEqual([...cube.cp]);
      expect([...again.co]).toEqual([...cube.co]);
      expect([...again.ep]).toEqual([...cube.ep]);
      expect([...again.eo]).toEqual([...cube.eo]);
    }
  });

  it('cancels a state against its inverse', () => {
    const random = seededRandom(99);
    for (let trial = 0; trial < 200; trial++) {
      const cube = randomCubie(random);
      expect(isSolvedCubie(multiply(cube, invertCubie(cube)))).toBe(true);
      expect(isSolvedCubie(multiply(invertCubie(cube), cube))).toBe(true);
    }
  });

  it('generates only states that legal turns can reach', () => {
    const parity = (perm: Int8Array): number => {
      let p = 0;
      for (let i = 0; i < perm.length; i++) {
        for (let j = i + 1; j < perm.length; j++) if (perm[i] > perm[j]) p ^= 1;
      }
      return p;
    };
    const random = seededRandom(31337);
    for (let trial = 0; trial < 2000; trial++) {
      const cube: CubieCube = randomCubie(random);
      expect([...cube.cp].slice().sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
      expect(cube.co.reduce((a, b) => a + b, 0) % 3).toBe(0);
      expect(cube.eo.reduce((a, b) => a + b, 0) % 2).toBe(0);
      expect(parity(cube.cp)).toBe(parity(cube.ep));
    }
  });

  it('returns to solved after four of any quarter turn', () => {
    for (let face = 0; face < 6; face++) {
      let cube = solvedCubie();
      for (let i = 0; i < 4; i++) cube = multiply(cube, MOVE_CUBES[face * 3]);
      expect(isSolvedCubie(cube), MOVE_NAMES[face * 3]).toBe(true);
    }
  });
});
