import { createSceneRegistry, type SceneRegistry } from '@engine';
import { observable } from 'mobx';
import { describe, expect, it } from 'vitest';
import { ReadingStore } from './ReadingStore';
import { createGame, fork } from './testStory';

/** A game started at its first line, read at the given speed. */
function startReading(registry?: SceneRegistry, textCps = 38) {
  const { game } = createGame({ registry });
  const settings = observable({ textCps });
  const reading = new ReadingStore(game, settings);
  game.newGame();
  return { game, reading, settings };
}

describe('ReadingStore', () => {
  it('holds a line as typing until the typewriter reports it typed out', () => {
    const { game, reading } = startReading();
    expect(reading.lineShown).toBe(false);

    reading.lineTyped(game.line!.key);
    expect(reading.lineShown).toBe(true);
  });

  it('shows a line whole on the first request mid-line and goes on with the next', () => {
    const { game, reading } = startReading();

    reading.requestAdvance();
    expect(game.line?.text).toBe('Первая');
    expect(reading.lineShown).toBe(true);

    reading.requestAdvance();
    expect(game.line?.text).toBe('Последняя');
    expect(reading.lineShown).toBe(false);
  });

  it('leaves the new line alone when the old one reports typing out late', () => {
    const { game, reading } = startReading();
    const first = game.line!.key;
    reading.finishLine();
    reading.requestAdvance();

    reading.lineTyped(first);
    expect(reading.lineShown).toBe(false);
  });

  it('shows every line whole at once when the text is instant', () => {
    const { game, reading, settings } = startReading(undefined, 0);
    expect(reading.lineShown).toBe(true);

    reading.requestAdvance();
    expect(game.line?.text).toBe('Последняя');

    settings.textCps = 38;
    expect(reading.lineShown).toBe(false);
  });

  it('brings out the options once the prompt has been read, and waits for a pick', () => {
    const { game, reading } = startReading(fork);
    expect(reading.choiceOptions).toBeNull();

    reading.requestAdvance();
    expect(reading.lineShown).toBe(true);
    expect(reading.choiceOptions).toBeNull();

    reading.requestAdvance();
    expect(reading.choiceOptions).toEqual([
      { index: 1, text: 'В парк' },
      { index: 2, text: 'Остаться' },
    ]);

    reading.requestAdvance();
    expect(game.interaction?.type).toBe('choice');
  });

  it('has the options of a choice without a prompt out at once', () => {
    const silent = createSceneRegistry(
      { intro: [{ type: 'choice', options: [{ text: 'Дальше', then: [] }] }] },
      'intro',
    );
    const { reading } = startReading(silent);

    expect(reading.choiceOptions).toEqual([{ index: 0, text: 'Дальше' }]);
  });

  it('picks with keys 1–9 among the options on screen, hidden ones not counted', () => {
    const { game, reading } = startReading(fork, 0);
    expect(reading.pickOption(1)).toBe(false);

    reading.requestAdvance();
    expect(reading.pickOption(3)).toBe(false);
    expect(reading.pickOption(1)).toBe(true);
    expect(game.line?.text).toBe('Пошли.');
  });
});
