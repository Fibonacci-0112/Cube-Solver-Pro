/**
 * Schema for algorithm sets.
 *
 * A set is self-describing: it knows how to identify one of its cases from a
 * cube state, how to enumerate every case that exists, and what must be true of
 * a case state for the algorithm to be plausible. The shared test drives all
 * three, so adding a set later (COLL, ZBLL, Winter Variation) means writing a
 * data file and one registry line — the verification comes for free.
 */

import type { CubieCube } from '../cube/cubie';

export interface AlgCase {
  /** Stable identifier, used as the key for the learner's per-case statistics. */
  id: string;
  /** How cubers refer to the case, e.g. "T perm" or "OLL 21". */
  name: string;
  /** Recognition grouping, used to organise the trainer and the reference pages. */
  group: string;
  /** Known algorithms, best-known-first. The first is the default. */
  algs: string[];
  /** Optional note shown alongside the case. */
  note?: string;
}

export interface AlgSet {
  id: string;
  name: string;
  description: string;
  /** What the learner is looking at when this set comes up. */
  stage: string;
  cases: AlgCase[];
  /** Reduces a cube state to the case it represents. */
  keyOf: (cube: CubieCube) => string;
  /** Every case the set can contain, derived from the cube's own constraints. */
  enumerate: () => Set<string>;
  /** Why a case state would be impossible for this set, or null if it is fine. */
  validate: (cube: CubieCube) => string | null;
}
