/**
 * Where the last-layer pieces have to travel, worked out from the cube itself.
 *
 * A PLL case is a permutation, and a permutation is much easier to recognise as
 * motion than as colour. Two cases can present almost the same ring of colours
 * and differ entirely in what moves where; the arrows are what make that
 * difference visible at a glance, which is why every PLL sheet has them.
 *
 * They are derived rather than stored. The piece sitting in slot `i` is
 * `cp[i]`, and a solved cube has every piece in the slot of its own number, so
 * that piece's destination is slot `cp[i]` and the arrow runs from `i` to
 * `cp[i]`. No table of cases to keep in step with the algorithms, and a case
 * added later draws itself.
 */

import { CORNER_FACELETS, EDGE_FACELETS, type CubieCube } from '../cube/cubie';

/** A square of the U face, as row and column of the 3x3 grid. */
export interface Cell {
  row: number;
  col: number;
}

export interface PermutationArrow {
  kind: 'corner' | 'edge';
  from: Cell;
  to: Cell;
  /**
   * True when the two pieces trade places. A pair swapping is one movement, not
   * two, and drawing it as a single line with a head at each end says that;
   * two separate arrows lying on top of each other would not.
   */
  bothWays: boolean;
}

/** The last layer's own slots, in solver order: URF, UFL, ULB, UBR / UR, UF, UL, UB. */
const LAST_LAYER_SLOTS = 4;

/** Where a slot's upward-facing sticker sits on the U face. */
const cellOfFacelet = (facelet: number): Cell => ({
  row: Math.floor(facelet / 3),
  col: facelet % 3,
});

function arrowsForPermutation(
  permutation: Int8Array,
  kind: PermutationArrow['kind'],
  faceletOfSlot: (slot: number) => number,
): PermutationArrow[] {
  const arrows: PermutationArrow[] = [];

  for (let slot = 0; slot < LAST_LAYER_SLOTS; slot++) {
    const piece = permutation[slot];
    if (piece === slot) continue;
    // A slot holding a piece from below the last layer has nowhere to point to
    // in a picture of the last layer. That is not a PLL case, but this function
    // is also handed mid-solve states, and a half-drawn arrow would mislead.
    if (piece >= LAST_LAYER_SLOTS) continue;

    const isSwap = permutation[piece] === slot;
    // A swap is drawn once. Taking the lower slot as the anchor picks the same
    // one of the two directions every time, so the picture is stable.
    if (isSwap && piece < slot) continue;

    arrows.push({
      kind,
      from: cellOfFacelet(faceletOfSlot(slot)),
      to: cellOfFacelet(faceletOfSlot(piece)),
      bothWays: isSwap,
    });
  }

  return arrows;
}

/**
 * Every movement the last layer still needs, corners and edges together.
 * Empty when the last layer is already permuted.
 */
export function lastLayerArrows(cube: CubieCube): PermutationArrow[] {
  return [
    ...arrowsForPermutation(cube.cp, 'corner', (slot) => CORNER_FACELETS[slot][0]),
    ...arrowsForPermutation(cube.ep, 'edge', (slot) => EDGE_FACELETS[slot][0]),
  ];
}
