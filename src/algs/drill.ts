/**
 * Turning an algorithm case into something you can practise on a real cube.
 *
 * The setup is the algorithm backwards: perform it on a solved cube and you are
 * looking at exactly the case the algorithm solves. A random U turn is added so
 * the case does not always appear at the same angle — recognising a case only
 * from one orientation is the usual reason a learned algorithm stalls.
 */

import { faceletsToCubie, type CubieCube } from '../cube/cubie';
import { PuzzleCube } from '../cube/puzzle';
import { invertAlgText, normaliseOrientation } from './analysis';
import type { AlgCase, AlgSet } from './types';
import type { TrainerStat } from '../db/types';

export interface Drill {
  /** Moves to perform on a solved cube to produce the case. */
  setup: string;
  /** The algorithm being practised. */
  alg: string;
  state: PuzzleCube;
  cubie: CubieCube;
}

const AUF = ['', 'U', 'U2', "U'"];

export function buildDrill(alg: string, random: () => number = Math.random): Drill {
  const turn = AUF[Math.floor(random() * AUF.length)];
  const setup = [invertAlgText(alg), turn].filter(Boolean).join(' ');
  const state = normaliseOrientation(PuzzleCube.solved(3).applyAlg(setup));
  return { setup, alg, state, cubie: faceletsToCubie(state.facelets()) };
}

/** The algorithm a learner has chosen for a case, falling back to the set's own. */
export const algFor = (algCase: AlgCase, stat?: TrainerStat): string =>
  stat?.customAlg?.trim() || algCase.algs[0];

/**
 * How strongly a case should be favoured when picking the next drill.
 *
 * Cases you have never seen come first, then ones you are still learning, then
 * a light sprinkling of ones you know so they do not rot. Within that, slower
 * recent times raise the weight, so the trainer spends its time where you are
 * actually losing it. Starring a case doubles whatever it would have been.
 */
export function drillWeight(stat: TrainerStat | undefined, medianMs: number): number {
  if (!stat || stat.attempts === 0) return 8;

  let weight = stat.status === 'known' ? 1 : 3;

  const recent = stat.recentMs;
  if (recent.length > 0 && medianMs > 0) {
    const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
    // Twice the typical time is worth roughly three times the attention.
    weight *= Math.min(3, Math.max(0.5, mean / medianMs));
  }

  // A case attempted only once or twice is not yet settled.
  if (stat.attempts < 3) weight *= 2;
  if (stat.dnfs > 0) weight *= 1 + Math.min(1, stat.dnfs / Math.max(1, stat.attempts));
  if (stat.starred) weight *= 2;

  return weight;
}

/** Middle of the learner's per-case times, used as the yardstick for weighting. */
export function medianCaseTime(stats: (TrainerStat | undefined)[]): number {
  const means = stats
    .filter((s): s is TrainerStat => Boolean(s && s.recentMs.length))
    .map((s) => s.recentMs.reduce((a, b) => a + b, 0) / s.recentMs.length)
    .sort((a, b) => a - b);
  if (means.length === 0) return 0;
  return means[Math.floor(means.length / 2)];
}

/** Chooses the next case to drill, weighted towards what needs the work. */
export function pickCase(
  cases: AlgCase[],
  statOf: (algCase: AlgCase) => TrainerStat | undefined,
  random: () => number = Math.random,
  avoidId?: string,
): AlgCase | null {
  const pool = cases.length > 1 && avoidId ? cases.filter((c) => c.id !== avoidId) : cases;
  if (pool.length === 0) return null;

  const median = medianCaseTime(pool.map(statOf));
  const weights = pool.map((c) => drillWeight(statOf(c), median));
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return pool[Math.floor(random() * pool.length)];

  let target = random() * total;
  for (let i = 0; i < pool.length; i++) {
    target -= weights[i];
    if (target <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

/** The groups a set's cases fall into, in the order they first appear. */
export const groupsOf = (set: AlgSet): string[] => [...new Set(set.cases.map((c) => c.group))];
