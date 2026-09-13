import { describe, expect, it } from 'vitest';
import { buildDrill, drillWeight, medianCaseTime, pickCase } from './drill';
import { ALG_SETS_BY_ID } from './index';
import { emptyTrainerStat, type TrainerStat } from '../data/types';
import type { AlgCase } from './types';

const stat = (over: Partial<TrainerStat>): TrainerStat => ({
  ...emptyTrainerStat('oll', 'x'),
  ...over,
});

describe('drill setup', () => {
  it('produces exactly the case the algorithm solves', () => {
    // Performing the setup and then the algorithm must leave a solved cube.
    for (const set of Object.values(ALG_SETS_BY_ID)) {
      for (const algCase of set.cases) {
        const alg = algCase.algs[0];
        const drill = buildDrill(alg, () => 0);
        const solved = drill.state.clone().applyAlg(alg);
        expect(solved.isSolved(), `${set.name} ${algCase.name}`).toBe(true);
      }
    }
  });

  it('varies the angle the case is presented from', () => {
    const alg = ALG_SETS_BY_ID.pll.cases[0].algs[0];
    const angles = new Set([0, 0.3, 0.55, 0.8].map((r) => buildDrill(alg, () => r).setup));
    expect(angles.size).toBe(4);
  });

  it('still solves the case after the angle changes', () => {
    // An added U turn must not break the relationship, only rotate it.
    for (const r of [0, 0.3, 0.55, 0.8]) {
      const algCase = ALG_SETS_BY_ID.oll.cases[20];
      const drill = buildDrill(algCase.algs[0], () => r);
      expect(ALG_SETS_BY_ID.oll.keyOf(drill.cubie)).toBe(
        ALG_SETS_BY_ID.oll.keyOf(buildDrill(algCase.algs[0], () => 0).cubie),
      );
    }
  });
});

describe('drill weighting', () => {
  it('favours cases never attempted', () => {
    expect(drillWeight(undefined, 2000)).toBeGreaterThan(drillWeight(stat({ attempts: 10 }), 2000));
  });

  it('favours cases still being learned over known ones', () => {
    const learning = stat({ attempts: 10, status: 'learning', recentMs: [2000] });
    const known = stat({ attempts: 10, status: 'known', recentMs: [2000] });
    expect(drillWeight(learning, 2000)).toBeGreaterThan(drillWeight(known, 2000));
  });

  it('favours cases that are slow relative to the rest', () => {
    const slow = stat({ attempts: 10, status: 'learning', recentMs: [6000] });
    const quick = stat({ attempts: 10, status: 'learning', recentMs: [1000] });
    expect(drillWeight(slow, 2000)).toBeGreaterThan(drillWeight(quick, 2000));
  });

  it('doubles a starred case', () => {
    const plain = stat({ attempts: 10, status: 'known', recentMs: [2000] });
    expect(drillWeight({ ...plain, starred: true }, 2000)).toBe(drillWeight(plain, 2000) * 2);
  });

  it('takes the middle of the per-case times', () => {
    expect(
      medianCaseTime([stat({ recentMs: [1000] }), stat({ recentMs: [5000] }), stat({ recentMs: [3000] })]),
    ).toBe(3000);
  });

  it('has no yardstick before any case has a time', () => {
    expect(medianCaseTime([undefined, stat({})])).toBe(0);
  });
});

describe('choosing the next case', () => {
  const cases: AlgCase[] = [
    { id: 'a', name: 'A', group: 'g', algs: ["R U R'"] },
    { id: 'b', name: 'B', group: 'g', algs: ["R U R'"] },
  ];

  it('returns nothing when no cases are selected', () => {
    expect(pickCase([], () => undefined)).toBeNull();
  });

  it('does not repeat the case just shown when there is an alternative', () => {
    for (let i = 0; i < 20; i++) {
      expect(pickCase(cases, () => undefined, Math.random, 'a')?.id).toBe('b');
    }
  });

  it('repeats rather than giving up when only one case is selected', () => {
    expect(pickCase([cases[0]], () => undefined, Math.random, 'a')?.id).toBe('a');
  });

  it('reaches every selected case', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) seen.add(pickCase(cases, () => undefined)!.id);
    expect(seen).toEqual(new Set(['a', 'b']));
  });
});
