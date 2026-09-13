/**
 * Parsing and formatting of standard cube notation.
 *
 * Understands single-layer turns (`R`), wide turns in both spellings (`Rw`,
 * `r`, `3Rw`), slices (`M`, `E`, `S`) and whole-cube rotations (`x`, `y`, `z`),
 * each with `'` and `2` modifiers. Which layers a slice or rotation actually
 * covers depends on the cube size, so that is resolved when the move is
 * applied rather than when it is parsed.
 */

import { FACE_NAMES, type Face } from './geometry';

export type MoveSpan =
  | { kind: 'layers'; from: number; to: number }
  | { kind: 'slice' }
  | { kind: 'rotation' };

export interface Move {
  face: Face;
  span: MoveSpan;
  /** Clockwise quarter turns: 1, 2 or 3. */
  amount: number;
}

/** Face each slice follows the direction of. */
const SLICE_FACE: Record<string, Face> = { M: 'L', E: 'D', S: 'F' };
/** Face each whole-cube rotation follows the direction of. */
const ROTATION_FACE: Record<string, Face> = { x: 'R', y: 'U', z: 'F' };

const SLICE_NAME: Partial<Record<Face, string>> = { L: 'M', D: 'E', F: 'S' };
const ROTATION_NAME: Partial<Record<Face, string>> = { R: 'x', U: 'y', F: 'z' };

const TOKEN = /^(\d*)([URFDLBurfdlbMESxyz])(w?)('?)(2?)('?)$/;

function amountFromModifiers(double: boolean, prime: boolean): number {
  const base = double ? 2 : 1;
  return prime ? 4 - base : base;
}

/** Parses a single token, or returns null if it is not valid notation. */
export function parseMove(token: string): Move | null {
  const m = TOKEN.exec(token);
  if (!m) return null;
  const [, countText, letter, wide, prime1, double, prime2] = m;
  if (prime1 && prime2) return null;

  const amount = amountFromModifiers(double === '2', Boolean(prime1 || prime2));

  if (letter in ROTATION_FACE) {
    if (countText || wide) return null;
    return { face: ROTATION_FACE[letter], span: { kind: 'rotation' }, amount };
  }

  if (letter in SLICE_FACE) {
    if (countText || wide) return null;
    return { face: SLICE_FACE[letter], span: { kind: 'slice' }, amount };
  }

  const upper = letter.toUpperCase() as Face;
  if (!FACE_NAMES.includes(upper)) return null;
  const isLowercase = letter !== upper;

  // `3Rw` turns three layers; `Rw` and `r` turn two; `R` turns one.
  let depth = 1;
  if (wide || isLowercase) depth = countText ? Number(countText) : 2;
  else if (countText) return null; // `3R` alone is not standard notation
  if (depth < 1) return null;

  return { face: upper, span: { kind: 'layers', from: 1, to: depth }, amount };
}

/** Parses a whitespace-separated algorithm or scramble. Throws on bad tokens. */
export function parseAlg(text: string): Move[] {
  const moves: Move[] = [];
  for (const token of text.trim().split(/\s+/)) {
    if (!token) continue;
    const move = parseMove(token);
    if (!move) throw new Error(`unrecognised move "${token}" in "${text}"`);
    moves.push(move);
  }
  return moves;
}

const suffix = (amount: number): string => (amount === 1 ? '' : amount === 2 ? '2' : "'");

export function formatMove(move: Move): string {
  const { face, span, amount } = move;
  if (span.kind === 'rotation') return (ROTATION_NAME[face] ?? face.toLowerCase()) + suffix(amount);
  if (span.kind === 'slice') return (SLICE_NAME[face] ?? face) + suffix(amount);
  if (span.to === 1) return face + suffix(amount);
  if (span.to === 2) return `${face}w${suffix(amount)}`;
  return `${span.to}${face}w${suffix(amount)}`;
}

export const formatAlg = (moves: Move[]): string => moves.map(formatMove).join(' ');

export const invertMove = (move: Move): Move => ({ ...move, amount: 4 - move.amount });

export const invertAlg = (moves: Move[]): Move[] => moves.map(invertMove).reverse();

/** Resolves a span against a concrete cube size, as inclusive 1-based layers. */
export function resolveSpan(span: MoveSpan, n: number): [number, number] {
  switch (span.kind) {
    case 'layers':
      return [span.from, Math.min(span.to, n)];
    case 'slice':
      return [2, Math.max(2, n - 1)];
    case 'rotation':
      return [1, n];
  }
}
