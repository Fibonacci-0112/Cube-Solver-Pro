/**
 * Identifying which case a cube state represents.
 *
 * Every algorithm in the database is checked by applying it to a solved cube
 * and inspecting the result, so these functions are what make the data
 * trustworthy: a mistyped algorithm produces the wrong case key, and the tests
 * notice. The case spaces are also enumerated from first principles here, which
 * lets the tests assert that a set covers every case exactly once rather than
 * merely that it has the expected number of entries.
 */

import {
  MOVE_CUBES,
  faceletsToCubie,
  multiply,
  solvedCubie,
  type CubieCube,
} from '../cube/cubie';
import { PuzzleCube } from '../cube/puzzle';
import { formatAlg, invertAlg, parseAlg } from '../cube/notation';

/** Corner slots of the last layer, in solver order: URF, UFL, ULB, UBR. */
const LL_CORNERS = [0, 1, 2, 3] as const;
/** Edge slots of the last layer: UR, UF, UL, UB. */
const LL_EDGES = [0, 1, 2, 3] as const;

/** The first-two-layers slot the trainer drills, DFR + FR. */
export const PAIR_CORNER = 4;
export const PAIR_EDGE = 8;

const U_MOVE = MOVE_CUBES[0];

/** The 24 ways a cube can be held, as rotation algorithms. */
const ORIENTATIONS: readonly string[] = (() => {
  const toUp = ['', 'x', 'x2', "x'", 'z', "z'"];
  const spin = ['', 'y', 'y2', "y'"];
  return toUp.flatMap((a) => spin.map((b) => [a, b].filter(Boolean).join(' ')));
})();

const centresAreStandard = (cube: PuzzleCube): boolean => {
  for (let face = 0; face < 6; face++) if (cube.stickers[face * 9 + 4] !== face) return false;
  return true;
};

/**
 * Turns the whole cube back to the standard orientation. Needed because an
 * algorithm may use rotations internally, and the permutation model assumes
 * centres sit where they started.
 */
export function normaliseOrientation(cube: PuzzleCube): PuzzleCube {
  for (const rotation of ORIENTATIONS) {
    const candidate = rotation ? cube.clone().applyAlg(rotation) : cube.clone();
    if (centresAreStandard(candidate)) return candidate;
  }
  /* c8 ignore next */
  throw new Error('cube could not be returned to a standard orientation');
}

/** True when the algorithm leaves the cube facing the way it started. */
export const hasNoNetRotation = (alg: string): boolean =>
  centresAreStandard(PuzzleCube.solved(3).applyAlg(alg));

/** The cube state an algorithm produces from solved, as a permutation model. */
export function stateAfterAlg(alg: string): CubieCube {
  const puzzle = normaliseOrientation(PuzzleCube.solved(3).applyAlg(alg));
  return faceletsToCubie(puzzle.facelets());
}

/** The same algorithm written backwards, undoing what it does. */
export const invertAlgText = (alg: string): string => formatAlg(invertAlg(parseAlg(alg)));

/**
 * The state a learner would be looking at when this algorithm is the answer.
 * Running the algorithm backwards from solved produces exactly the case it
 * solves, which is also the setup the trainer uses to drill it.
 */
export const caseStateOf = (alg: string): CubieCube => stateAfterAlg(invertAlgText(alg));

const turnU = (cube: CubieCube, times: number): CubieCube => {
  let result = cube;
  for (let i = 0; i < times; i++) result = multiply(result, U_MOVE);
  return result;
};

const preTurnU = (cube: CubieCube, times: number): CubieCube => {
  let result = cube;
  for (let i = 0; i < times; i++) result = multiply(U_MOVE, result);
  return result;
};

/**
 * Smallest signature over every combination of U turns before and after the
 * case. Adjusting the U layer is free during a solve, so two states that differ
 * only by that are the same case to a solver.
 */
function canonical(cube: CubieCube, signature: (c: CubieCube) => string): string {
  let best: string | null = null;
  for (let before = 0; before < 4; before++) {
    const shifted = preTurnU(cube, before);
    for (let after = 0; after < 4; after++) {
      const key = signature(turnU(shifted, after));
      if (best === null || key < best) best = key;
    }
  }
  return best!;
}

/** Which last-layer stickers point the wrong way. Identifies an OLL case. */
export const ollKey = (cube: CubieCube): string =>
  canonical(cube, (c) =>
    LL_CORNERS.map((i) => c.co[i]).join('') + ':' + LL_EDGES.map((i) => c.eo[i]).join(''),
  );

/** Where the last-layer pieces sit. Identifies a PLL case. */
export const pllKey = (cube: CubieCube): string =>
  canonical(cube, (c) =>
    LL_CORNERS.map((i) => c.cp[i]).join('') + ':' + LL_EDGES.map((i) => c.ep[i]).join(''),
  );

/**
 * Where the DFR corner and FR edge are, and how they are turned. Identifies an
 * F2L case. Only U turns after the state matter here: the rest of the last
 * layer is irrelevant to which pair case you are looking at.
 */
export function f2lKey(cube: CubieCube): string {
  let best: string | null = null;
  for (let after = 0; after < 4; after++) {
    const c = turnU(cube, after);
    const cornerSlot = c.cp.indexOf(PAIR_CORNER);
    const edgeSlot = c.ep.indexOf(PAIR_EDGE);
    const key = `${cornerSlot}.${c.co[cornerSlot]}|${edgeSlot}.${c.eo[edgeSlot]}`;
    if (best === null || key < best) best = key;
  }
  return best!;
}

export const SOLVED_OLL_KEY = ollKey(solvedCubie());
export const SOLVED_PLL_KEY = pllKey(solvedCubie());
export const SOLVED_F2L_KEY = f2lKey(solvedCubie());

// ---------------------------------------------------------------------------
// Structural checks, used to confirm an algorithm only disturbs what it should
// ---------------------------------------------------------------------------

const cornerSolved = (c: CubieCube, i: number): boolean => c.cp[i] === i && c.co[i] === 0;
const edgeSolved = (c: CubieCube, i: number): boolean => c.ep[i] === i && c.eo[i] === 0;

/** True when everything below the last layer is in place. */
export function firstTwoLayersSolved(cube: CubieCube): boolean {
  for (const corner of [4, 5, 6, 7]) if (!cornerSolved(cube, corner)) return false;
  for (const edge of [4, 5, 6, 7, 8, 9, 10, 11]) if (!edgeSolved(cube, edge)) return false;
  return true;
}

/** True when the cross and the three slots an F2L case leaves alone are intact. */
export function f2lRemainderSolved(cube: CubieCube): boolean {
  for (const corner of [5, 6, 7]) if (!cornerSolved(cube, corner)) return false;
  for (const edge of [4, 5, 6, 7, 9, 10, 11]) if (!edgeSolved(cube, edge)) return false;
  return true;
}

/** True when every last-layer sticker that should face up does. */
export function lastLayerOriented(cube: CubieCube): boolean {
  for (const i of LL_CORNERS) if (cube.co[i] !== 0) return false;
  for (const i of LL_EDGES) if (cube.eo[i] !== 0) return false;
  return true;
}

/** True when the last layer is fully in place. */
export function lastLayerPermuted(cube: CubieCube): boolean {
  for (const i of LL_CORNERS) if (cube.cp[i] !== i) return false;
  for (const i of LL_EDGES) if (cube.ep[i] !== i) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Enumerating the complete case spaces
// ---------------------------------------------------------------------------

function permutationsOf(values: number[]): number[][] {
  if (values.length <= 1) return [values];
  const out: number[][] = [];
  values.forEach((value, i) => {
    const rest = [...values.slice(0, i), ...values.slice(i + 1)];
    for (const tail of permutationsOf(rest)) out.push([value, ...tail]);
  });
  return out;
}

const parityOf = (perm: number[]): number => {
  let parity = 0;
  for (let i = 0; i < perm.length; i++) {
    for (let j = i + 1; j < perm.length; j++) if (perm[i] > perm[j]) parity ^= 1;
  }
  return parity;
};

/**
 * Every last-layer orientation reachable on a real cube: corner twists summing
 * to a multiple of three, and an even number of flipped edges. Excludes the
 * already-oriented case, leaving the 57 OLL cases.
 */
export function enumerateOllKeys(): Set<string> {
  const keys = new Set<string>();
  for (let twists = 0; twists < 81; twists++) {
    const co = [0, 1, 2, 3].map((i) => Math.floor(twists / 3 ** i) % 3);
    if ((co[0] + co[1] + co[2] + co[3]) % 3 !== 0) continue;
    for (let flips = 0; flips < 16; flips++) {
      const eo = [0, 1, 2, 3].map((i) => (flips >> i) & 1);
      if ((eo[0] + eo[1] + eo[2] + eo[3]) % 2 !== 0) continue;
      const cube = solvedCubie();
      co.forEach((value, i) => (cube.co[i] = value));
      eo.forEach((value, i) => (cube.eo[i] = value));
      const key = ollKey(cube);
      if (key !== SOLVED_OLL_KEY) keys.add(key);
    }
  }
  return keys;
}

/**
 * Every last-layer arrangement reachable on a real cube: corner and edge
 * permutations of matching parity. Excludes the solved case, leaving the 21
 * PLL cases.
 */
export function enumeratePllKeys(): Set<string> {
  const keys = new Set<string>();
  const perms = permutationsOf([0, 1, 2, 3]);
  for (const cp of perms) {
    for (const ep of perms) {
      if (parityOf(cp) !== parityOf(ep)) continue;
      const cube = solvedCubie();
      cp.forEach((value, i) => (cube.cp[i] = value));
      ep.forEach((value, i) => (cube.ep[i] = value));
      const key = pllKey(cube);
      if (key !== SOLVED_PLL_KEY) keys.add(key);
    }
  }
  return keys;
}

/**
 * Every position the DFR/FR pair can be in with the rest of the first two
 * layers finished: each piece either somewhere in the last layer or already in
 * its slot, in any orientation. Excludes the solved case, leaving 41.
 */
export function enumerateF2lKeys(): Set<string> {
  const keys = new Set<string>();
  const cornerSlots = [0, 1, 2, 3, PAIR_CORNER];
  const edgeSlots = [0, 1, 2, 3, PAIR_EDGE];
  for (const cornerSlot of cornerSlots) {
    for (let cornerOri = 0; cornerOri < 3; cornerOri++) {
      for (const edgeSlot of edgeSlots) {
        for (let edgeOri = 0; edgeOri < 2; edgeOri++) {
          const cube = solvedCubie();
          [cube.cp[cornerSlot], cube.cp[PAIR_CORNER]] = [cube.cp[PAIR_CORNER], cube.cp[cornerSlot]];
          [cube.ep[edgeSlot], cube.ep[PAIR_EDGE]] = [cube.ep[PAIR_EDGE], cube.ep[edgeSlot]];
          cube.co[cornerSlot] = cornerOri;
          cube.eo[edgeSlot] = edgeOri;
          const key = f2lKey(cube);
          if (key !== SOLVED_F2L_KEY) keys.add(key);
        }
      }
    }
  }
  return keys;
}
