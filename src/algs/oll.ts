/**
 * OLL — orienting the last layer. 57 cases, each turning every last-layer
 * sticker face up without regard to where the pieces end up.
 *
 * Grouped by the shape the oriented stickers make on the top face, which is how
 * the cases are actually recognised: you read the shape first, then the
 * surrounding stickers tell you which case within the shape you have.
 */

import { enumerateOllKeys, firstTwoLayersSolved, lastLayerOriented, ollKey } from './analysis';
import type { AlgCase, AlgSet } from './types';

const entries: [number, string, string][] = [
  [1, 'Dot', "R U2 R2 F R F' U2 R' F R F'"],
  [2, 'Dot', "F R U R' U' F' f R U R' U' f'"],
  [3, 'Dot', "f R U R' U' f' U' F R U R' U' F'"],
  [4, 'Dot', "f R U R' U' f' U F R U R' U' F'"],
  [5, 'Square', "r' U2 R U R' U r"],
  [6, 'Square', "r U2 R' U' R U' r'"],
  [7, 'Small lightning bolt', "r U R' U R U2 r'"],
  [8, 'Small lightning bolt', "r' U' R U' R' U2 r"],
  [9, 'Fish', "R U R' U' R' F R2 U R' U' F'"],
  [10, 'Fish', "R U R' U R' F R F' R U2 R'"],
  [11, 'Small L', "r U R' U R' F R F' R U2 r'"],
  [12, 'Small L', "M' R' U' R U' R' U2 R U' R r'"],
  [13, 'Knight move', "F U R U' R2 F' R U R U' R'"],
  [14, 'Knight move', "R' F R U R' F' R F U' F'"],
  [15, 'Knight move', "r' U' r R' U' R U r' U r"],
  [16, 'Knight move', "r U r' R U R' U' r U' r'"],
  [17, 'Dot', "F R' F' R2 r' U R U' R' U' M'"],
  [18, 'Dot', "r U R' U R U2 r2 U' R U' R' U2 r"],
  [19, 'Dot', "r' R U R U R' U' M' R' F R F'"],
  [20, 'Dot', "r U R' U' M2 U R U' R' U' M'"],
  [21, 'Cross', "R U2 R' U' R U R' U' R U' R'"],
  [22, 'Cross', "R U2 R2 U' R2 U' R2 U2 R"],
  [23, 'Cross', "R2 D R' U2 R D' R' U2 R'"],
  [24, 'Cross', "r U R' U' r' F R F'"],
  [25, 'Cross', "F' r U R' U' r' F R"],
  [26, 'Cross', "R U2 R' U' R U' R'"],
  [27, 'Cross', "R U R' U R U2 R'"],
  [28, 'Corners oriented', "r U R' U' r' R U R U' R'"],
  [29, 'Awkward', "R U R' U' R U' R' F' U' F R U R'"],
  [30, 'Awkward', "F R' F R2 U' R' U' R U R' F2"],
  [31, 'P', "R' U' F U R U' R' F' R"],
  [32, 'P', "L U F' U' L' U L F L'"],
  [33, 'T', "R U R' U' R' F R F'"],
  [34, 'C', "R U R2 U' R' F R U R U' F'"],
  [35, 'Fish', "R U2 R2 F R F' R U2 R'"],
  [36, 'W', "L' U' L U' L' U L U L F' L' F"],
  [37, 'Fish', "F R U' R' U' R U R' F'"],
  [38, 'W', "R U R' U R U' R' U' R' F R F'"],
  [39, 'Big lightning bolt', "L F' L' U' L U F U' L'"],
  [40, 'Big lightning bolt', "R' F R U R' U' F' U R"],
  [41, 'Awkward', "R U R' U R U2 R' F R U R' U' F'"],
  [42, 'Awkward', "R' U' R U' R' U2 R F R U R' U' F'"],
  [43, 'P', "F' U' L' U L F"],
  [44, 'P', "F U R U' R' F'"],
  [45, 'T', "F R U R' U' F'"],
  [46, 'C', "R' U' R' F R F' U R"],
  [47, 'L', "F' L' U' L U L' U' L U F"],
  [48, 'L', "F R U R' U' R U R' U' F'"],
  [49, 'L', "r U' r2 U r2 U r2 U' r"],
  [50, 'L', "r' U r2 U' r2 U' r2 U r'"],
  [51, 'I', "f R U R' U' R U R' U' f'"],
  [52, 'I', "R U R' U R U' B U' B' R'"],
  [53, 'L', "r' U' R U' R' U R U' R' U2 r"],
  [54, 'L', "r U R' U R U' R' U R U2 r'"],
  [55, 'I', "R U2 R2 U' R U' R' U2 F R F'"],
  [56, 'I', "r U r' U R U' R' U R U' R' r U' r'"],
  [57, 'Corners oriented', "R U R' U' M' U R U' r'"],
];

const cases: AlgCase[] = entries.map(([number, group, alg]) => ({
  id: `oll-${number}`,
  name: `OLL ${number}`,
  group,
  algs: [alg],
}));

export const OLL: AlgSet = {
  id: 'oll',
  name: 'OLL',
  description:
    'Orienting the last layer: turning every last-layer sticker face up in one ' +
    'algorithm, ignoring where the pieces end up. 57 cases.',
  stage: 'Last layer, first two layers complete',
  keyOf: ollKey,
  enumerate: enumerateOllKeys,
  validate: (cube) => {
    if (!firstTwoLayersSolved(cube)) return 'first two layers are disturbed';
    if (lastLayerOriented(cube)) return 'last layer is already oriented';
    return null;
  },
  cases,
};
