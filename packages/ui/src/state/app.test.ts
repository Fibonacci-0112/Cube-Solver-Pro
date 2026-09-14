import { beforeEach, expect, it } from 'vitest';
import { createMemoryStore, type Store } from '@cube/platform';
import { setPlatform, useApp } from './app';

let store: Store;

beforeEach(() => {
  store = createMemoryStore();
  setPlatform({
    store,
    info: { shell: 'web', version: 'test' },
    files: { save: async () => 'saved', open: async () => null },
  });
});

it('reconciles and persists the fallback puzzle after replacing history', async () => {
  await useApp.getState().init();
  await useApp.getState().setPuzzle('222');
  await useApp.getState().importData(JSON.stringify({
    session1: [[[0, 15_000], '', '', 1_600_000_000]],
  }), 'replace');

  const state = useApp.getState();
  expect(state.settings.currentPuzzle).toBe('333');
  expect(state.settings.currentSessionId).toBe(state.currentSessionId);
  expect(await store.getSettings()).toEqual(state.settings);
  await state.addSolve({ puzzle: state.settings.currentPuzzle, scramble: 'R', timeMs: 9000, penalty: 'none' });
  const session = state.sessions.find(s => s.id === state.currentSessionId)!;
  expect((await store.listSolves(session.id)).every(s => s.puzzle === session.puzzle)).toBe(true);

  await useApp.getState().init();
  expect(useApp.getState().settings.currentPuzzle).toBe('333');
  expect(useApp.getState().currentSessionId).toBe(session.id);
});

it('preserves a valid saved selection when other sessions exist', async () => {
  await useApp.getState().init();
  await useApp.getState().setPuzzle('222');
  const selected = useApp.getState().currentSessionId;
  await store.createSession('Other', '222');
  await useApp.getState().init();
  expect(useApp.getState().currentSessionId).toBe(selected);
  expect(useApp.getState().settings.currentPuzzle).toBe('222');
});
