import { describe, expect, it } from 'vitest';
import {
  N_CORNER_PERM,
  N_FLIP,
  N_SLICE,
  N_SLICE_PERM,
  N_TWIST,
  SLICE_SOLVED,
  getCornerPerm,
  getFlip,
  getSlice,
  getSlicePerm,
  getTwist,
  getUdEdgePerm,
  permRank,
  permUnrank,
  setCornerPerm,
  setFlip,
  setSlice,
  setSlicePerm,
  setTwist,
  setUdEdgePerm,
} from './coords';
import { solvedCubie } from './cubie';

describe('permutation ranking', () => {
  it('is a bijection over every permutation of four elements', () => {
    const seen = new Set<string>();
    for (let rank = 0; rank < 24; rank++) {
      const perm = permUnrank(rank, 4);
      expect(permRank(perm)).toBe(rank);
      seen.add(perm.join(''));
    }
    expect(seen.size).toBe(24);
  });

  it('round-trips every permutation of eight elements', () => {
    for (let rank = 0; rank < 40320; rank++) {
      expect(permRank(permUnrank(rank, 8))).toBe(rank);
    }
  });

  it('ranks the identity at zero', () => {
    expect(permRank([0, 1, 2, 3, 4, 5, 6, 7])).toBe(0);
  });
});

describe('coordinates', () => {
  const roundTrip = (
    size: number,
    set: (cube: ReturnType<typeof solvedCubie>, v: number) => void,
    get: (cube: ReturnType<typeof solvedCubie>) => number,
  ) => {
    for (let value = 0; value < size; value++) {
      const cube = solvedCubie();
      set(cube, value);
      expect(get(cube)).toBe(value);
    }
  };

  it('round-trips corner orientation', () => roundTrip(N_TWIST, setTwist, getTwist));
  it('round-trips edge orientation', () => roundTrip(N_FLIP, setFlip, getFlip));
  it('round-trips equator placement', () => roundTrip(N_SLICE, setSlice, getSlice));
  it('round-trips equator order', () => roundTrip(N_SLICE_PERM, setSlicePerm, getSlicePerm));
  it('round-trips corner order', () => roundTrip(N_CORNER_PERM, setCornerPerm, getCornerPerm));
  it('round-trips U/D edge order', () => roundTrip(N_CORNER_PERM, setUdEdgePerm, getUdEdgePerm));

  it('keeps every coordinate at its solved value for a solved cube', () => {
    const cube = solvedCubie();
    expect(getTwist(cube)).toBe(0);
    expect(getFlip(cube)).toBe(0);
    expect(getSlice(cube)).toBe(SLICE_SOLVED);
    expect(getCornerPerm(cube)).toBe(0);
    expect(getUdEdgePerm(cube)).toBe(0);
    expect(getSlicePerm(cube)).toBe(0);
  });

  it('keeps orientation sums legal when set from a coordinate', () => {
    for (const value of [0, 1, 500, N_TWIST - 1]) {
      const cube = solvedCubie();
      setTwist(cube, value);
      expect(cube.co.reduce((a, b) => a + b, 0) % 3).toBe(0);
    }
    for (const value of [0, 1, 500, N_FLIP - 1]) {
      const cube = solvedCubie();
      setFlip(cube, value);
      expect(cube.eo.reduce((a, b) => a + b, 0) % 2).toBe(0);
    }
  });
});
