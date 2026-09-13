/**
 * The real store: IndexedDB.
 *
 * Available on all three shells — a browser tab, Electron's renderer and the
 * Android System WebView are all Chromium, and all three give the app its own
 * origin and its own database. That is why the same implementation covers every
 * platform today, and why the `Store` interface is about being able to change
 * that later rather than about papering over a difference that exists now.
 */

import { buildExport, DEFAULT_SETTINGS, newId } from '@cube/core';
import type { Session, Settings, Solve, TrainerStat } from '@cube/core';
import type { Store } from '../types';
import { createMemoryStore } from './memory';

const DB_NAME = 'cube-improver';
const DB_VERSION = 1;
const SETTINGS_KEY = 'settings';

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
