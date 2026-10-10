import type { UiDictionary } from './ru';

/** Interface strings, English. `satisfies` makes a missing or extra key a compile error. */
export const en = {
  'menu.newGame': 'New game',
  'menu.continue': 'Continue',
  'menu.settings': 'Settings',
  'menu.language': 'Language',
  'header.settings': 'Settings',
  'dialogue.action.auto': 'Auto',
  'dialogue.action.skip': 'Skip',
  'dialogue.action.history': 'History',
  'dialogue.action.save': 'Save',
  'dialogue.action.load': 'Load',
  'dialogue.action.choices': 'Choices',
  'dialogue.locked': '{{action}} — not available yet',
  'notice.comingSoon': '{{feature}} — coming soon',
  'notice.saved': 'Game saved',
  'notice.saveFailed': "Couldn't save: browser storage is unavailable",
  'notice.autosaveUnavailable': "Saving is unavailable: progress won't be kept",
  'stage.rotateTitle': 'Rotate your device',
  'stage.rotateHint': 'The game is made for landscape',
} satisfies UiDictionary;
