/**
 * The story in English. Keys are the Russian lines exactly as written in the scenes — the scenes
 * stay readable and translations live here, gettext-style. A line edited in a scene loses its
 * translation (the old key goes stale); the content test points at both sides.
 */
export const en: Readonly<Record<string, string>> = {
  // Speakers
  Мила: 'Mila',
  'Голос за дверью': 'Voice behind the door',

  // Scene titles
  'Стук в дверь': 'A knock at the door',
  'Тихая улица': 'A quiet street',
  'Снова дома': 'Home again',

  // intro
  'Дождь не прекращается с вечера. Комнату освещают только мониторы.':
    'It has been raining since evening. Only the monitors light the room.',
  'Опять не спится? Мне тоже. Дождь будто разговаривает.':
    "Can't sleep again? Me neither. It's like the rain is talking.",
  'Коробки после переезда так и стоят неразобранными. Чай в кружке давно остыл.':
    'The boxes from the move still sit unpacked. The tea in the mug went cold long ago.',
  'А мне здесь нравится. Даже тишина какая-то своя.':
    'I like it here, though. Even the silence feels like our own.',
  'В дверь стучат. Три коротких удара — тихо, будто извиняясь.':
    'Someone knocks at the door. Three short raps, quiet, almost apologetic.',
  'Кто это может быть? Третий час ночи.': "Who could that be? It's past two in the morning.",
  'Можно войти?': 'May I come in?',
  'Я с другой стороны. Меня просили передать, что вас там ждут.':
    "I'm from the other side. I was asked to tell you that you're expected there.",
  'С другой стороны чего?..': 'The other side of what?..',
  'Он ждёт ответа. Что будем делать?': "He's waiting for an answer. What do we do?",

  // intro: the choice
  'Открыть дверь': 'Open the door',
  'За дверью никого. Только мокрые следы на полу — они ведут к лестнице.':
    'No one is there. Only wet footprints on the floor, leading to the stairs.',
  'Эй! Есть тут кто-нибудь?': 'Hey! Is anyone there?',
  'Отвечает лишь эхо где-то внизу.': 'Only an echo answers, somewhere below.',
  'Он не мог уйти так быстро. Пойдём посмотрим.':
    "He couldn't have gone that fast. Let's take a look.",
  'Спросить, кто там': "Ask who's there",
  'Кто вы? Назовитесь.': 'Who are you? Tell us your name.',
  'Ты меня знаешь, Мила. Просто давно не слышала.':
    "You know me, Mila. You just haven't heard me in a long time.",
  'Шаги удаляются вниз по лестнице.': 'Footsteps fade away down the stairs.',
  'Он знает моё имя… Я за ним.': "He knows my name… I'm going after him.",
  Промолчать: 'Stay silent',
  'Мы не отвечаем. Только дождь и тиканье часов.':
    "We don't answer. Only the rain and the ticking of the clock.",
  'Я подожду внизу. Как всегда.': "I'll wait downstairs. As always.",
  'Как всегда?.. Я слышу его впервые.': "As always?.. I've never heard him before.",
  'И всё же Мила снимает с вешалки куртку.': 'Still, Mila takes her jacket off the hook.',

  // walk
  'Улица пуста. Фонари горят ровно, не мигая, а дождь почти перестал.':
    'The street is empty. The lamps burn steadily, without a flicker, and the rain has almost stopped.',
  'Здесь всегда так тихо.': "It's always this quiet here.",
  'Слышишь? Будто город задержал дыхание.': "Hear that? It's like the city is holding its breath.",
  'Голос доносится из-за двери закрытой лавки на углу.':
    'The voice comes from behind the door of a closed shop on the corner.',
  'Сюда. Не бойтесь, здесь сухо.': "Over here. Don't be afraid, it's dry in here.",
  'Мне кажется, я уже была здесь. Только улица была другой.':
    "I feel like I've been here before. Only the street was different.",
  'Кто-то держал меня за руку и просил не оборачиваться.':
    'Someone held my hand and asked me not to look back.',
  'На той стороне тоже идёт дождь. Только слышно его иначе.':
    "It's raining on the other side too. It just sounds different there.",
  'Голос стихает. В луже у двери отражаются фонари, которых на этой улице нет.':
    "The voice falls silent. The puddle by the door reflects lamps this street doesn't have.",
  'Пойдём домой. Сегодня я ничего не хочу решать.':
    "Let's go home. I don't want to decide anything tonight.",

  // home
  'Дома всё так же светятся мониторы. Дождь вернулся и больше не торопится.':
    'At home the monitors are still glowing. The rain is back, in no hurry now.',
  'Знаешь, я рада, что мы вышли. Даже если ничего не нашли.':
    "You know, I'm glad we went out. Even if we found nothing.",
  'На стекле — отпечаток ладони. С той стороны окна.':
    'There is a handprint on the glass. On the other side of the window.',
  'Завтра он постучит снова. Не знаю почему, но я уверена.':
    "He'll knock again tomorrow. I don't know why, but I'm sure of it.",
  'Хорошо, что ты здесь.': "I'm glad you're here.",
  'Конец демо.': 'End of the demo.',
};
