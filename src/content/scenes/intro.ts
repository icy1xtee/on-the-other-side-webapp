import { goTo, hide, music, narrate, say, scene, set, sfx, show } from '../dsl';
import type { Scene } from '../types';

// Demo scene with placeholder text: walks through every instant command.
export const intro: Scene = [
  music('theme'),
  scene('room'),
  narrate('Утро. Свет пробивается сквозь шторы.'),
  sfx('door'),
  say('stranger', 'Можно войти?'),
  show('anna', 'neutral'),
  say('anna', 'Привет. Я Анна.'),
  set('metAnna', true),
  show('anna', 'happy', 'left'),
  say('anna', 'Рада, что ты здесь. Пойдём, покажу улицу.'),
  hide('anna'),
  narrate('Анна вышла в коридор.'),
  goTo('walk'),
];
