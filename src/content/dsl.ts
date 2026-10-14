// Factories the story is written with. Each one builds a plain engine command, typed against
// this story's registries, and checks what a plain union can't: that an emotion belongs to
// that very character, and that a variable gets a value of its own type.

import type { LocalizedText, SpritePosition, Transition } from '@engine';
import type { BackgroundId, CharacterId, EmotionOf, MusicId, SceneId, SfxId } from './ids';
import type { SpeakerId } from './speakers';
import type { Cmd, Line, Option } from './types';
import type { GameVars } from './variables';

/**
 * Ren'Py's `with` clause: the transition the frame comes in with — `fade`, `move`, `vpunch`. The
 * line after it waits for it to end. Without one the frame dissolves, and the line doesn't wait.
 */
type WithTransition = { with?: Transition };

/** Clear the stage and set a background — Ren'Py's `scene`. */
export function scene(background: BackgroundId, options: WithTransition = {}): Cmd {
  return withTransition({ type: 'scene', background }, options);
}

/**
 * Show a character, or change the emotion of one already shown; it keeps its place unless `at`
 * is given: `show('mila', 'happy')`, `show('mila', 'happy', 'left', { with: 'move' })`,
 * `show('mila', 'sad', { with: 'vpunch' })`.
 */
export function show<C extends CharacterId>(
  tag: C,
  emotion: EmotionOf<C>,
  at?: SpritePosition | WithTransition,
  options: WithTransition = {},
): Cmd {
  if (typeof at === 'object') {
    return withTransition({ type: 'show', tag, emotion }, at);
  }
  const command: Cmd = at ? { type: 'show', tag, emotion, at } : { type: 'show', tag, emotion };
  return withTransition(command, options);
}

export function hide(tag: CharacterId, options: WithTransition = {}): Cmd {
  return withTransition({ type: 'hide', tag }, options);
}

/** No `with` key at all without a transition: a scene without any keeps its fingerprint. */
function withTransition<T extends Cmd>(command: T, options: WithTransition): T {
  return options.with ? { ...command, with: options.with } : command;
}

/** Play a track; with `ifChanged`, a track already playing is not restarted. */
export function music(asset: MusicId, options: { ifChanged?: boolean } = {}): Cmd {
  return options.ifChanged ? { type: 'music', asset, ifChanged: true } : { type: 'music', asset };
}

export function stopMusic(): Cmd {
  return { type: 'music', asset: null };
}

export function sfx(asset: SfxId): Cmd {
  return { type: 'sfx', asset };
}

export function set<K extends keyof GameVars>(name: K, value: GameVars[K]): Cmd {
  return { type: 'set', name, value };
}

/** Leave for another scene, with no way back — the skeleton of the plot. */
export function goTo(target: SceneId): Cmd {
  return { type: 'jump', scene: target };
}

export function say(speaker: SpeakerId, text: LocalizedText): Line {
  return { type: 'say', speaker, text };
}

/** A line without a speaker. */
export function narrate(text: LocalizedText): Line {
  return { type: 'say', text };
}

/**
 * A choice. A line given first stays on screen while the player chooses — the say statement
 * inside a Ren'Py `menu`: `choice(say('mila', 'Куда пойдём?'), [option(…), option(…)])`.
 */
export function choice(options: readonly Option[]): Cmd;
export function choice(prompt: Line, options: readonly Option[]): Cmd;
export function choice(...args: [readonly Option[]] | [Line, readonly Option[]]): Cmd {
  if (args.length === 1) {
    return { type: 'choice', options: args[0] };
  }
  const [{ speaker, text }, options] = args;
  return { type: 'choice', prompt: speaker ? { speaker, text } : { text }, options };
}

/**
 * One option of a choice. `then` is a reaction — a command or a block that plays and continues
 * after the choice — or a `goTo` that leaves for another scene.
 */
export function option(
  text: LocalizedText,
  then: Cmd | readonly Cmd[],
  options: { when?: (vars: Readonly<GameVars>) => boolean } = {},
): Option {
  const block = isBlock(then) ? then : [then];
  return options.when ? { text, then: block, when: options.when } : { text, then: block };
}

function isBlock(then: Cmd | readonly Cmd[]): then is readonly Cmd[] {
  return Array.isArray(then);
}
