import { narrate, say, scene, show } from '../dsl';
import type { Scene } from '../types';

// Back in the room: the demo ends by running out, and the game returns to the main menu.
export const home: Scene = [
  scene('room'),
  narrate('Дома всё так же светятся мониторы. Дождь вернулся и больше не торопится.'),
  show('mila', 'neutral', 'left'),
  say('mila', 'Знаешь, я рада, что мы вышли. Даже если ничего не нашли.'),
  narrate('На стекле — отпечаток ладони. С той стороны окна.'),
  show('mila', 'sad'),
  say('mila', 'Завтра он постучит снова. Не знаю почему, но я уверена.'),
  show('mila', 'happy'),
  say('mila', 'Хорошо, что ты здесь.'),
  narrate('Конец демо.'),
];
