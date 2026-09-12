/**
 * The algorithm sets the trainer knows about.
 *
 * Adding a set means writing a data file that exports an AlgSet and listing it
 * here. The shared test then verifies it automatically: every case valid, no
 * duplicates, and full coverage of the case space the set defines.
 */

import { F2L } from './f2l';
import { OLL } from './oll';
import { PLL } from './pll';
import type { AlgSet } from './types';

export type { AlgCase, AlgSet } from './types';

/** Ordered the way they are learned. */
export const ALG_SETS: readonly AlgSet[] = [F2L, OLL, PLL];

export const ALG_SETS_BY_ID: Record<string, AlgSet> = Object.fromEntries(
  ALG_SETS.map((set) => [set.id, set]),
);
