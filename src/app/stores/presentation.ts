import {
  run,
  type Effect,
  type GameState,
  type HistoryEntry,
  type Interaction,
  type SceneRegistry,
  type SpritePosition,
  type Transition,
} from '@engine';

// What the player sees, worked out from the engine's state: ids become files and names. Pure
// functions over plain data — the stores call them from their computed views, the tests call
// them directly.

/** What turns the engine's ids into pictures, names and sounds. Supplied by content at boot. */
export type Presentation = {
  speakers: Readonly<Record<string, { name: string }>>;
  /** What the player calls each scene. A scene without one (a dev scene) has no title. */
  sceneTitles: Readonly<Partial<Record<string, string>>>;
  assets: {
    backgrounds: Readonly<Record<string, string>>;
    characters: Readonly<Record<string, Readonly<Record<string, string>>>>;
    portraits: Readonly<Record<string, string>>;
    music: Readonly<Record<string, string>>;
    /** May lack a sound: one without a file plays nothing. */
    sounds: Readonly<Partial<Record<string, string>>>;
  };
};

export type SpriteView = {
  tag: string;
  src: string | undefined;
  at: SpritePosition;
};

/** A picture of the scene: the background and the characters over it, as files. */
export type FrameView = {
  background: string | undefined;
  sprites: SpriteView[];
};

export type LineView = {
  /**
   * Changes with every line, even when two lines read the same or the story comes back to the
   * same step: restarts the typewriter and the reading of a choice's prompt.
   */
  key: string;
  speaker: { name: string; portrait: string | undefined } | null;
  text: string;
};

export type OptionView = {
  /** The option's place among all the choice's options, hidden ones included: what `choose` takes. */
  index: number;
  text: string;
};

/** A line as the menu quotes it: the speaker's name and the text, untranslated. */
export type QuotedLine = { speaker: string | null; text: string };

/** A save as the menus show it: the Continue card, a slot. */
export type SavePreview = {
  frame: FrameView;
  /** The title of the scene there, untranslated; empty for a scene without one. */
  sceneTitle: string;
  /** The line on screen there; null if the save stands on a choice without a prompt. */
  line: QuotedLine | null;
  /** Milliseconds since the epoch. */
  savedAt: number;
};

/**
 * An explicit transition — the story's `with` — the frame of a line comes in with. The key
 * changes with every one, so the same transition twice in a row plays twice.
 */
export type TransitionView = { kind: Transition; key: number };

/**
 * The transition the frame changes with on the way to a line: the last `with` met. The engine
 * gathers every change up to the line into one frame, so it has one transition; Ren'Py would play
 * several `with`s one after another. Null without any: the frame dissolves.
 */
export function frameTransition(effects: readonly Effect[]): Transition | null {
  const last = effects.findLast((effect) => effect.type === 'transition');
  return last?.type === 'transition' ? last.transition : null;
}

/** The frame of a state; no state draws an empty stage. */
export function frameView(state: GameState | null, presentation: Presentation): FrameView {
  if (!state) {
    return { background: undefined, sprites: [] };
  }
  const { backgrounds, characters } = presentation.assets;
  const { background, sprites } = state.stage;
  return {
    background: background ? backgrounds[background] : undefined,
    sprites: sprites.map(({ tag, emotion, at }) => ({ tag, at, src: characters[tag]?.[emotion] })),
  };
}

/** The line on screen — the one being read, or the prompt of a choice — under the given key. */
export function lineView(
  interaction: Interaction | null,
  key: string,
  presentation: Presentation,
): LineView | null {
  const shown = shownLine(interaction);
  if (!shown) {
    return null;
  }
  const { portraits } = presentation.assets;
  const { speaker, text } = shown;
  return {
    key,
    speaker: speaker
      ? { name: speakerName(speaker, presentation), portrait: portraits[speaker] }
      : null,
    text,
  };
}

/**
 * The options of a choice the player may pick, or null when there is no choice. Options ruled out
 * by their condition are left out — hidden, as in Ren'Py.
 */
export function optionViews(interaction: Interaction | null): OptionView[] | null {
  if (interaction?.type !== 'choice') {
    return null;
  }
  return interaction.options.flatMap((option, index) =>
    option.available ? [{ index, text: option.text }] : [],
  );
}

/** The title of the scene a state stands in, untranslated; empty for a scene without one. */
export function sceneTitle(state: GameState | null, presentation: Presentation): string {
  const sceneId = state?.position.sceneId;
  return (sceneId && presentation.sceneTitles[sceneId]) || '';
}

/** The line an interaction shows, quoted with its speaker's name; null if it shows none. */
export function quotedLine(
  interaction: Interaction | null,
  presentation: Presentation,
): QuotedLine | null {
  const shown = shownLine(interaction);
  return (
    shown && {
      speaker: shown.speaker ? speakerName(shown.speaker, presentation) : null,
      text: shown.text,
    }
  );
}

/**
 * What a save shows of itself, from the state it stands on. The line comes from running that
 * state — the same `run` loading does, without its effects.
 */
export function savePreview(
  state: GameState,
  savedAt: number,
  registry: SceneRegistry,
  presentation: Presentation,
): SavePreview {
  return {
    frame: frameView(state, presentation),
    sceneTitle: sceneTitle(state, presentation),
    line: quotedLine(run(state, registry).interaction, presentation),
    savedAt,
  };
}

/** The line an interaction shows: a spoken or narrated line, or the prompt of a choice. */
function shownLine(interaction: Interaction | null) {
  if (interaction?.type === 'say') {
    return interaction;
  }
  return interaction?.type === 'choice' ? (interaction.prompt ?? null) : null;
}

function speakerName(speaker: string, presentation: Presentation): string {
  return presentation.speakers[speaker]?.name ?? speaker;
}

/** An entry of the History section: a speaker by name, the text untranslated. */
export type HistoryView =
  | { kind: 'line'; speaker: string; text: string }
  | { kind: 'narration'; text: string }
  | { kind: 'choice'; text: string };

/** The history as the History section lists it, oldest first. */
export function historyView(
  entries: readonly HistoryEntry[],
  presentation: Presentation,
): HistoryView[] {
  return entries.map((entry) =>
    entry.kind === 'line' ? { ...entry, speaker: speakerName(entry.speaker, presentation) } : entry,
  );
}
