import { describe, expect, it } from 'vitest';
import { caseStateOf } from '../algs/analysis';
import { PLL } from '../algs/pll';
import { solvedCubie } from '../cube/cubie';
import { lastLayerArrows, type PermutationArrow } from './arrows';

const stateOf = (name: string) => {
  const found = PLL.cases.find((c) => c.name === name);
  if (!found) throw new Error(`no PLL case called ${name}`);
  return caseStateOf(found.algs[0]);
};

const kinds = (arrows: PermutationArrow[], kind: PermutationArrow['kind']) =>
  arrows.filter((a) => a.kind === kind);

describe('lastLayerArrows', () => {
  it('draws nothing when the last layer is already in place', () => {
    expect(lastLayerArrows(solvedCubie())).toEqual([]);
  });

  it('draws a two-headed arrow for a pair that trades places', () => {
    // A T perm swaps two adjacent corners and two edges, and nothing else.
    const arrows = lastLayerArrows(stateOf('T perm'));
    expect(kinds(arrows, 'corner')).toHaveLength(1);
    expect(kinds(arrows, 'edge')).toHaveLength(1);
    expect(arrows.every((a) => a.bothWays)).toBe(true);
  });

  it('draws one arrow per step of a three-cycle', () => {
    // A U perm cycles three edges and leaves every corner alone.
    const arrows = lastLayerArrows(stateOf('Ua perm'));
    expect(kinds(arrows, 'corner')).toHaveLength(0);
    expect(kinds(arrows, 'edge')).toHaveLength(3);
    expect(arrows.some((a) => a.bothWays)).toBe(false);
  });

  it('draws both swaps of an H perm', () => {
    const arrows = lastLayerArrows(stateOf('H perm'));
    expect(kinds(arrows, 'corner')).toHaveLength(0);
    expect(kinds(arrows, 'edge')).toHaveLength(2);
    expect(arrows.every((a) => a.bothWays)).toBe(true);
  });

  it('gives every PLL case something to show', () => {
    for (const algCase of PLL.cases) {
      expect(lastLayerArrows(caseStateOf(algCase.algs[0])).length, algCase.name).toBeGreaterThan(0);
    }
  });

  it('accounts for every piece that is out of place', () => {
    for (const algCase of PLL.cases) {
      const cube = caseStateOf(algCase.algs[0]);
      const arrows = lastLayerArrows(cube);

      // A swap is drawn as one arrow standing for two pieces; every other
      // displaced piece gets its own.
      const moving = (perm: Int8Array) => {
        let count = 0;
        for (let slot = 0; slot < 4; slot++) if (perm[slot] !== slot) count++;
        return count;
      };
      const drawn = (kind: PermutationArrow['kind']) =>
        kinds(arrows, kind).reduce((total, a) => total + (a.bothWays ? 2 : 1), 0);

      expect(drawn('corner'), `${algCase.name} corners`).toBe(moving(cube.cp));
      expect(drawn('edge'), `${algCase.name} edges`).toBe(moving(cube.ep));
    }
  });

  it('anchors arrows on the last layer, never off the picture', () => {
    for (const algCase of PLL.cases) {
      for (const arrow of lastLayerArrows(caseStateOf(algCase.algs[0]))) {
        for (const cell of [arrow.from, arrow.to]) {
          expect(cell.row).toBeGreaterThanOrEqual(0);
          expect(cell.row).toBeLessThanOrEqual(2);
          expect(cell.col).toBeGreaterThanOrEqual(0);
          expect(cell.col).toBeLessThanOrEqual(2);
        }
        // An arrow that starts and ends in the same square says nothing.
        expect(arrow.from).not.toEqual(arrow.to);
      }
    }
  });

  it('puts corner arrows on corners and edge arrows on edges', () => {
    for (const algCase of PLL.cases) {
      for (const arrow of lastLayerArrows(caseStateOf(algCase.algs[0]))) {
        for (const { row, col } of [arrow.from, arrow.to]) {
          const isCorner = row !== 1 && col !== 1;
          const isEdge = (row === 1) !== (col === 1);
          expect(arrow.kind === 'corner' ? isCorner : isEdge, algCase.name).toBe(true);
        }
      }
    }
  });

  it('ignores a slot holding a piece from below the last layer', () => {
    // Mid-solve states reach this code too; an arrow pointing at a slot the
    // picture does not contain would be worse than no arrow.
    const cube = solvedCubie();
    cube.cp[0] = 6;
    cube.cp[6] = 0;
    expect(kinds(lastLayerArrows(cube), 'corner')).toEqual([]);
  });
});
