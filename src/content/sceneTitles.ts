import type { SceneId } from './ids';

/**
 * What the player calls each scene: under the dialogue panel's buttons, and on save slots later.
 * Story text like the lines — the Russian title is the key of its translation. `satisfies`
 * makes a scene without a title a compile error.
 */
export const sceneTitles = {
  intro: 'Стук в дверь',
  walk: 'Тихая улица',
  home: 'Снова дома',
} satisfies Record<SceneId, string>;
