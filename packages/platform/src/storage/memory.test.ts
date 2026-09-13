import { describe, expect, it } from 'vitest';
import type { Solve } from '@cube/core';
import { createMemoryStore } from './memory';

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

describe('memory store', () => {
  it('reports that it does not persist', () => {
    expect(createMemoryStore().persistent).toBe(false);
  });

  it('keeps solves with their session and removes them with it', async () => {
    const store = createMemoryStore();
    const session = await store.createSession('Main', '333');
    await store.addSolve(solve({ sessionId: session.id }));
    expect(await store.listSolves(session.id)).toHaveLength(1);
    await store.deleteSession(session.id);
    expect(await store.listSessions()).toHaveLength(0);
    expect(await store.listSolves(session.id)).toHaveLength(0);
  });

  it('returns solves oldest first', async () => {
    const store = createMemoryStore();
    const session = await store.createSession('Main', '333');
    await store.addSolve(solve({ id: 'b', sessionId: session.id, createdAt: 200 }));
    await store.addSolve(solve({ id: 'a', sessionId: session.id, createdAt: 100 }));
    expect((await store.listSolves(session.id)).map((s) => s.id)).toEqual(['a', 'b']);
  });

  it('replaces everything on a replacing import, and keeps it on a merge', async () => {
    const store = createMemoryStore();
    const first = await store.createSession('First', '333');
    const payload = {
      sessions: [{ id: 'imported', name: 'Imported', puzzle: '333' as const, createdAt: 5 }],
      solves: [],
      trainerStats: [],
      source: 'cube-solver-pro' as const,
    };

    await store.importAll(payload, 'merge');
    // Sessions come back oldest first, and the imported one predates this run.
    expect((await store.listSessions()).map((s) => s.name).sort()).toEqual(['First', 'Imported']);

    await store.importAll({ ...payload }, 'replace');
    expect((await store.listSessions()).map((s) => s.name)).toEqual(['Imported']);
    expect(first.name).toBe('First');
  });
});
