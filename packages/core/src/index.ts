/**
 * Everything the app knows how to do that has nothing to do with where it runs.
 *
 * The cube model and its turns, the two-phase solver, scrambling, case
 * recognition, the algorithm sets, session statistics, the save-file format and
 * the geometry behind the diagrams all live here. None of it touches the DOM —
 * the package compiles without the DOM library at all, which is what keeps that
 * promise honest — so the same code runs in a browser tab, a desktop window, an
 * Android WebView and a bare Node test process.
 */

export * from './cube/geometry';
export * from './cube/notation';
export * from './cube/puzzle';
export * from './cube/cubie';
export * from './cube/coords';
export * from './cube/kociemba';
export * from './cube/solver222';
export * from './cube/scramble';

export * from './algs/types';
export * from './algs/analysis';
export * from './algs/lookup';
export * from './algs/drill';
export * from './algs/index';
export * from './algs/f2l';
export * from './algs/oll';
export * from './algs/pll';

export * from './stats/solves';

export * from './data/types';
export * from './data/transfer';

export * from './tutorials/analysis';

export * from './diagram/projection';
export * from './diagram/arrows';
