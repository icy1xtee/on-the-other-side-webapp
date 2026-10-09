import { music, narrate, say, scene, set, show } from '../dsl';
import type { Scene } from '../types';

// Second demo scene: reached through `goTo`, ends the game by running out.
export const walk: Scene = [
  scene('street'),
  music('theme', { ifChanged: true }),
  show('anna', 'sad', 'right'),
  say('anna', 'Здесь всегда так тихо.'),
  set('trust', 1),
  narrate('Конец демо-сцены.'),
];
