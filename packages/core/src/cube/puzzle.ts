/**
 * An N x N x N cube as a flat array of stickers, one byte per sticker holding
 * the index of the face whose colour it carries. Every turn goes through the
 * geometric permutations in `geometry.ts`, so the same class handles 2x2
 * through 7x7 with no size-specific code.
 */

import { FACE_INDEX, FACE_NAMES, turnPermutation, type Face } from './geometry';
import { parseAlg, resolveSpan, type Move } from './notation';

export class PuzzleCube {
  readonly n: number;
  readonly stickers: Uint8Array;

  private constructor(n: number, stickers: Uint8Array) {
    this.n = n;
    this.stickers = stickers;
  }

  static solved(n: number): PuzzleCube {
    const stickers = new Uint8Array(6 * n * n);
    for (let i = 0; i < stickers.length; i++) stickers[i] = Math.floor(i / (n * n));
    return new PuzzleCube(n, stickers);
  }

  /** Builds a cube from a URFDLB facelet string such as the 54-character 3x3 form. */
  static fromFacelets(facelets: string): PuzzleCube {
    const perFace = facelets.length / 6;
    const n = Math.round(Math.sqrt(perFace));
    if (n * n * 6 !== facelets.length) {
      throw new Error(`facelet string of length ${facelets.length} is not a cube`);
    }
    const stickers = new Uint8Array(facelets.length);
    for (let i = 0; i < facelets.length; i++) {
      const face = facelets[i].toUpperCase() as Face;
      const index = FACE_INDEX[face];
      if (index === undefined) throw new Error(`unknown facelet "${facelets[i]}"`);
      stickers[i] = index;
    }
    return new PuzzleCube(n, stickers);
  }

  clone(): PuzzleCube {
    return new PuzzleCube(this.n, this.stickers.slice());
  }

  apply(move: Move): this {
    const [from, to] = resolveSpan(move.span, this.n);
    const perm = turnPermutation(this.n, move.face, from, to, move.amount);
    const before = this.stickers.slice();
    for (let i = 0; i < perm.length; i++) this.stickers[perm[i]] = before[i];
    return this;
  }

  applyAll(moves: Move[]): this {
    for (const move of moves) this.apply(move);
    return this;
  }

  /** Convenience for applying an algorithm written in standard notation. */
  applyAlg(alg: string): this {
    return this.applyAll(parseAlg(alg));
  }

  isSolved(): boolean {
    const perFace = this.n * this.n;
    for (let i = 0; i < this.stickers.length; i++) {
      if (this.stickers[i] !== Math.floor(i / perFace)) return false;
    }
    return true;
  }

  /**
   * True when every face is a single colour, allowing for the whole cube being
   * rotated. Useful when checking a solve that ended in a different orientation.
   */
  isSolvedIgnoringOrientation(): boolean {
    const perFace = this.n * this.n;
    for (let f = 0; f < 6; f++) {
      const first = this.stickers[f * perFace];
      for (let i = 1; i < perFace; i++) {
        if (this.stickers[f * perFace + i] !== first) return false;
      }
    }
    return true;
  }

  facelets(): string {
    let out = '';
    for (let i = 0; i < this.stickers.length; i++) out += FACE_NAMES[this.stickers[i]];
    return out;
  }

  /** The n x n grid of face-colour indices for one face, as rows of columns. */
  faceGrid(face: Face): number[][] {
    const { n } = this;
    const base = FACE_INDEX[face] * n * n;
    const rows: number[][] = [];
    for (let r = 0; r < n; r++) {
      const row: number[] = [];
      for (let c = 0; c < n; c++) row.push(this.stickers[base + r * n + c]);
      rows.push(row);
    }
    return rows;
  }

  equals(other: PuzzleCube): boolean {
    if (other.n !== this.n) return false;
    for (let i = 0; i < this.stickers.length; i++) {
      if (this.stickers[i] !== other.stickers[i]) return false;
    }
    return true;
  }
}

/** Applies an algorithm to a solved cube of the given size. */
export function cubeAfter(alg: string | Move[], n = 3): PuzzleCube {
  const cube = PuzzleCube.solved(n);
  return typeof alg === 'string' ? cube.applyAlg(alg) : cube.applyAll(alg);
}
