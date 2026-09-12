import { describe, expect, it } from 'vitest';
import { FACE_NAMES, type Face } from './geometry';
import { formatAlg, invertAlg, parseAlg, parseMove } from './notation';
import { PuzzleCube, cubeAfter } from './puzzle';

const SIZES = [2, 3, 4, 5, 6, 7];

describe('notation', () => {
  it('parses and round-trips the canonical spellings', () => {
    expect(formatAlg(parseAlg("R U' F2 Rw Bw2"))).toBe("R U' F2 Rw Bw2");
    expect(formatAlg(parseAlg("r u' 3Rw2 M E' S2 x y' z2"))).toBe("Rw Uw' 3Rw2 M E' S2 x y' z2");
  });

  it('treats the two wide spellings as the same move', () => {
    expect(parseMove('r')).toEqual(parseMove('Rw'));
    expect(parseMove("u'")).toEqual(parseMove("Uw'"));
  });

  it('accepts both orderings of the double-and-prime modifiers', () => {
    expect(parseMove("R2'")?.amount).toBe(2);
    expect(parseMove("R'")?.amount).toBe(3);
    expect(parseMove('R2')?.amount).toBe(2);
  });

  it('rejects malformed tokens', () => {
    for (const bad of ['Q', '3R', "R''", 'Rx', 'x2w', '', '2R']) {
      expect(parseMove(bad)).toBeNull();
    }
    expect(() => parseAlg('R Q')).toThrow(/unrecognised move/);
  });
});

describe('turn geometry', () => {
  it('returns to solved after four identical quarter turns, at every size', () => {
    for (const n of SIZES) {
      for (const face of FACE_NAMES) {
        for (let depth = 1; depth <= n; depth++) {
          const alg = parseAlg(`${depth > 1 ? depth : ''}${face}${depth > 1 ? 'w' : ''}`);
          const cube = PuzzleCube.solved(n);
          for (let i = 0; i < 4; i++) cube.applyAll(alg);
          expect(cube.isSolved(), `${n}x${n} ${formatAlg(alg)}^4`).toBe(true);
        }
      }
    }
  });

  it('undoes any algorithm when its inverse is applied', () => {
    const alg = parseAlg("R U R' U' M2 x y' Rw2 3Fw' D B2");
    for (const n of [3, 5, 7]) {
      const cube = PuzzleCube.solved(n).applyAll(alg).applyAll(invertAlg(alg));
      expect(cube.isSolved(), `${n}x${n}`).toBe(true);
    }
  });

  it('returns to solved after six sexy moves', () => {
    const cube = PuzzleCube.solved(3);
    for (let i = 0; i < 6; i++) cube.applyAlg("R U R' U'");
    expect(cube.isSolved()).toBe(true);
  });

  it('sends each face to its neighbour in the right direction', () => {
    // U turns clockwise seen from above, so the front row of stickers moves to
    // the left face: F <- R <- B <- L <- F.
    const afterU = cubeAfter('U');
    const topRow = (cube: PuzzleCube, face: Face) => cube.faceGrid(face)[0].join('');
    expect(topRow(afterU, 'F')).toBe('111'); // R's colour index
    expect(topRow(afterU, 'R')).toBe('555'); // B
    expect(topRow(afterU, 'B')).toBe('444'); // L
    expect(topRow(afterU, 'L')).toBe('222'); // F

    // R turns clockwise seen from the right: U <- F <- D <- B <- U.
    const afterR = cubeAfter('R');
    const col = (cube: PuzzleCube, face: Face, c: number) =>
      cube.faceGrid(face).map((row) => row[c]).join('');
    expect(col(afterR, 'U', 2)).toBe('222'); // F
    expect(col(afterR, 'B', 0)).toBe('000'); // U, on B's R-adjacent edge
    expect(col(afterR, 'F', 2)).toBe('333'); // D
    expect(col(afterR, 'D', 2)).toBe('555'); // B
  });

  it('treats a whole-cube rotation as solved but reoriented', () => {
    for (const n of SIZES) {
      const cube = PuzzleCube.solved(n).applyAlg('y');
      expect(cube.isSolved()).toBe(false);
      expect(cube.isSolvedIgnoringOrientation()).toBe(true);
    }
  });

  it('makes a wide turn equal the face turn plus the inner slice on 3x3', () => {
    expect(cubeAfter('Rw').facelets()).toBe(cubeAfter("R M'").facelets());
    expect(cubeAfter('Uw').facelets()).toBe(cubeAfter("U E'").facelets());
    expect(cubeAfter('Fw').facelets()).toBe(cubeAfter('F S').facelets());
  });

  it('makes a rotation equal turning every layer together', () => {
    expect(cubeAfter('x').facelets()).toBe(cubeAfter("R M' L'").facelets());
    expect(cubeAfter('y').facelets()).toBe(cubeAfter("U E' D'").facelets());
    expect(cubeAfter('z').facelets()).toBe(cubeAfter("F S B'").facelets());
  });
});

describe('facelet strings', () => {
  it('round-trips through the URFDLB representation', () => {
    const cube = cubeAfter("R U R' F2 D Lw' x");
    expect(PuzzleCube.fromFacelets(cube.facelets()).equals(cube)).toBe(true);
  });

  it('reads a solved 3x3 as nine of each face letter in URFDLB order', () => {
    expect(PuzzleCube.solved(3).facelets()).toBe(
      'UUUUUUUUU' + 'RRRRRRRRR' + 'FFFFFFFFF' + 'DDDDDDDDD' + 'LLLLLLLLL' + 'BBBBBBBBB',
    );
  });
});
