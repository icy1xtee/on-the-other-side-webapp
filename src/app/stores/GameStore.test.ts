import { createSceneRegistry } from '@engine';
import { autorun } from 'mobx';
import { describe, expect, it, vi } from 'vitest';
import { GameStore, type Presentation } from './GameStore';
import { RootStore } from './RootStore';

const registry = createSceneRegistry(
  {
    intro: [
      { type: 'scene', background: 'room' },
      { type: 'show', tag: 'mila', emotion: 'happy', at: 'left' },
      { type: 'say', speaker: 'mila', text: 'Первая' },
      { type: 'say', text: 'Последняя' },
    ],
  },
  'intro',
);

const presentation: Presentation = {
  speakers: { mila: { name: 'Мила' } },
  assets: {
    backgrounds: { room: '/room.webp' },
    characters: { mila: { happy: '/mila-happy.webp' } },
    portraits: { mila: '/mila-portrait.webp' },
  },
};

function createStore(onEnd = vi.fn()) {
  return {
    store: new GameStore({ registry, variableDefaults: { trust: 0 }, presentation, onEnd }),
    onEnd,
  };
}

describe('GameStore', () => {
  it('starts the story on the first line, with ids resolved into files and names', () => {
    const { store } = createStore();
    store.newGame();

    expect(store.background).toBe('/room.webp');
    expect(store.sprites).toEqual([{ tag: 'mila', at: 'left', src: '/mila-happy.webp' }]);
    expect(store.line).toEqual({
      key: 'intro:2',
      speaker: { name: 'Мила', portrait: '/mila-portrait.webp' },
      text: 'Первая',
    });
  });

  it('shows narration without a speaker', () => {
    const { store } = createStore();
    store.newGame();
    store.advance();

    expect(store.line).toEqual({ key: 'intro:3', speaker: null, text: 'Последняя' });
  });

  it('reports the end after the last line', () => {
    const { store, onEnd } = createStore();
    store.newGame();
    store.advance();
    expect(onEnd).not.toHaveBeenCalled();

    store.advance();
    expect(store.interaction).toEqual({ type: 'end' });
    expect(store.line).toBeNull();
    expect(onEnd).toHaveBeenCalledOnce();
  });

  it('ignores clicks when there is no line to pass', () => {
    const { store } = createStore();
    expect(() => store.advance()).not.toThrow();
    expect(store.state).toBeNull();
    expect(store.sprites).toEqual([]);
  });

  it('is observable: a reaction sees each new line', () => {
    const { store } = createStore();
    const speakers: Array<string | undefined> = [];
    const stop = autorun(() => {
      speakers.push(store.line?.speaker?.name);
    });

    store.newGame();
    store.advance();
    stop();

    expect(speakers).toEqual([undefined, 'Мила', undefined]);
  });
});

describe('RootStore', () => {
  it('opens the game on a new game and goes back to the menu when the story ends', () => {
    const root = new RootStore({ registry, variableDefaults: {}, presentation });

    root.newGame();
    expect(root.ui.screen).toBe('game');

    root.game.advance();
    root.game.advance();
    expect(root.ui.screen).toBe('menu');
  });
});
