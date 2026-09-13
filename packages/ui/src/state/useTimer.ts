/**
 * The solve timer.
 *
 * Follows the behaviour cubers expect from a stackmat or from csTimer: hold the
 * spacebar until it goes green, release to start, press anything to stop. With
 * inspection on, a tap starts the fifteen second countdown first, and going
 * over adds the penalties the WCA specifies — two seconds past fifteen, and a
 * DNF past seventeen.
 *
 * Times are taken from the event's own timestamp, never from the clock at the
 * moment the handler runs. The two are not the same: an event is stamped when
 * the input arrives, then waits for whatever the main thread is busy with, and
 * on a mid-range Android phone that wait is tens of milliseconds and varies
 * from solve to solve. Reading the clock inside the handler would fold that
 * delay into the recorded time; reading `event.timeStamp` leaves scheduling
 * jitter affecting only how soon the display updates, which nobody is grading.
 * It is what makes the same timer trustworthy in a WebView and in a desktop
 * window.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Penalty } from '@cube/core';

export type TimerPhase = 'idle' | 'inspection' | 'running';

export interface TimerResult {
  timeMs: number;
  penalty: Penalty;
}

export interface TimerOptions {
  inspection: boolean;
  inspectionSeconds: number;
  holdToStartMs: number;
  onComplete: (result: TimerResult) => void;
  /** Blocks starting, for example while a scramble is still being generated. */
  disabled?: boolean;
}

export interface TimerState {
  phase: TimerPhase;
  /** Elapsed solve time, or the inspection countdown, in milliseconds. */
  displayMs: number;
  /** Held down but not yet held long enough. */
  holding: boolean;
  /** Held long enough — releasing now starts the solve. */
  armed: boolean;
  /** Penalty inspection has already incurred, shown as a warning. */
  pendingPenalty: Penalty;
  /**
   * `at` is the triggering event's `timeStamp`, on the same clock as
   * `performance.now()`. Callers that have an event should always pass it.
   */
  press: (at?: number) => void;
  release: (at?: number) => void;
  cancel: () => void;
}

const OVER_TIME_DNF_SECONDS = 2;

export function useTimer(options: TimerOptions): TimerState {
  const { inspection, inspectionSeconds, holdToStartMs, onComplete, disabled } = options;

  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [displayMs, setDisplayMs] = useState(0);
  const [holding, setHolding] = useState(false);
  const [armed, setArmed] = useState(false);
  const [pendingPenalty, setPendingPenalty] = useState<Penalty>('none');

  const startedAt = useRef(0);
  const inspectionStartedAt = useRef(0);
  const holdTimer = useRef<number | null>(null);
  const frame = useRef<number | null>(null);

  // Keep the latest callback without restarting the loop on every render.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearHoldTimer = () => {
    if (holdTimer.current !== null) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const stopLoop = () => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  };

  useEffect(() => () => {
    clearHoldTimer();
    stopLoop();
  }, []);

  const cancel = useCallback(() => {
    clearHoldTimer();
    stopLoop();
    setPhase('idle');
    setHolding(false);
    setArmed(false);
    setPendingPenalty('none');
    setDisplayMs(0);
  }, []);

  const beginSolve = useCallback((at: number) => {
    startedAt.current = at;
    setPhase('running');
    setDisplayMs(0);
    const tick = () => {
      setDisplayMs(performance.now() - startedAt.current);
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, []);

  const finishSolve = useCallback(
    (at: number) => {
      stopLoop();
      const elapsed = at - startedAt.current;
      setPhase('idle');
      setDisplayMs(elapsed);
      const penalty = pendingPenalty;
      setPendingPenalty('none');
      onCompleteRef.current({ timeMs: elapsed, penalty });
    },
    [pendingPenalty],
  );

  // Inspection countdown, and the penalties for overrunning it.
  useEffect(() => {
    if (phase !== 'inspection') return;
    const id = window.setInterval(() => {
      const elapsed = (performance.now() - inspectionStartedAt.current) / 1000;
      setDisplayMs(Math.max(0, inspectionSeconds - elapsed) * 1000);
      if (elapsed > inspectionSeconds + OVER_TIME_DNF_SECONDS) setPendingPenalty('dnf');
      else if (elapsed > inspectionSeconds) setPendingPenalty('plus2');
    }, 50);
    return () => window.clearInterval(id);
  }, [phase, inspectionSeconds]);

  const press = useCallback(
    (at: number = performance.now()) => {
      if (phase === 'running') {
        finishSolve(at);
        return;
      }
      if (disabled) return;
      setHolding(true);
      setArmed(false);
      clearHoldTimer();
      holdTimer.current = window.setTimeout(() => setArmed(true), holdToStartMs);
    },
    [phase, disabled, holdToStartMs, finishSolve],
  );

  const release = useCallback(
    (at: number = performance.now()) => {
      if (!holding) return;
      clearHoldTimer();
      setHolding(false);

      // A tap with inspection switched on starts the countdown rather than the solve.
      if (phase === 'idle' && inspection) {
        inspectionStartedAt.current = at;
        setPendingPenalty('none');
        setDisplayMs(inspectionSeconds * 1000);
        setPhase('inspection');
        setArmed(false);
        return;
      }

      if (armed) beginSolve(at);
      setArmed(false);
    },
    [holding, phase, inspection, inspectionSeconds, armed, beginSolve],
  );

  return { phase, displayMs, holding, armed, pendingPenalty, press, release, cancel };
}

/**
 * Wires the timer to the keyboard. The spacebar arms and starts; any other key
 * stops a running solve, which is what stops a mis-hit from costing a time.
 */
export function useTimerKeyboard(timer: TimerState, enabled: boolean): void {
  const { phase, press, release, cancel } = timer;

  useEffect(() => {
    if (!enabled) return;

    const isTypingTarget = (target: EventTarget | null): boolean => {
      const element = target as HTMLElement | null;
      if (!element) return false;
      return (
        element.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)
      );
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || event.repeat) return;
      if (event.code === 'Escape') {
        cancel();
        return;
      }
      if (event.code === 'Space') {
        event.preventDefault();
        press(event.timeStamp);
        return;
      }
      if (phase === 'running') press(event.timeStamp);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (event.code !== 'Space') return;
      event.preventDefault();
      release(event.timeStamp);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [enabled, phase, press, release, cancel]);
}
