/**
 * PLL — permuting the last layer. 21 cases, each moving last-layer pieces into
 * place without disturbing their orientation.
 *
 * Groups follow how the cases are recognised in practice: what the corners are
 * doing is the first thing you read, so that is what they are grouped by.
 */

import {
  enumeratePllKeys,
  firstTwoLayersSolved,
  lastLayerOriented,
  lastLayerPermuted,
  pllKey,
} from './analysis';
import type { AlgSet } from './types';

export const PLL: AlgSet = {
  id: 'pll',
  name: 'PLL',
  description:
    'Permuting the last layer: the final step of CFOP, moving the last-layer pieces ' +
    'into place once they are all oriented. 21 cases.',
  stage: 'Last layer, already oriented',
  keyOf: pllKey,
  enumerate: enumeratePllKeys,
  validate: (cube) => {
    if (!firstTwoLayersSolved(cube)) return 'first two layers are disturbed';
    if (!lastLayerOriented(cube)) return 'last layer is not oriented';
    if (lastLayerPermuted(cube)) return 'nothing is out of place';
    return null;
  },
  cases: [
    {
      id: 'pll-ua',
      name: 'Ua perm',
      group: 'Edges only',
      algs: ['M2 U M U2 M\' U M2', "R U' R U R U R U' R' U' R2"],
    },
    {
      id: 'pll-ub',
      name: 'Ub perm',
      group: 'Edges only',
      algs: ["M2 U' M U2 M' U' M2", "R2 U R U R' U' R' U' R' U R'"],
    },
    {
      id: 'pll-z',
      name: 'Z perm',
      group: 'Edges only',
      algs: ["M' U M2 U M2 U M' U2 M2"],
    },
    {
      id: 'pll-h',
      name: 'H perm',
      group: 'Edges only',
      algs: ["M2 U M2 U2 M2 U M2"],
    },
    {
      id: 'pll-aa',
      name: 'Aa perm',
      group: 'Corners only',
      algs: ["x L2 D2 L' U' L D2 L' U L' x'"],
    },
    {
      id: 'pll-ab',
      name: 'Ab perm',
      group: 'Corners only',
      algs: ["x L U' L D2 L' U L D2 L2 x'", "R2 B2 R F R' B2 R F' R"],
    },
    {
      id: 'pll-e',
      name: 'E perm',
      group: 'Corners only',
      algs: ["x' L' U L D' L' U' L D L' U' L D' L' U L D x"],
    },
    {
      id: 'pll-t',
      name: 'T perm',
      group: 'Adjacent corner swap',
      algs: ["R U R' U' R' F R2 U' R' U' R U R' F'"],
    },
    {
      id: 'pll-f',
      name: 'F perm',
      group: 'Adjacent corner swap',
      algs: ["R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R"],
    },
    {
      id: 'pll-ja',
      name: 'Ja perm',
      group: 'Adjacent corner swap',
      algs: ["R' U L' U2 R U' R' U2 R L", "B2 R' U' R B2 L' D L' D' L2"],
    },
    {
      id: 'pll-jb',
      name: 'Jb perm',
      group: 'Adjacent corner swap',
      algs: ["R U R' F' R U R' U' R' F R2 U' R' U'"],
    },
    {
      id: 'pll-ra',
      name: 'Ra perm',
      group: 'Adjacent corner swap',
      algs: ["R U' R' U' R U R D R' U' R D' R' U2 R'"],
    },
    {
      id: 'pll-rb',
      name: 'Rb perm',
      group: 'Adjacent corner swap',
      algs: ["R' U2 R U2 R' F R U R' U' R' F' R2 U'"],
    },
    {
      id: 'pll-ga',
      name: 'Ga perm',
      group: 'Adjacent corner swap',
      algs: ["R2 U R' U R' U' R U' R2 U' D R' U R D'"],
    },
    {
      id: 'pll-gb',
      name: 'Gb perm',
      group: 'Adjacent corner swap',
      algs: ["R' U' R U D' R2 U R' U R U' R U' R2 D"],
    },
    {
      id: 'pll-gc',
      name: 'Gc perm',
      group: 'Adjacent corner swap',
      algs: ["R2 U' R U' R U R' U R2 U D' R U' R' D"],
    },
    {
      id: 'pll-gd',
      name: 'Gd perm',
      group: 'Adjacent corner swap',
      algs: ["R U R' U' D R2 U' R U' R' U R' U R2 D'"],
    },
    {
      id: 'pll-v',
      name: 'V perm',
      group: 'Diagonal corner swap',
      algs: ["R' U R' U' y R' F' R2 U' R' U R' F R F y'"],
    },
    {
      id: 'pll-y',
      name: 'Y perm',
      group: 'Diagonal corner swap',
      algs: ["F R U' R' U' R U R' F' R U R' U' R' F R F'"],
    },
    {
      id: 'pll-na',
      name: 'Na perm',
      group: 'Diagonal corner swap',
      algs: ["R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'"],
    },
    {
      id: 'pll-nb',
      name: 'Nb perm',
      group: 'Diagonal corner swap',
      algs: ["R' U R U' R' F' U' F R U R' F R' F' R U' R"],
    },
  ],
};
