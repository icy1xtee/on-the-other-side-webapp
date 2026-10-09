import { music, narrate, say, scene, set, show } from '../dsl';
import type { Scene } from '../types';

// Second demo scene: reached through `goTo`, ends the game by running out.
export const walk: Scene = [
  scene('street'),
  music('theme', { ifChanged: true }),
  show('mila', 'sad', 'right'),
  say('mila', 'Здесь всегда так тихо.'),
  set('trust', 1),
  narrate('Конец демо-сцены.'),
];
