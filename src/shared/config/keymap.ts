/**
 * What the keys and the mouse do — Ren'Py's `config.keymap`: every action with the inputs that do
 * it. The game's input handlers ask it which action a key stands for, and the game menu's
 * «Управление» draws it, so a key bound here is a key the player sees there.
 */

/**
 * One way to do an action: a key (its `KeyboardEvent.key`), a run of keys, the mouse, or a button
 * of the dialogue panel for what has no key.
 */
export type Input =
  | { type: 'key'; key: string }
  | { type: 'keys'; from: string; to: string }
  | { type: 'mouse'; mouse: 'click' | 'wheelUp' | 'wheelDown' }
  | { type: 'button'; button: 'auto' };

const key = (name: string): Input => ({ type: 'key', key: name });

export const KEYMAP = {
  /** The next line; a click or a key mid-line shows the line whole first. */
  advance: [{ type: 'mouse', mouse: 'click' }, key(' '), key('Enter')],
  /** The option in that place, once the options are out. */
  pick: [{ type: 'keys', from: '1', to: '9' }],
  toggleSkip: [key('Tab')],
  holdSkip: [key('Control')],
  toggleAuto: [{ type: 'button', button: 'auto' }],
  rollBack: [{ type: 'mouse', mouse: 'wheelUp' }, key('PageUp')],
  rollForward: [{ type: 'mouse', mouse: 'wheelDown' }, key('PageDown')],
  /** The game menu, on Save; in a window, closes it. */
  gameMenu: [key('Escape')],
  /** The game menu on «Управление», on every screen — Ren'Py's help key. */
  controls: [key('F1')],
} as const satisfies Record<string, readonly Input[]>;

export type ControlAction = keyof typeof KEYMAP;

/** «Управление» by groups, in this order — Ren'Py's help screen lists its keys so. */
export const CONTROL_GROUPS = [
  { id: 'reading', actions: ['advance'] },
  { id: 'choice', actions: ['pick'] },
  { id: 'modes', actions: ['toggleSkip', 'holdSkip', 'toggleAuto'] },
  { id: 'rollback', actions: ['rollBack', 'rollForward'] },
  { id: 'windows', actions: ['gameMenu', 'controls'] },
] as const satisfies readonly { id: string; actions: readonly ControlAction[] }[];

const ACTIONS = Object.keys(KEYMAP) as ControlAction[];

/** Tells inputs apart: the same input has the same id wherever it is bound. */
export function inputId(input: Input): string {
  switch (input.type) {
    case 'key':
      return `key:${input.key}`;
    case 'keys':
      return `keys:${input.from}-${input.to}`;
    case 'mouse':
      return `mouse:${input.mouse}`;
    case 'button':
      return `button:${input.button}`;
  }
}

function isKey(input: Input, name: string): boolean {
  if (input.type === 'key') {
    return input.key === name;
  }
  if (input.type === 'keys') {
    return name.length === 1 && name >= input.from && name <= input.to;
  }
  return false;
}

/** What a key press is to the game: its action and the input it matched; null for an unbound key. */
export function bindingOfKey(name: string): { action: ControlAction; input: Input } | null {
  for (const action of ACTIONS) {
    const input = KEYMAP[action].find((candidate: Input) => isKey(candidate, name));
    if (input) {
      return { action, input };
    }
  }
  return null;
}

/** The action a key stands for; null for a key the game doesn't use. */
export function actionOfKey(name: string): ControlAction | null {
  return bindingOfKey(name)?.action ?? null;
}
