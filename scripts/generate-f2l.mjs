/**
 * Generates the F2L case list.
 *
 * Searches outwards from a solved cube using only R, U and F — the three faces
 * that bound the front-right slot — and records the shortest way to reach each
 * distinct pair configuration with the cross and the other three slots still
 * intact. Reversing that path gives the algorithm that solves the case, so the
 * results are correct by construction and as short as R/U/F allows.
 *
 * Run with: npx vite-node scripts/generate-f2l.mjs > src/algs/f2l.ts
 */
import { MOVE_CUBES, MOVE_NAMES, multiply, solvedCubie } from '../src/cube/cubie.ts';
import { f2lKey, f2lRemainderSolved, SOLVED_F2L_KEY, enumerateF2lKeys } from '../src/algs/analysis.ts';

const MOVES = [3, 4, 5, 0, 1, 2, 6, 7, 8]; // R R2 R' U U2 U' F F2 F'
const faceOf = (m) => Math.floor(m / 3);
const MAX_DEPTH = 10;

const shortest = new Map();
const path = [];

function visit(cube) {
  if (!f2lRemainderSolved(cube)) return;
  const key = f2lKey(cube);
  if (key === SOLVED_F2L_KEY) return;
  const existing = shortest.get(key);
  if (!existing || path.length < existing.length) shortest.set(key, [...path]);
}

function search(cube, depth, lastFace) {
  visit(cube);
  if (depth === 0) return;
  for (const move of MOVES) {
    const face = faceOf(move);
    if (face === lastFace) continue;
    path.push(move);
    search(multiply(cube, MOVE_CUBES[move]), depth - 1, face);
    path.pop();
  }
}

for (let depth = 1; depth <= MAX_DEPTH; depth++) {
  path.length = 0;
  search(solvedCubie(), depth, -1);
  if (shortest.size >= enumerateF2lKeys().size) break;
}

const expected = enumerateF2lKeys();
const missing = [...expected].filter((k) => !shortest.has(k));
if (missing.length) {
  console.error(`still missing ${missing.length} case(s) at depth ${MAX_DEPTH}: ${missing.join(', ')}`);
  process.exit(1);
}

/** Reverse the path to solved: that is the algorithm that solves the case. */
const solveText = (p) =>
  [...p].reverse()
    .map((move) => {
      const face = faceOf(move);
      const amount = (move % 3) + 1;
      return MOVE_NAMES[face * 3 + (4 - amount - 1)];
    })
    .join(' ');

const PAIR_CORNER = 4;
const PAIR_EDGE = 8;
function groupOf(key) {
  const [cornerPart, edgePart] = key.split('|');
  const cornerInSlot = Number(cornerPart.split('.')[0]) === PAIR_CORNER;
  const edgeInSlot = Number(edgePart.split('.')[0]) === PAIR_EDGE;
  if (cornerInSlot && edgeInSlot) return 'Both pieces in the slot';
  if (cornerInSlot) return 'Corner in the slot, edge on top';
  if (edgeInSlot) return 'Edge in the slot, corner on top';
  return 'Both pieces on top';
}

const GROUP_ORDER = [
  'Both pieces on top',
  'Corner in the slot, edge on top',
  'Edge in the slot, corner on top',
  'Both pieces in the slot',
];

const rows = [...shortest.entries()]
  .map(([key, p]) => ({ key, alg: solveText(p), group: groupOf(key), length: p.length }))
  .sort((a, b) =>
    GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) ||
    a.length - b.length ||
    a.alg.localeCompare(b.alg));

const lines = rows.map((r, i) => `  [${i + 1}, '${r.group}', "${r.alg}"],`).join('\n');

process.stdout.write(`/**
 * F2L — pairing a corner and its edge and inserting them into the front-right
 * slot. 41 cases, covering every way the pair can be arranged with the cross
 * and the other three slots already finished.
 *
 * These algorithms are generated rather than transcribed: scripts/generate-f2l.mjs
 * searches outwards from a solved cube using only R, U and F — the faces that
 * bound the slot — and records the shortest route to each case. Reversing it
 * gives the solution, so every entry is correct by construction and as short as
 * R/U/F allows. Regenerate with:
 *
 *     npx vite-node scripts/generate-f2l.mjs > src/algs/f2l.ts
 *
 * Many cubers prefer a slightly longer but smoother turning sequence for some of
 * these; the trainer lets you record your own algorithm per case.
 */

import { enumerateF2lKeys, f2lKey, f2lRemainderSolved } from './analysis';
import type { AlgCase, AlgSet } from './types';

const entries: [number, string, string][] = [
${lines}
];

const cases: AlgCase[] = entries.map(([number, group, alg]) => ({
  id: \`f2l-\${number}\`,
  name: \`F2L \${number}\`,
  group,
  algs: [alg],
}));

export const F2L: AlgSet = {
  id: 'f2l',
  name: 'F2L',
  description:
    'First two layers: pairing each corner with its edge and inserting them ' +
    'together, rather than layer by layer. 41 cases.',
  stage: 'Cross done, filling the four slots',
  keyOf: f2lKey,
  enumerate: enumerateF2lKeys,
  validate: (cube) => (f2lRemainderSolved(cube) ? null : 'cross or another slot is disturbed'),
  cases,
};
`);
console.error(`generated ${rows.length} cases; longest ${Math.max(...rows.map((r) => r.length))} moves`);
