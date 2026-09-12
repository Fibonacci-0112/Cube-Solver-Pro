import { describe, expect, it } from 'vitest';
import {
  average,
  best,
  bestAverage,
  effectiveMs,
  formatSolve,
  formatStat,
  formatTime,
  mean,
  rollingAverages,
  summarise,
  trimCount,
  type Penalty,
  type Solve,
} from './solves';

let counter = 0;
const solve = (timeMs: number, penalty: Penalty = 'none'): Solve => ({
  id: `s${counter++}`,
  sessionId: 'session',
  puzzle: '333',
  scramble: '',
  timeMs,
  penalty,
  createdAt: counter,
});

const times = (values: number[]): Solve[] => values.map((v) => solve(v));

describe('penalties', () => {
  it('adds two seconds for a +2', () => {
    expect(effectiveMs(solve(10_000, 'plus2'))).toBe(12_000);
  });

  it('treats a DNF as having no time', () => {
    expect(effectiveMs(solve(10_000, 'dnf'))).toBeNull();
  });

  it('shows the penalty in the written form', () => {
    expect(formatSolve(solve(10_000))).toBe('10.00');
    expect(formatSolve(solve(10_000, 'plus2'))).toBe('12.00+');
    expect(formatSolve(solve(10_000, 'dnf'))).toBe('DNF(10.00)');
  });
});

describe('trimming', () => {
  it('drops one solve from each end of a short average', () => {
    expect(trimCount(5)).toBe(1);
    expect(trimCount(12)).toBe(1);
  });

  it('drops five percent from each end of a long one', () => {
    expect(trimCount(50)).toBe(3);
    expect(trimCount(100)).toBe(5);
  });
});

describe('average of 5', () => {
  it('drops the fastest and slowest before taking the mean', () => {
    // 1 and 5 are dropped; (2 + 3 + 4) / 3 = 3.
    expect(average(times([1000, 2000, 3000, 4000, 5000]), 5)).toBe(3000);
  });

  it('is not available until there are enough solves', () => {
    expect(average(times([1000, 2000, 3000, 4000]), 5)).toBeUndefined();
  });

  it('uses only the most recent five', () => {
    expect(average(times([99_000, 1000, 2000, 3000, 4000, 5000]), 5)).toBe(3000);
  });

  it('drops a single DNF as the slowest solve', () => {
    const window = [solve(1000), solve(2000), solve(3000), solve(4000), solve(9000, 'dnf')];
    expect(average(window, 5)).toBe(3000);
  });

  it('is a DNF once there are more DNFs than it can drop', () => {
    const window = [solve(1000), solve(2000), solve(3000), solve(4000, 'dnf'), solve(5000, 'dnf')];
    expect(average(window, 5)).toBe('DNF');
  });

  it('counts the +2 rather than the raw time', () => {
    // Penalised to 6s, which makes it the slowest and drops it; (2+3+4)/3.
    const window = [solve(4000, 'plus2'), solve(2000), solve(3000), solve(4000), solve(1000)];
    expect(average(window, 5)).toBe(3000);
  });
});

describe('average of 12', () => {
  it('drops one from each end', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 100].map((v) => v * 1000);
    // Drops 1 and 100, leaving 2..11, which average to 6.5.
    expect(average(times(values), 12)).toBe(6500);
  });

  it('survives a single DNF', () => {
    const window = [...times([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((v) => v * 1000)),
      solve(50_000, 'dnf')];
    // The DNF is dropped as the slowest and the 1s as the fastest, leaving
    // 2s through 11s, which average to 6.5s.
    expect(average(window, 12)).toBe(6500);
  });
});

describe('mean', () => {
  it('keeps every solve', () => {
    expect(mean(times([1000, 2000, 3000]), 3)).toBe(2000);
  });

  it('is ruined by any DNF', () => {
    expect(mean([solve(1000), solve(2000), solve(3000, 'dnf')], 3)).toBe('DNF');
  });
});

describe('bests', () => {
  it('ignores DNFs when finding the fastest solve', () => {
    expect(best([solve(5000), solve(1000, 'dnf'), solve(3000)])).toBe(3000);
  });

  it('is undefined when every solve is a DNF', () => {
    expect(best([solve(5000, 'dnf')])).toBeUndefined();
  });

  it('finds the best average anywhere in the session, not just at the end', () => {
    // The fastest run of five sits at the start; the session ends slowly.
    const values = [1, 1, 1, 1, 1, 20, 30, 40, 50, 60].map((v) => v * 1000);
    expect(bestAverage(times(values), 5)).toBe(1000);
  });
});

describe('trend line', () => {
  it('has no value until the window is full, then one per solve', () => {
    const line = rollingAverages(times([1000, 2000, 3000, 4000, 5000, 6000]), 5);
    expect(line.slice(0, 4)).toEqual([null, null, null, null]);
    expect(line[4]).toBe(3000);
    expect(line[5]).toBe(4000);
  });
});

describe('session summary', () => {
  it('reports what is available and leaves the rest undefined', () => {
    const summary = summarise(times([10_000, 12_000, 11_000, 13_000, 9000]));
    expect(summary.count).toBe(5);
    expect(summary.solved).toBe(5);
    expect(summary.best).toBe(9000);
    expect(summary.worst).toBe(13_000);
    expect(summary.ao5).toBe(11_000);
    expect(summary.ao12).toBeUndefined();
    expect(summary.ao100).toBeUndefined();
  });

  it('handles an empty session', () => {
    const summary = summarise([]);
    expect(summary.count).toBe(0);
    expect(summary.best).toBeUndefined();
    expect(summary.mean).toBeUndefined();
  });
});

describe('formatting', () => {
  it('writes seconds to two decimal places', () => {
    expect(formatTime(9870)).toBe('9.87');
    expect(formatTime(500)).toBe('0.50');
  });

  it('switches to minutes past sixty seconds', () => {
    expect(formatTime(83_450)).toBe('1:23.45');
    expect(formatTime(60_000)).toBe('1:00.00');
    expect(formatTime(605_000)).toBe('10:05.00');
  });

  it('has a placeholder for statistics that do not exist yet', () => {
    expect(formatStat(undefined)).toBe('—');
    expect(formatStat('DNF')).toBe('DNF');
    expect(formatStat(12_340)).toBe('12.34');
  });
});
