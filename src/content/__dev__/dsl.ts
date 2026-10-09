// Factories for the dev scenes. The story's own factories build commands that may jump to story
// scenes only; these three also reach the dev scenes. Everything else comes from ../dsl.

import type { ChoiceOption, Command, LocalizedText } from '@engine';
import type { SceneId } from '../ids';
import type { ContentIds, Line } from '../types';
import type { GameVars } from '../variables';

export const devSceneIds = ['branching', 'branchingStreet', 'branchingHome'] as const;
export type DevSceneId = (typeof devSceneIds)[number];

/** The story's ids, with the dev scenes added as jump targets. */
type DevIds = Omit<ContentIds, 'scene'> & { scene: SceneId | DevSceneId };
export type DevCmd = Command<DevIds>;
export type DevScene = readonly DevCmd[];
type DevOption = ChoiceOption<DevIds>;

export function goTo(target: SceneId | DevSceneId): DevCmd {
  return { type: 'jump', scene: target };
}

export function choice(options: readonly DevOption[]): DevCmd;
export function choice(prompt: Line, options: readonly DevOption[]): DevCmd;
export function choice(...args: [readonly DevOption[]] | [Line, readonly DevOption[]]): DevCmd {
  if (args.length === 1) {
    return { type: 'choice', options: args[0] };
  }
  const [{ speaker, text }, options] = args;
  return { type: 'choice', prompt: speaker ? { speaker, text } : { text }, options };
}

export function option(
  text: LocalizedText,
  then: DevCmd | readonly DevCmd[],
  options: { when?: (vars: Readonly<GameVars>) => boolean } = {},
): DevOption {
  const block = isBlock(then) ? then : [then];
  return options.when ? { text, then: block, when: options.when } : { text, then: block };
}

function isBlock(then: DevCmd | readonly DevCmd[]): then is readonly DevCmd[] {
  return Array.isArray(then);
}
