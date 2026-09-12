/**
 * The 3x3 cube as permutation-and-orientation arrays, which is what the
 * two-phase solver needs. This is a second, independent representation of the
 * same puzzle as `PuzzleCube`; the test suite cross-checks them against each
 * other on random scrambles, which is what gives confidence that both are right.
 *
 * Corner orientation counts clockwise twists of the U/D sticker away from the
 * U/D face; edge orientation is 0 when the edge's primary sticker (U/D, or F/B
 * for the four equator edges) sits in the slot's primary facelet.
 */

import { FACE_NAMES, stickerIndex, type Face } from './geometry';
import { PuzzleCube } from './puzzle';
import { parseAlg } from './notation';

/** Corners in solver order, each listed clockwise from its U/D face. */
export const CORNER_FACES: readonly (readonly [Face, Face, Face])[] = [
  ['U', 'R', 'F'], // URF
  ['U', 'F', 'L'], // UFL
  ['U', 'L', 'B'], // ULB
  ['U', 'B', 'R'], // UBR
  ['D', 'F', 'R'], // DFR
  ['D', 'L', 'F'], // DLF
  ['D', 'B', 'L'], // DBL
  ['D', 'R', 'B'], // DRB
];

/** Edges in solver order; the equator four are listed F/B first on purpose. */
export const EDGE_FACES: readonly (readonly [Face, Face])[] = [
  ['U', 'R'], // UR
  ['U', 'F'], // UF
  ['U', 'L'], // UL
  ['U', 'B'], // UB
  ['D', 'R'], // DR
  ['D', 'F'], // DF
  ['D', 'L'], // DL
  ['D', 'B'], // DB
  ['F', 'R'], // FR
  ['F', 'L'], // FL
  ['B', 'L'], // BL
  ['B', 'R'], // BR
];

const NORMALS: Record<Face, readonly [number, number, number]> = {
  U: [0, 1, 0],
  R: [1, 0, 0],
  F: [0, 0, 1],
  D: [0, -1, 0],
  L: [-1, 0, 0],
  B: [0, 0, -1],
};

/**
 * Facelet index of the sticker that piece `faces` shows on face `faces[which]`.
 * Derived from the same 3D model the turns use, so the two cannot drift apart.
 */
function pieceFacelet(faces: readonly Face[], which: number): number {
  const n = 3;
  const position: [number, number, number] = [0, 0, 0];
  faces.forEach((face, i) => {
    const normal = NORMALS[face];
    const scale = i === which ? n : n - 1;
    position[0] += scale * normal[0];
    position[1] += scale * normal[1];
    position[2] += scale * normal[2];
  });
  return stickerIndex(n, position);
}

/** Facelet indices of each corner slot, in the same order as CORNER_FACES. */
export const CORNER_FACELETS: readonly (readonly number[])[] = CORNER_FACES.map((faces) =>
  faces.map((_, i) => pieceFacelet(faces, i)),
);

/** Facelet indices of each edge slot, in the same order as EDGE_FACES. */
export const EDGE_FACELETS: readonly (readonly number[])[] = EDGE_FACES.map((faces) =>
  faces.map((_, i) => pieceFacelet(faces, i)),
);

export interface CubieCube {
  /** cp[i] is which corner cubie currently sits in slot i. */
  cp: Int8Array;
  co: Int8Array;
  /** ep[i] is which edge cubie currently sits in slot i. */
  ep: Int8Array;
  eo: Int8Array;
}

export function solvedCubie(): CubieCube {
  return {
    cp: Int8Array.from([0, 1, 2, 3, 4, 5, 6, 7]),
    co: new Int8Array(8),
    ep: Int8Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
    eo: new Int8Array(12),
  };
}

/** Applies `b` to `a`: the piece landing in slot i is whatever `a` had in slot b[i]. */
export function multiply(a: CubieCube, b: CubieCube): CubieCube {
  const cp = new Int8Array(8);
  const co = new Int8Array(8);
  for (let i = 0; i < 8; i++) {
    cp[i] = a.cp[b.cp[i]];
    co[i] = (a.co[b.cp[i]] + b.co[i]) % 3;
  }
  const ep = new Int8Array(12);
  const eo = new Int8Array(12);
  for (let i = 0; i < 12; i++) {
    ep[i] = a.ep[b.ep[i]];
    eo[i] = (a.eo[b.ep[i]] + b.eo[i]) % 2;
  }
  return { cp, co, ep, eo };
}

export function invertCubie(c: CubieCube): CubieCube {
  const inv = solvedCubie();
  for (let i = 0; i < 8; i++) inv.cp[c.cp[i]] = i;
  for (let i = 0; i < 8; i++) inv.co[c.cp[i]] = (3 - c.co[i]) % 3;
  for (let i = 0; i < 12; i++) inv.ep[c.ep[i]] = i;
  for (let i = 0; i < 12; i++) inv.eo[c.ep[i]] = c.eo[i];
  return inv;
}

const FACE_TO_INDEX: Record<string, number> = Object.fromEntries(
  FACE_NAMES.map((f, i) => [f, i]),
);

export function faceletsToCubie(facelets: string): CubieCube {
  const colour = (index: number): number => FACE_TO_INDEX[facelets[index]];
  const cube = solvedCubie();

  for (let slot = 0; slot < 8; slot++) {
    const stickers = CORNER_FACELETS[slot].map(colour);
    // The U or D sticker identifies the twist; its position in the slot's
    // clockwise facelet order is the orientation.
    const twist = stickers.findIndex((c) => c === FACE_TO_INDEX.U || c === FACE_TO_INDEX.D);
    if (twist < 0) throw new Error(`corner slot ${slot} has no U/D sticker`);
    const rotated = [0, 1, 2].map((k) => stickers[(k + twist) % 3]);
    const piece = CORNER_FACES.findIndex((faces) =>
      faces.every((f, k) => FACE_TO_INDEX[f] === rotated[k]),
    );
    if (piece < 0) throw new Error(`corner slot ${slot} holds no valid corner`);
    cube.cp[slot] = piece;
    cube.co[slot] = twist;
  }

  for (let slot = 0; slot < 12; slot++) {
    const [a, b] = EDGE_FACELETS[slot].map(colour);
    const piece = EDGE_FACES.findIndex(
      ([f, g]) =>
        (FACE_TO_INDEX[f] === a && FACE_TO_INDEX[g] === b) ||
        (FACE_TO_INDEX[f] === b && FACE_TO_INDEX[g] === a),
    );
    if (piece < 0) throw new Error(`edge slot ${slot} holds no valid edge`);
    cube.ep[slot] = piece;
    cube.eo[slot] = FACE_TO_INDEX[EDGE_FACES[piece][0]] === a ? 0 : 1;
  }

  return cube;
}

export function cubieToFacelets(cube: CubieCube): string {
  const out = new Array<string>(54);
  for (let slot = 0; slot < 8; slot++) {
    const piece = cube.cp[slot];
    const twist = cube.co[slot];
    for (let k = 0; k < 3; k++) {
      out[CORNER_FACELETS[slot][(k + twist) % 3]] = CORNER_FACES[piece][k];
    }
  }
  for (let slot = 0; slot < 12; slot++) {
    const piece = cube.ep[slot];
    const flipped = cube.eo[slot] === 1;
    for (let k = 0; k < 2; k++) {
      out[EDGE_FACELETS[slot][flipped ? 1 - k : k]] = EDGE_FACES[piece][k];
    }
  }
  // Centres never move in this model.
  for (let f = 0; f < 6; f++) out[f * 9 + 4] = FACE_NAMES[f];
  return out.join('');
}

/**
 * The 18 quarter/half turns, indexed `face * 3 + (amount - 1)` with faces in
 * U R F D L B order. Built by running each turn through the geometric engine,
 * so there is no hand-written permutation data to get wrong.
 */
export const MOVE_CUBES: readonly CubieCube[] = (() => {
  const cubes: CubieCube[] = [];
  for (const face of FACE_NAMES) {
    for (let amount = 1; amount <= 3; amount++) {
      const suffix = amount === 1 ? '' : amount === 2 ? '2' : "'";
      const puzzle = PuzzleCube.solved(3).applyAll(parseAlg(face + suffix));
      cubes.push(faceletsToCubie(puzzle.facelets()));
    }
  }
  return cubes;
})();

export const MOVE_NAMES: readonly string[] = (() => {
  const names: string[] = [];
  for (const face of FACE_NAMES) {
    for (const suffix of ['', '2', "'"]) names.push(face + suffix);
  }
  return names;
})();

export function isSolvedCubie(cube: CubieCube): boolean {
  for (let i = 0; i < 8; i++) if (cube.cp[i] !== i || cube.co[i] !== 0) return false;
  for (let i = 0; i < 12; i++) if (cube.ep[i] !== i || cube.eo[i] !== 0) return false;
  return true;
}

const permutationParity = (perm: ArrayLike<number>): number => {
  let parity = 0;
  for (let i = 0; i < perm.length; i++) {
    for (let j = i + 1; j < perm.length; j++) if (perm[i] > perm[j]) parity ^= 1;
  }
  return parity;
};

function shuffle(values: number[], random: () => number): number[] {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

/**
 * A uniformly random solvable state. The last corner twist, the last edge flip
 * and the edge permutation's parity are each forced by the preceding choices,
 * which is exactly what keeps the state reachable by legal turns.
 */
export function randomCubie(random: () => number = Math.random): CubieCube {
  const cube = solvedCubie();

  const cp = shuffle([0, 1, 2, 3, 4, 5, 6, 7], random);
  let ep = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], random);
  if (permutationParity(cp) !== permutationParity(ep)) {
    [ep[0], ep[1]] = [ep[1], ep[0]];
  }
  cube.cp.set(cp);
  cube.ep.set(ep);

  let twistSum = 0;
  for (let i = 0; i < 7; i++) {
    cube.co[i] = Math.floor(random() * 3);
    twistSum += cube.co[i];
  }
  cube.co[7] = (3 - (twistSum % 3)) % 3;

  let flipSum = 0;
  for (let i = 0; i < 11; i++) {
    cube.eo[i] = Math.floor(random() * 2);
    flipSum += cube.eo[i];
  }
  cube.eo[11] = flipSum % 2;

  return cube;
}
