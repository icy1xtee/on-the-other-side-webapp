import { createSceneRegistry } from '@engine';
import { autorun } from 'mobx';
import { describe, expect, it } from 'vitest';
import { memorySlot } from './testDoubles';
import { createGame, fork, path } from './testStory';

describe('GameStore', () => {
  it('starts the story on the first line, with ids resolved into files and names', () => {
    const { game } = createGame();
    game.newGame();

    expect(game.frame).toEqual({
      background: '/room.webp',
      sprites: [{ tag: 'mila', at: 'left', src: '/mila-happy.webp' }],
    });
    expect(game.sceneTitle).toBe('Начало');
    expect(game.line).toEqual({
      key: 'intro:4:1',
      speaker: { name: 'Мила', portrait: '/mila-portrait.webp' },
      text: 'Первая',
    });
  });

  it('goes on to the next line, and reports the end after the last', () => {
    const { game, onEnd } = createGame();
    game.newGame();
    game.advance();
    expect(game.line).toEqual({ key: 'intro:6:2', speaker: null, text: 'Последняя' });
    expect(onEnd).not.toHaveBeenCalled();

    game.advance();
    expect(game.interaction).toEqual({ type: 'end' });
    expect(game.line).toBeNull();
    expect(onEnd).toHaveBeenCalledOnce();
  });

  it('ignores clicks when there is no line to pass', () => {
    const { game } = createGame();
    expect(() => game.advance()).not.toThrow();
    expect(game.state).toBeNull();
    expect(game.frame.sprites).toEqual([]);
  });

  it('is observable: a reaction sees each new line', () => {
    const { game } = createGame();
    const speakers: Array<string | undefined> = [];
    const stop = autorun(() => {
      speakers.push(game.line?.speaker?.name);
    });

    game.newGame();
    game.advance();
    stop();

    expect(speakers).toEqual([undefined, 'Мила', undefined]);
  });
});

describe('GameStore at a choice', () => {
  function startFork() {
    const { game } = createGame({ registry: fork });
    game.newGame();
    return game;
  }

  it('shows the prompt as the line, and only the options the player may pick', () => {
    const game = startFork();

    expect(game.line?.text).toBe('Куда пойдём?');
    expect(game.choiceOptions).toEqual([
      { index: 1, text: 'В парк' },
      { index: 2, text: 'Остаться' },
    ]);
  });

  it('plays the picked option, addressed by its place among all options', () => {
    const game = startFork();
    game.choose(1);

    expect(game.line?.text).toBe('Пошли.');
    expect(game.choiceOptions).toBeNull();
  });

  it('does not let a click on the stage skip the choice', () => {
    const game = startFork();
    game.advance();

    expect(game.interaction?.type).toBe('choice');
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
    const { game } = createGame({ registry: loop });
    game.newGame();
    const first = game.line?.key;
    game.choose(0);

    expect(game.line?.text).toBe('Ещё раз?');
    expect(game.line?.key).not.toBe(first);
  });

  it('ignores a choice when the player is reading a line', () => {
    const { game } = createGame();
    game.newGame();
    game.choose(0);

    expect(game.line?.text).toBe('Первая');
  });
});

describe('GameStore continuing', () => {
  it('resumes after a reload on the same line, with the same stage', () => {
    const before = createGame();
    before.game.newGame();
    before.game.advance();

    // A new game over the same storage: the page was reloaded.
    const { game } = createGame({ slot: memorySlot(before.slot.value) });
    expect(game.continueGame()).toBe(true);

    expect(game.line?.text).toBe('Последняя');
    expect(game.state).toEqual(before.game.state);
    expect(game.frame).toEqual(before.game.frame);
  });

  it('has nothing to continue without a save', () => {
    const { game } = createGame();
    expect(game.continueGame()).toBe(false);
    expect(game.state).toBeNull();
  });

  it('previews what Continue leads to: the picture, the line and when it was saved', () => {
    const before = createGame();
    before.game.newGame();

    const { game } = createGame({ slot: memorySlot(before.slot.value) });
    expect(game.continuePreview).toEqual({
      frame: {
        background: '/room.webp',
        sprites: [{ tag: 'mila', at: 'left', src: '/mila-happy.webp' }],
      },
      line: { speaker: 'Мила', text: 'Первая' },
      savedAt: expect.any(Number),
    });
    // The preview plays nothing: the door knocks on Continue only if it did on the way.
    expect(game.state).toBeNull();
  });

  it('has nothing to preview without a save', () => {
    expect(createGame().game.continuePreview).toBeNull();
  });
});

describe('GameStore audio', () => {
  it('plays the music and sounds the story asks for on the way to a line', () => {
    const { game, audio } = createGame();
    game.newGame();

    expect(audio.playMusic).toHaveBeenCalledWith('/theme.mp3', { ifChanged: false });
    expect(audio.playSound).toHaveBeenCalledWith('/door.mp3');

    game.advance();
    expect(audio.playSound).toHaveBeenCalledOnce();
  });

  it('brings the music back on Continue without restarting the same track', () => {
    const before = createGame();
    before.game.newGame();

    const { game, audio } = createGame({ slot: memorySlot(before.slot.value) });
    game.continueGame();

    expect(audio.playMusic).toHaveBeenCalledExactlyOnceWith('/theme.mp3', { ifChanged: true });
    // Nothing on the way to the saved line is re-executed: the door doesn't knock twice.
    expect(audio.playSound).not.toHaveBeenCalled();
  });
});

describe('GameStore history', () => {
  it('keeps the lines read by speaker, the prompt once, and the pick', () => {
    const { game } = createGame({ registry: path });
    game.newGame();
    game.advance();
    game.advance();
    game.choose(1);

    expect(game.history).toEqual([
      { kind: 'narration', text: 'Первая' },
      { kind: 'line', speaker: 'Мила', text: 'Вторая' },
      { kind: 'line', speaker: 'Мила', text: 'Куда?' },
      { kind: 'choice', text: 'Направо' },
      { kind: 'narration', text: 'Справа' },
    ]);
  });

  it('starts over with a new game, and with Continue until saves keep it', () => {
    const before = createGame({ registry: path });
    before.game.newGame();
    before.game.advance();
    before.game.newGame();
    expect(before.game.history).toEqual([{ kind: 'narration', text: 'Первая' }]);

    before.game.advance();
    const { game } = createGame({ registry: path, slot: memorySlot(before.slot.value) });
    game.continueGame();
    expect(game.history).toEqual([{ kind: 'line', speaker: 'Мила', text: 'Вторая' }]);
    expect(game.canRollBack).toBe(false);
  });
});

describe('GameStore rollback', () => {
  /** A game on the choice, past two lines. */
  function atTheChoice() {
    const created = createGame({ registry: path });
    created.game.newGame();
    created.game.advance();
    created.game.advance();
    return created;
  }

  it('has nowhere to go at the first line', () => {
    const { game } = createGame({ registry: path });
    game.newGame();
    expect(game.canRollBack).toBe(false);
    expect(game.rollBack()).toBe(false);
    expect(game.line?.text).toBe('Первая');
  });

  it('goes back to the line before: its stage and track, no sounds, the history cut', () => {
    const { game, audio, slot } = createGame({ registry: path });
    game.newGame();
    game.advance();
    expect(audio.playSound).toHaveBeenCalledOnce();

    expect(game.rollBack()).toBe(true);
    expect(game.line?.text).toBe('Первая');
    expect(game.frame.sprites).toEqual([]);
    expect(audio.playMusic).toHaveBeenLastCalledWith('/theme.mp3', { ifChanged: true });
    expect(audio.playSound).toHaveBeenCalledOnce();
    expect(game.travelled).toBe(true);
    expect(game.history).toEqual([{ kind: 'narration', text: 'Первая' }]);
    // The autosave follows: Continue picks up where the player rolled back to.
    expect(JSON.parse(slot.value!)).toMatchObject({ position: { step: 2 } });
  });

  it('rolls forward along the way taken, and stops at the newest line', () => {
    const { game } = atTheChoice();
    game.rollBack();
    expect(game.canRollForward).toBe(true);

    expect(game.rollForward()).toBe(true);
    expect(game.line?.text).toBe('Куда?');
    expect(game.canRollForward).toBe(false);
    expect(game.rollForward()).toBe(false);
  });

  it('keeps the way forward when the player reads on along it', () => {
    const { game } = atTheChoice();
    game.rollBack();
    game.rollBack();
    game.advance();

    expect(game.line?.text).toBe('Вторая');
    expect(game.travelled).toBe(false);
    expect(game.canRollForward).toBe(true);
    expect(game.history.map((entry) => entry.text)).toEqual(['Первая', 'Вторая']);
  });

  it('lets a choice be made again: another pick forgets the way forward, the same keeps it', () => {
    const { game } = atTheChoice();
    game.choose(0);
    game.advance();
    game.rollBack();
    game.rollBack();
    expect(game.line?.text).toBe('Куда?');

    game.choose(0);
    expect(game.line?.text).toBe('Слева');
    expect(game.canRollForward).toBe(true);

    game.rollBack();
    game.choose(1);
    expect(game.line?.text).toBe('Справа');
    expect(game.canRollForward).toBe(false);
    expect(game.history.slice(-2)).toEqual([
      { kind: 'choice', text: 'Направо' },
      { kind: 'narration', text: 'Справа' },
    ]);
  });

  it('rolls forward through a choice with the pick made before', () => {
    const { game } = atTheChoice();
    game.choose(1);
    game.rollBack();
    game.rollForward();

    expect(game.line?.text).toBe('Справа');
    expect(game.history.at(-2)).toEqual({ kind: 'choice', text: 'Направо' });
  });
});
