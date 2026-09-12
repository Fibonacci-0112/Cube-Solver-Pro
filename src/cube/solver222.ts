/**
 * Optimal 2x2 solver.
 *
 * With the DBL corner held still, U, R and F reach every one of the
 * 7! * 3^6 = 3,674,160 states, which is small enough to hold a full
 * breadth-first distance table in memory. Solving is then a walk downhill
 * through that table, so every scramble comes out at the shortest possible
 * length — the same property WCA 2x2 scrambles have.
 *
 * Corner permutation and corner orientation advance independently of each
 * other under a turn, so the table is indexed by the pair and built from two
 * small move tables rather than by replaying cube states.
 */

import { MOVE_CUBES, multiply, solvedCubie, type CubieCube } from './cubie';
import { permRank, permUnrank } from './coords';

/** The seven corner slots that move; DBL (slot 6) is the fixed reference. */
const SLOTS: readonly number[] = [0, 1, 2, 3, 4, 5, 7];

/** U, R and F in all three amounts, using the shared 18-move indexing. */
export const MOVES_222: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const N_PERM = 5040; // 7!
const N_ORIENT = 729; // 3^6, the seventh twist being forced
const N_STATES = N_PERM * N_ORIENT;
const UNREACHABLE = 0xff;

const toSmall = (cubie: number): number => (cubie > 6 ? cubie - 1 : cubie);
const fromSmall = (value: number): number => (value >= 6 ? value + 1 : value);

export function getPerm222(cube: CubieCube): number {
  return permRank(SLOTS.map((slot) => toSmall(cube.cp[slot])));
}

export function setPerm222(cube: CubieCube, rank: number): void {
  const perm = permUnrank(rank, 7);
  SLOTS.forEach((slot, i) => {
    cube.cp[slot] = fromSmall(perm[i]);
  });
  cube.cp[6] = 6;
}

export function getOrient222(cube: CubieCube): number {
  let value = 0;
  for (let i = 0; i < 6; i++) value = value * 3 + cube.co[SLOTS[i]];
  return value;
}

export function setOrient222(cube: CubieCube, index: number): void {
  let remaining = index;
  let total = 0;
  for (let i = 5; i >= 0; i--) {
    const twist = remaining % 3;
    cube.co[SLOTS[i]] = twist;
    total += twist;
    remaining = Math.floor(remaining / 3);
  }
  cube.co[SLOTS[6]] = (3 - (total % 3)) % 3;
  cube.co[6] = 0;
}

interface Tables222 {
  perm: Uint16Array;
  orient: Uint16Array;
  distance: Uint8Array;
}

let tables: Tables222 | null = null;

function buildMoveTable(
  size: number,
  set: (cube: CubieCube, value: number) => void,
  get: (cube: CubieCube) => number,
): Uint16Array {
  const table = new Uint16Array(size * MOVES_222.length);
  for (let value = 0; value < size; value++) {
    const base = solvedCubie();
    set(base, value);
    for (let m = 0; m < MOVES_222.length; m++) {
      table[value * MOVES_222.length + m] = get(multiply(base, MOVE_CUBES[MOVES_222[m]]));
    }
  }
  return table;
}

export function prepare222(): void {
  if (tables) return;
  const perm = buildMoveTable(N_PERM, setPerm222, getPerm222);
  const orient = buildMoveTable(N_ORIENT, setOrient222, getOrient222);

  const distance = new Uint8Array(N_STATES).fill(UNREACHABLE);
  const queue = new Int32Array(N_STATES);
  let head = 0;
  let tail = 0;
  distance[0] = 0;
  queue[tail++] = 0;

  const moveCount = MOVES_222.length;
  while (head < tail) {
    const index = queue[head++];
    const next = distance[index] + 1;
    const p = (index / N_ORIENT) | 0;
    const o = index - p * N_ORIENT;
    const rowP = p * moveCount;
    const rowO = o * moveCount;
    for (let m = 0; m < moveCount; m++) {
      const target = perm[rowP + m] * N_ORIENT + orient[rowO + m];
      if (distance[target] === UNREACHABLE) {
        distance[target] = next;
        queue[tail++] = target;
      }
    }
  }

  tables = { perm, orient, distance };
}

/**
 * Shortest solution for a 2x2 state, as move indices. Walks downhill through
 * the distance table, so it cannot fail for a reachable state.
 */
export function solve222(cube: CubieCube): number[] {
  if (!tables) throw new Error('2x2 tables are not built; call prepare222() first');
  const { perm, orient, distance } = tables;
  const moveCount = MOVES_222.length;

  let p = getPerm222(cube);
  let o = getOrient222(cube);
  const solution: number[] = [];

  let remaining = distance[p * N_ORIENT + o];
  if (remaining === UNREACHABLE) throw new Error('2x2 state is not reachable');

  while (remaining > 0) {
    let advanced = false;
    for (let m = 0; m < moveCount; m++) {
      const nextP = perm[p * moveCount + m];
      const nextO = orient[o * moveCount + m];
      if (distance[nextP * N_ORIENT + nextO] === remaining - 1) {
        solution.push(MOVES_222[m]);
        p = nextP;
        o = nextO;
        remaining--;
        advanced = true;
        break;
      }
    }
    /* c8 ignore next */
    if (!advanced) throw new Error('2x2 distance table is inconsistent');
  }
  return solution;
}

/** A uniformly random 2x2 state, expressed as a full cube with DBL fixed. */
export function random222(random: () => number = Math.random): CubieCube {
  const cube = solvedCubie();
  setPerm222(cube, Math.floor(random() * N_PERM));
  setOrient222(cube, Math.floor(random() * N_ORIENT));
  return cube;
}
