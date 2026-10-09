// Test content, not part of the game: scenes that put the engine through what the linear demo
// story doesn't — choices, conditions, jumps between scenes. Played on the dev server only, with
// `?dev=branching` (see main.tsx); production builds leave this folder out.

import { branching, branchingHome, branchingStreet } from './branching';
import type { DevScene, DevSceneId } from './dsl';

export const devScenes = { branching, branchingStreet, branchingHome } satisfies Record<
  DevSceneId,
  DevScene
>;

export const devStartScene: DevSceneId = 'branching';
