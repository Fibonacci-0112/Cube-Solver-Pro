/**
 * Drawing a cube as a solid seen from a corner, rather than as a flat net.
 *
 * An F2L case is about a corner and an edge that belong together and are
 * currently somewhere else. A net splits that pair across two panels with the
 * fold between them, so the one relationship the picture exists to show is the
 * one it hides. Seen from a corner, with the top, front and right faces all
 * visible at once, the pair sits in a single view and the slot it has to go into
 * is right there underneath it — which is how the case looks on a real cube in
 * your hands, and how every printed F2L sheet draws it.
 *
 * The projection is ordinary 3D: take the sticker squares from the same model
 * the turns use, yaw the cube so two side faces show, pitch it so the top shows,
 * divide by depth for perspective, and keep the faces that ended up pointing at
 * the viewer. Nothing here knows what an F2L case is; it draws whatever cube it
 * is handed, from whatever angle it is asked for.
 */

import { FACE_NAMES, faceNormal, stickerCorners, type Face, type Vec } from '../cube/geometry';

export interface Point {
  x: number;
  y: number;
}

export interface ProjectedSticker {
  face: Face;
  row: number;
  col: number;
  /** Index into a 54-character facelet string, so callers can colour it. */
  facelet: number;
  /** The sticker's outline, in order around it. */
  points: Point[];
  /** Distance towards the viewer. Larger is nearer. */
  depth: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

export interface ProjectedFace {
  face: Face;
  /** The face's outer edge, for the body of the cube under the stickers. */
  points: Point[];
}

export interface Projection {
  /** Visible stickers, farthest first, so painting them in order is correct. */
  stickers: ProjectedSticker[];
  /**
   * The silhouette of each visible face. Filling these behind the stickers is
   * what makes the drawing read as a solid object rather than as twenty-seven
   * loose tiles: it supplies the outer edge and the seams where faces meet.
   */
  faces: ProjectedFace[];
  bounds: Bounds;
}

export interface ViewAngle {
  /** Degrees turned about the vertical axis. Positive brings R towards you. */
  yaw: number;
  /** Degrees tilted about the horizontal axis. Positive brings U towards you. */
  pitch: number;
}

export interface ProjectOptions {
  view?: ViewAngle;
  /**
   * How far the viewer stands from the cube, in the same units as the model
   * (a 3x3 is six units across). Smaller exaggerates the perspective; large
   * values approach a flat isometric drawing.
   */
  distance?: number;
  /** Fraction of a sticker's half-width taken off for the gap between stickers. */
  gap?: number;
}

/**
 * The angle F2L and OLL diagrams are conventionally drawn from: turned far
 * enough to see both side faces of the slot, tilted far enough that the top face
 * reads as a grid rather than a sliver.
 */
export const CORNER_VIEW: ViewAngle = { yaw: 34, pitch: 28 };

const radians = (degrees: number) => (degrees * Math.PI) / 180;

/** Turn about the vertical axis, then tilt about the horizontal one. */
function rotate(p: Vec, view: ViewAngle): Vec {
  const yaw = radians(view.yaw);
  const pitch = radians(view.pitch);

  const x = p[0] * Math.cos(yaw) - p[2] * Math.sin(yaw);
  const zYawed = p[0] * Math.sin(yaw) + p[2] * Math.cos(yaw);

  const y = p[1] * Math.cos(pitch) - zYawed * Math.sin(pitch);
  const z = p[1] * Math.sin(pitch) + zYawed * Math.cos(pitch);

  return [x, y, z];
}

export function projectCube(n: number, options: ProjectOptions = {}): Projection {
  const view = options.view ?? CORNER_VIEW;
  const distance = options.distance ?? 26;
  const gap = options.gap ?? 0.08;

  const project = (p: Vec): Point => {
    const [x, y, z] = rotate(p, view);
    // Points nearer the viewer sit at larger z, so they are scaled up.
    const scale = distance / (distance - z);
    // Screen y grows downwards; the model's y grows upwards.
    return { x: x * scale, y: -y * scale };
  };

  const stickers: ProjectedSticker[] = [];
  const faces: ProjectedFace[] = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  /**
   * A face's own outline, taken from the outer corner of each of its four
   * corner stickers. `stickerCorners` lists a sticker's corners in a fixed
   * order, so the corner pointing away from the middle of the face is a known
   * one in each case.
   */
  const outlineOf = (face: Face): Point[] =>
    (
      [
        [0, 0, 0],
        [0, n - 1, 1],
        [n - 1, n - 1, 2],
        [n - 1, 0, 3],
      ] as const
    ).map(([row, col, corner]) => project(stickerCorners(n, face, row, col, 0)[corner]));

  for (const face of FACE_NAMES) {
    // A face is visible when, after turning the cube, its outward normal still
    // points somewhere towards the viewer.
    if (rotate(faceNormal(face), view)[2] <= 0) continue;

    faces.push({ face, points: outlineOf(face) });

    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        const corners = stickerCorners(n, face, row, col, gap);
        const points = corners.map(project);
        for (const point of points) {
          if (point.x < minX) minX = point.x;
          if (point.y < minY) minY = point.y;
          if (point.x > maxX) maxX = point.x;
          if (point.y > maxY) maxY = point.y;
        }
        const depth =
          corners.reduce((sum, corner) => sum + rotate(corner, view)[2], 0) / corners.length;
        stickers.push({
          face,
          row,
          col,
          facelet: FACE_NAMES.indexOf(face) * n * n + row * n + col,
          points,
          depth,
        });
      }
    }
  }

  stickers.sort((a, b) => a.depth - b.depth);

  // The outlines sit a gap-width outside the stickers, so they, not the
  // stickers, decide how much room the drawing needs.
  for (const { points } of faces) {
    for (const point of points) {
      if (point.x < minX) minX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.x > maxX) maxX = point.x;
      if (point.y > maxY) maxY = point.y;
    }
  }

  return {
    stickers,
    faces,
    bounds: { minX, minY, width: maxX - minX, height: maxY - minY },
  };
}
