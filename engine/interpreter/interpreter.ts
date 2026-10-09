import { EngineError } from '../errors';
import type { SceneRegistry } from '../program/sceneRegistry';
import { applyInstant, type Effect } from '../state/applyInstant';
import { createInitialState, type GameState, type Position } from '../state/state';
import type { VarValue } from '../types/ids';
import type { LocalizedText } from '../types/text';

/**
 * Most instructions one run may execute without reaching the player. Ren'Py guards against
 * runaway scripts with a timer ("Possible infinite loop"), because its scripts run arbitrary
 * Python; ours only run O(1) commands over data, so counting steps is enough, and it is
 * deterministic in tests. A real scene runs a few dozen instant commands in a row at most.
 */
export const STEP_LIMIT = 10_000;

export type ChoiceView = {
  text: LocalizedText;
  /** False when the option's `when` condition does not hold for the current vars. */
  available: boolean;
};

/** What the player is looking at now. */
export type Interaction =
  | { type: 'say'; speaker?: string; text: LocalizedText }
  | { type: 'choice'; options: ChoiceView[] }
  /** The script ran out. Like Ren'Py with an empty call stack: the game is over. */
  | { type: 'end' };

export type RunResult = {
  /** Positioned on the interaction itself, which is what a save stores. */
  state: GameState;
  interaction: Interaction;
  /** Sounds and music changes met on the way, in order. */
  effects: Effect[];
};

/** A new game: the start scene, every variable at its default. */
export function startGame(
  registry: SceneRegistry,
  variableDefaults: Readonly<Record<string, VarValue>>,
): RunResult {
  return run(createInitialState(registry.startScene, variableDefaults), registry);
}

/**
 * Executes from the current position until an instruction that needs the player — Ren'Py's
 * `run_context`. Called on a loaded save, it stops at once on the saved line: loading needs
 * no replay.
 */
export function run(state: GameState, registry: SceneRegistry): RunResult {
  let current = state;
  const effects: Effect[] = [];

  for (let executed = 0; executed < STEP_LIMIT; executed++) {
    const { sceneId, step } = current.position;
    const instruction = registry.getProgram(sceneId)[step];

    if (!instruction) {
      return { state: current, interaction: { type: 'end' }, effects };
    }

    switch (instruction.type) {
      case 'say':
        return {
          state: current,
          interaction: { type: 'say', speaker: instruction.speaker, text: instruction.text },
          effects,
        };
      case 'choice':
        return {
          state: current,
          interaction: {
            type: 'choice',
            options: instruction.options.map((option) => ({
              text: option.text,
              available: option.when?.(current.vars) ?? true,
            })),
          },
          effects,
        };
      case 'jump':
        current = moveTo(current, { sceneId: instruction.scene, step: 0 });
        break;
      case 'goto':
        current = moveTo(current, { sceneId, step: instruction.step });
        break;
      default: {
        const result = applyInstant(current, instruction);
        if (result.effect) {
          effects.push(result.effect);
        }
        current = moveTo(result.state, { sceneId, step: step + 1 });
      }
    }
  }

  const { sceneId, step } = current.position;
  throw new EngineError(
    `Step limit of ${STEP_LIMIT} exceeded at scene "${sceneId}", step ${step}: ` +
      'probably jumps going round in a loop without a single line or choice',
  );
}

/** The player has read the current line: move past it and run on to the next interaction. */
export function advance(state: GameState, registry: SceneRegistry): RunResult {
  const { sceneId, step } = state.position;
  const instruction = registry.getProgram(sceneId)[step];
  if (instruction?.type !== 'say') {
    throw new EngineError(
      `advance() needs a line at scene "${sceneId}", step ${step}, ` +
        `but found ${instruction ? `a ${instruction.type}` : 'the end of the scene'}`,
    );
  }
  return run(moveTo(state, { sceneId, step: step + 1 }), registry);
}

function moveTo(state: GameState, position: Position): GameState {
  return { ...state, position };
}
