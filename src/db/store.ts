/**
 * Local storage for sessions, solves, trainer progress and settings.
 *
 * IndexedDB is the real store. It can be unavailable — private browsing, a
 * locked-down profile, a browser that refuses to open it — so there is also an
 * in-memory store with the same interface. The app keeps working in that case;
 * only persistence is lost, and it says so rather than failing silently.
 */

import { DEFAULT_SETTINGS, type Settings, type TrainerStat } from './types';
import type { Session, Solve } from '../stats/solves';
import { buildExport, newId, type ExportFile, type ImportResult } from './transfer';

const DB_NAME = 'cube-solver-pro';
const DB_VERSION = 1;
const SETTINGS_KEY = 'settings';

export type ImportMode = 'merge' | 'replace';

export interface Store {
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

// ---------------------------------------------------------------------------
// In-memory
// ---------------------------------------------------------------------------

export function createMemoryStore(): Store {
  let sessions: Session[] = [];
  let solves: Solve[] = [];
  let trainerStats: TrainerStat[] = [];
  let settings: Settings = { ...DEFAULT_SETTINGS };

  const store: Store = {
    persistent: false,
    async listSessions() {
      return [...sessions].sort((a, b) => a.createdAt - b.createdAt);
    },
    async createSession(name, puzzle) {
      const session: Session = { id: newId('session'), name, puzzle, createdAt: Date.now() };
      sessions.push(session);
      return session;
    },
    async updateSession(id, changes) {
      sessions = sessions.map((s) => (s.id === id ? { ...s, ...changes, id } : s));
    },
    async deleteSession(id) {
      sessions = sessions.filter((s) => s.id !== id);
      solves = solves.filter((s) => s.sessionId !== id);
    },
    async listSolves(sessionId) {
      return solves.filter((s) => s.sessionId === sessionId).sort((a, b) => a.createdAt - b.createdAt);
    },
    async addSolve(solve) {
      solves.push(solve);
    },
    async updateSolve(id, changes) {
      solves = solves.map((s) => (s.id === id ? { ...s, ...changes, id } : s));
    },
    async deleteSolve(id) {
      solves = solves.filter((s) => s.id !== id);
    },
    async deleteSolvesInSession(sessionId) {
      solves = solves.filter((s) => s.sessionId !== sessionId);
    },
    async listTrainerStats() {
      return [...trainerStats];
    },
    async saveTrainerStat(stat) {
      const index = trainerStats.findIndex((s) => s.id === stat.id);
      if (index >= 0) trainerStats[index] = stat;
      else trainerStats.push(stat);
    },
    async clearTrainerStats() {
      trainerStats = [];
    },
    async getSettings() {
      return { ...settings };
    },
    async saveSettings(next) {
      settings = { ...next };
    },
    async exportAll() {
      return buildExport({ sessions, solves, trainerStats, settings });
    },
    async importAll(data, mode) {
      if (mode === 'replace') {
        sessions = [];
        solves = [];
        trainerStats = [];
      }
      sessions = [...sessions, ...data.sessions];
      solves = [...solves, ...data.solves];
      const byId = new Map(trainerStats.map((s) => [s.id, s]));
      for (const stat of data.trainerStats) byId.set(stat.id, stat);
      trainerStats = [...byId.values()];
      if (data.settings) settings = { ...settings, ...data.settings };
    },
  };
  return store;
}

// ---------------------------------------------------------------------------
// IndexedDB
// ---------------------------------------------------------------------------

const promisify = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('solves')) {
        const solves = db.createObjectStore('solves', { keyPath: 'id' });
        solves.createIndex('bySession', 'sessionId', { unique: false });
      }
      if (!db.objectStoreNames.contains('trainerStats')) {
        db.createObjectStore('trainerStats', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('the database is open in another window'));
  });
}

function createIndexedDbStore(db: IDBDatabase): Store {
  const read = <T>(name: string, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> =>
    promisify(run(db.transaction(name, 'readonly').objectStore(name)));

  const write = (names: string[], run: (tx: IDBTransaction) => void): Promise<void> =>
    new Promise((resolve, reject) => {
      const tx = db.transaction(names, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
      run(tx);
    });

  const put = (name: string, value: unknown): Promise<void> =>
    write([name], (tx) => tx.objectStore(name).put(value));

  const store: Store = {
    persistent: true,

    async listSessions() {
      const all = await read<Session[]>('sessions', (s) => s.getAll());
      return all.sort((a, b) => a.createdAt - b.createdAt);
    },

    async createSession(name, puzzle) {
      const session: Session = { id: newId('session'), name, puzzle, createdAt: Date.now() };
      await put('sessions', session);
      return session;
    },

    async updateSession(id, changes) {
      const existing = await read<Session | undefined>('sessions', (s) => s.get(id));
      if (existing) await put('sessions', { ...existing, ...changes, id });
    },

    async deleteSession(id) {
      const solves = await this.listSolves(id);
      await write(['sessions', 'solves'], (tx) => {
        tx.objectStore('sessions').delete(id);
        const store = tx.objectStore('solves');
        for (const solve of solves) store.delete(solve.id);
      });
    },

    async listSolves(sessionId) {
      const all = await read<Solve[]>('solves', (s) =>
        s.index('bySession').getAll(IDBKeyRange.only(sessionId)),
      );
      return all.sort((a, b) => a.createdAt - b.createdAt);
    },

    async addSolve(solve) {
      await put('solves', solve);
    },

    async updateSolve(id, changes) {
      const existing = await read<Solve | undefined>('solves', (s) => s.get(id));
      if (existing) await put('solves', { ...existing, ...changes, id });
    },

    async deleteSolve(id) {
      await write(['solves'], (tx) => tx.objectStore('solves').delete(id));
    },

    async deleteSolvesInSession(sessionId) {
      const solves = await this.listSolves(sessionId);
      await write(['solves'], (tx) => {
        const store = tx.objectStore('solves');
        for (const solve of solves) store.delete(solve.id);
      });
    },

    async listTrainerStats() {
      return read<TrainerStat[]>('trainerStats', (s) => s.getAll());
    },

    async saveTrainerStat(stat) {
      await put('trainerStats', stat);
    },

    async clearTrainerStats() {
      await write(['trainerStats'], (tx) => tx.objectStore('trainerStats').clear());
    },

    async getSettings() {
      const row = await read<{ key: string; value: Settings } | undefined>('settings', (s) =>
        s.get(SETTINGS_KEY),
      );
      return { ...DEFAULT_SETTINGS, ...(row?.value ?? {}) };
    },

    async saveSettings(settings) {
      await put('settings', { key: SETTINGS_KEY, value: settings });
    },

    async exportAll() {
      const sessions = await this.listSessions();
      const solves = await read<Solve[]>('solves', (s) => s.getAll());
      const trainerStats = await this.listTrainerStats();
      const settings = await this.getSettings();
      return buildExport({ sessions, solves, trainerStats, settings });
    },

    async importAll(data, mode) {
      await write(['sessions', 'solves', 'trainerStats'], (tx) => {
        if (mode === 'replace') {
          tx.objectStore('sessions').clear();
          tx.objectStore('solves').clear();
          tx.objectStore('trainerStats').clear();
        }
        for (const session of data.sessions) tx.objectStore('sessions').put(session);
        for (const solve of data.solves) tx.objectStore('solves').put(solve);
        for (const stat of data.trainerStats) tx.objectStore('trainerStats').put(stat);
      });
      if (data.settings) {
        await this.saveSettings({ ...(await this.getSettings()), ...data.settings });
      }
    },
  };
  return store;
}

/**
 * Opens the local database, falling back to memory if IndexedDB is unavailable.
 * Check `store.persistent` to find out which one you got.
 */
export async function openStore(): Promise<Store> {
  if (typeof indexedDB === 'undefined') return createMemoryStore();
  try {
    return createIndexedDbStore(await openDatabase());
  } catch {
    return createMemoryStore();
  }
}
