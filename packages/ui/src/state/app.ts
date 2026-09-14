/**
 * Application state.
 *
 * Everything here is backed by the local store, so each action updates the
 * in-memory copy and writes through. Nothing leaves the device.
 */

import { create } from 'zustand';
import {
  DEFAULT_SETTINGS,
  emptyTrainerStat,
  type ImportResult,
  newId,
  parseImport,
  type Penalty,
  type PuzzleId,
  type Session,
  type Settings,
  type Solve,
  type TrainerStat,
} from '@cube/core';
import type { ImportMode, Platform, Store } from '@cube/platform';

/** Times kept per case to steer which one the trainer shows next. */
const RECENT_WINDOW = 5;

interface AppState {
  ready: boolean;
  /** False when IndexedDB was unavailable and history will not survive a restart. */
  persistent: boolean;
  settings: Settings;
  sessions: Session[];
  currentSessionId: string | null;
  solves: Solve[];
  trainerStats: Record<string, TrainerStat>;

  init: () => Promise<void>;
  updateSettings: (changes: Partial<Settings>) => Promise<void>;

  setPuzzle: (puzzle: PuzzleId) => Promise<void>;
  selectSession: (id: string) => Promise<void>;
  createSession: (name: string) => Promise<void>;
  renameSession: (id: string, name: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  clearSession: (id: string) => Promise<void>;

  addSolve: (input: { puzzle: PuzzleId; scramble: string; timeMs: number; penalty: Penalty }) => Promise<void>;
  setPenalty: (id: string, penalty: Penalty) => Promise<void>;
  setComment: (id: string, comment: string) => Promise<void>;
  deleteSolve: (id: string) => Promise<void>;

  trainerStatFor: (setId: string, caseId: string) => TrainerStat;
  recordAttempt: (setId: string, caseId: string, timeMs: number, dnf: boolean) => Promise<void>;
  updateTrainerStat: (setId: string, caseId: string, changes: Partial<TrainerStat>) => Promise<void>;
  resetTrainerStats: () => Promise<void>;

  exportData: () => Promise<string>;
  importData: (text: string, mode: ImportMode) => Promise<ImportResult>;
}

/**
 * The shell hands the app its platform before rendering; see each app's
 * `main.tsx`. Keeping it in a module rather than a React context means the
 * store is reachable from the Zustand actions below, which are plain functions
 * and have no component to read a context from.
 */
let current: Platform | null = null;

export const setPlatform = (platform: Platform): void => {
  current = platform;
};

export const platform = (): Platform => {
  if (!current) throw new Error('the shell has not provided a platform yet');
  return current;
};

const db = (): Store => platform().store;

/** Sessions the picker should show for the puzzle currently selected. */
export const sessionsForPuzzle = (sessions: Session[], puzzle: PuzzleId): Session[] =>
  sessions.filter((s) => s.puzzle === puzzle);

export const useApp = create<AppState>()((set, get) => ({
  ready: false,
  persistent: true,
  settings: DEFAULT_SETTINGS,
  sessions: [],
  currentSessionId: null,
  solves: [],
  trainerStats: {},

  async init() {
    const store = db();
    let settings = await store.getSettings();
    let sessions = await store.listSessions();

    // A first run has no session; make one so the timer is usable immediately.
    if (sessions.length === 0) {
      await store.createSession('Main', settings.currentPuzzle);
      sessions = await store.listSessions();
    }

    const forPuzzle = sessionsForPuzzle(sessions, settings.currentPuzzle);
    const current =
      forPuzzle.find((s) => s.id === settings.currentSessionId) ??
      forPuzzle[forPuzzle.length - 1] ??
      sessions[0];

    // Imports can remove the selected puzzle's sessions. Keep the fallback
    // session, puzzle picker and persisted selection in agreement.
    if (current && (settings.currentPuzzle !== current.puzzle || settings.currentSessionId !== current.id)) {
      settings = { ...settings, currentPuzzle: current.puzzle, currentSessionId: current.id };
      await store.saveSettings(settings);
    }

    const stats = await store.listTrainerStats();
    set({
      ready: true,
      persistent: store.persistent,
      settings,
      sessions,
      currentSessionId: current?.id ?? null,
      solves: current ? await store.listSolves(current.id) : [],
      trainerStats: Object.fromEntries(stats.map((s) => [s.id, s])),
    });
  },

  async updateSettings(changes) {
    const settings = { ...get().settings, ...changes };
    set({ settings });
    await db().saveSettings(settings);
  },

  async setPuzzle(puzzle) {
    const { sessions } = get();
    let forPuzzle = sessionsForPuzzle(sessions, puzzle);

    if (forPuzzle.length === 0) {
      await db().createSession('Main', puzzle);
      const refreshed = await db().listSessions();
      set({ sessions: refreshed });
      forPuzzle = sessionsForPuzzle(refreshed, puzzle);
    }

    const next = forPuzzle[forPuzzle.length - 1];
    await get().updateSettings({ currentPuzzle: puzzle, currentSessionId: next.id });
    set({ currentSessionId: next.id, solves: await db().listSolves(next.id) });
  },

  async selectSession(id) {
    set({ currentSessionId: id, solves: await db().listSolves(id) });
    await get().updateSettings({ currentSessionId: id });
  },

  async createSession(name) {
    const session = await db().createSession(name, get().settings.currentPuzzle);
    set({ sessions: await db().listSessions() });
    await get().selectSession(session.id);
  },

  async renameSession(id, name) {
    await db().updateSession(id, { name });
    set({ sessions: await db().listSessions() });
  },

  async deleteSession(id) {
    await db().deleteSession(id);
    const sessions = await db().listSessions();
    set({ sessions });

    if (get().currentSessionId !== id) return;
    const { currentPuzzle } = get().settings;
    const remaining = sessionsForPuzzle(sessions, currentPuzzle);
    if (remaining.length > 0) {
      await get().selectSession(remaining[remaining.length - 1].id);
    } else {
      // Never leave the timer without somewhere to record a solve.
      await get().createSession('Main');
    }
  },

  async clearSession(id) {
    await db().deleteSolvesInSession(id);
    if (get().currentSessionId === id) set({ solves: [] });
  },

  async addSolve({ puzzle, scramble, timeMs, penalty }) {
    const sessionId = get().currentSessionId;
    if (!sessionId) return;
    const solve: Solve = {
      id: newId('solve'),
      sessionId,
      puzzle,
      scramble,
      timeMs,
      penalty,
      createdAt: Date.now(),
    };
    await db().addSolve(solve);
    set({ solves: [...get().solves, solve] });
  },

  async setPenalty(id, penalty) {
    await db().updateSolve(id, { penalty });
    set({ solves: get().solves.map((s) => (s.id === id ? { ...s, penalty } : s)) });
  },

  async setComment(id, comment) {
    const value = comment.trim() || undefined;
    await db().updateSolve(id, { comment: value });
    set({ solves: get().solves.map((s) => (s.id === id ? { ...s, comment: value } : s)) });
  },

  async deleteSolve(id) {
    await db().deleteSolve(id);
    set({ solves: get().solves.filter((s) => s.id !== id) });
  },

  trainerStatFor(setId, caseId) {
    return get().trainerStats[`${setId}:${caseId}`] ?? emptyTrainerStat(setId, caseId);
  },

  async recordAttempt(setId, caseId, timeMs, dnf) {
    const previous = get().trainerStatFor(setId, caseId);
    const next: TrainerStat = {
      ...previous,
      attempts: previous.attempts + 1,
      dnfs: previous.dnfs + (dnf ? 1 : 0),
      totalMs: previous.totalMs + (dnf ? 0 : timeMs),
      bestMs: dnf ? previous.bestMs : Math.min(previous.bestMs ?? Infinity, timeMs),
      lastMs: dnf ? previous.lastMs : timeMs,
      recentMs: dnf ? previous.recentMs : [...previous.recentMs, timeMs].slice(-RECENT_WINDOW),
      // A case stops being "unseen" the moment it is attempted.
      status: previous.status === 'unseen' ? 'learning' : previous.status,
      updatedAt: Date.now(),
    };
    if (next.bestMs === Infinity) delete next.bestMs;
    await db().saveTrainerStat(next);
    set({ trainerStats: { ...get().trainerStats, [next.id]: next } });
  },

  async updateTrainerStat(setId, caseId, changes) {
    const next: TrainerStat = {
      ...get().trainerStatFor(setId, caseId),
      ...changes,
      updatedAt: Date.now(),
    };
    await db().saveTrainerStat(next);
    set({ trainerStats: { ...get().trainerStats, [next.id]: next } });
  },

  async resetTrainerStats() {
    await db().clearTrainerStats();
    set({ trainerStats: {} });
  },

  async exportData() {
    return JSON.stringify(await db().exportAll(), null, 2);
  },

  async importData(text, mode) {
    const parsed = parseImport(text);
    await db().importAll(parsed, mode);
    await get().init();
    return parsed;
  },
}));
