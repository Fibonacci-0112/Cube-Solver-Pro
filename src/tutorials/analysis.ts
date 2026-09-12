/**
 * Working out what a cube needs next.
 *
 * Drives the guided solves: look at the state, decide which step the solver is
 * on, and say what to do about it. Where a step matches a case in the algorithm
 * database, the case is named and its algorithm offered, so the guidance is
 * specific rather than generic.
 */

import { cubieToFacelets, faceletsToCubie, type CubieCube } from '../cube/cubie';
import { PuzzleCube } from '../cube/puzzle';
import type { Face } from '../cube/geometry';
import { ALG_SETS_BY_ID } from '../algs';
import { identifyCase, identifyPll, identifyOll } from '../algs/lookup';
import { firstTwoLayersSolved, lastLayerOriented, lastLayerPermuted } from '../algs/analysis';

export type Method = 'beginner' | 'cfop';

export interface StepAdvice {
  step: string;
  detail: string;
  /** The case being looked at, when one can be named. */
  caseName?: string;
  algorithm?: string;
  /** Extra moves needed before the algorithm applies. */
  setup?: string;
  progress?: { done: number; total: number };
  solved: boolean;
}

const CROSS_EDGES = [4, 5, 6, 7]; // DR, DF, DL, DB
const SLOTS = [
  { corner: 4, edge: 8 },
  { corner: 5, edge: 9 },
  { corner: 6, edge: 10 },
  { corner: 7, edge: 11 },
];

const cornerSolved = (c: CubieCube, i: number) => c.cp[i] === i && c.co[i] === 0;
const edgeSolved = (c: CubieCube, i: number) => c.ep[i] === i && c.eo[i] === 0;

export const crossCount = (cube: CubieCube): number =>
  CROSS_EDGES.filter((e) => edgeSolved(cube, e)).length;

export const crossSolved = (cube: CubieCube): boolean => crossCount(cube) === 4;

export const slotsSolved = (cube: CubieCube): number =>
  SLOTS.filter((s) => cornerSolved(cube, s.corner) && edgeSolved(cube, s.edge)).length;

export const isSolved = (cube: CubieCube): boolean =>
  firstTwoLayersSolved(cube) && lastLayerOriented(cube) && lastLayerPermuted(cube);

/** Where each face's stickers end up after turning the whole cube with y. */
const AFTER_Y: Record<Face, Face> = { U: 'U', D: 'D', R: 'F', F: 'L', L: 'B', B: 'R' };

/**
 * The same physical cube, seen as if you had turned it once with y.
 *
 * Turning the cube moves the centres, which the permutation model assumes stay
 * put, so the colours are relabelled afterwards to put the frame back where it
 * started. That makes it possible to ask a question defined for the
 * front-right slot — "which F2L case is this?" — about each slot in turn.
 */
export function viewFromNextSide(cube: CubieCube): CubieCube {
  const turned = PuzzleCube.fromFacelets(cubieToFacelets(cube)).applyAlg('y');
  const relabelled = [...turned.facelets()].map((f) => AFTER_Y[f as Face]).join('');
  return faceletsToCubie(relabelled);
}

const TURN_WORDS = ['', 'once', 'twice', 'three times'];

/** Finds the F2L case for an open slot, looking at the cube from each side. */
function f2lAdvice(cube: CubieCube): StepAdvice {
  const done = slotsSolved(cube);
  const set = ALG_SETS_BY_ID.f2l;

  let view = cube;
  for (let turn = 0; turn < 4; turn++) {
    if (turn > 0) view = viewFromNextSide(view);
    if (set.validate(view) !== null) continue;
    const match = identifyCase(set, view);
    if (!match) continue;
    return {
      step: 'First two layers',
      detail:
        turn === 0
          ? 'Pair the corner with its edge, then insert them into the front-right slot together.'
          : `Turn the whole cube ${TURN_WORDS[turn]} with y so the slot you are filling sits at ` +
            'the front-right, then run this.',
      caseName: match.name,
      algorithm: match.algs[0],
      setup: turn === 0 ? undefined : turn === 1 ? 'y' : turn === 2 ? 'y2' : "y'",
      progress: { done, total: 4 },
      solved: false,
    };
  }

  return {
    step: 'First two layers',
    detail:
      'Find a corner and its matching edge, bring them together in the top layer, then insert the ' +
      'pair into its slot. Take whichever pair is easiest to see rather than working in a fixed order.',
    progress: { done, total: 4 },
    solved: false,
  };
}

const SOLVED_ADVICE: StepAdvice = {
  step: 'Solved',
  detail: 'That is a solved cube. Scramble it and go again.',
  solved: true,
};

/** What to do next, solving with CFOP. */
export function analyseCfop(cube: CubieCube): StepAdvice {
  if (isSolved(cube)) return SOLVED_ADVICE;

  if (!crossSolved(cube)) {
    return {
      step: 'Cross',
      detail:
        'Put the four bottom edges in place, each matching the centre beside it. Build it on the ' +
        'bottom rather than making it on top and flipping the cube over — it is slower to learn ' +
        'but it is what lets you plan the cross during inspection later.',
      progress: { done: crossCount(cube), total: 4 },
      solved: false,
    };
  }

  if (!firstTwoLayersSolved(cube)) return f2lAdvice(cube);

  if (!lastLayerOriented(cube)) {
    const match = identifyOll(cube);
    return {
      step: 'Orient the last layer',
      detail: match
        ? 'One algorithm turns every top sticker face up.'
        : 'Get every top sticker facing up.',
      caseName: match?.name,
      algorithm: match?.algs[0],
      solved: false,
    };
  }

  const match = identifyPll(cube);
  return {
    step: 'Permute the last layer',
    detail: match
      ? 'Last step: this puts the top pieces in place. A final U turn may be needed afterwards.'
      : 'Move the last-layer pieces into place.',
    caseName: match?.name,
    algorithm: match?.algs[0],
    solved: false,
  };
}

/** What to do next, solving layer by layer. */
export function analyseBeginner(cube: CubieCube): StepAdvice {
  if (isSolved(cube)) return SOLVED_ADVICE;

  if (!crossSolved(cube)) {
    return {
      step: '1. The cross',
      detail:
        'Put the four bottom edges in place so each matches the centre next to it. No algorithm ' +
        'needed: move an edge to the top, line it up above where it belongs, then turn that face ' +
        'twice to drop it in.',
      progress: { done: crossCount(cube), total: 4 },
      solved: false,
    };
  }

  const corners = SLOTS.filter((s) => cornerSolved(cube, s.corner)).length;
  if (corners < 4) {
    return {
      step: '2. The first layer corners',
      detail:
        'Bring a bottom corner into the top layer, directly above the slot it belongs in, then ' +
        'repeat the trigger until it drops in the right way up. Repeating it cannot break what ' +
        'you have already done — it only cycles that corner.',
      algorithm: "R U R' U'",
      progress: { done: corners, total: 4 },
      solved: false,
    };
  }

  const middles = SLOTS.filter((s) => edgeSolved(cube, s.edge)).length;
  if (middles < 4) {
    return {
      step: '3. The middle layer',
      detail:
        'Find a top edge with no yellow on it. Turn the top until its front colour matches the ' +
        'centre below it, then send it right or left depending on where it needs to go.',
      algorithm: "To the right: U R U' R' U' F' U F      To the left: U' L' U L U F U' F'",
      progress: { done: middles, total: 4 },
      solved: false,
    };
  }

  const edgesUp = [0, 1, 2, 3].filter((i) => cube.eo[i] === 0).length;
  if (edgesUp < 4) {
    return {
      step: '4. The top cross',
      detail:
        'Get the four top edges facing up. From a dot you will need it three times, from a line ' +
        'twice, from an L shape once — the same algorithm each time, just held differently. Hold ' +
        'the line across from left to right, and the L pointing to the back-left.',
      algorithm: "F R U R' U' F'",
      progress: { done: edgesUp, total: 4 },
      solved: false,
    };
  }

  if (!lastLayerOriented(cube)) {
    const up = [0, 1, 2, 3].filter((i) => cube.co[i] === 0).length;
    return {
      step: '5. Turn the top corners up',
      detail:
        'Hold the cube with an unsolved corner at the top-front-right and repeat the trigger until ' +
        'that one corner faces up. Then turn only the top layer to bring the next unsolved corner ' +
        'into that spot. The cube will look wrecked in the middle of this — keep going, it comes back.',
      algorithm: "R U R' U'",
      progress: { done: up, total: 4 },
      solved: false,
    };
  }

  const placed = [0, 1, 2, 3].filter((i) => cube.cp[i] === i).length;
  if (placed < 4) {
    return {
      step: '6. Put the top corners in place',
      detail:
        'Cycle three top corners at a time until each is in the right place, ignoring which way ' +
        'round it faces. If two corners already belong beside each other, keep that pair at the back.',
      algorithm: "U R U' L' U R' U' L",
      progress: { done: placed, total: 4 },
      solved: false,
    };
  }

  const match = identifyPll(cube);
  return {
    step: '7. Finish the top edges',
    detail: 'The last step: cycle the remaining edges into place.',
    caseName: match?.name,
    algorithm: match?.algs[0] ?? "R U' R U R U R U' R' U' R2",
    solved: false,
  };
}

export const analyse = (cube: CubieCube, method: Method): StepAdvice =>
  method === 'cfop' ? analyseCfop(cube) : analyseBeginner(cube);
