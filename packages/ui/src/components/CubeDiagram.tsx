/**
 * Cube pictures, drawn from actual cube states rather than stored as images.
 *
 * Sticker colours are the physical cube's colour scheme, not a data palette:
 * they identify a face the way a flag identifies a country, so the convention
 * is fixed rather than chosen. Scramble previews are drawn white-on-top, the
 * way a cube sits at rest. Last-layer and F2L pictures are drawn yellow-on-top,
 * because that is where you are looking from once the cross is solved — the
 * same view every printed algorithm sheet uses.
 *
 * Each stage gets the view that shows what it is about. A last layer is a flat
 * thing and reads best from directly above. An F2L case is not: it is a pair of
 * pieces on top and the slot underneath waiting for them, so it is drawn as a
 * solid seen from the corner, where both are in frame at once.
 */

import { useId, useMemo } from 'react';
import {
  type CubieCube,
  cubieToFacelets,
  lastLayerArrows,
  projectCube,
  PuzzleCube,
} from '@cube/core';

/**
 * The six sticker colours, at the saturation a real cube has. They are read at
 * a glance and often at thumbnail size, so they are deliberately more vivid
 * than the rest of the interface: telling red from orange at 20 pixels is the
 * whole job, and a tasteful, muted version of that is a worse diagram.
 */
const WHITE = '#fcfcfa';
const RED = '#e71414';
const GREEN = '#0da53c';
const YELLOW = '#ffdb00';
const ORANGE = '#ff7b14';
const BLUE = '#0b50dc';

/** Indexed by face order U, R, F, D, L, B. */
const WHITE_TOP = [WHITE, RED, GREEN, YELLOW, ORANGE, BLUE];
const YELLOW_TOP = [YELLOW, RED, GREEN, WHITE, ORANGE, BLUE];
/** Stickers whose orientation is wrong, in an OLL picture. */
const UNORIENTED = '#757470';
/** Stickers a picture is not about, kept visible but out of the way. */
const BACKGROUND = '#6f6f75';

const STROKE = '#0b0b0d';
const ARROW = '#000000';

interface NetProps {
  cube: PuzzleCube;
  /** Length of one sticker's edge, in pixels. */
  cell?: number;
  className?: string;
}

/**
 * The whole cube unfolded, U on top and the four sides in a row. Used to show
 * what a scramble produces, so a suspicious scramble can be checked by eye.
 */
export function CubeNet({ cube, cell = 12, className }: NetProps) {
  const { n } = cube;
  const gap = Math.max(1, Math.round(cell / 10));
  const width = 4 * n * cell;
  const height = 3 * n * cell;

  const faces: { face: Parameters<PuzzleCube['faceGrid']>[0]; x: number; y: number }[] = [
    { face: 'U', x: n, y: 0 },
    { face: 'L', x: 0, y: n },
    { face: 'F', x: n, y: n },
    { face: 'R', x: 2 * n, y: n },
    { face: 'B', x: 3 * n, y: n },
    { face: 'D', x: n, y: 2 * n },
  ];

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={`Scrambled ${n}x${n} cube`}
    >
      {faces.map(({ face, x, y }) =>
        cube.faceGrid(face).map((row, r) =>
          row.map((colour, c) => (
            <rect
              key={`${face}-${r}-${c}`}
              x={(x + c) * cell + gap / 2}
              y={(y + r) * cell + gap / 2}
              width={cell - gap}
              height={cell - gap}
              rx={Math.max(1, cell / 8)}
              fill={WHITE_TOP[colour]}
              stroke={STROKE}
              strokeWidth={gap}
            />
          )),
        ),
      )}
    </svg>
  );
}

interface PerspectiveProps {
  cube: PuzzleCube;
  /**
   * Facelets the case is actually about. Everything else is drawn in a flat
   * grey, which is what turns a picture of a whole cube into a picture of one
   * case. Leave it out to colour the entire cube.
   */
  emphasis?: readonly number[];
  /** Width in pixels; the height follows from the projection. */
  size?: number;
  className?: string;
  label?: string;
}

/** Room left around the cube so the outline's stroke is not clipped. */
const PERSPECTIVE_PADDING = 0.3;

/**
 * The cube as a solid, seen from the corner where the top, front and right
 * faces meet — the angle an F2L case is drawn from, and the angle you are
 * looking at your own cube from while you solve one.
 */
export function CubePerspective({
  cube,
  emphasis,
  size = 108,
  className,
  label,
}: PerspectiveProps) {
  const { stickers, faces, bounds } = useMemo(() => projectCube(cube.n), [cube.n]);
  const lit = emphasis ? new Set(emphasis) : null;

  const pad = PERSPECTIVE_PADDING;
  const width = bounds.width + 2 * pad;
  const height = bounds.height + 2 * pad;
  const path = (points: { x: number; y: number }[]) =>
    points.map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(' ');

  return (
    <svg
      className={className}
      viewBox={`${bounds.minX - pad} ${bounds.minY - pad} ${width} ${height}`}
      width={size}
      height={Math.round((size * height) / width)}
      role="img"
      aria-label={label ?? 'Cube seen from the corner'}
    >
      <g strokeLinejoin="round">
        {/* The body of the cube, which supplies the outer edge and the seams. */}
        {faces.map((face) => (
          <polygon
            key={face.face}
            points={path(face.points)}
            fill={STROKE}
            stroke={STROKE}
            strokeWidth={0.22}
          />
        ))}
        {stickers.map((sticker) => (
          <polygon
            key={sticker.facelet}
            points={path(sticker.points)}
            fill={
              lit && !lit.has(sticker.facelet)
                ? BACKGROUND
                : YELLOW_TOP[cube.stickers[sticker.facelet]]
            }
            stroke={STROKE}
            strokeWidth={0.06}
          />
        ))}
      </g>
    </svg>
  );
}

interface LastLayerProps {
  cube: CubieCube;
  /**
   * `orientation` greys every sticker that is not facing up, which is what an
   * OLL case looks like. `permutation` shows real colours, for PLL.
   */
  mode: 'orientation' | 'permutation';
  /**
   * Draws where each piece has to travel. Two cases can show nearly the same
   * ring of colours and move entirely different pieces, so for PLL the arrows
   * are most of the recognition, not decoration on top of it.
   */
  arrows?: boolean;
  cell?: number;
  className?: string;
}

/**
 * The last layer seen from above: the U face, with the top row of each side
 * face folded outwards around it.
 */
export function LastLayerDiagram({
  cube,
  mode,
  arrows = false,
  cell = 18,
  className,
}: LastLayerProps) {
  const headId = useId();
  const puzzle = PuzzleCube.fromFacelets(cubieToFacelets(cube));
  const bar = Math.round(cell * 0.4);
  /** Thickness of the black grid between stickers, and of the outer border. */
  const line = Math.max(1, cell * 0.1);
  const size = 3 * cell + 2 * bar;

  const grid = puzzle.faceGrid('U');
  // Each side's top row, ordered left-to-right or top-to-bottom as the picture
  // sees it: the back and right faces read backwards from above.
  const back = [...puzzle.faceGrid('B')[0]].reverse();
  const right = [...puzzle.faceGrid('R')[0]].reverse();
  const front = puzzle.faceGrid('F')[0];
  const left = puzzle.faceGrid('L')[0];

  const colourOf = (faceIndex: number): string =>
    mode === 'orientation'
      ? faceIndex === 0
        ? YELLOW_TOP[0]
        : UNORIENTED
      : YELLOW_TOP[faceIndex];

  /**
   * Stickers are cut out of a solid black backing rather than outlined
   * individually: every line between two squares is then exactly one width,
   * however the squares meet, and the outer border matches it.
   */
  const sticker = (key: string, x: number, y: number, w: number, h: number, colour: number) => (
    <rect
      key={key}
      x={x + line / 2}
      y={y + line / 2}
      width={w - line}
      height={h - line}
      fill={colourOf(colour)}
    />
  );

  // Anchored on the middle of each piece's upward sticker, then pulled back at
  // both ends so the head points at the square rather than covering it.
  const centreOf = (position: { row: number; col: number }) => ({
    x: bar + position.col * cell + cell / 2,
    y: bar + position.row * cell + cell / 2,
  });
  const movements = (arrows ? lastLayerArrows(cube) : []).map((arrow) => {
    const from = centreOf(arrow.from);
    const to = centreOf(arrow.to);
    const span = Math.hypot(to.x - from.x, to.y - from.y);
    // Both ends are shortened by the same amount, so a two-headed arrow stays
    // symmetrical about the pair it connects.
    const back = (cell * 0.24) / span;
    return {
      key: `${arrow.kind}-${arrow.from.row}${arrow.from.col}-${arrow.to.row}${arrow.to.col}`,
      bothWays: arrow.bothWays,
      line: {
        x1: from.x + (to.x - from.x) * back,
        y1: from.y + (to.y - from.y) * back,
        x2: to.x - (to.x - from.x) * back,
        y2: to.y - (to.y - from.y) * back,
      },
    };
  });

  const headSize = cell * 0.42;
  const arrowWidth = cell * 0.085;
  const label =
    mode === 'orientation'
      ? 'Last layer orientation'
      : movements.length > 0
        ? 'Last layer arrangement, with arrows showing where each piece goes'
        : 'Last layer arrangement';

  return (
    <svg
      className={className}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label={label}
    >
      {movements.length > 0 && (
        <defs>
          {/* `auto-start-reverse` lets one marker serve both ends of a swap. */}
          <marker
            id={headId}
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerUnits="userSpaceOnUse"
            markerWidth={headSize}
            markerHeight={headSize}
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={ARROW} />
          </marker>
        </defs>
      )}
      {/* The black body the stickers are cut out of: a cross, so the four
          corners outside the folded-out side faces stay empty. */}
      <g fill={STROKE}>
        <rect x={0} y={bar} width={size} height={3 * cell} />
        <rect x={bar} y={0} width={3 * cell} height={size} />
      </g>
      {grid.map((row, r) =>
        row.map((colour, c) =>
          sticker(`u-${r}-${c}`, bar + c * cell, bar + r * cell, cell, cell, colour),
        ),
      )}
      {back.map((colour, i) => sticker(`b-${i}`, bar + i * cell, 0, cell, bar, colour))}
      {front.map((colour, i) =>
        sticker(`f-${i}`, bar + i * cell, bar + 3 * cell, cell, bar, colour),
      )}
      {left.map((colour, i) => sticker(`l-${i}`, 0, bar + i * cell, bar, cell, colour))}
      {right.map((colour, i) =>
        sticker(`r-${i}`, bar + 3 * cell, bar + i * cell, bar, cell, colour),
      )}

      <g fill="none" strokeLinecap="butt">
        <g stroke={ARROW} strokeWidth={arrowWidth}>
          {movements.map((arrow) => (
            <line
              key={arrow.key}
              {...arrow.line}
              markerEnd={`url(#${headId})`}
              markerStart={arrow.bothWays ? `url(#${headId})` : undefined}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
