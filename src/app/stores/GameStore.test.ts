import { createSceneRegistry } from '@engine';
import { autorun } from 'mobx';
import { describe, expect, it, vi } from 'vitest';
import { GameStore } from './GameStore';
import { RootStore } from './RootStore';

const registry = createSceneRegistry(
  {
    intro: [
      { type: 'scene', background: 'room' },
      { type: 'say', speaker: 'anna', text: 'Первая' },
      { type: 'say', text: 'Последняя' },
    ],
  },
  'intro',
);

function createStore(onEnd = vi.fn()) {
  return { store: new GameStore({ registry, variableDefaults: { trust: 0 }, onEnd }), onEnd };
}

describe('GameStore', () => {
  it('starts the story on the first line', () => {
    const { store } = createStore();
    store.newGame();

    expect(store.line).toEqual({ type: 'say', speaker: 'anna', text: 'Первая' });
    expect(store.stage).toEqual({ background: 'room', sprites: [] });
  });

  it('advances line by line and reports the end', () => {
    const { store, onEnd } = createStore();
    store.newGame();
    store.advance();
    expect(store.line?.text).toBe('Последняя');
    expect(onEnd).not.toHaveBeenCalled();

    store.advance();
    expect(store.interaction).toEqual({ type: 'end' });
    expect(onEnd).toHaveBeenCalledOnce();
  });

  it('ignores clicks when there is no line to pass', () => {
    const { store } = createStore();
    expect(() => store.advance()).not.toThrow();
    expect(store.state).toBeNull();
  });

  it('is observable: a reaction sees each new line', () => {
    const { store } = createStore();
    const lines: Array<string | undefined> = [];
    const stop = autorun(() => {
      lines.push(store.line?.speaker);
    });

    store.newGame();
    store.advance();
    stop();

    expect(lines).toEqual([undefined, 'anna', undefined]);
  });
});

describe('RootStore', () => {
  it('opens the game on a new game and goes back to the menu when the story ends', () => {
    const root = new RootStore({ registry, variableDefaults: {} });

    root.newGame();
    expect(root.ui.screen).toBe('game');

    root.game.advance();
    root.game.advance();
    expect(root.ui.screen).toBe('menu');
  });
});
