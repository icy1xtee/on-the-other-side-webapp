import { describe, expect, it, vi } from 'vitest';
import { memorySlot } from './testDoubles';
import { createGame } from './testStory';

describe('SaveStore', () => {
  it('autosaves on every line, positioned on that line', () => {
    const { game, slot } = createGame();
    game.newGame();
    expect(slot.writes).toBe(1);
    expect(JSON.parse(slot.value!)).toMatchObject({ position: { sceneId: 'intro', step: 4 } });

    game.advance();
    expect(slot.writes).toBe(2);
    expect(JSON.parse(slot.value!)).toMatchObject({ position: { sceneId: 'intro', step: 6 } });
  });

  it('finds the autosave at boot', () => {
    const before = createGame();
    before.game.newGame();

    const { saves } = createGame({ slot: memorySlot(before.slot.value) });
    expect(saves.canContinue).toBe(true);
    expect(saves.resumable?.state).toEqual(before.game.state);
  });

  it('has nothing to continue without a save', () => {
    const { saves } = createGame();
    expect(saves.canContinue).toBe(false);
    expect(saves.resumable).toBeNull();
  });

  it('ignores a broken save, saying why in the log', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { saves } = createGame({ slot: memorySlot('{"version":1,"position":"nowhere"}') });

    expect(saves.canContinue).toBe(false);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Autosave ignored'));
    warn.mockRestore();
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
    expect(saves.saveNow()).toBe(false);
    expect(saves.canContinue).toBe(true);
  });

  it('tells once that autosaves fail, however many there are', () => {
    const onUnavailable = vi.fn();
    const { game, saves } = createGame({
      slot: memorySlot(null, { refusing: true }),
      onUnavailable,
    });
    game.newGame();
    game.advance();
    saves.saveNow();

    expect(onUnavailable).toHaveBeenCalledOnce();
  });

  it('saves on demand, but not before a game or after its end', () => {
    const { game, saves, slot } = createGame();
    expect(saves.saveNow()).toBe(false);

    game.newGame();
    expect(saves.saveNow()).toBe(true);
    expect(slot.writes).toBe(2);

    game.advance();
    game.advance();
    expect(saves.saveNow()).toBe(false);
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

  it('goes on from the saved time on Continue, and starts from zero in a new game', () => {
    const before = clockedGame();
    before.saves.startClock();
    before.game.newGame();
    before.tick(7_000);
    before.saves.stopClock();

    const { game, saves, tick } = clockedGame(memorySlot(before.slot.value));
    game.continueGame();
    saves.startClock();
    tick(1_000);
    expect(saves.playTime()).toBe(8_000);

    game.newGame();
    tick(500);
    expect(saves.playTime()).toBe(500);
  });

  it('reads a save without play time as zero', () => {
    const first = clockedGame();
    first.game.newGame();
    const { playTime: _, ...older } = JSON.parse(first.slot.value!);

    const { game, saves } = clockedGame(memorySlot(JSON.stringify(older)));
    game.continueGame();
    expect(saves.playTime()).toBe(0);
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
