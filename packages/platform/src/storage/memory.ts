/**
 * The fallback store, used when IndexedDB will not open — private browsing, a
 * locked-down profile, a WebView with site data blocked.
 *
 * The app keeps working; only persistence is lost, and `persistent` being false
 * is what lets the UI say so rather than appearing to save and silently not.
 */

import { buildExport, DEFAULT_SETTINGS, newId } from '@cube/core';
import type { Session, Settings, Solve, TrainerStat } from '@cube/core';
import type { Store } from '../types';

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
      return solves
        .filter((s) => s.sessionId === sessionId)
        .sort((a, b) => a.createdAt - b.createdAt);
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
