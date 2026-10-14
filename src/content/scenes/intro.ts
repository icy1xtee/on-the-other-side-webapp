import { choice, goTo, music, narrate, option, say, scene, set, sfx, show } from '../dsl';
import type { Scene } from '../types';

// Demo story, placeholder text until the real plot (0.3). The night in the room, a knock at the
// door and the demo's one choice: every answer leaves for the street, where the branches meet.
export const intro: Scene = [
  music('theme'),
  scene('room'),
  narrate('Дождь не прекращается с вечера. Комнату освещают только мониторы.'),
  show('mila', 'neutral'),
  say('mila', 'Опять не спится? Мне тоже. Дождь будто разговаривает.'),
  narrate('Коробки после переезда так и стоят неразобранными. Чай в кружке давно остыл.'),
  show('mila', 'happy'),
  say('mila', 'А мне здесь нравится. Даже тишина какая-то своя.'),
  // The knock shakes the room; Mila steps back from the door.
  sfx('knock'),
  show('mila', 'sad', { with: 'vpunch' }),
  narrate('В дверь стучат. Три коротких удара — тихо, будто извиняясь.'),
  show('mila', 'sad', 'left', { with: 'move' }),
  say('mila', 'Кто это может быть? Третий час ночи.'),
  say('stranger', 'Можно войти?'),
  say('stranger', 'Я с другой стороны. Меня просили передать, что вас там ждут.'),
  say('mila', 'С другой стороны чего?..'),
  choice(say('mila', 'Он ждёт ответа. Что будем делать?'), [
    option('Открыть дверь', [
      set('doorAnswer', 'opened'),
      sfx('door'),
      narrate('За дверью никого. Только мокрые следы на полу — они ведут к лестнице.'),
      show('mila', 'neutral'),
      say('mila', 'Эй! Есть тут кто-нибудь?'),
      narrate('Отвечает лишь эхо где-то внизу.'),
      say('mila', 'Он не мог уйти так быстро. Пойдём посмотрим.'),
      goTo('walk'),
    ]),
    option('Спросить, кто там', [
      set('doorAnswer', 'asked'),
      say('mila', 'Кто вы? Назовитесь.'),
      say('stranger', 'Ты меня знаешь, Мила. Просто давно не слышала.'),
      sfx('steps'),
      narrate('Шаги удаляются вниз по лестнице.'),
      say('mila', 'Он знает моё имя… Я за ним.'),
      goTo('walk'),
    ]),
    option('Промолчать', [
      set('doorAnswer', 'silent'),
      narrate('Мы не отвечаем. Только дождь и тиканье часов.'),
      say('stranger', 'Я подожду внизу. Как всегда.'),
      sfx('steps'),
      say('mila', 'Как всегда?.. Я слышу его впервые.'),
      narrate('И всё же Мила снимает с вешалки куртку.'),
      goTo('walk'),
    ]),
  ]),
];
