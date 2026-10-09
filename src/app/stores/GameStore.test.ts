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
      key: 'intro:2:1',
      speaker: { name: 'Мила', portrait: '/mila-portrait.webp' },
      text: 'Первая',
    });
  });

  it('shows narration without a speaker', () => {
    const { store } = createStore();
    store.newGame();
    store.advance();

    expect(store.line).toEqual({ key: 'intro:3:2', speaker: null, text: 'Последняя' });
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

describe('GameStore at a choice', () => {
  const fork = createSceneRegistry(
    {
      intro: [
        {
          type: 'choice',
          prompt: { speaker: 'mila', text: 'Куда пойдём?' },
          options: [
            { text: 'Довериться', when: (vars) => vars.trust === 1, then: [] },
            { text: 'В парк', then: [{ type: 'say', text: 'Пошли.' }] },
            { text: 'Остаться', then: [] },
          ],
        },
      ],
    },
    'intro',
  );

  function startFork() {
    const store = new GameStore({
      registry: fork,
      variableDefaults: { trust: 0 },
      presentation,
      onEnd: vi.fn(),
    });
    store.newGame();
    return store;
  }

  it('shows the prompt as the line, and only the options the player may pick', () => {
    const store = startFork();

    expect(store.line).toEqual({
      key: 'intro:0:1',
      speaker: { name: 'Мила', portrait: '/mila-portrait.webp' },
      text: 'Куда пойдём?',
    });
    expect(store.choiceOptions).toEqual([
      { index: 1, text: 'В парк' },
      { index: 2, text: 'Остаться' },
    ]);
  });

  it('plays the picked option, addressed by its place among all options', () => {
    const store = startFork();
    store.choose(1);

    expect(store.line?.text).toBe('Пошли.');
    expect(store.choiceOptions).toBeNull();
  });

  it('does not let a click on the stage skip the choice', () => {
    const store = startFork();
    store.advance();

    expect(store.interaction?.type).toBe('choice');
  });

  it('gives a line a new key when the story comes back to the same step', () => {
    const loop = createSceneRegistry(
      {
        intro: [
          {
            type: 'choice',
            prompt: { text: 'Ещё раз?' },
            options: [
              { text: 'Да', then: [{ type: 'jump', scene: 'intro' }] },
              { text: 'Нет', then: [] },
            ],
          },
        ],
      },
      'intro',
    );
    const store = new GameStore({
      registry: loop,
      variableDefaults: {},
      presentation,
      onEnd: vi.fn(),
    });
    store.newGame();
    const first = store.line?.key;
    store.choose(0);

    expect(store.line?.text).toBe('Ещё раз?');
    expect(store.line?.key).not.toBe(first);
  });

  it('ignores a choice when the player is reading a line', () => {
    const { store } = createStore();
    store.newGame();
    store.choose(0);

    expect(store.line?.text).toBe('Первая');
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
