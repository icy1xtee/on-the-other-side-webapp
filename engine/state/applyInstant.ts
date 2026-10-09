import { EngineError } from '../errors';
import type { StateCommand } from '../types/command';
import type { GameState, Sprite } from './state';

/**
 * A side effect for the app to perform. Music is also in the state, but a restart of the same
 * track can't be seen in a state diff, so it is reported here too.
 */
export type Effect =
  { type: 'music'; asset: string | null; ifChanged: boolean } | { type: 'sfx'; asset: string };

export type InstantResult = {
  state: GameState;
  effect: Effect | null;
};

export function applyInstant(state: GameState, command: StateCommand): InstantResult {
  switch (command.type) {
    case 'scene':
      // Ren'Py's `scene`: clear the layer, then show the new background.
      return {
        state: { ...state, stage: { background: command.background, sprites: [] } },
        effect: null,
      };
    case 'show':
      return {
        state: {
          ...state,
          stage: { ...state.stage, sprites: showSprite(state.stage.sprites, command) },
        },
        effect: null,
      };
    case 'hide':
      return {
        state: {
          ...state,
          stage: {
            ...state.stage,
            sprites: state.stage.sprites.filter((sprite) => sprite.tag !== command.tag),
          },
        },
        effect: null,
      };
    case 'music':
      return {
        state: { ...state, audio: { music: command.asset } },
        effect: { type: 'music', asset: command.asset, ifChanged: command.ifChanged ?? false },
      };
    case 'sfx':
      return { state, effect: { type: 'sfx', asset: command.asset } };
    case 'set':
      return {
        state: { ...state, vars: { ...state.vars, [command.name]: command.value } },
        effect: null,
      };
    default: {
      const unknown: never = command;
      throw new EngineError(`Unknown instant command: ${JSON.stringify(unknown)}`);
    }
  }
}

/**
 * Ren'Py's tag rule: showing a tag that is already on screen replaces that sprite in place,
 * keeping its z-order and, unless a new `at` is given, its position. A new tag goes on top,
 * at the centre by default.
 */
function showSprite(
  sprites: readonly Sprite[],
  { tag, emotion, at }: Extract<StateCommand, { type: 'show' }>,
): Sprite[] {
  const index = sprites.findIndex((sprite) => sprite.tag === tag);
  if (index === -1) {
    return [...sprites, { tag, emotion, at: at ?? 'center' }];
  }
  return sprites.map((sprite, i) => (i === index ? { tag, emotion, at: at ?? sprite.at } : sprite));
}
