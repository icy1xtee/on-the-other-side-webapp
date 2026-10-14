import i18next from 'i18next';
import { beforeAll, describe, expect, it } from 'vitest';
import type { LoadSource } from '@/shared/config/saveSlots';
import { ru } from '@/shared/i18n/locales/ru';
import { RootStore } from './RootStore';
import { fakeAudio, memorySlot } from './testDoubles';
import { presentation, registry } from './testStory';

/** A RootStore over memory storage — refusing to save, if asked to — and silent audio. */
function createRoot({ refusing = false } = {}) {
  const audio = fakeAudio();
  const saves = new Map<LoadSource, ReturnType<typeof memorySlot>>();
  return {
    root: new RootStore({
      registry,
      variableDefaults: {},
      presentation,
      saveStorage: (source) => {
        const slot = saves.get(source) ?? memorySlot(null, { refusing });
        saves.set(source, slot);
        return slot;
      },
      settingsSlot: memorySlot(),
      persistentSlot: memorySlot(),
      menuArt: { background: '/room.webp', character: '/mila-happy.webp' },
      audio,
    }),
    audio,
  };
}

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

  it('reads the line through the reading store wired to the game and the settings', () => {
    const { root } = createRoot();
    root.settings.setTextCps(0);
    root.newGame();
    expect(root.reading.lineShown).toBe(true);

    root.reading.requestAdvance();
    expect(root.game.line?.text).toBe('Последняя');
  });

  it('stops Auto and Skip when the game menu opens or the player leaves the game', () => {
    const { root } = createRoot();
    root.newGame();
    root.reading.toggleAuto();
    root.ui.openGameMenu('save');
    expect(root.reading.mode).toBeNull();

    root.ui.closeOverlay();
    root.reading.toggleSkip();
    root.toMainMenu();
    expect(root.reading.mode).toBeNull();
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
    const { root } = createRoot({ refusing: true });
    root.newGame();

    expect(root.ui.notice).not.toBeNull();
  });
});

describe('RootStore save slots', () => {
  // The notices say what happened in the player's words.
  beforeAll(() =>
    i18next.init({
      lng: 'ru',
      ns: ['ui'],
      defaultNS: 'ui',
      resources: { ru: { ui: ru } },
      keySeparator: false,
      initAsync: false,
    }),
  );

  /** In the game on its second line, the game menu open on a section. */
  function inTheMenu(section: 'save' | 'load', options?: { refusing?: boolean }) {
    const created = createRoot(options);
    created.root.newGame();
    created.root.ui.openGameMenu(section);
    return created;
  }

  const question = (root: RootStore) =>
    root.ui.overlay?.type === 'gameMenu' ? root.ui.overlay.question : undefined;

  it('saves into an empty slot at once, and says so', () => {
    const { root } = inTheMenu('save');
    root.requestSave(3);

    expect(root.saves.game(3)).not.toBeNull();
    expect(question(root)).toBeNull();
    expect(root.ui.notice).toMatchObject({ text: 'Сохранено в слот 3', tone: 'info' });
  });

  it('asks before overwriting a slot, and overwrites on yes', () => {
    const { root } = inTheMenu('save');
    root.requestSave(1);
    const first = root.saves.game(1);
    root.game.advance();

    root.requestSave(1);
    expect(question(root)).toEqual({ type: 'overwrite', slot: 1 });
    expect(root.saves.game(1)).toBe(first);

    root.confirmQuestion();
    expect(question(root)).toBeNull();
    expect(root.saves.preview(1)?.line?.text).toBe('Последняя');
  });

  it('says in red when storage refuses the slot', () => {
    const { root } = inTheMenu('save', { refusing: true });
    root.requestSave(2);
    expect(root.ui.notice).toMatchObject({
      text: 'Не удалось сохранить: хранилище браузера недоступно',
      tone: 'error',
    });
  });

  it('asks before deleting, and keeps the slot on no', () => {
    const { root } = inTheMenu('save');
    root.requestSave(4);

    root.requestDelete(4);
    expect(question(root)).toEqual({ type: 'delete', slot: 4 });
    root.ui.dismissQuestion();
    expect(root.saves.game(4)).not.toBeNull();

    root.requestDelete(4);
    root.confirmQuestion();
    expect(root.saves.game(4)).toBeNull();
  });

  it('asks before loading over the game on screen, then plays the save', () => {
    const { root } = inTheMenu('save');
    root.requestSave(5);
    root.game.advance();
    root.ui.showMenuSection('load');

    root.requestLoad(5);
    expect(question(root)).toEqual({ type: 'load', source: 5 });
    root.confirmQuestion();
    expect(root.ui.overlay).toBeNull();
    expect(root.game.line?.text).toBe('Первая');
  });

  it('loads at once from the main menu', () => {
    const { root } = inTheMenu('save');
    root.requestSave(6);
    root.game.advance();
    root.toMainMenu();
    root.ui.openGameMenu('load');

    root.requestLoad(6);
    expect(root.ui.screen).toBe('game');
    expect(root.ui.overlay).toBeNull();
    expect(root.game.line?.text).toBe('Первая');
  });

  it('drops the question with the section it was asked in', () => {
    const { root } = inTheMenu('save');
    root.requestSave(1);
    root.requestDelete(1);

    root.ui.showMenuSection('settings');
    expect(question(root)).toBeNull();
  });
});
