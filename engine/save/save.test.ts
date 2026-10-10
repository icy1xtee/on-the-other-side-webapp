import { describe, expect, it } from 'vitest';
import { advance, choose, run, startGame } from '../interpreter/interpreter';
import { createSceneRegistry } from '../program/sceneRegistry';
import type { GameState } from '../state/state';
import type { Command } from '../types/command';
import { createSave, parseSave, restoreSave } from './save';
import { SAVE_VERSION, type SaveData } from './schema';

const defaults = { metAnna: false, trust: 0 };
const say = (text: string, speaker?: string): Command => ({ type: 'say', speaker, text });

const scenes: Record<string, Command[]> = {
  intro: [
    { type: 'music', asset: 'theme' },
    { type: 'scene', background: 'room' },
    { type: 'show', tag: 'anna', emotion: 'happy', at: 'left' },
    { type: 'show', tag: 'boris', emotion: 'sad', at: 'right' },
    { type: 'set', name: 'metAnna', value: true },
    say('Первая', 'anna'),
    {
      type: 'choice',
      options: [
        { text: 'Довериться', then: [{ type: 'set', name: 'trust', value: 2 }] },
        { text: 'Уйти', then: [{ type: 'jump', scene: 'walk' }] },
      ],
    },
    say('За развилкой'),
  ],
  walk: [say('На улице')],
};
const registry = createSceneRegistry(scenes, 'intro');

/** A save the way the app keeps it: through JSON, back from text. */
function roundTrip(state: GameState, from = registry) {
  const parsed = parseSave(JSON.stringify(createSave(state, from, 1_700_000_000_000)));
  if (!parsed.ok) {
    throw new Error(parsed.reason);
  }
  return parsed.save;
}

describe('save and load', () => {
  it('resumes on the same line with the same vars, stage and music', () => {
    const playing = startGame(registry, defaults);
    const restored = restoreSave(roundTrip(playing.state), registry, defaults);

    expect(restored).toEqual(playing.state);
    const resumed = run(restored!, registry);
    expect(resumed.interaction).toEqual(playing.interaction);
    // Nothing is re-executed on the way: no sound plays twice.
    expect(resumed.effects).toEqual([]);
  });

  it('keeps sprites in their order, with their emotions and places', () => {
    const save = roundTrip(startGame(registry, defaults).state);
    expect(save.stage.sprites).toEqual([
      { tag: 'anna', emotion: 'happy', at: 'left' },
      { tag: 'boris', emotion: 'sad', at: 'right' },
    ]);
  });

  it('resumes on a choice, and the choice still works', () => {
    const atChoice = advance(startGame(registry, defaults).state, registry);
    const restored = restoreSave(roundTrip(atChoice.state), registry, defaults)!;

    expect(run(restored, registry).interaction).toMatchObject({ type: 'choice' });
    expect(choose(restored, registry, 0).state.vars.trust).toBe(2);
  });

  it('writes what the slot needs to know', () => {
    const save = createSave(startGame(registry, defaults).state, registry, 42);
    expect(save).toMatchObject({
      version: SAVE_VERSION,
      position: { sceneId: 'intro', step: 5 },
      sceneHash: registry.getSceneHash('intro'),
      audio: { music: 'theme' },
      savedAt: 42,
    });
  });
});

describe('variables on load', () => {
  const save = (vars: SaveData['vars']) => ({
    ...roundTrip(startGame(registry, defaults).state),
    vars,
  });

  it('give a variable added after the save its default', () => {
    const restored = restoreSave(save({ metAnna: true }), registry, { ...defaults, mood: 'calm' });
    expect(restored?.vars).toEqual({ metAnna: true, trust: 0, mood: 'calm' });
  });

  it('drop a variable the story no longer has, or whose type changed', () => {
    const restored = restoreSave(save({ metAnna: 'yes', trust: 3, gone: 1 }), registry, defaults);
    expect(restored?.vars).toEqual({ metAnna: false, trust: 3 });
  });
});

describe('a story changed under the save', () => {
  it('starts the changed scene over, keeping the saved vars', () => {
    const atChoice = advance(startGame(registry, defaults).state, registry);
    const save = roundTrip(atChoice.state);
    const edited = createSceneRegistry(
      { ...scenes, intro: [say('Новая первая реплика'), ...(scenes.intro ?? [])] },
      'intro',
    );

    const restored = restoreSave(save, edited, defaults);
    expect(restored?.position).toEqual({ sceneId: 'intro', step: 0 });
    expect(restored?.vars).toEqual({ metAnna: true, trust: 0 });
    expect(run(restored!, edited).interaction).toEqual({
      type: 'say',
      text: 'Новая первая реплика',
    });
  });

  it('starts over when the saved step is not a line or a choice', () => {
    const save = {
      ...roundTrip(startGame(registry, defaults).state),
      position: { sceneId: 'intro', step: 2 },
    };
    expect(restoreSave(save, registry, defaults)?.position).toEqual({ sceneId: 'intro', step: 0 });
  });

  it('has nothing to resume when the scene is gone', () => {
    const save = roundTrip(startGame(registry, defaults).state);
    const without = createSceneRegistry({ walk: scenes.walk ?? [] }, 'walk');
    expect(restoreSave(save, without, defaults)).toBeNull();
  });
});

describe('parseSave', () => {
  const valid = () => createSave(startGame(registry, defaults).state, registry, 1);

  it('refuses text that is not JSON', () => {
    expect(parseSave('{oops')).toEqual({ ok: false, reason: 'not JSON' });
  });

  it('refuses JSON without a format version', () => {
    expect(parseSave('"hello"')).toEqual({ ok: false, reason: 'no format version' });
    expect(parseSave('{"position":{}}')).toEqual({ ok: false, reason: 'no format version' });
  });

  it('refuses a save of a newer format rather than guessing', () => {
    expect(parseSave(JSON.stringify({ ...valid(), version: SAVE_VERSION + 1 }))).toEqual({
      ok: false,
      reason: `format ${SAVE_VERSION + 1} is newer than this game's ${SAVE_VERSION}`,
    });
  });

  it('refuses an older format it has no migration for', () => {
    expect(parseSave(JSON.stringify({ ...valid(), version: 0 }))).toEqual({
      ok: false,
      reason: 'no migration from format 0',
    });
  });

  it('refuses a broken save and says what is wrong', () => {
    const broken = { ...valid(), position: { sceneId: 'intro', step: -1 }, stage: null };
    const parsed = parseSave(JSON.stringify(broken));

    expect(parsed.ok).toBe(false);
    expect(!parsed.ok && parsed.reason).toContain('position.step');
    expect(!parsed.ok && parsed.reason).toContain('stage');
  });

  it('refuses a sprite in a place the engine has no column for', () => {
    const save = valid();
    const odd = {
      ...save,
      stage: { ...save.stage, sprites: [{ tag: 'anna', emotion: 'happy', at: 'top' }] },
    };
    expect(parseSave(JSON.stringify(odd)).ok).toBe(false);
  });
});

describe('scene fingerprints', () => {
  it('are the same for the same scene, built again', () => {
    expect(createSceneRegistry(scenes, 'intro').getSceneHash('intro')).toBe(
      registry.getSceneHash('intro'),
    );
  });

  it('change with any edit, a fixed typo included', () => {
    const edited = createSceneRegistry({ ...scenes, walk: [say('На улицe')] }, 'intro');
    expect(edited.getSceneHash('walk')).not.toBe(registry.getSceneHash('walk'));
    expect(edited.getSceneHash('intro')).toBe(registry.getSceneHash('intro'));
  });
});
