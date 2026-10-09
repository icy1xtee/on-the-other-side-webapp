import type { SceneId } from '../ids';
import type { Scene } from '../types';
import { intro } from './intro';
import { walk } from './walk';

/** Every scene by id. `satisfies` makes a declared scene without commands a compile error. */
export const scenes = { intro, walk } satisfies Record<SceneId, Scene>;

export const startScene: SceneId = 'intro';
