/**
 * Interface strings, Russian — the source dictionary: its keys are the keys of every language.
 * Flat keys: dots are part of the name, not nesting (`keySeparator: false`, needed for the
 * story's natural-language keys).
 */
export const ru = {
  'menu.newGame': 'Новая игра',
  'menu.continue': 'Продолжить',
  'menu.settings': 'Настройки',
  'menu.language': 'Язык',
  'header.settings': 'Настройки',
  'dialogue.action.auto': 'Авто',
  'dialogue.action.skip': 'Пропуск',
  'dialogue.action.history': 'История',
  'dialogue.action.save': 'Сохранить',
  'dialogue.action.load': 'Загрузить',
  'dialogue.action.choices': 'Выборы',
  'dialogue.locked': '{{action}} — пока недоступно',
  'notice.comingSoon': '{{feature}} — скоро',
  'notice.saved': 'Игра сохранена',
  'notice.saveFailed': 'Не удалось сохранить: хранилище браузера недоступно',
  'notice.autosaveUnavailable': 'Сохранение недоступно: прогресс не сохранится',
  'settings.title': 'Настройки',
  'settings.sound': 'Звук',
  'settings.masterVolume': 'Общая громкость',
  'settings.musicVolume': 'Музыка',
  'settings.soundVolume': 'Звуки',
  'settings.text': 'Текст',
  'settings.textSpeed': 'Скорость текста',
  'settings.textCps': '{{cps}} симв/с',
  'settings.textInstant': 'Мгновенно',
  'settings.language': 'Язык',
  'settings.mainMenu': 'Главное меню',
  'settings.close': 'Закрыть',
  'confirm.cancel': 'Отмена',
  'confirm.newGame.title': 'Начать заново?',
  'confirm.newGame.text': 'Сохранённая игра будет перезаписана: слот сохранения один.',
  'confirm.newGame.confirm': 'Начать заново',
  'stage.rotateTitle': 'Поверните устройство',
  'stage.rotateHint': 'Игра рассчитана на альбомную ориентацию',
};

export type UiDictionary = Record<keyof typeof ru, string>;
