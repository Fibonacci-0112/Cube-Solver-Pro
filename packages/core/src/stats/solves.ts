/**
 * Solve records and the statistics drawn from them.
 *
 * Averages follow the conventions competitive cubers expect: an average drops
 * the fastest and slowest solves before taking the mean, a DNF sorts as worse
 * than any time, and an average with more DNFs than it can drop is itself a
 * DNF. That last rule is why an average returns a result rather than a number.
 */

import type { PuzzleId } from '../cube/scramble';

export type Penalty = 'none' | 'plus2' | 'dnf';

export interface Solve {
  id: string;
  sessionId: string;
  puzzle: PuzzleId;
  scramble: string;
  /** Raw time as stopped, before any penalty is applied. */
  timeMs: number;
  penalty: Penalty;
  comment?: string;
  createdAt: number;
}

export interface Session {
  id: string;
  name: string;
  puzzle: PuzzleId;
  createdAt: number;
}

/** A statistic that may not exist yet, and may be a DNF rather than a time. */
export type Stat = number | 'DNF' | undefined;

export const PLUS_TWO_MS = 2000;

/** The time that counts, or null for a DNF. */
export function effectiveMs(solve: Solve): number | null {
  if (solve.penalty === 'dnf') return null;
  return solve.timeMs + (solve.penalty === 'plus2' ? PLUS_TWO_MS : 0);
}

/**
 * How many solves are dropped from each end of an average. Five percent,
 * rounded up, and never fewer than one — so an average of 5 or 12 drops one
 * from each end and an average of 100 drops five.
 */
export const trimCount = (n: number): number => Math.max(1, Math.ceil(n * 0.05));

/**
 * Mean of the middle of a window, once the fastest and slowest are dropped.
 * Returns undefined when there are not enough solves yet.
 */
export function average(window: readonly Solve[], n: number): Stat {
  if (window.length < n) return undefined;
  const recent = window.slice(-n);
  const trim = trimCount(n);

  const dnfs = recent.filter((s) => s.penalty === 'dnf').length;
  // A DNF is dropped as the slowest solve; more than can be dropped ruins it.
  if (dnfs > trim) return 'DNF';

  const times = recent
    .map(effectiveMs)
    .map((ms) => (ms === null ? Number.POSITIVE_INFINITY : ms))
    .sort((a, b) => a - b);

  const kept = times.slice(trim, times.length - trim);
  if (kept.some((ms) => !Number.isFinite(ms))) return 'DNF';
  return kept.reduce((sum, ms) => sum + ms, 0) / kept.length;
}

/** Straight mean of the last n solves, with no solves dropped. */
export function mean(window: readonly Solve[], n: number): Stat {
  if (window.length < n) return undefined;
  const recent = window.slice(-n);
  if (recent.some((s) => s.penalty === 'dnf')) return 'DNF';
  const total = recent.reduce((sum, s) => sum + (effectiveMs(s) ?? 0), 0);
  return total / recent.length;
}

/** Fastest single solve, ignoring DNFs. */
export function best(solves: readonly Solve[]): Stat {
  let fastest: number | undefined;
  for (const solve of solves) {
    const ms = effectiveMs(solve);
    if (ms !== null && (fastest === undefined || ms < fastest)) fastest = ms;
  }
  return fastest;
}

/** Slowest single solve, ignoring DNFs. */
export function worst(solves: readonly Solve[]): Stat {
  let slowest: number | undefined;
  for (const solve of solves) {
    const ms = effectiveMs(solve);
    if (ms !== null && (slowest === undefined || ms > slowest)) slowest = ms;
  }
  return slowest;
}

/** Best average of n anywhere in the session, checked at every position. */
export function bestAverage(solves: readonly Solve[], n: number): Stat {
  if (solves.length < n) return undefined;
  let fastest: number | undefined;
  for (let end = n; end <= solves.length; end++) {
    const value = average(solves.slice(0, end), n);
    if (typeof value === 'number' && (fastest === undefined || value < fastest)) fastest = value;
  }
  return fastest ?? 'DNF';
}

/** Rolling average at each point, for plotting a trend line. */
export function rollingAverages(solves: readonly Solve[], n: number): (number | null)[] {
  return solves.map((_, i) => {
    if (i + 1 < n) return null;
    const value = average(solves.slice(0, i + 1), n);
    return typeof value === 'number' ? value : null;
  });
}

export interface SessionSummary {
  count: number;
  solved: number;
  best: Stat;
  worst: Stat;
  mean: Stat;
  ao5: Stat;
  ao12: Stat;
  ao50: Stat;
  ao100: Stat;
  bestAo5: Stat;
  bestAo12: Stat;
}

export function summarise(solves: readonly Solve[]): SessionSummary {
  const solved = solves.filter((s) => s.penalty !== 'dnf').length;
  return {
    count: solves.length,
    solved,
    best: best(solves),
    worst: worst(solves),
    mean: solves.length ? mean(solves, solves.length) : undefined,
    ao5: average(solves, 5),
    ao12: average(solves, 12),
    ao50: average(solves, 50),
    ao100: average(solves, 100),
    bestAo5: bestAverage(solves, 5),
    bestAo12: bestAverage(solves, 12),
  };
}

/** Times as `12.34`, or `1:23.45` once past a minute. */
export function formatTime(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '—';
  if (!Number.isFinite(ms)) return 'DNF';
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  if (minutes === 0) return seconds.toFixed(2);
  return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
}

export const formatStat = (stat: Stat): string =>
  stat === undefined ? '—' : stat === 'DNF' ? 'DNF' : formatTime(stat);

/** How a solve reads in a list, penalty included. */
export function formatSolve(solve: Solve): string {
  if (solve.penalty === 'dnf') return `DNF(${formatTime(solve.timeMs)})`;
  if (solve.penalty === 'plus2') return `${formatTime(solve.timeMs + PLUS_TWO_MS)}+`;
  return formatTime(solve.timeMs);
}
