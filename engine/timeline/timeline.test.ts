import { describe, expect, it } from 'vitest';
import type { GameState } from '../state/state';
import {
  arrive,
  goesTheSameWay,
  HISTORY_LENGTH,
  rollBack,
  rollForward,
  ROLLBACK_LENGTH,
  shownEntries,
  startTimeline,
  type Checkpoint,
  type Timeline,
} from './timeline';

/** A checkpoint at step `step`, showing narration `text`. */
function at(step: number, text = `Реплика ${step}`): Checkpoint {
  const state = { position: { sceneId: 'intro', step } } as GameState;
  return { state, entries: [{ kind: 'narration', text }] };
}

/** A game through `count` lines, one after another. */
function through(count: number): Timeline {
  let timeline = startTimeline(at(0));
  for (let step = 1; step < count; step += 1) {
    timeline = arrive(timeline, at(step));
  }
  return timeline;
}

const texts = (timeline: Timeline) => timeline.history.map((entry) => entry.text);

describe('timeline', () => {
  it('keeps the history of the way, the line on screen included', () => {
    const timeline = through(3);
    expect(texts(timeline)).toEqual(['Реплика 0', 'Реплика 1', 'Реплика 2']);
    expect(timeline.current).toBe(2);
  });

  it('rolls back a step at a time, taking the lines off the history, down to the first', () => {
    let timeline: Timeline | null = through(3);
    timeline = rollBack(timeline)!;
    expect(timeline.current).toBe(1);
    expect(texts(timeline)).toEqual(['Реплика 0', 'Реплика 1']);

    timeline = rollBack(rollBack(timeline)!);
    expect(timeline).toBeNull();
  });

  it('rolls forward along the way taken, putting the lines back, up to the newest', () => {
    const back = rollBack(rollBack(through(3))!)!;
    const forward = rollForward(back)!;
    expect(forward.current).toBe(1);
    expect(texts(forward)).toEqual(['Реплика 0', 'Реплика 1']);

    expect(rollForward(rollForward(forward)!)).toBeNull();
  });

  it('forgets the way forward once the player goes another way', () => {
    const back = rollBack(rollBack(through(3))!)!;
    const elsewhere = arrive(back, at(7, 'Другая'));

    expect(elsewhere.checkpoints).toHaveLength(2);
    expect(texts(elsewhere)).toEqual(['Реплика 0', 'Другая']);
    expect(rollForward(elsewhere)).toBeNull();
  });

  it('remembers a pick, and goes the same way only with the same pick', () => {
    const choice = startTimeline(at(0, 'Куда?'));
    const picked = arrive(choice, { ...at(1), entries: [{ kind: 'choice', text: 'Налево' }] }, 0);
    expect(picked.checkpoints[0]?.chosen).toBe(0);

    const back = rollBack(picked)!;
    expect(goesTheSameWay(back, 0)).toBe(true);
    expect(goesTheSameWay(back, 1)).toBe(false);
    expect(goesTheSameWay(through(2), undefined)).toBe(false);
    expect(goesTheSameWay(rollBack(through(2))!, undefined)).toBe(true);
  });

  it(`lets the player roll back ${ROLLBACK_LENGTH} steps, no more`, () => {
    let timeline: Timeline | null = through(ROLLBACK_LENGTH + 10);
    let steps = 0;
    while ((timeline = rollBack(timeline!))) {
      steps += 1;
    }
    expect(steps).toBe(ROLLBACK_LENGTH);
  });

  it(`keeps the last ${HISTORY_LENGTH} entries of the history`, () => {
    const timeline = through(HISTORY_LENGTH + 5);
    expect(timeline.history).toHaveLength(HISTORY_LENGTH);
    expect(timeline.history.at(-1)?.text).toBe(`Реплика ${HISTORY_LENGTH + 4}`);
  });

  it('records a spoken line, narration and a prompt, and nothing for the end', () => {
    expect(shownEntries({ type: 'say', speaker: 'mila', text: 'Привет' })).toEqual([
      { kind: 'line', speaker: 'mila', text: 'Привет' },
    ]);
    expect(shownEntries({ type: 'say', text: 'Тихо' })).toEqual([
      { kind: 'narration', text: 'Тихо' },
    ]);
    expect(shownEntries({ type: 'choice', prompt: { text: 'Куда?' }, options: [] })).toEqual([
      { kind: 'narration', text: 'Куда?' },
    ]);
    expect(shownEntries({ type: 'choice', options: [] })).toEqual([]);
    expect(shownEntries({ type: 'end' })).toEqual([]);
  });
});
