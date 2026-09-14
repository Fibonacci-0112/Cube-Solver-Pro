/**
 * Moving solve history in and out of the app.
 *
 * Because nothing is stored on a server, the export file is the only way to
 * carry history between the Windows app and the web app, or to keep a backup.
 * Import also accepts csTimer's export format so an existing history can be
 * brought across.
 */

import { PUZZLE_IDS, type PuzzleId } from '../cube/scramble';
import type { Penalty, Session, Solve } from '../stats/solves';
import type { Settings, TrainerStat } from './types';

export const EXPORT_FORMAT = 'cube-solver-pro-export';
export const EXPORT_VERSION = 1;

export interface ExportFile {
  format: typeof EXPORT_FORMAT;
  version: number;
  exportedAt: number;
  sessions: Session[];
  solves: Solve[];
  trainerStats: TrainerStat[];
  settings?: Partial<Settings>;
}

export interface ImportResult {
  sessions: Session[];
  solves: Solve[];
  trainerStats: TrainerStat[];
  settings?: Partial<Settings>;
  /** What the file was recognised as, for reporting back to the user. */
  source: 'cube-solver-pro' | 'cstimer';
}

export function buildExport(data: {
  sessions: Session[];
  solves: Solve[];
  trainerStats: TrainerStat[];
  settings?: Partial<Settings>;
}): ExportFile {
  return {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    ...data,
  };
}

const isPuzzleId = (value: unknown): value is PuzzleId =>
  typeof value === 'string' && (PUZZLE_IDS as readonly string[]).includes(value);

let idCounter = 0;
/** Ids only need to be unique within this device's database. */
export function newId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

/**
 * csTimer stores each solve as `[[penalty, timeMs], scramble, comment, unixSeconds]`,
 * where the penalty is 0, 2000 for a +2, or -1 for a DNF, and the time excludes
 * the penalty. Session names live in a JSON string inside `properties`.
 */
function parseCsTimer(raw: Record<string, unknown>): ImportResult | null {
  const sessionKeys = Object.keys(raw).filter((key) => /^session\d+$/.test(key));
  if (sessionKeys.length === 0) return null;

  let names: Record<string, string> = {};
  const properties = raw.properties;
  if (properties && typeof properties === 'object' && 'sessionData' in properties) {
    try {
      const parsed = JSON.parse(String((properties as Record<string, unknown>).sessionData));
      names = Object.fromEntries(
        Object.entries(parsed as Record<string, { name?: string }>).map(([k, v]) => [
          k,
          v?.name ?? `Session ${k}`,
        ]),
      );
    } catch {
      // A missing or malformed name table is not worth failing the import over.
    }
  }

  const sessions: Session[] = [];
  const solves: Solve[] = [];

  for (const key of sessionKeys) {
    const rows = raw[key];
    if (!Array.isArray(rows)) continue;
    const number = key.replace('session', '');
    const sessionId = newId('session');
    let earliest = Date.now();

    for (const row of rows) {
      if (!Array.isArray(row) || !Array.isArray(row[0])) continue;
      const [penaltyRaw, timeRaw] = row[0] as [number, number];
      const penalty: Penalty = penaltyRaw === -1 ? 'dnf' : penaltyRaw === 2000 ? 'plus2' : 'none';
      const timeMs = Number(timeRaw);
      if (!Number.isFinite(timeMs) || timeMs < 0) continue;
      const createdAt = typeof row[3] === 'number' ? row[3] * 1000 : Date.now();
      earliest = Math.min(earliest, createdAt);
      solves.push({
        id: newId('solve'),
        sessionId,
        puzzle: '333',
        scramble: typeof row[1] === 'string' ? row[1] : '',
        timeMs,
        penalty,
        comment: typeof row[2] === 'string' && row[2] ? row[2] : undefined,
        createdAt,
      });
    }

    sessions.push({
      id: sessionId,
      name: names[number] ?? `Imported session ${number}`,
      puzzle: '333',
      createdAt: earliest,
    });
  }

  if (solves.length === 0 && sessions.length === 0) return null;
  return { sessions, solves, trainerStats: [], source: 'cstimer' };
}

function parseNative(raw: Record<string, unknown>): ImportResult | null {
  if (raw.format !== EXPORT_FORMAT) return null;
  const sessions = Array.isArray(raw.sessions) ? (raw.sessions as Session[]) : [];
  const solves = Array.isArray(raw.solves) ? (raw.solves as Solve[]) : [];
  const trainerStats = Array.isArray(raw.trainerStats) ? (raw.trainerStats as TrainerStat[]) : [];

  const known = new Set(sessions.map((s) => s.id));
  return {
    sessions: sessions.filter((s) => s && typeof s.id === 'string' && isPuzzleId(s.puzzle)),
    // Drop solves pointing at a session the file does not contain; they would
    // otherwise be invisible in the UI but still counted in totals.
    solves: solves.filter(
      (s) => s && typeof s.id === 'string' && known.has(s.sessionId) && Number.isFinite(s.timeMs),
    ),
    trainerStats: trainerStats.filter((s) => s && typeof s.id === 'string'),
    settings: (raw.settings as Partial<Settings>) ?? undefined,
    source: 'cube-solver-pro',
  };
}

/** Reads an export file, accepting either this app's format or csTimer's. */
export function parseImport(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (!raw || typeof raw !== 'object') throw new Error('That file does not contain any data.');

  const record = raw as Record<string, unknown>;
  const native = parseNative(record);
  if (native) return native;
  const csTimer = parseCsTimer(record);
  if (csTimer) return csTimer;

  throw new Error('That file is not a Cube Solver Pro or csTimer export.');
}
