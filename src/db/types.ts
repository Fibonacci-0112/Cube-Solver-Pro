/**
 * Everything the app stores. All of it lives on this device: there is no
 * account and no server, so the export file is the only way data leaves.
 */

import type { PuzzleId } from '../cube/scramble';
import type { Session, Solve } from '../stats/solves';

export type { Session, Solve };

/** How well a learner knows one algorithm case. */
export interface TrainerStat {
  /** `${setId}:${caseId}`, so cases from different sets cannot collide. */
  id: string;
  setId: string;
  caseId: string;
  attempts: number;
  dnfs: number;
  totalMs: number;
  bestMs?: number;
  lastMs?: number;
  /** The most recent few times, used to weight which case comes up next. */
  recentMs: number[];
  status: 'unseen' | 'learning' | 'known';
  starred: boolean;
  /** An algorithm the learner prefers over the set's default. */
  customAlg?: string;
  updatedAt: number;
}

export interface Settings {
  theme: 'system' | 'light' | 'dark';
  /** WCA-style 15 second inspection before the timer starts. */
  inspection: boolean;
  inspectionSeconds: number;
  /** Spoken or beeped warnings at 8 and 12 seconds. */
  inspectionSound: boolean;
  /** How long the spacebar must be held before the timer arms. */
  holdToStartMs: number;
  /** Hide everything but the time while solving. */
  zenMode: boolean;
  /** Show only whole seconds while the timer runs. */
  hideTimeWhileRunning: boolean;
  currentSessionId?: string;
  currentPuzzle: PuzzleId;
  /** Whether the first-run tour has been dismissed. */
  tourSeen: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  inspection: false,
  inspectionSeconds: 15,
  inspectionSound: true,
  holdToStartMs: 300,
  zenMode: false,
  hideTimeWhileRunning: false,
  currentPuzzle: '333',
  tourSeen: false,
};

export const emptyTrainerStat = (setId: string, caseId: string): TrainerStat => ({
  id: `${setId}:${caseId}`,
  setId,
  caseId,
  attempts: 0,
  dnfs: 0,
  totalMs: 0,
  recentMs: [],
  status: 'unseen',
  starred: false,
  updatedAt: Date.now(),
});
