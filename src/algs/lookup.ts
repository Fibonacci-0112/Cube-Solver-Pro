/**
 * Recognising a case from a cube state.
 *
 * The algorithm sets already know how to reduce a state to a case key, so
 * indexing each set by that key turns "what am I looking at?" into a lookup.
 * This is what lets the guided solve name the case in front of you and hand you
 * the algorithm for it.
 */

import { ALG_SETS_BY_ID } from './index';
import { caseStateOf } from './analysis';
import type { AlgCase, AlgSet } from './types';
import type { CubieCube } from '../cube/cubie';

const indexes = new Map<string, Map<string, AlgCase>>();

/** Case key to case, built once per set. */
export function caseIndex(set: AlgSet): Map<string, AlgCase> {
  const existing = indexes.get(set.id);
  if (existing) return existing;
  const index = new Map<string, AlgCase>();
  for (const algCase of set.cases) {
    index.set(set.keyOf(caseStateOf(algCase.algs[0])), algCase);
  }
  indexes.set(set.id, index);
  return index;
}

export const identifyCase = (set: AlgSet, cube: CubieCube): AlgCase | undefined =>
  caseIndex(set).get(set.keyOf(cube));

export const identifyOll = (cube: CubieCube): AlgCase | undefined =>
  identifyCase(ALG_SETS_BY_ID.oll, cube);

export const identifyPll = (cube: CubieCube): AlgCase | undefined =>
  identifyCase(ALG_SETS_BY_ID.pll, cube);
