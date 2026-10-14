import { goTo, hide, music, narrate, say, scene, sfx, show } from '../dsl';
import type { Scene } from '../types';

// Where the branches of the knock meet: the night street and the voice from behind another door.
export const walk: Scene = [
  scene('street', { with: 'fade' }),
  music('theme', { ifChanged: true }),
  sfx('steps'),
  narrate('Улица пуста. Фонари горят ровно, не мигая, а дождь почти перестал.'),
  show('mila', 'neutral', 'right'),
  say('mila', 'Здесь всегда так тихо.'),
  say('mila', 'Слышишь? Будто город задержал дыхание.'),
  narrate('Голос доносится из-за двери закрытой лавки на углу.'),
  say('stranger', 'Сюда. Не бойтесь, здесь сухо.'),
  show('mila', 'sad'),
  say('mila', 'Мне кажется, я уже была здесь. Только улица была другой.'),
  say('mila', 'Кто-то держал меня за руку и просил не оборачиваться.'),
  say('stranger', 'На той стороне тоже идёт дождь. Только слышно его иначе.'),
  narrate('Голос стихает. В луже у двери отражаются фонари, которых на этой улице нет.'),
  say('mila', 'Пойдём домой. Сегодня я ничего не хочу решать.'),
  hide('mila'),
  goTo('home'),
];
