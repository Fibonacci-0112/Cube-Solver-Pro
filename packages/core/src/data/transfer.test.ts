import { describe, expect, it } from 'vitest';
import { EXPORT_FORMAT, buildExport, parseImport } from './transfer';
import type { Solve } from '../stats/solves';

const solve = (over: Partial<Solve> = {}): Solve => ({
  id: 'solve-1',
  sessionId: 'session-1',
  puzzle: '333',
  scramble: "R U R'",
  timeMs: 12_340,
  penalty: 'none',
  createdAt: 1_700_000_000_000,
  ...over,
});

describe('export and re-import', () => {
  it('survives a round trip', () => {
    const file = buildExport({
      sessions: [{ id: 'session-1', name: 'Main', puzzle: '333', createdAt: 1 }],
      solves: [solve()],
      trainerStats: [],
    });
    const back = parseImport(JSON.stringify(file));
    expect(back.source).toBe('cube-solver-pro');
    expect(back.sessions).toHaveLength(1);
    expect(back.solves[0].timeMs).toBe(12_340);
  });

  it('drops solves whose session is not in the file', () => {
    const file = buildExport({
      sessions: [{ id: 'session-1', name: 'Main', puzzle: '333', createdAt: 1 }],
      solves: [solve(), solve({ id: 'solve-2', sessionId: 'missing' })],
      trainerStats: [],
    });
    // An orphaned solve would count towards totals while being invisible.
    expect(parseImport(JSON.stringify(file)).solves).toHaveLength(1);
  });

  it('rejects files it does not recognise', () => {
    expect(() => parseImport('not json')).toThrow(/valid JSON/);
    expect(() => parseImport('{"hello":"world"}')).toThrow(/not a Cube Solver Pro or csTimer/);
    expect(() => parseImport('null')).toThrow(/does not contain any data/);
  });

  it('marks its own format', () => {
    expect(buildExport({ sessions: [], solves: [], trainerStats: [] }).format).toBe(EXPORT_FORMAT);
  });
});

describe('csTimer import', () => {
  const csTimer = JSON.stringify({
    session1: [
      [[0, 12_340], "R U R' U'", '', 1_600_000_000],
      [[2000, 15_000], "F R U'", 'shaky', 1_600_000_100],
      [[-1, 20_000], 'D2 L', '', 1_600_000_200],
    ],
    properties: {
      sessionData: JSON.stringify({ '1': { name: 'Old timer', rank: 1 } }),
    },
  });

  it('reads solves, scrambles and comments', () => {
    const result = parseImport(csTimer);
    expect(result.source).toBe('cstimer');
    expect(result.solves).toHaveLength(3);
    expect(result.solves[0].scramble).toBe("R U R' U'");
    expect(result.solves[1].comment).toBe('shaky');
  });

  it('reads the penalties', () => {
    const [plain, plusTwo, dnf] = parseImport(csTimer).solves;
    expect(plain.penalty).toBe('none');
    expect(plusTwo.penalty).toBe('plus2');
    expect(dnf.penalty).toBe('dnf');
  });

  it('stores the raw time, since csTimer folds the +2 into its own', () => {
    const [, plusTwo] = parseImport(csTimer).solves;
    expect(plusTwo.timeMs).toBe(13_000);
  });

  it('keeps the session name', () => {
    expect(parseImport(csTimer).sessions[0].name).toBe('Old timer');
  });

  it('copes with a missing name table', () => {
    const withoutNames = JSON.stringify({ session1: [[[0, 9000], '', '', 1_600_000_000]] });
    expect(parseImport(withoutNames).sessions[0].name).toBe('Imported session 1');
  });

  it('converts the timestamp from seconds to milliseconds', () => {
    expect(parseImport(csTimer).solves[0].createdAt).toBe(1_600_000_000_000);
  });
});
