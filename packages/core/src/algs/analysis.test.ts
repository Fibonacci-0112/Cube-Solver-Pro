import { describe, expect, it } from 'vitest';
import {
  enumerateF2lKeys,
  enumerateOllKeys,
  enumeratePllKeys,
  f2lKey,
  hasNoNetRotation,
  normaliseOrientation,
  ollKey,
  pllKey,
  stateAfterAlg,
} from './analysis';
import { PuzzleCube } from '../cube/puzzle';
import { solvedCubie } from '../cube/cubie';

describe('case space enumeration', () => {
  // These three counts are the reason speedcubers talk about "57 OLLs" and
  // "21 PLLs". Deriving them from the cube's own constraints, rather than
  // hard-coding them, is what lets the set tests prove full coverage.
  it('finds exactly 57 last-layer orientation cases', () => {
    expect(enumerateOllKeys().size).toBe(57);
  });

  it('finds exactly 21 last-layer permutation cases', () => {
    expect(enumeratePllKeys().size).toBe(21);
  });

  it('finds exactly 41 first-two-layers pair cases', () => {
    expect(enumerateF2lKeys().size).toBe(41);
  });
});

describe('orientation handling', () => {
  it('undoes a net rotation', () => {
    const rotated = PuzzleCube.solved(3).applyAlg("x y' z2");
    expect(normaliseOrientation(rotated).isSolved()).toBe(true);
  });

  it('spots algorithms that leave the cube facing elsewhere', () => {
    expect(hasNoNetRotation("R U R' U'")).toBe(true);
    expect(hasNoNetRotation("x L2 D2 L' U' L D2 L' U L' x'")).toBe(true);
    expect(hasNoNetRotation("R U R' y'")).toBe(false);
  });

  it('reads a solved cube as the solved case in every set', () => {
    const solved = solvedCubie();
    expect(ollKey(stateAfterAlg(''))).toBe(ollKey(solved));
    expect(pllKey(stateAfterAlg(''))).toBe(pllKey(solved));
    expect(f2lKey(stateAfterAlg(''))).toBe(f2lKey(solved));
  });
});

describe('case keys', () => {
  it('treats states differing only by U turns as the same case', () => {
    const base = stateAfterAlg("R U R' U' R' F R2 U' R' U' R U R' F'"); // T perm
    expect(pllKey(stateAfterAlg("U R U R' U' R' F R2 U' R' U' R U R' F' U2"))).toBe(pllKey(base));
  });

  it('distinguishes genuinely different cases', () => {
    const tPerm = pllKey(stateAfterAlg("R U R' U' R' F R2 U' R' U' R U R' F'"));
    const hPerm = pllKey(stateAfterAlg('M2 U M2 U2 M2 U M2'));
    expect(tPerm).not.toBe(hPerm);
  });
});
