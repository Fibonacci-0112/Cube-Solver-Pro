/**
 * Cube pictures, drawn from actual cube states rather than stored as images.
 *
 * Sticker colours are the physical cube's colour scheme, not a data palette:
 * they identify a face the way a flag identifies a country, so the convention
 * is fixed rather than chosen. Scramble previews are drawn white-on-top, the
 * way a cube sits at rest. Last-layer pictures are drawn yellow-on-top, because
 * that is where you are looking from once the cross is solved — the same view
 * every printed algorithm sheet uses.
 */

import type { CubieCube } from '../cube/cubie';
import { cubieToFacelets } from '../cube/cubie';
import { PuzzleCube } from '../cube/puzzle';

/** Indexed by face order U, R, F, D, L, B. */
const WHITE_TOP = ['#f4f4ef', '#c62828', '#2e7d32', '#f9c015', '#ef6c00', '#1364bf'];
const YELLOW_TOP = ['#f9c015', '#c62828', '#2e7d32', '#f4f4ef', '#ef6c00', '#1364bf'];
/** Stickers whose orientation is wrong, in an OLL picture. */
const UNORIENTED = '#6e6d68';

const STROKE = '#26262a';

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

interface LastLayerProps {
  cube: CubieCube;
  /**
   * `orientation` greys every sticker that is not facing up, which is what an
   * OLL case looks like. `permutation` shows real colours, for PLL.
   */
  mode: 'orientation' | 'permutation';
  cell?: number;
  className?: string;
}

/**
 * The last layer seen from above: the U face, with the top row of each side
 * face folded outwards around it.
 */
export function LastLayerDiagram({ cube, mode, cell = 18, className }: LastLayerProps) {
  const puzzle = PuzzleCube.fromFacelets(cubieToFacelets(cube));
  const bar = Math.round(cell * 0.42);
  const gap = Math.max(1, Math.round(cell / 9));
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

  const sticker = (key: string, x: number, y: number, w: number, h: number, colour: number) => (
    <rect
      key={key}
      x={x + gap / 2}
      y={y + gap / 2}
      width={w - gap}
      height={h - gap}
      rx={Math.max(1, cell / 9)}
      fill={colourOf(colour)}
      stroke={STROKE}
      strokeWidth={gap}
    />
  );

  return (
    <svg
      className={className}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label={mode === 'orientation' ? 'Last layer orientation' : 'Last layer arrangement'}
    >
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
    </svg>
  );
}
