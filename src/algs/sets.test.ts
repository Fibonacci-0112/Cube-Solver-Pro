import { describe, expect, it } from 'vitest';
import { ALG_SETS } from './index';
import { caseStateOf } from './analysis';
import { parseAlg } from '../cube/notation';

describe.each(ALG_SETS.map((set) => [set.name, set] as const))('%s', (_name, set) => {
  it('has unique case ids', () => {
    const ids = set.cases.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('lists at least one algorithm per case, all parseable', () => {
    for (const algCase of set.cases) {
      expect(algCase.algs.length, algCase.name).toBeGreaterThan(0);
      for (const alg of algCase.algs) {
        expect(() => parseAlg(alg), `${algCase.name}: ${alg}`).not.toThrow();
      }
    }
  });

  it('leaves the cube facing forwards after every algorithm', () => {
    // A stored algorithm that ends rotated would make the drill setup and the
    // case picture disagree with what the learner actually sees.
    const rotated = set.cases
      .flatMap((c) => c.algs.map((alg) => ({ name: c.name, alg })))
      .filter(({ alg }) => {
        const moves = parseAlg(alg);
        const net = moves.filter((m) => m.span.kind === 'rotation');
        return net.length > 0 && !isBalanced(net);
      });
    expect(rotated.map((r) => `${r.name}: ${r.alg}`)).toEqual([]);
  });

  it('produces a state consistent with the set for every algorithm', () => {
    const problems: string[] = [];
    for (const algCase of set.cases) {
      for (const alg of algCase.algs) {
        const reason = set.validate(caseStateOf(alg));
        if (reason) problems.push(`${algCase.name} [${alg}] -> ${reason}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('has every algorithm for a case solving that same case', () => {
    const problems: string[] = [];
    for (const algCase of set.cases) {
      const keys = algCase.algs.map((alg) => set.keyOf(caseStateOf(alg)));
      if (new Set(keys).size !== 1) {
        problems.push(`${algCase.name}: algorithms disagree (${keys.join(' vs ')})`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('has no two cases that are secretly the same case', () => {
    const seen = new Map<string, string>();
    const duplicates: string[] = [];
    for (const algCase of set.cases) {
      const key = set.keyOf(caseStateOf(algCase.algs[0]));
      const previous = seen.get(key);
      if (previous) duplicates.push(`${algCase.name} duplicates ${previous}`);
      else seen.set(key, algCase.name);
    }
    expect(duplicates).toEqual([]);
  });

  it('covers the whole case space exactly once', () => {
    const expected = set.enumerate();
    const covered = new Set(set.cases.map((c) => set.keyOf(caseStateOf(c.algs[0]))));
    const missing = [...expected].filter((key) => !covered.has(key));
    const unexpected = [...covered].filter((key) => !expected.has(key));
    expect({ missing: missing.length, unexpected }).toEqual({ missing: 0, unexpected: [] });
    expect(set.cases.length).toBe(expected.size);
  });
});

/** True when the rotations in an algorithm cancel out. */
function isBalanced(rotations: ReturnType<typeof parseAlg>): boolean {
  const net = new Map<string, number>();
  for (const move of rotations) {
    net.set(move.face, ((net.get(move.face) ?? 0) + move.amount) % 4);
  }
  return [...net.values()].every((amount) => amount === 0);
}
