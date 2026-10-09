import { goTo, hide, music, narrate, say, scene, set, sfx, show } from '../dsl';
import type { Scene } from '../types';

// Demo scene with placeholder text: walks through every instant command.
export const intro: Scene = [
  music('theme'),
  scene('room'),
  narrate('Утро. Свет пробивается сквозь шторы.'),
  sfx('door'),
  say('stranger', 'Можно войти?'),
  show('mila', 'neutral'),
  say('mila', 'Привет. Я Мила.'),
  set('metMila', true),
  show('mila', 'happy', 'left'),
  say('mila', 'Рада, что ты здесь. Пойдём, покажу улицу.'),
  hide('mila'),
  narrate('Мила вышла в коридор.'),
  goTo('walk'),
];
