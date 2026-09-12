import { describe, expect, it } from 'vitest';
import {
  analyseBeginner,
  analyseCfop,
  crossSolved,
  isSolved,
  slotsSolved,
  viewFromNextSide,
} from './analysis';
import { faceletsToCubie, randomCubie, solvedCubie, cubieToFacelets } from '../cube/cubie';
import { PuzzleCube } from '../cube/puzzle';
import { ALG_SETS_BY_ID } from '../algs';
import { caseStateOf } from '../algs/analysis';

const after = (alg: string) => faceletsToCubie(PuzzleCube.solved(3).applyAlg(alg).facelets());

describe('looking at the cube from another side', () => {
  it('returns to the starting view after four turns', () => {
    const start = randomCubie(() => 0.42);
    let view = start;
    for (let i = 0; i < 4; i++) view = viewFromNextSide(view);
    expect(cubieToFacelets(view)).toBe(cubieToFacelets(start));
  });

  it('leaves a solved cube solved', () => {
    expect(isSolved(viewFromNextSide(solvedCubie()))).toBe(true);
  });

  it('keeps the cross and the finished slots finished', () => {
    // Only the front-right slot is open, so every view should still see a
    // complete cross and three filled slots.
    let view = after("R U R' U'");
    for (let i = 0; i < 4; i++) {
      expect(crossSolved(view)).toBe(true);
      expect(slotsSolved(view)).toBe(3);
      view = viewFromNextSide(view);
    }
  });
});

describe('CFOP guidance', () => {
  it('recognises a solved cube', () => {
    expect(analyseCfop(solvedCubie()).solved).toBe(true);
  });

  it('asks for the cross first', () => {
    const advice = analyseCfop(randomCubie(() => 0.3));
    expect(advice.step).toBe('Cross');
  });

  it('names the OLL case and hands over its algorithm', () => {
    for (const algCase of ALG_SETS_BY_ID.oll.cases) {
      const advice = analyseCfop(caseStateOf(algCase.algs[0]));
      expect(advice.step, algCase.name).toBe('Orient the last layer');
      expect(advice.caseName, algCase.name).toBe(algCase.name);
      expect(advice.algorithm, algCase.name).toBe(algCase.algs[0]);
    }
  });

  it('names the PLL case and hands over its algorithm', () => {
    for (const algCase of ALG_SETS_BY_ID.pll.cases) {
      const advice = analyseCfop(caseStateOf(algCase.algs[0]));
      expect(advice.step, algCase.name).toBe('Permute the last layer');
      expect(advice.caseName, algCase.name).toBe(algCase.name);
    }
  });

  it('names the F2L case for the front-right slot', () => {
    for (const algCase of ALG_SETS_BY_ID.f2l.cases) {
      const advice = analyseCfop(caseStateOf(algCase.algs[0]));
      expect(advice.step, algCase.name).toBe('First two layers');
      expect(advice.caseName, algCase.name).toBe(algCase.name);
      expect(advice.setup, algCase.name).toBeUndefined();
    }
  });

  it('finds an F2L case in a slot that is not at the front, and says how to turn to it', () => {
    // Put the same case in the back-right slot by looking at it from a side.
    const frontRight = caseStateOf(ALG_SETS_BY_ID.f2l.cases[10].algs[0]);
    const advice = analyseCfop(viewFromNextSide(frontRight));
    expect(advice.step).toBe('First two layers');
    expect(advice.caseName).toBe(ALG_SETS_BY_ID.f2l.cases[10].name);
    expect(advice.setup).toBeTruthy();
  });
});

describe('beginner guidance', () => {
  it('walks the steps in order', () => {
    expect(analyseBeginner(randomCubie(() => 0.3)).step).toContain('cross');
    // A cube with only the last layer left must be past the middle-layer steps.
    const lastLayer = caseStateOf(ALG_SETS_BY_ID.oll.cases[26].algs[0]);
    expect(analyseBeginner(lastLayer).step).toMatch(/top cross|corners/);
  });

  it('recognises a solved cube', () => {
    expect(analyseBeginner(solvedCubie()).solved).toBe(true);
  });

  it('always has something to say', () => {
    for (let i = 0; i < 50; i++) {
      const advice = analyseBeginner(randomCubie());
      expect(advice.step.length).toBeGreaterThan(0);
      expect(advice.detail.length).toBeGreaterThan(0);
    }
  });
});
