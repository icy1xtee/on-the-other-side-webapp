import { narrate, say, scene, set, show } from '../dsl';
import { choice, goTo, option, type DevScene } from './dsl';

// A fork with reactions, one of them holding a choice of its own, then two big branches that
// leave for scenes of their own. Placeholder text, Russian only: not part of the game.
export const branching: DevScene = [
  scene('room'),
  show('mila', 'neutral'),
  narrate('Dev-сцена: проверка выборов. В игру не входит.'),
  choice(say('mila', 'Как ты сегодня?'), [
    option('Отлично!', [show('mila', 'happy'), say('mila', 'Вот и я тоже.'), set('trust', 1)]),
    option('Так себе.', [
      show('mila', 'sad'),
      choice(say('mila', 'Что-то случилось?'), [
        option('Голова болит.', say('mila', 'Тогда начнём с кофе.')),
        option('Не хочу об этом.', say('mila', 'Понимаю.')),
      ]),
    ]),
  ]),
  narrate('Обе реакции сходятся здесь, за развилкой.'),
  // A long prompt: two lines while it types, cut to one when the options come out.
  choice(
    narrate(
      'Мила застёгивает куртку и смотрит в окно: на улице темнеет, зажглись фонари, а дома ' +
        'тепло и пахнет чаем, и уходить никуда не хочется. Куда дальше?',
    ),
    [
      option('На улицу', [set('metMila', true), goTo('branchingStreet')]),
      option('Остаться дома', goTo('branchingHome')),
    ],
  ),
];

export const branchingStreet: DevScene = [
  scene('street'),
  show('mila', 'neutral', 'right'),
  say('mila', 'Здесь всегда так тихо.'),
  // No prompt: the panel stays, empty, with its system buttons.
  choice([
    // Offered only to whoever answered «Отлично!» back in the room.
    option('Взять её за руку', [show('mila', 'happy'), narrate('Мила улыбается.')], {
      when: (vars) => vars.trust >= 1,
    }),
    option('Идти молча', narrate('Вы идёте молча.')),
  ]),
  narrate('Конец ветки «улица».'),
];

export const branchingHome: DevScene = [
  // No `scene` here: the room and Mila stay — a jump doesn't clear the stage by itself.
  narrate('Комната и Мила на месте: переход сам по себе кадр не сбрасывает.'),
  // `metMila` is set only on the way out, so every option is ruled out and the choice is skipped.
  choice(narrate('Этого выбора не должно быть видно.'), [
    option('Скрытый вариант', narrate('И этой реплики тоже.'), { when: (vars) => vars.metMila }),
  ]),
  narrate('Выбор без доступных вариантов пропущен.'),
  narrate('Конец ветки «дома».'),
];
