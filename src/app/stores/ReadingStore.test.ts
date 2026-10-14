import { createSceneRegistry, type SceneRegistry } from '@engine';
import { observable } from 'mobx';
import { describe, expect, it } from 'vitest';
import type { SkipMode } from '@/shared/config/settings';
import { PersistentStore } from './PersistentStore';
import { autoForwardMs, ReadingStore, SKIP_DELAY_MS } from './ReadingStore';
import { memorySlot } from './testDoubles';
import { createGame, fork, path } from './testStory';

type Options = { textCps?: number; autoDelay?: number; skipMode?: SkipMode };

/** A game started at its first line, read with the given settings. */
function startReading(
  registry?: SceneRegistry,
  options: Options = {},
  persistent = new PersistentStore(memorySlot()),
) {
  const { game } = createGame({ registry });
  const settings = observable({
    textCps: 38,
    autoDelay: 2,
    skipMode: 'read' as SkipMode,
    ...options,
  });
  const reading = new ReadingStore(game, settings, persistent);
  game.newGame();
  return { game, reading, settings, persistent };
}

/** Three lines, a choice whose options go on to two lines more: a story long enough to skip. */
const story = createSceneRegistry(
  {
    intro: [
      { type: 'say', text: 'Первая' },
      { type: 'say', speaker: 'mila', text: 'Вторая' },
      { type: 'say', text: 'Третья' },
      {
        type: 'choice',
        prompt: { speaker: 'mila', text: 'Куда?' },
        options: [
          { text: 'Налево', then: [{ type: 'say', text: 'Слева' }] },
          { text: 'Направо', then: [{ type: 'say', text: 'Справа' }] },
        ],
      },
      { type: 'say', text: 'Последняя' },
    ],
  },
  'intro',
);

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
    const { game, reading, settings } = startReading(undefined, { textCps: 0 });
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
    const { game, reading } = startReading(fork, { textCps: 0 });
    expect(reading.pickOption(1)).toBe(false);

    reading.requestAdvance();
    expect(reading.pickOption(3)).toBe(false);
    expect(reading.pickOption(1)).toBe(true);
    expect(game.line?.text).toBe('Пошли.');
  });
});

describe('ReadingStore: what has been read', () => {
  it('marks a line read once the player goes past it, not while it is on screen', () => {
    const { reading, persistent } = startReading(story, { textCps: 0 });
    expect(reading.lineRead).toBe(false);

    reading.requestAdvance();
    expect(reading.lineRead).toBe(false);

    // A new game over the same marks: the lines gone past are read now.
    const again = startReading(story, { textCps: 0 }, persistent);
    expect(again.reading.lineRead).toBe(true);
    again.reading.requestAdvance();
    expect(again.reading.lineRead).toBe(false);
  });

  it("marks a choice's prompt read once an option is picked", () => {
    const { game, reading, persistent } = startReading(fork, { textCps: 0 });
    reading.requestAdvance();
    expect(persistent.isRead('intro', 'Куда пойдём?')).toBe(false);

    reading.choose(1);
    expect(persistent.isRead('intro', 'Куда пойдём?')).toBe(true);
    expect(game.line?.text).toBe('Пошли.');
  });
});

describe('ReadingStore: Auto', () => {
  it('waits the pause from the settings once a line is out, then goes on', () => {
    const { game, reading } = startReading(story);
    reading.toggleAuto();
    expect(reading.nextStep).toBeNull();

    reading.lineTyped(game.line!.key);
    expect(reading.nextStep).toEqual({ action: 'advance', delayMs: 2000, lineKey: game.line!.key });

    reading.step();
    expect(game.line?.text).toBe('Вторая');
    expect(reading.mode).toBe('auto');
  });

  it('adds the time to read the line when the text is instant', () => {
    expect(autoForwardMs(50, { autoDelay: 2, textCps: 38 })).toBe(2000);
    // Ren'Py's (length + 25) / 250 × T, with T = 4 s.
    expect(autoForwardMs(50, { autoDelay: 2, textCps: 0 })).toBe(3200);
  });

  it('reads the prompt of a choice by itself and waits for the pick, then goes on', () => {
    const { game, reading } = startReading(story, { textCps: 0 });
    reading.toggleAuto();
    reading.step();
    reading.step();
    reading.step();
    expect(game.line?.text).toBe('Куда?');
    expect(reading.nextStep?.action).toBe('reveal');

    reading.step();
    expect(reading.choiceOptions).toHaveLength(2);
    expect(reading.nextStep).toBeNull();

    reading.choose(1);
    expect(game.line?.text).toBe('Справа');
    expect(reading.nextStep?.action).toBe('advance');
  });

  it('ends with a click, which does nothing else', () => {
    const { game, reading } = startReading(story, { textCps: 0 });
    reading.toggleAuto();
    reading.requestAdvance();

    expect(reading.mode).toBeNull();
    expect(game.line?.text).toBe('Первая');
    expect(reading.nextStep).toBeNull();
  });
});

describe('ReadingStore: Skip', () => {
  /** A second pass: the first went past the three lines and the choice, then stopped. */
  function secondPass(options: Options = {}) {
    const first = startReading(story, { textCps: 0 });
    first.reading.requestAdvance();
    first.reading.requestAdvance();
    first.reading.requestAdvance();
    first.reading.requestAdvance();
    first.reading.choose(0);
    return startReading(story, options, first.persistent);
  }

  it('stops at once on a line never read', () => {
    const { game, reading } = startReading(story);
    reading.toggleSkip();
    expect(reading.nextStep?.action).toBe('stop');

    reading.step();
    expect(reading.mode).toBeNull();
    expect(game.line?.text).toBe('Первая');
  });

  it('passes read lines whole, a moment each, and stops at the choice with its options out', () => {
    const { game, reading } = secondPass();
    reading.toggleSkip();
    expect(reading.lineShown).toBe(true);
    expect(reading.nextStep).toEqual({
      action: 'advance',
      delayMs: SKIP_DELAY_MS,
      lineKey: game.line!.key,
    });

    reading.step();
    reading.step();
    reading.step();
    expect(game.line?.text).toBe('Куда?');
    reading.step();
    expect(reading.choiceOptions).toHaveLength(2);
    reading.step();
    expect(reading.mode).toBeNull();

    // And not after the pick.
    reading.choose(0);
    expect(reading.nextStep).toBeNull();
  });

  it('passes unread lines too when set to skip everything, and still stops at the choice', () => {
    const { game, reading } = startReading(story, { skipMode: 'all' });
    reading.toggleSkip();
    expect(reading.nextStep?.action).toBe('advance');

    // Three lines, the prompt read, the stop.
    for (let step = 0; step < 5; step += 1) {
      reading.step();
    }
    expect(game.line?.text).toBe('Куда?');
    expect(reading.choiceOptions).toHaveLength(2);
    expect(reading.mode).toBeNull();
  });

  it('skips while Ctrl is held, waits on an unread line, and keeps a passed line whole after', () => {
    const { game, reading } = secondPass({ textCps: 38 });
    reading.holdSkip(true);
    expect(reading.nextStep?.action).toBe('advance');
    reading.step();
    expect(game.line?.text).toBe('Вторая');

    reading.holdSkip(false);
    expect(reading.lineShown).toBe(true);
    expect(reading.nextStep).toBeNull();

    const fresh = startReading(story);
    fresh.reading.holdSkip(true);
    expect(fresh.reading.nextStep).toBeNull();
    expect(fresh.reading.mode).toBeNull();
  });

  it('turns Auto off when it comes on, and the other way round', () => {
    const { reading } = startReading(story);
    reading.toggleAuto();
    reading.toggleSkip();
    expect(reading.mode).toBe('skip');

    reading.toggleAuto();
    expect(reading.mode).toBe('auto');
    expect(reading.skipping).toBe(false);
  });

  it('ends with a click, which does nothing else', () => {
    const { game, reading } = secondPass();
    reading.toggleSkip();
    reading.requestAdvance();

    expect(reading.mode).toBeNull();
    expect(game.line?.text).toBe('Первая');
    // The line Skip was passing stays whole: no typing it out again.
    expect(reading.lineShown).toBe(true);
  });

  it('stops with both modes when the player leaves the game', () => {
    const { reading } = secondPass();
    reading.toggleSkip();
    reading.holdSkip(true);
    reading.stopModes();

    expect(reading.mode).toBeNull();
    expect(reading.skipping).toBe(false);
  });
});

describe('ReadingStore: rollback', () => {
  /** Reads a line typing at the default speed: shows it whole, then goes on. */
  function readOn(reading: ReadingStore) {
    reading.requestAdvance();
    reading.requestAdvance();
  }

  it('goes back with Auto and Skip off, the line there shown whole at once', () => {
    const { game, reading } = startReading(path);
    readOn(reading);
    reading.toggleAuto();

    reading.rollBack();
    expect(reading.mode).toBeNull();
    expect(game.line?.text).toBe('Первая');
    expect(reading.lineShown).toBe(true);
  });

  it('comes back to a choice with its options out, to pick again', () => {
    const { game, reading } = startReading(path);
    readOn(reading);
    readOn(reading);
    readOn(reading);
    reading.choose(0);
    expect(game.line?.text).toBe('Слева');

    reading.rollBack();
    expect(game.line?.text).toBe('Куда?');
    expect(reading.choiceOptions).toHaveLength(2);

    reading.rollForward();
    expect(game.line?.text).toBe('Слева');
    expect(reading.lineShown).toBe(true);
  });
});
