/**
 * What the app needs from the machine it is running on.
 *
 * This is deliberately small. Everything a speedcubing app actually does —
 * timing, scrambling, recognising a case, averaging a session — is arithmetic,
 * and arithmetic does not care what it runs on. Only three things genuinely
 * differ between a browser tab, a desktop window and an Android WebView, and
 * they are the three interfaces below. Adding a fourth should feel like a
 * decision, not a reflex: every entry here is a thing that has to be written,
 * and tested, three times.
 */

import type { ExportFile, ImportResult, Session, Settings, Solve, TrainerStat } from '@cube/core';

export type ImportMode = 'merge' | 'replace';

export type Shell = 'web' | 'windows' | 'android';

/**
 * Local storage for sessions, solves, trainer progress and settings.
 *
 * IndexedDB backs this on all three shells today. The interface exists anyway,
 * because it is also what the in-memory fallback implements when IndexedDB is
 * unavailable, and because a solve log is the one piece of user data here that
 * cannot be regenerated — being able to swap the engine underneath it without
 * touching the app is worth one indirection.
 */
export interface Store {
  /** False when history will not survive a restart. The UI says so when it is. */
  readonly persistent: boolean;
  listSessions(): Promise<Session[]>;
  createSession(name: string, puzzle: Session['puzzle']): Promise<Session>;
  updateSession(id: string, changes: Partial<Session>): Promise<void>;
  deleteSession(id: string): Promise<void>;
  listSolves(sessionId: string): Promise<Solve[]>;
  addSolve(solve: Solve): Promise<void>;
  updateSolve(id: string, changes: Partial<Solve>): Promise<void>;
  deleteSolve(id: string): Promise<void>;
  deleteSolvesInSession(sessionId: string): Promise<void>;
  listTrainerStats(): Promise<TrainerStat[]>;
  saveTrainerStat(stat: TrainerStat): Promise<void>;
  clearTrainerStats(): Promise<void>;
  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;
  exportAll(): Promise<ExportFile>;
  importAll(data: ImportResult, mode: ImportMode): Promise<void>;
}

/**
 * How the export file leaves the device and how an import comes back.
 *
 * This is the interface that earns its keep. With no account and no sync, the
 * export file is the only way a solve history moves between a phone and a
 * desktop, so it has to work everywhere — and a browser's `<a download>` is
 * inert inside an Android WebView, which silently does nothing rather than
 * failing loudly. Android therefore writes the file and hands it to the share
 * sheet instead. The wording the UI shows afterwards differs too, which is why
 * `save` reports back what actually happened.
 */
export interface FileTransfer {
  save(suggestedName: string, contents: string): Promise<SaveOutcome>;
  /** Text of the file the user chose, or null if they cancelled. */
  open(accept: string): Promise<string | null>;
}

export type SaveOutcome = 'saved' | 'shared' | 'cancelled';

export interface AppInfo {
  readonly shell: Shell;
  readonly version: string;
}

export interface Platform {
  readonly info: AppInfo;
  readonly store: Store;
  readonly files: FileTransfer;
}
