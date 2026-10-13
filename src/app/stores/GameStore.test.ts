import { createSceneRegistry } from '@engine';
import { autorun } from 'mobx';
import { describe, expect, it, vi } from 'vitest';
import { GameStore, type Presentation } from './GameStore';
import { RootStore } from './RootStore';
import { fakeAudio, memorySlot } from './testDoubles';

const registry = createSceneRegistry(
  {
    intro: [
      { type: 'music', asset: 'theme' },
      { type: 'scene', background: 'room' },
      { type: 'show', tag: 'mila', emotion: 'happy', at: 'left' },
      { type: 'sfx', asset: 'door' },
      { type: 'say', speaker: 'mila', text: 'Первая' },
      { type: 'sfx', asset: 'silent' },
      { type: 'say', text: 'Последняя' },
    ],
  },
  'intro',
);

const presentation: Presentation = {
  speakers: { mila: { name: 'Мила' } },
  sceneTitles: { intro: 'Начало' },
  assets: {
    backgrounds: { room: '/room.webp' },
    characters: { mila: { happy: '/mila-happy.webp' } },
    portraits: { mila: '/mila-portrait.webp' },
    music: { theme: '/theme.mp3' },
    sounds: { door: '/door.mp3' },
  },
};

function createStore(onEnd = vi.fn(), saveSlot = memorySlot(), audio = fakeAudio()) {
  return {
    store: new GameStore({
      registry,
      variableDefaults: { trust: 0 },
      presentation,
      saveSlot,
      audio,
      onEnd,
    }),
    onEnd,
    saveSlot,
    audio,
  };
}

/** A RootStore over memory storage and silent audio. */
function createRoot(saveSlot = memorySlot(), settingsSlot = memorySlot(), audio = fakeAudio()) {
  return {
    root: new RootStore({
      registry,
      variableDefaults: {},
      presentation,
      saveSlot,
      settingsSlot,
      menuArt: { background: '/room.webp', character: '/mila-happy.webp' },
      audio,
    }),
    audio,
  };
}

describe('GameStore', () => {
  it('starts the story on the first line, with ids resolved into files and names', () => {
    const { store } = createStore();
    store.newGame();

    expect(store.background).toBe('/room.webp');
    expect(store.sprites).toEqual([{ tag: 'mila', at: 'left', src: '/mila-happy.webp' }]);
    expect(store.line).toEqual({
      key: 'intro:4:1',
      speaker: { name: 'Мила', portrait: '/mila-portrait.webp' },
      text: 'Первая',
    });
  });

  it('shows narration without a speaker', () => {
    const { store } = createStore();
    store.newGame();
    store.advance();

    expect(store.line).toEqual({ key: 'intro:6:2', speaker: null, text: 'Последняя' });
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
      saveSlot: memorySlot(),
      audio: fakeAudio(),
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
      saveSlot: memorySlot(),
      audio: fakeAudio(),
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

describe('GameStore saves', () => {
  it('saves on every line, positioned on that line', () => {
    const { store, saveSlot } = createStore();
    store.newGame();
    expect(saveSlot.writes).toBe(1);
    expect(JSON.parse(saveSlot.value!)).toMatchObject({ position: { sceneId: 'intro', step: 4 } });

    store.advance();
    expect(saveSlot.writes).toBe(2);
    expect(JSON.parse(saveSlot.value!)).toMatchObject({ position: { sceneId: 'intro', step: 6 } });
  });

  it('resumes after a reload on the same line, with the same stage', () => {
    const before = createStore();
    before.store.newGame();
    before.store.advance();

    // A new store over the same storage: the page was reloaded.
    const { store: after } = createStore(vi.fn(), memorySlot(before.saveSlot.value));
    expect(after.canContinue).toBe(true);
    expect(after.continueGame()).toBe(true);

    expect(after.line?.text).toBe('Последняя');
    expect(after.state).toEqual(before.store.state);
    expect(after.background).toBe('/room.webp');
    expect(after.sprites).toEqual(before.store.sprites);
  });

  it('has nothing to continue without a save', () => {
    const { store } = createStore();
    expect(store.canContinue).toBe(false);
    expect(store.continueGame()).toBe(false);
    expect(store.state).toBeNull();
  });

  it('ignores a broken save, saying why in the log', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { store } = createStore(vi.fn(), memorySlot('{"version":1,"position":"nowhere"}'));

    expect(store.canContinue).toBe(false);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Autosave ignored'));
    warn.mockRestore();
  });

  it('forgets the save once the story is over', () => {
    const { store, saveSlot } = createStore();
    store.newGame();
    store.advance();
    store.advance();

    expect(store.interaction).toEqual({ type: 'end' });
    expect(saveSlot.value).toBeNull();
    expect(store.canContinue).toBe(false);
  });

  it('plays on when storage refuses, and still continues within the session', () => {
    const { store } = createStore(vi.fn(), memorySlot(null, { refusing: true }));
    store.newGame();
    store.advance();

    expect(store.line?.text).toBe('Последняя');
    expect(store.saveNow()).toBe(false);
    expect(store.canContinue).toBe(true);
  });

  it('tells once that autosaves fail, however many there are', () => {
    const onSaveUnavailable = vi.fn();
    const store = new GameStore({
      registry,
      variableDefaults: {},
      presentation,
      saveSlot: memorySlot(null, { refusing: true }),
      audio: fakeAudio(),
      onEnd: vi.fn(),
      onSaveUnavailable,
    });
    store.newGame();
    store.advance();
    store.saveNow();

    expect(onSaveUnavailable).toHaveBeenCalledOnce();
  });

  it('saves on demand, but not after the end', () => {
    const { store, saveSlot } = createStore();
    expect(store.saveNow()).toBe(false);

    store.newGame();
    expect(store.saveNow()).toBe(true);
    expect(saveSlot.writes).toBe(2);
  });
});

describe('GameStore for the menu and the panel', () => {
  it('names the scene being played; a scene without a title has none', () => {
    const { store } = createStore();
    expect(store.sceneTitle).toBe('');
    store.newGame();
    expect(store.sceneTitle).toBe('Начало');
  });

  it('previews what Continue leads to: the picture, the line and when it was saved', () => {
    const before = createStore();
    before.store.newGame();

    const { store } = createStore(vi.fn(), memorySlot(before.saveSlot.value));
    expect(store.continuePreview).toEqual({
      frame: {
        background: '/room.webp',
        sprites: [{ tag: 'mila', at: 'left', src: '/mila-happy.webp' }],
      },
      line: { speaker: 'Мила', text: 'Первая' },
      savedAt: expect.any(Number),
    });
    // The preview plays nothing: the door knocks on Continue only if it did on the way.
    expect(store.state).toBeNull();
  });

  it('has nothing to preview without a save', () => {
    expect(createStore().store.continuePreview).toBeNull();
  });
});

describe('GameStore play time', () => {
  function clockedStore(saveSlot = memorySlot()) {
    let now = 1_000;
    const store = new GameStore({
      registry,
      variableDefaults: {},
      presentation,
      saveSlot,
      audio: fakeAudio(),
      onEnd: vi.fn(),
      now: () => now,
    });
    return { store, saveSlot, tick: (ms: number) => (now += ms) };
  }

  it('counts only while the clock runs', () => {
    const { store, tick } = clockedStore();
    store.newGame();
    tick(5_000);
    expect(store.playTime()).toBe(0);

    store.startClock();
    tick(3_000);
    expect(store.playTime()).toBe(3_000);

    store.stopClock();
    tick(10_000);
    expect(store.playTime()).toBe(3_000);
  });

  it('saves the time with every line, and on stopping the clock', () => {
    const { store, saveSlot, tick } = clockedStore();
    store.startClock();
    store.newGame();
    tick(2_000);
    store.advance();
    expect(JSON.parse(saveSlot.value!)).toMatchObject({ playTime: 2_000 });

    tick(4_000);
    store.stopClock();
    expect(JSON.parse(saveSlot.value!)).toMatchObject({ playTime: 6_000 });
  });

  it('goes on from the saved time on Continue, and starts from zero in a new game', () => {
    const before = clockedStore();
    before.store.startClock();
    before.store.newGame();
    before.tick(7_000);
    before.store.stopClock();

    const { store, tick } = clockedStore(memorySlot(before.saveSlot.value));
    store.continueGame();
    store.startClock();
    tick(1_000);
    expect(store.playTime()).toBe(8_000);

    store.newGame();
    tick(500);
    expect(store.playTime()).toBe(500);
  });

  it('reads a save without play time as zero', () => {
    const { store: first, saveSlot } = clockedStore();
    first.newGame();
    const { playTime: _, ...older } = JSON.parse(saveSlot.value!);

    const { store } = clockedStore(memorySlot(JSON.stringify(older)));
    store.continueGame();
    expect(store.playTime()).toBe(0);
  });

  it('does not bring back a finished game by stopping the clock', () => {
    const { store, saveSlot } = clockedStore();
    store.startClock();
    store.newGame();
    store.advance();
    store.advance();
    store.stopClock();

    expect(saveSlot.value).toBeNull();
    expect(store.canContinue).toBe(false);
  });
});

describe('GameStore audio', () => {
  it('plays the music and sounds the story asks for, a sound without a file staying silent', () => {
    const { store, audio } = createStore();
    store.newGame();

    expect(audio.playMusic).toHaveBeenCalledWith('/theme.mp3', { ifChanged: false });
    expect(audio.playSound).toHaveBeenCalledWith('/door.mp3');

    store.advance();
    expect(audio.playSound).toHaveBeenCalledOnce();
  });

  it('brings the music back on Continue without restarting the same track', () => {
    const before = createStore();
    before.store.newGame();

    const { store, audio } = createStore(vi.fn(), memorySlot(before.saveSlot.value));
    store.continueGame();

    expect(audio.playMusic).toHaveBeenCalledOnce();
    expect(audio.playMusic).toHaveBeenCalledWith('/theme.mp3', { ifChanged: true });
    // Nothing on the way to the saved line is re-executed: the door doesn't knock twice.
    expect(audio.playSound).not.toHaveBeenCalled();
  });

  it('plays a track without a file as silence', () => {
    const silent = createSceneRegistry(
      {
        intro: [
          { type: 'music', asset: 'unknown' },
          { type: 'say', text: 'Тихо' },
        ],
      },
      'intro',
    );
    const audio = fakeAudio();
    const store = new GameStore({
      registry: silent,
      variableDefaults: {},
      presentation,
      saveSlot: memorySlot(),
      audio,
      onEnd: vi.fn(),
    });
    store.newGame();

    expect(audio.playMusic).toHaveBeenCalledWith(null, { ifChanged: false });
  });
});

describe('RootStore', () => {
  it('opens the game on a new game and goes back to the menu when the story ends', () => {
    const { root, audio } = createRoot();

    root.newGame();
    expect(root.ui.screen).toBe('game');

    root.game.advance();
    root.game.advance();
    expect(root.ui.screen).toBe('menu');
    // The menu has no music of its own: the game's track fades out.
    expect(audio.playMusic).toHaveBeenLastCalledWith(null);
  });

  it('continues into the game, or stays in the menu with nothing to continue', () => {
    const { root: empty } = createRoot();
    empty.continueGame();
    expect(empty.ui.screen).toBe('menu');

    const { root } = createRoot();
    root.newGame();
    root.toMainMenu();
    root.continueGame();
    expect(root.ui.screen).toBe('game');
    expect(root.game.line?.text).toBe('Первая');
  });

  it('asks before a new game overwrites the one to continue', () => {
    const { root } = createRoot();
    root.requestNewGame();
    expect(root.ui.screen).toBe('game');
    expect(root.ui.overlay).toBeNull();

    root.toMainMenu();
    root.requestNewGame();
    expect(root.ui.screen).toBe('menu');
    expect(root.ui.overlay).toEqual({ type: 'confirmNewGame' });

    root.newGame();
    expect(root.ui.screen).toBe('game');
    expect(root.ui.overlay).toBeNull();
  });

  it('applies the volumes at once, at boot and on every change', () => {
    const { root, audio } = createRoot();
    expect(audio.setVolumes).toHaveBeenLastCalledWith({ master: 1, music: 0.5, sound: 1 });

    root.settings.setMusicVolume(0.2);
    expect(audio.setVolumes).toHaveBeenLastCalledWith({ master: 1, music: 0.2, sound: 1 });
  });

  it('silences everything on "Без звука", the volumes kept', () => {
    const { root, audio } = createRoot();
    expect(audio.setMuted).toHaveBeenLastCalledWith(false);

    root.settings.setMuted(true);
    expect(audio.setMuted).toHaveBeenLastCalledWith(true);
    expect(audio.setVolumes).toHaveBeenCalledOnce();
  });

  it('shows a notice when the game cannot be saved', () => {
    const { root } = createRoot(memorySlot(null, { refusing: true }));
    root.newGame();

    expect(root.ui.notice).not.toBeNull();
  });
});
