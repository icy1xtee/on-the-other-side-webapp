/**
 * The story in English. Keys are the Russian lines exactly as written in the scenes — the scenes
 * stay readable and translations live here, gettext-style. A line edited in a scene loses its
 * translation (the old key goes stale); the content test points at both sides.
 */
export const en: Readonly<Record<string, string>> = {
  // Speakers
  Мила: 'Mila',
  'Голос за дверью': 'Voice behind the door',

  // intro
  'Утро. Свет пробивается сквозь шторы.': 'Morning. Light seeps through the curtains.',
  'Можно войти?': 'May I come in?',
  'Привет. Я Мила.': "Hi! I'm Mila.",
  'Рада, что ты здесь. Пойдём, покажу улицу.':
    "Glad you're here. Come on, I'll show you the street.",
  'Мила вышла в коридор.': 'Mila stepped out into the hallway.',

  // walk
  'Здесь всегда так тихо.': "It's always this quiet here.",
  'Конец демо-сцены.': 'End of the demo scene.',
};
