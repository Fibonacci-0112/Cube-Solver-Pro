/**
 * F2L — pairing a corner and its edge and inserting them into the front-right
 * slot. 41 cases, covering every way the pair can be arranged with the cross
 * and the other three slots already finished.
 *
 * These algorithms are generated rather than transcribed: scripts/generate-f2l.mjs
 * searches outwards from a solved cube using only R, U and F — the faces that
 * bound the slot — and records the shortest route to each case. Reversing it
 * gives the solution, so every entry is correct by construction and as short as
 * R/U/F allows. Regenerate with:
 *
 *     npx vite-node scripts/generate-f2l.mjs > packages/core/src/algs/f2l.ts
 *
 * Many cubers prefer a slightly longer but smoother turning sequence for some of
 * these; the trainer lets you record your own algorithm per case.
 */

import { enumerateF2lKeys, f2lKey, f2lRemainderSolved } from './analysis';
import type { AlgCase, AlgSet } from './types';

const entries: [number, string, string][] = [
  [1, 'Both pieces on top', "F' U' F"],
  [2, 'Both pieces on top', "F' U2 F"],
  [3, 'Both pieces on top', "R U R'"],
  [4, 'Both pieces on top', "R U' R'"],
  [5, 'Both pieces on top', "F' U' F R U R'"],
  [6, 'Both pieces on top', "F' U' F2 R' F' R"],
  [7, 'Both pieces on top', "F' U2 F2 R' F' R"],
  [8, 'Both pieces on top', "R U2 R2 F R F'"],
  [9, 'Both pieces on top', "F U2 F2 U' F2 U' F'"],
  [10, 'Both pieces on top', "F' U F U2 R U R'"],
  [11, 'Both pieces on top', "F' U' F U' F' U' F"],
  [12, 'Both pieces on top', "F' U2 F U' R U R'"],
  [13, 'Both pieces on top', "F2 U' F U' F' U2 F2"],
  [14, 'Both pieces on top', "F2 U2 F U F' U F2"],
  [15, 'Both pieces on top', "F2 U2 R' F R U2 F2"],
  [16, 'Both pieces on top', "F2 U2 R' F' R U2 F2"],
  [17, 'Both pieces on top', "R U R' U2 R U' R'"],
  [18, 'Both pieces on top', "R U' R' U R U R'"],
  [19, 'Both pieces on top', "R U' R' U' R U R'"],
  [20, 'Both pieces on top', "R U' R' U2 F' U' F"],
  [21, 'Both pieces on top', "R U2 R' U' R U R'"],
  [22, 'Both pieces on top', "R U2 R' U2 R U' R'"],
  [23, 'Both pieces on top', "R2 U2 F R2 F' U2 R2"],
  [24, 'Both pieces on top', "R2 U2 R' U' R U' R2"],
  [25, 'Corner in the slot, edge on top', "F R' F' R2 U R'"],
  [26, 'Corner in the slot, edge on top', "F' U F2 R' F' R"],
  [27, 'Corner in the slot, edge on top', "F' U2 F R U2 R'"],
  [28, 'Corner in the slot, edge on top', "R U' R' F' U' F"],
  [29, 'Corner in the slot, edge on top', "F' U F U R U' R'"],
  [30, 'Corner in the slot, edge on top', "R U' R' F R' F' R"],
  [31, 'Edge in the slot, corner on top', "F' U F R U2 R'"],
  [32, 'Edge in the slot, corner on top', "F' U' F U R U' R'"],
  [33, 'Edge in the slot, corner on top', "R U R' F R' F' R"],
  [34, 'Edge in the slot, corner on top', "R U R' U2 R U R'"],
  [35, 'Edge in the slot, corner on top', "R U' R' U2 R U' R'"],
  [36, 'Edge in the slot, corner on top', "R2 U2 R2 U' R2 U' R2"],
  [37, 'Both pieces in the slot', "R F U R U' R' F' U' R'"],
  [38, 'Both pieces in the slot', "R U F R U R' U' F' R'"],
  [39, 'Both pieces in the slot', "R2 U2 F R' F' U2 R' U2 R'"],
  [40, 'Both pieces in the slot', "R2 U2 F R2 F' U2 R' U R'"],
  [41, 'Both pieces in the slot', "R2 U2 R' U' R U' R' U2 R'"],
];

const cases: AlgCase[] = entries.map(([number, group, alg]) => ({
  id: `f2l-${number}`,
  name: `F2L ${number}`,
  group,
  algs: [alg],
}));

export const F2L: AlgSet = {
  id: 'f2l',
  name: 'F2L',
  description:
    'First two layers: pairing each corner with its edge and inserting them ' +
    'together, rather than layer by layer. 41 cases.',
  stage: 'Cross done, filling the four slots',
  keyOf: f2lKey,
  enumerate: enumerateF2lKeys,
  validate: (cube) => (f2lRemainderSolved(cube) ? null : 'cross or another slot is disturbed'),
  cases,
};
