import type { Ids, VarName, VarValue } from './ids';
import type { LocalizedText } from './text';

/** Fixed sprite positions, Ren'Py's `at left / center / right`: no pixels in the story. */
export type SpritePosition = 'left' | 'center' | 'right';

export type Command<I extends Ids = Ids> =
  // Instant: change the state, execution runs on.
  | { type: 'scene'; background: I['background'] }
  | { type: 'show'; tag: I['character']; emotion: I['emotion']; at?: SpritePosition }
  | { type: 'hide'; tag: I['character'] }
  | { type: 'music'; asset: I['music'] | null; ifChanged?: boolean }
  | { type: 'sfx'; asset: I['sfx'] }
  | { type: 'set'; name: VarName<I>; value: VarValue }
  | { type: 'jump'; scene: I['scene'] }
  // Interaction: execution stops until the player acts. No speaker means the narrator.
  | { type: 'say'; speaker?: I['speaker']; text: LocalizedText }
  | { type: 'choice'; prompt?: ChoicePrompt<I>; options: readonly ChoiceOption<I>[] };

/**
 * The line a choice asks with, on screen while the player chooses — the say statement inside a
 * Ren'Py `menu`. It belongs to the choice rather than to the line before it, so a save made at
 * the choice shows it too. No speaker means the narrator.
 */
export type ChoicePrompt<I extends Ids = Ids> = { speaker?: I['speaker']; text: LocalizedText };

export type ChoiceOption<I extends Ids = Ids> = {
  text: LocalizedText;
  // A method rather than a function property: method parameters are bivariant, so an option
  // typed with the content's own vars still fits the engine's plain `Command`.
  when?(vars: Readonly<I['vars']>): boolean;
  /**
   * Played when the option is chosen; then execution continues after the choice, like a
   * Ren'Py `menu` block. A block that ends with a `jump` leaves for another scene instead.
   */
  then: readonly Command<I>[];
};

export type InteractionCommand<I extends Ids = Ids> = Extract<
  Command<I>,
  { type: 'say' | 'choice' }
>;

/** Instant commands that only change the state; `jump` is control flow and lives apart. */
export type StateCommand<I extends Ids = Ids> = Extract<
  Command<I>,
  { type: 'scene' | 'show' | 'hide' | 'music' | 'sfx' | 'set' }
>;

export function requiresInteraction<I extends Ids>(
  command: Command<I>,
): command is InteractionCommand<I> {
  return command.type === 'say' || command.type === 'choice';
}
