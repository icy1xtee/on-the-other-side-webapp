import { describe, expect, it, vi } from 'vitest';
import { memorySlot } from './testDoubles';
import { createGame, path, registry, savedPosition } from './testStory';

describe('SaveStore autosave', () => {
  it('autosaves on every line, positioned on that line', () => {
    const { game, slot } = createGame();
    game.newGame();
    expect(slot.writes).toBe(1);
    expect(savedPosition(slot.value)).toEqual({ sceneId: 'intro', step: 4 });

    game.advance();
    expect(slot.writes).toBe(2);
    expect(savedPosition(slot.value)).toEqual({ sceneId: 'intro', step: 6 });
  });

  it('keeps the way taken in the save: the history and the way back', () => {
    const { game, slot } = createGame({ registry: path });
    game.newGame();
    game.advance();

    expect(JSON.parse(slot.value!)).toMatchObject({
      current: 1,
      history: [
        { kind: 'narration', text: 'Первая' },
        { kind: 'line', speaker: 'mila', text: 'Вторая' },
      ],
    });
  });

  it('finds the autosave at boot', () => {
    const before = createGame();
    before.game.newGame();

    const { saves } = createGame({ slot: memorySlot(before.slot.value) });
    expect(saves.canContinue).toBe(true);
    expect(saves.resumable?.timeline).toEqual(before.game.timeline);
  });

  it('has nothing to continue without a save', () => {
    const { saves } = createGame();
    expect(saves.canContinue).toBe(false);
    expect(saves.resumable).toBeNull();
    expect(saves.preview('auto')).toBeNull();
  });

  it('ignores a broken save, saying why in the log', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { saves } = createGame({ slot: memorySlot('{"version":2,"checkpoints":"nowhere"}') });

    expect(saves.canContinue).toBe(false);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Autosave ignored'));
    warn.mockRestore();
  });

  it('loads a save of format 1, without a way back', () => {
    const v1 = {
      version: 1,
      position: { sceneId: 'intro', step: 4 },
      sceneHash: registry.getSceneHash('intro'),
      vars: { trust: 0 },
      stage: { background: 'room', sprites: [] },
      audio: { music: 'theme' },
      savedAt: 5,
    };
    const { saves } = createGame({ slot: memorySlot(JSON.stringify(v1)) });

    expect(saves.resumable).toMatchObject({ savedAt: 5, playTime: 0 });
    expect(saves.resumable?.timeline.checkpoints).toHaveLength(1);
    expect(saves.resumable?.timeline.history).toEqual([]);
  });

  it('forgets the save once the story is over', () => {
    const { game, saves, slot } = createGame();
    game.newGame();
    game.advance();
    game.advance();

    expect(game.interaction).toEqual({ type: 'end' });
    expect(slot.value).toBeNull();
    expect(saves.canContinue).toBe(false);
  });

  it('plays on when storage refuses, and still continues within the session', () => {
    const { game, saves } = createGame({ slot: memorySlot(null, { refusing: true }) });
    game.newGame();
    game.advance();

    expect(game.line?.text).toBe('Последняя');
    expect(saves.canContinue).toBe(true);
  });

  it('tells once that autosaves fail, however many there are', () => {
    const onUnavailable = vi.fn();
    const { game } = createGame({
      slot: memorySlot(null, { refusing: true }),
      onUnavailable,
    });
    game.newGame();
    game.advance();

    expect(onUnavailable).toHaveBeenCalledOnce();
  });

  it('previews the autosave: the picture, the scene, the line and when', () => {
    const before = createGame();
    before.game.newGame();

    const { game, saves } = createGame({ slot: memorySlot(before.slot.value) });
    expect(saves.preview('auto')).toEqual({
      frame: {
        background: '/room.webp',
        sprites: [{ tag: 'mila', at: 'left', src: '/mila-happy.webp' }],
      },
      sceneTitle: 'Начало',
      line: { speaker: 'Мила', text: 'Первая' },
      savedAt: expect.any(Number),
    });
    // The preview plays nothing: the door knocks on Continue only if it did on the way.
    expect(game.state).toBeNull();
  });
});

describe('SaveStore slots', () => {
  it('puts the game on screen into a slot, and the slot shows it', () => {
    const { game, saves, slots } = createGame({ now: () => 42 });
    game.newGame();
    game.advance();

    expect(saves.saveTo(3)).toBe(true);
    expect(savedPosition(slots.get(3)!.value)).toEqual({ sceneId: 'intro', step: 6 });
    expect(saves.preview(3)).toMatchObject({
      sceneTitle: 'Начало',
      line: { speaker: null, text: 'Последняя' },
      savedAt: 42,
    });
    expect(saves.preview(1)).toBeNull();
  });

  it('has nothing to save before a game or after its end', () => {
    const { game, saves } = createGame();
    expect(saves.saveTo(1)).toBe(false);

    game.newGame();
    game.advance();
    game.advance();
    expect(saves.saveTo(1)).toBe(false);
    expect(saves.game(1)).toBeNull();
  });

  it('says so when storage refuses the slot, which stays as it was', () => {
    const slots = new Map([[2 as const, memorySlot(null, { refusing: true })]]);
    const { game, saves } = createGame({ slots });
    game.newGame();

    expect(saves.saveTo(2)).toBe(false);
    expect(saves.game(2)).toBeNull();
  });

  it('reads the slots anew when asked: a reload finds them', () => {
    const before = createGame({ registry: path });
    before.game.newGame();
    before.game.advance();
    before.saves.saveTo(5);

    const { saves } = createGame({ registry: path, slots: before.slots });
    expect(saves.game(5)).toBeNull();
    saves.readSlots();
    expect(saves.game(5)?.timeline).toEqual(before.game.timeline);
  });

  it('counts a broken slot as empty, saying why in the log', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const slots = new Map([[4 as const, memorySlot('{oops')]]);
    const { saves } = createGame({ slots });
    saves.readSlots();

    expect(saves.game(4)).toBeNull();
    expect(warn).toHaveBeenCalledWith('Slot 4 ignored: not JSON');
    warn.mockRestore();
  });

  it('empties a slot on delete', () => {
    const { game, saves, slots } = createGame();
    game.newGame();
    saves.saveTo(6);

    saves.deleteSlot(6);
    expect(saves.game(6)).toBeNull();
    expect(slots.get(6)?.value).toBeNull();
  });

  it('keeps the slots apart from the autosave', () => {
    const { game, saves, slot } = createGame();
    game.newGame();
    const writes = slot.writes;
    saves.saveTo(1);

    expect(slot.writes).toBe(writes);
    expect(saves.game('auto')).toBe(saves.resumable);
  });
});

describe('SaveStore play time', () => {
  function clockedGame(slot = memorySlot()) {
    let now = 1_000;
    const game = createGame({ slot, now: () => now });
    return { ...game, tick: (ms: number) => (now += ms) };
  }

  it('counts only while the clock runs', () => {
    const { game, saves, tick } = clockedGame();
    game.newGame();
    tick(5_000);
    expect(saves.playTime()).toBe(0);

    saves.startClock();
    tick(3_000);
    expect(saves.playTime()).toBe(3_000);

    saves.stopClock();
    tick(10_000);
    expect(saves.playTime()).toBe(3_000);
  });

  it('saves the time with every line, and on stopping the clock', () => {
    const { game, saves, slot, tick } = clockedGame();
    saves.startClock();
    game.newGame();
    tick(2_000);
    game.advance();
    expect(JSON.parse(slot.value!)).toMatchObject({ playTime: 2_000 });

    tick(4_000);
    saves.stopClock();
    expect(JSON.parse(slot.value!)).toMatchObject({ playTime: 6_000 });
  });

  it('puts the time played into a slot, and a loaded slot goes on from it', () => {
    const before = clockedGame();
    before.saves.startClock();
    before.game.newGame();
    before.tick(7_000);
    before.saves.stopClock();
    before.saves.saveTo(1);
    before.tick(3_000);

    expect(before.saves.game(1)?.playTime).toBe(7_000);
    before.game.resume(before.saves.game(1)!);
    before.saves.startClock();
    before.tick(1_000);
    expect(before.saves.playTime()).toBe(8_000);
  });

  it('goes on from the saved time on Continue, and starts from zero in a new game', () => {
    const before = clockedGame();
    before.saves.startClock();
    before.game.newGame();
    before.tick(7_000);
    before.saves.stopClock();

    const { game, saves, tick } = clockedGame(memorySlot(before.slot.value));
    game.resume(saves.resumable!);
    saves.startClock();
    tick(1_000);
    expect(saves.playTime()).toBe(8_000);

    game.newGame();
    tick(500);
    expect(saves.playTime()).toBe(500);
  });

  it('does not bring back a finished game by stopping the clock', () => {
    const { game, saves, slot } = clockedGame();
    saves.startClock();
    game.newGame();
    game.advance();
    game.advance();
    saves.stopClock();

    expect(slot.value).toBeNull();
    expect(saves.canContinue).toBe(false);
  });
});
