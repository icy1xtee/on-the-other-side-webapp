import type { Interaction } from '../interpreter/interpreter';
import type { GameState } from '../state/state';

// The way the player has come through the story: the checkpoints rollback returns to and the
// history read on the way — Ren'Py's rollback log and `_history_list`. Pure functions over plain
// data: the app keeps the result, a save stores it whole.

/** Ren'Py's `config.history_length`: how many entries the history keeps. */
export const HISTORY_LENGTH = 250;

/** Ren'Py's `config.rollback_length`: how many steps the player can roll back. */
export const ROLLBACK_LENGTH = 128;

/**
 * One entry of the history, kept as keys — the speaker's id and the Russian line — so it is
 * translated when shown, in whatever language the player reads then.
 */
export type HistoryEntry =
  | { kind: 'line'; speaker: string; text: string }
  | { kind: 'narration'; text: string }
  | { kind: 'choice'; text: string };

/** A line or a choice the game stopped at, as rollback keeps it. */
export type Checkpoint = {
  /** On the interaction: what a save stores, what `run` picks up. */
  state: GameState;
  /** What arriving here added to the history: the choice that led here, then the line shown. */
  entries: readonly HistoryEntry[];
  /** The option picked here, once one has been. */
  chosen?: number;
};

/**
 * Checkpoints oldest first, the one on screen at `current`. Those after it are the way forward
 * the player rolled back over: kept until they go another way. The history isn't in the
 * checkpoints — 128 copies of 250 entries would bloat a save — each checkpoint knows what it
 * added, and rolling back takes that off the history's end.
 */
export type Timeline = {
  checkpoints: readonly Checkpoint[];
  current: number;
  history: readonly HistoryEntry[];
};

/** A new game or one picked up: no way back yet. */
export function startTimeline(checkpoint: Checkpoint): Timeline {
  return { checkpoints: [checkpoint], current: 0, history: keep(checkpoint.entries) };
}

/**
 * The story went on to a new line or choice — by a pick, when `chosen` is given. The way forward
 * from the checkpoint left is replaced by this one; the oldest checkpoints fall off past
 * `ROLLBACK_LENGTH` steps back.
 */
export function arrive(timeline: Timeline, checkpoint: Checkpoint, chosen?: number): Timeline {
  const passed = timeline.checkpoints.slice(0, timeline.current + 1);
  const left = passed[passed.length - 1];
  if (left && chosen !== undefined) {
    passed[passed.length - 1] = { ...left, chosen };
  }
  const checkpoints = [...passed, checkpoint].slice(-(ROLLBACK_LENGTH + 1));
  return {
    checkpoints,
    current: checkpoints.length - 1,
    history: keep([...timeline.history, ...checkpoint.entries]),
  };
}

/**
 * Whether a step from the checkpoint on screen goes the way taken before: a line always does, a
 * choice only with the same pick.
 */
export function goesTheSameWay(timeline: Timeline, chosen?: number): boolean {
  const here = timeline.checkpoints[timeline.current];
  return timeline.current < timeline.checkpoints.length - 1 && here?.chosen === chosen;
}

/** One checkpoint back, its entries off the history. Null at the oldest one. */
export function rollBack(timeline: Timeline): Timeline | null {
  const left = timeline.checkpoints[timeline.current];
  if (timeline.current === 0 || !left) {
    return null;
  }
  const history = timeline.history.slice(
    0,
    Math.max(0, timeline.history.length - left.entries.length),
  );
  return { ...timeline, current: timeline.current - 1, history };
}

/** One checkpoint forward along the way taken before, its entries back. Null at the newest one. */
export function rollForward(timeline: Timeline): Timeline | null {
  const next = timeline.checkpoints[timeline.current + 1];
  if (!next) {
    return null;
  }
  return {
    ...timeline,
    current: timeline.current + 1,
    history: keep([...timeline.history, ...next.entries]),
  };
}

function keep(history: readonly HistoryEntry[]): readonly HistoryEntry[] {
  return history.length > HISTORY_LENGTH ? history.slice(-HISTORY_LENGTH) : history;
}

/**
 * What showing an interaction puts in the history: its line, or the prompt of a choice — once,
 * as a line. A choice without a prompt and the end put nothing.
 */
export function shownEntries(interaction: Interaction): HistoryEntry[] {
  const line =
    interaction.type === 'say'
      ? interaction
      : interaction.type === 'choice'
        ? interaction.prompt
        : null;
  if (!line) {
    return [];
  }
  return [
    line.speaker
      ? { kind: 'line', speaker: line.speaker, text: line.text }
      : { kind: 'narration', text: line.text },
  ];
}
