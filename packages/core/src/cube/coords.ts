/**
 * Coordinates for the two-phase solver.
 *
 * Each one compresses part of the cube's state into a small integer so the
 * search can index pruning tables directly. Phase 1 drives corner orientation,
 * edge orientation and the equator-edge positions to their solved values;
 * phase 2 then works within the resulting subgroup, where only the three
 * permutation coordinates are still free.
 */

import { solvedCubie, type CubieCube } from './cubie';

export const N_TWIST = 2187; // 3^7 corner orientations
export const N_FLIP = 2048; // 2^11 edge orientations
export const N_SLICE = 495; // C(12,4) placements of the equator edges
export const N_CORNER_PERM = 40320; // 8!
export const N_UD_EDGE_PERM = 40320; // 8!
export const N_SLICE_PERM = 24; // 4!

/**
 * Index of the equator edges sitting in slots 8..11. The combinatorial ranking
 * puts that at the top of the range rather than at zero, so phase 1 aims here.
 */
export const SLICE_SOLVED = 494;

const BINOMIAL: number[][] = (() => {
  const table: number[][] = [];
  for (let n = 0; n <= 12; n++) {
    table[n] = [];
    for (let k = 0; k <= 12; k++) {
      table[n][k] = k === 0 ? 1 : k > n ? 0 : table[n - 1][k - 1] + table[n - 1][k];
    }
  }
  return table;
})();

const choose = (n: number, k: number): number => (n < 0 || k < 0 || k > n ? 0 : BINOMIAL[n][k]);

/** Lehmer-code rank of a permutation of 0..n-1. */
export function permRank(perm: ArrayLike<number>): number {
  let rank = 0;
  for (let i = 0; i < perm.length; i++) {
    let smaller = 0;
    for (let j = i + 1; j < perm.length; j++) if (perm[j] < perm[i]) smaller++;
    rank = rank * (perm.length - i) + smaller;
  }
  return rank;
}

export function permUnrank(rank: number, size: number): number[] {
  const digits = new Array<number>(size);
  let remaining = rank;
  for (let i = size - 1; i >= 0; i--) {
    const radix = size - i;
    digits[i] = remaining % radix;
    remaining = (remaining - digits[i]) / radix;
  }
  const available = Array.from({ length: size }, (_, i) => i);
  return digits.map((d) => available.splice(d, 1)[0]);
}

export function getTwist(cube: CubieCube): number {
  let twist = 0;
  for (let i = 0; i < 7; i++) twist = twist * 3 + cube.co[i];
  return twist;
}

export function setTwist(cube: CubieCube, twist: number): void {
  let remaining = twist;
  let total = 0;
  for (let i = 6; i >= 0; i--) {
    cube.co[i] = remaining % 3;
    total += cube.co[i];
    remaining = Math.floor(remaining / 3);
  }
  cube.co[7] = (3 - (total % 3)) % 3;
}

export function getFlip(cube: CubieCube): number {
  let flip = 0;
  for (let i = 0; i < 11; i++) flip = flip * 2 + cube.eo[i];
  return flip;
}

export function setFlip(cube: CubieCube, flip: number): void {
  let remaining = flip;
  let total = 0;
  for (let i = 10; i >= 0; i--) {
    cube.eo[i] = remaining % 2;
    total += cube.eo[i];
    remaining = Math.floor(remaining / 2);
  }
  cube.eo[11] = total % 2;
}

/** Which four slots hold the equator edges, ignoring their order. */
export function getSlice(cube: CubieCube): number {
  let rank = 0;
  let seen = 0;
  for (let slot = 0; slot < 12; slot++) {
    if (cube.ep[slot] >= 8) {
      rank += choose(slot, seen + 1);
      seen++;
    }
  }
  return rank;
}

export function setSlice(cube: CubieCube, index: number): void {
  const slots = new Array<number>(4);
  let remaining = index;
  for (let i = 4; i >= 1; i--) {
    let slot = i - 1;
    while (choose(slot + 1, i) <= remaining) slot++;
    slots[i - 1] = slot;
    remaining -= choose(slot, i);
  }
  const isSlice = new Array<boolean>(12).fill(false);
  for (const slot of slots) isSlice[slot] = true;
  let nextSlice = 8;
  let nextOther = 0;
  for (let slot = 0; slot < 12; slot++) {
    cube.ep[slot] = isSlice[slot] ? nextSlice++ : nextOther++;
  }
}

export const getCornerPerm = (cube: CubieCube): number => permRank(cube.cp);

export function setCornerPerm(cube: CubieCube, rank: number): void {
  cube.cp.set(permUnrank(rank, 8));
}

/** Order of the eight non-equator edges. Only meaningful for phase-2 states. */
export const getUdEdgePerm = (cube: CubieCube): number => permRank(cube.ep.subarray(0, 8));

export function setUdEdgePerm(cube: CubieCube, rank: number): void {
  cube.ep.set(permUnrank(rank, 8), 0);
  for (let i = 8; i < 12; i++) cube.ep[i] = i;
}

/** Order of the four equator edges among themselves. */
export function getSlicePerm(cube: CubieCube): number {
  const within = [0, 1, 2, 3].map((i) => cube.ep[8 + i] - 8);
  return permRank(within);
}

export function setSlicePerm(cube: CubieCube, rank: number): void {
  const within = permUnrank(rank, 4);
  for (let i = 0; i < 8; i++) cube.ep[i] = i;
  for (let i = 0; i < 4; i++) cube.ep[8 + i] = within[i] + 8;
}

/** A cube carrying just the given coordinate, for building move tables. */
export function cubeWithCoord(set: (cube: CubieCube, value: number) => void, value: number) {
  const cube = solvedCubie();
  set(cube, value);
  return cube;
}
