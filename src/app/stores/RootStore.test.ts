import { describe, expect, it } from 'vitest';
import { RootStore } from './RootStore';
import { fakeAudio, memorySlot } from './testDoubles';
import { presentation, registry } from './testStory';

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
