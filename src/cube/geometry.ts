/**
 * Sticker geometry for an N x N x N cube.
 *
 * Rather than hand-writing a permutation table per face (easy to get subtly
 * wrong, and it would need redoing for every cube size), every turn is derived
 * from a small 3D model: each sticker has an integer position, a turn is a
 * rotation matrix applied to that position, and the sticker's new index is read
 * back out of the rotated position. One set of six rotations then covers every
 * cube size, every layer depth, slices and whole-cube rotations alike.
 *
 * Axes: +x points right (towards R), +y up (towards U), +z forwards (towards F).
 *
 * Sticker indices are `faceIndex * n * n + row * n + col`, with faces ordered
 * U, R, F, D, L, B and each face read row-major. For n = 3 that is exactly the
 * 54-character URFDLB facelet string used by the solver.
 */

export const FACE_NAMES = ['U', 'R', 'F', 'D', 'L', 'B'] as const;
export type Face = (typeof FACE_NAMES)[number];

export const FACE_INDEX: Record<Face, number> = { U: 0, R: 1, F: 2, D: 3, L: 4, B: 5 };

/** Axis each face turns about; used to spot redundant moves in scrambles. */
export const AXIS: Record<Face, number> = { U: 0, D: 0, R: 1, L: 1, F: 2, B: 2 };

type Vec = readonly [number, number, number];

const NORMAL: Record<Face, Vec> = {
  U: [0, 1, 0],
  R: [1, 0, 0],
  F: [0, 0, 1],
  D: [0, -1, 0],
  L: [-1, 0, 0],
  B: [0, 0, -1],
};

/**
 * Direction of increasing row/col on each face. Chosen so that reading a face
 * row-major reproduces the conventional net: U is read with B at the top, D
 * with F at the top, and the four side faces are read from their own outside
 * with U at the top.
 */
const ROW_DIR: Record<Face, Vec> = {
  U: [0, 0, 1],
  R: [0, -1, 0],
  F: [0, -1, 0],
  D: [0, 0, -1],
  L: [0, -1, 0],
  B: [0, -1, 0],
};

const COL_DIR: Record<Face, Vec> = {
  U: [1, 0, 0],
  R: [0, 0, -1],
  F: [1, 0, 0],
  D: [1, 0, 0],
  L: [0, 0, 1],
  B: [-1, 0, 0],
};

/** One clockwise quarter turn about each face's axis, seen from outside it. */
const ROTATE: Record<Face, (v: Vec) => Vec> = {
  U: ([x, y, z]) => [-z, y, x],
  D: ([x, y, z]) => [z, y, -x],
  R: ([x, y, z]) => [x, z, -y],
  L: ([x, y, z]) => [x, -z, y],
  F: ([x, y, z]) => [y, -x, z],
  B: ([x, y, z]) => [-y, x, z],
};

const dot = (a: Vec, b: Vec): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Coordinate of the i-th row/col, centred on zero so even and odd n both work. */
const tick = (n: number, i: number): number => 2 * i - (n - 1);

export function stickerPosition(n: number, face: Face, row: number, col: number): Vec {
  const nm = NORMAL[face];
  const rd = ROW_DIR[face];
  const cd = COL_DIR[face];
  const r = tick(n, row);
  const c = tick(n, col);
  return [
    n * nm[0] + r * rd[0] + c * cd[0],
    n * nm[1] + r * rd[1] + c * cd[1],
    n * nm[2] + r * rd[2] + c * cd[2],
  ];
}

/**
 * Inverse of {@link stickerPosition}. A sticker's own face is the only one whose
 * normal it projects onto with the full magnitude n, which makes the face
 * unambiguous; row and column then fall out of the remaining two projections.
 */
export function stickerIndex(n: number, p: Vec): number {
  for (const face of FACE_NAMES) {
    if (dot(p, NORMAL[face]) !== n) continue;
    const row = (dot(p, ROW_DIR[face]) + n - 1) / 2;
    const col = (dot(p, COL_DIR[face]) + n - 1) / 2;
    return FACE_INDEX[face] * n * n + row * n + col;
  }
  throw new Error(`position ${p.join(',')} is not on an n=${n} cube`);
}

/**
 * How deep a sticker sits along a face's axis, counting that face as layer 1
 * and the opposite face as layer n.
 */
function depthAlong(n: number, projection: number): number {
  if (projection === n) return 1;
  if (projection === -n) return n;
  return (n + 1 - projection) / 2;
}

const permutationCache = new Map<string, Int16Array>();

/**
 * Permutation for turning layers `from`..`to` (1-based, counted inwards from
 * `face`) by `amount` clockwise quarter turns. `perm[i]` is where the sticker
 * currently at index i ends up.
 */
export function turnPermutation(
  n: number,
  face: Face,
  from: number,
  to: number,
  amount: number,
): Int16Array {
  const turns = ((amount % 4) + 4) % 4;
  const key = `${n}|${face}|${from}|${to}|${turns}`;
  const cached = permutationCache.get(key);
  if (cached) return cached;

  const size = 6 * n * n;
  const perm = new Int16Array(size);
  for (let i = 0; i < size; i++) perm[i] = i;

  if (turns !== 0) {
    const normal = NORMAL[face];
    const rotate = ROTATE[face];
    for (const f of FACE_NAMES) {
      for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
          const from3d = stickerPosition(n, f, row, col);
          const depth = depthAlong(n, dot(from3d, normal));
          if (depth < from || depth > to) continue;
          let p = from3d;
          for (let t = 0; t < turns; t++) p = rotate(p);
          perm[FACE_INDEX[f] * n * n + row * n + col] = stickerIndex(n, p);
        }
      }
    }
  }

  permutationCache.set(key, perm);
  return perm;
}
