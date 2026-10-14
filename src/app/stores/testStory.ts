// A tiny story for the store tests, and the stores wired around it over memory storage and silent
// audio.

import { createSceneRegistry, type SceneRegistry } from '@engine';
import { vi } from 'vitest';
import type { LoadSource, SaveSlot } from '@/shared/config/saveSlots';
import { GameStore } from './GameStore';
import type { Presentation } from './presentation';
import { SaveStore } from './SaveStore';
import { fakeAudio, memorySlot } from './testDoubles';

/** Music, a scene, Mila, a door, two lines: every kind of thing the stores turn into files. */
export const registry = createSceneRegistry(
  {
    intro: [
      { type: 'music', asset: 'theme' },
      { type: 'scene', background: 'room' },
      { type: 'show', tag: 'mila', emotion: 'happy', at: 'left' },
      { type: 'sfx', asset: 'door' },
      { type: 'say', speaker: 'mila', text: 'Первая' },
      { type: 'sfx', asset: 'silent' },
      { type: 'say', text: 'Последняя' },
    ],
  },
  'intro',
);

/** A fork: a prompt, an option hidden by its condition, and two the player may pick. */
export const fork = createSceneRegistry(
  {
    intro: [
      {
        type: 'choice',
        prompt: { speaker: 'mila', text: 'Куда пойдём?' },
        options: [
          { text: 'Довериться', when: (vars) => vars.trust === 1, then: [] },
          { text: 'В парк', then: [{ type: 'say', text: 'Пошли.' }] },
          { text: 'Остаться', then: [] },
        ],
      },
    ],
  },
  'intro',
);

/** Lines, a sound and a new track on the way, then a choice: a way to roll back along. */
export const path = createSceneRegistry(
  {
    intro: [
      { type: 'music', asset: 'theme' },
      { type: 'scene', background: 'room' },
      { type: 'say', text: 'Первая' },
      { type: 'sfx', asset: 'door' },
      { type: 'music', asset: 'night' },
      { type: 'show', tag: 'mila', emotion: 'happy', at: 'left' },
      { type: 'say', speaker: 'mila', text: 'Вторая' },
      {
        type: 'choice',
        prompt: { speaker: 'mila', text: 'Куда?' },
        options: [
          { text: 'Налево', then: [{ type: 'say', text: 'Слева' }] },
          { text: 'Направо', then: [{ type: 'say', text: 'Справа' }] },
        ],
      },
      { type: 'say', text: 'Последняя' },
    ],
  },
  'intro',
);

/**
 * Transitions the story asks for: none on the first line, two before the second — the last one
 * counts — and one before a choice without a prompt.
 */
export const staged = createSceneRegistry(
  {
    intro: [
      { type: 'scene', background: 'room' },
      { type: 'say', text: 'Тихо' },
      { type: 'show', tag: 'mila', emotion: 'happy', with: 'vpunch' },
      { type: 'show', tag: 'mila', emotion: 'happy', at: 'left', with: 'move' },
      { type: 'say', speaker: 'mila', text: 'Стук' },
      { type: 'scene', background: 'room', with: 'fade' },
      {
        type: 'choice',
        options: [
          { text: 'Да', then: [] },
          { text: 'Нет', then: [] },
        ],
      },
      { type: 'say', text: 'Последняя' },
    ],
  },
  'intro',
);

export const presentation: Presentation = {
  speakers: { mila: { name: 'Мила' } },
  sceneTitles: { intro: 'Начало' },
  assets: {
    backgrounds: { room: '/room.webp' },
    characters: { mila: { happy: '/mila-happy.webp' } },
    portraits: { mila: '/mila-portrait.webp' },
    music: { theme: '/theme.mp3', night: '/night.mp3' },
    sounds: { door: '/door.mp3' },
  },
};

type MemorySlot = ReturnType<typeof memorySlot>;

type GameOptions = {
  registry?: SceneRegistry;
  /** The autosave's storage. */
  slot?: MemorySlot;
  /** The slots' storage, filled as they are opened; the same map again is a page reloaded. */
  slots?: Map<SaveSlot, MemorySlot>;
  onEnd?: () => void;
  onUnavailable?: () => void;
  now?: () => number;
};

/** A game and its saves, the way RootStore wires them. */
export function createGame(options: GameOptions = {}) {
  const {
    registry: story = registry,
    slot = memorySlot(),
    slots = new Map<SaveSlot, MemorySlot>(),
    onEnd = vi.fn(),
    onUnavailable,
    now,
  } = options;
  const audio = fakeAudio();
  const variableDefaults = { trust: 0 };
  const storage = (source: LoadSource) => {
    if (source === 'auto') {
      return slot;
    }
    const manual = slots.get(source) ?? memorySlot();
    slots.set(source, manual);
    return manual;
  };
  const saves = new SaveStore({
    registry: story,
    variableDefaults,
    presentation,
    storage,
    onUnavailable,
    now,
  });
  const game = new GameStore({
    registry: story,
    variableDefaults,
    presentation,
    audio,
    saves,
    onEnd,
  });
  return { game, saves, slot, slots, audio, onEnd };
}

/** Where a save in storage stands: the position of its checkpoint on screen. */
export function savedPosition(text: string | null): unknown {
  const save = JSON.parse(text ?? 'null');
  return save?.checkpoints[save.current]?.state.position;
}
