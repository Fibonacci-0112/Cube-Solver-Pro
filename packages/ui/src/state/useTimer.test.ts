// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimer, type TimerResult } from './useTimer';

const HOLD_MS = 300;

const setup = (options: { inspection?: boolean } = {}) => {
  const completed: TimerResult[] = [];
  const view = renderHook(() =>
    useTimer({
      inspection: options.inspection ?? false,
      inspectionSeconds: 15,
      holdToStartMs: HOLD_MS,
      onComplete: (result) => completed.push(result),
    }),
  );
  return { view, completed };
};

/** Holds long enough to arm, then releases — the gesture that starts a solve. */
const start = (view: ReturnType<typeof setup>['view'], at: number) => {
  act(() => view.result.current.press(at));
  act(() => vi.advanceTimersByTime(HOLD_MS));
  act(() => view.result.current.release(at + HOLD_MS));
};

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Any call to the wall clock now returns a value far from the timestamps
    // the tests pass in, so a time taken from the clock cannot pass by luck.
    vi.spyOn(performance, 'now').mockReturnValue(500_000);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('measures the solve from the event timestamps, not from when the handler ran', () => {
    const { view, completed } = setup();
    start(view, 1_000);
    act(() => view.result.current.press(1_000 + HOLD_MS + 12_345));

    expect(completed).toHaveLength(1);
    expect(completed[0].timeMs).toBe(12_345);
  });

  it('is unaffected by how late the stopping handler runs', () => {
    // The same two events, but the browser gets round to delivering the second
    // one much later. A stackmat would still read 8.000, and so must this.
    const { view, completed } = setup();
    start(view, 2_000);

    vi.spyOn(performance, 'now').mockReturnValue(999_999);
    act(() => view.result.current.press(2_000 + HOLD_MS + 8_000));

    expect(completed[0].timeMs).toBe(8_000);
  });

  it('does not start the solve when the hold was too short', () => {
    const { view, completed } = setup();
    act(() => view.result.current.press(1_000));
    act(() => vi.advanceTimersByTime(HOLD_MS - 50));
    act(() => view.result.current.release(1_000 + HOLD_MS - 50));

    expect(view.result.current.phase).toBe('idle');
    act(() => view.result.current.press(50_000));
    expect(completed).toHaveLength(0);
  });

  it('runs inspection before the solve when it is switched on', () => {
    const { view } = setup({ inspection: true });
    act(() => view.result.current.press(1_000));
    act(() => view.result.current.release(1_050));
    expect(view.result.current.phase).toBe('inspection');

    start(view, 5_000);
    expect(view.result.current.phase).toBe('running');
  });

  it('falls back to the clock when a caller has no event to hand', () => {
    const { view, completed } = setup();
    act(() => view.result.current.press());
    act(() => vi.advanceTimersByTime(HOLD_MS));
    act(() => view.result.current.release());

    vi.spyOn(performance, 'now').mockReturnValue(507_000);
    act(() => view.result.current.press());

    expect(completed[0].timeMs).toBe(7_000);
  });
});
