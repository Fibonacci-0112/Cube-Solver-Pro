import { describe, expect, it } from 'vitest';
import { CORNER_VIEW, projectCube, type Point } from './projection';

/** Shoelace area of an outline, used to compare apparent sizes. */
const areaOf = ({ points }: { points: Point[] }): number => {
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    total += a.x * b.y - b.x * a.y;
  }
  return Math.abs(total) / 2;
};

describe('projectCube', () => {
  it('shows exactly the three faces that meet at the near corner', () => {
    const { stickers } = projectCube(3);
    const faces = new Set(stickers.map((s) => s.face));
    expect(faces).toEqual(new Set(['U', 'F', 'R']));
    expect(stickers).toHaveLength(27);
  });

  it('hides the faces turned away from the viewer', () => {
    // Straight on, only the front is in view.
    const { stickers } = projectCube(3, { view: { yaw: 0, pitch: 0 } });
    expect(new Set(stickers.map((s) => s.face))).toEqual(new Set(['F']));
  });

  it('numbers stickers so they index a facelet string', () => {
    const { stickers } = projectCube(3);
    const indices = stickers.map((s) => s.facelet);
    expect(new Set(indices).size).toBe(indices.length);
    // Faces are ordered U, R, F, D, L, B, nine facelets each.
    for (const sticker of stickers) {
      expect(sticker.facelet).toBe(
        { U: 0, R: 1, F: 2 }[sticker.face as 'U' | 'R' | 'F'] * 9 + sticker.row * 3 + sticker.col,
      );
    }
  });

  it('gives every sticker a four-cornered outline', () => {
    for (const sticker of projectCube(3).stickers) {
      expect(sticker.points).toHaveLength(4);
      for (const point of sticker.points) {
        expect(Number.isFinite(point.x)).toBe(true);
        expect(Number.isFinite(point.y)).toBe(true);
      }
    }
  });

  it('orders stickers far to near, so painting them in order is correct', () => {
    const depths = projectCube(3).stickers.map((s) => s.depth);
    for (let i = 1; i < depths.length; i++) expect(depths[i]).toBeGreaterThanOrEqual(depths[i - 1]);
  });

  it('draws nearer stickers larger, which is what makes it read as solid', () => {
    const { stickers } = projectCube(3);
    const top = stickers.filter((s) => s.face === 'U');
    // On the U face, row 2 is the edge next to the front — nearest the viewer —
    // and row 0 is the one at the back.
    const near = top.filter((s) => s.row === 2).reduce((a, s) => a + areaOf(s), 0);
    const far = top.filter((s) => s.row === 0).reduce((a, s) => a + areaOf(s), 0);
    expect(near).toBeGreaterThan(far);
  });

  it('flattens towards an isometric drawing as the viewer steps back', () => {
    const spread = (distance: number) => {
      const top = projectCube(3, { distance }).stickers.filter((s) => s.face === 'U');
      const near = top.filter((s) => s.row === 2).reduce((a, s) => a + areaOf(s), 0);
      const far = top.filter((s) => s.row === 0).reduce((a, s) => a + areaOf(s), 0);
      return near / far;
    };
    expect(spread(12)).toBeGreaterThan(spread(200));
    expect(spread(2000)).toBeCloseTo(1, 1);
  });

  it('outlines each visible face, and nothing else', () => {
    const { faces } = projectCube(3);
    expect(faces.map((f) => f.face).sort()).toEqual(['F', 'R', 'U']);
    for (const face of faces) expect(face.points).toHaveLength(4);
  });

  it('makes each face outline enclose that face’s stickers', () => {
    const { stickers, faces } = projectCube(3);
    for (const face of faces) {
      const covered = stickers
        .filter((s) => s.face === face.face)
        .reduce((total, s) => total + areaOf(s), 0);
      expect(areaOf(face)).toBeGreaterThan(covered);
    }
  });

  it('reports bounds that contain every point it drew', () => {
    const { stickers, faces, bounds } = projectCube(3);
    for (const face of faces) {
      for (const point of face.points) {
        expect(point.x).toBeGreaterThanOrEqual(bounds.minX - 1e-9);
        expect(point.x).toBeLessThanOrEqual(bounds.minX + bounds.width + 1e-9);
      }
    }
    for (const sticker of stickers) {
      for (const point of sticker.points) {
        expect(point.x).toBeGreaterThanOrEqual(bounds.minX - 1e-9);
        expect(point.y).toBeGreaterThanOrEqual(bounds.minY - 1e-9);
        expect(point.x).toBeLessThanOrEqual(bounds.minX + bounds.width + 1e-9);
        expect(point.y).toBeLessThanOrEqual(bounds.minY + bounds.height + 1e-9);
      }
    }
  });

  it('leaves a gap between stickers', () => {
    const touching = projectCube(3, { gap: 0 }).stickers.reduce((a, s) => a + areaOf(s), 0);
    const spaced = projectCube(3, { gap: 0.2 }).stickers.reduce((a, s) => a + areaOf(s), 0);
    expect(spaced).toBeLessThan(touching);
  });

  it('works for cube sizes other than three', () => {
    expect(projectCube(2).stickers).toHaveLength(12);
    expect(projectCube(4).stickers).toHaveLength(48);
  });

  it('uses the conventional angle by default', () => {
    expect(projectCube(3).stickers).toEqual(projectCube(3, { view: CORNER_VIEW }).stickers);
  });
});
