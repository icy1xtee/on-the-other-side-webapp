import { describe, expect, it } from 'vitest';
import { advance, choose, run, startGame, type RunResult } from '../interpreter/interpreter';
import { createSceneRegistry, type SceneRegistry } from '../program/sceneRegistry';
import { arrive, rollBack, shownEntries, startTimeline, type Timeline } from '../timeline/timeline';
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
  walk: [say('На улице'), say('Дальше')],
};
const registry = createSceneRegistry(scenes, 'intro');

/** A game in progress, the way the app plays it: the engine's result and the way taken. */
type Play = { result: RunResult; timeline: Timeline };

function begin(story = registry): Play {
  const result = startGame(story, defaults);
  return {
    result,
    timeline: startTimeline({ state: result.state, entries: shownEntries(result.interaction) }),
  };
}

/** The next line, or the option `pick` of the choice on screen. */
function next({ result, timeline }: Play, pick?: number, story = registry): Play {
  const options = result.interaction.type === 'choice' ? result.interaction.options : [];
  const after =
    pick === undefined ? advance(result.state, story) : choose(result.state, story, pick);
  const picked = pick === undefined ? undefined : options[pick];
  const entries = [
    ...(picked ? [{ kind: 'choice' as const, text: picked.text }] : []),
    ...shownEntries(after.interaction),
  ];
  return { result: after, timeline: arrive(timeline, { state: after.state, entries }, pick) };
}

/** A save the way the app keeps it: through JSON, back from text. */
function roundTrip(timeline: Timeline, from: SceneRegistry = registry): SaveData {
  const parsed = parseSave(
    JSON.stringify(createSave(timeline, from, { savedAt: 1_700_000_000_000, playTime: 0 })),
  );
  if (!parsed.ok) {
    throw new Error(parsed.reason);
  }
  return parsed.save;
}

/** The way a save resumes from; fails the test if there is none. */
function restored(
  save: SaveData,
  story = registry,
  vars: Record<string, string | number | boolean> = defaults,
) {
  const result = restoreSave(save, story, vars);
  if (!result.ok) {
    throw new Error(result.reason);
  }
  return result.timeline;
}

const onScreen = (timeline: Timeline) => timeline.checkpoints[timeline.current]!.state;

describe('save and load', () => {
  it('resumes on the same line with the same vars, stage and music', () => {
    const playing = begin();
    const timeline = restored(roundTrip(playing.timeline));

    expect(onScreen(timeline)).toEqual(playing.result.state);
    const resumed = run(onScreen(timeline), registry);
    expect(resumed.interaction).toEqual(playing.result.interaction);
    // Nothing is re-executed on the way: no sound plays twice.
    expect(resumed.effects).toEqual([]);
  });

  it('keeps sprites in their order, with their emotions and places', () => {
    const save = roundTrip(begin().timeline);
    expect(save.checkpoints[0]?.state.stage.sprites).toEqual([
      { tag: 'anna', emotion: 'happy', at: 'left' },
      { tag: 'boris', emotion: 'sad', at: 'right' },
    ]);
  });

  it('resumes on a choice, and the choice still works', () => {
    const atChoice = onScreen(restored(roundTrip(next(begin()).timeline)));

    expect(run(atChoice, registry).interaction).toMatchObject({ type: 'choice' });
    expect(choose(atChoice, registry, 0).state.vars.trust).toBe(2);
  });

  it('keeps the way back, the picks on it and the history', () => {
    const walked = next(next(next(begin()), 1));
    const timeline = restored(roundTrip(walked.timeline));

    expect(timeline).toEqual(walked.timeline);
    expect(timeline.checkpoints[1]?.chosen).toBe(1);
    expect(timeline.history).toEqual([
      { kind: 'line', speaker: 'anna', text: 'Первая' },
      { kind: 'choice', text: 'Уйти' },
      { kind: 'narration', text: 'На улице' },
      { kind: 'narration', text: 'Дальше' },
    ]);
    expect(onScreen(rollBack(rollBack(timeline)!)!).position).toEqual({
      sceneId: 'intro',
      step: 6,
    });
  });

  it('keeps the way forward the player rolled back over', () => {
    const back = rollBack(rollBack(next(next(next(begin()), 1)).timeline)!)!;
    const timeline = restored(roundTrip(back));

    expect(timeline.current).toBe(1);
    expect(timeline.checkpoints).toHaveLength(4);
  });

  it('writes what the slot needs to know, and every scene on the way', () => {
    const walked = next(next(begin()), 1);
    const save = createSave(walked.timeline, registry, { savedAt: 42, playTime: 61_000 });
    expect(save).toMatchObject({
      version: SAVE_VERSION,
      current: 2,
      sceneHashes: {
        intro: registry.getSceneHash('intro'),
        walk: registry.getSceneHash('walk'),
      },
      savedAt: 42,
      playTime: 61_000,
    });
  });
});

describe('a save of format 1', () => {
  const v1 = (extra: Record<string, unknown> = {}) => ({
    version: 1,
    position: { sceneId: 'intro', step: 5 },
    sceneHash: registry.getSceneHash('intro'),
    vars: { metAnna: true, trust: 0 },
    stage: { background: 'room', sprites: [{ tag: 'anna', emotion: 'happy', at: 'left' }] },
    audio: { music: 'theme' },
    savedAt: 7,
    ...extra,
  });

  it('loads with an empty history, no way back and its play time', () => {
    const parsed = parseSave(JSON.stringify(v1({ playTime: 5_000 })));
    expect(parsed.ok && parsed.save).toMatchObject({
      version: SAVE_VERSION,
      current: 0,
      history: [],
      sceneHashes: { intro: registry.getSceneHash('intro') },
      savedAt: 7,
      playTime: 5_000,
    });

    const timeline = restored(parsed.ok ? parsed.save : ({} as SaveData));
    expect(timeline.checkpoints).toHaveLength(1);
    expect(run(onScreen(timeline), registry).interaction).toMatchObject({ text: 'Первая' });
  });

  it('counts play time from zero when it has none', () => {
    const parsed = parseSave(JSON.stringify(v1()));
    expect(parsed.ok && parsed.save.playTime).toBe(0);
  });

  it('is still refused when broken, saying what is wrong', () => {
    const parsed = parseSave(JSON.stringify(v1({ position: 'nowhere' })));
    expect(!parsed.ok && parsed.reason).toContain('position');
  });
});

describe('variables on load', () => {
  const save = (vars: SaveData['checkpoints'][number]['state']['vars']) => {
    const saved = roundTrip(begin().timeline);
    const [checkpoint] = saved.checkpoints;
    return { ...saved, checkpoints: [{ ...checkpoint!, state: { ...checkpoint!.state, vars } }] };
  };

  it('give a variable added after the save its default', () => {
    const timeline = restored(save({ metAnna: true }), registry, { ...defaults, mood: 'calm' });
    expect(onScreen(timeline).vars).toEqual({ metAnna: true, trust: 0, mood: 'calm' });
  });

  it('drop a variable the story no longer has, or whose type changed', () => {
    const timeline = restored(save({ metAnna: 'yes', trust: 3, gone: 1 }));
    expect(onScreen(timeline).vars).toEqual({ metAnna: false, trust: 3 });
  });
});

describe('a story changed under the save', () => {
  const edit = (changes: Record<string, Command[]>) =>
    createSceneRegistry({ ...scenes, ...changes }, 'intro');

  it('starts the scene on screen over, keeping the saved vars, its first line in the history', () => {
    const save = roundTrip(next(begin()).timeline);
    const edited = edit({ intro: [say('Новая первая реплика'), ...(scenes.intro ?? [])] });

    const timeline = restored(save, edited);
    expect(timeline.checkpoints).toHaveLength(1);
    expect(onScreen(timeline).position).toEqual({ sceneId: 'intro', step: 0 });
    expect(onScreen(timeline).vars).toEqual({ metAnna: true, trust: 0 });
    expect(run(onScreen(timeline), edited).interaction).toEqual({
      type: 'say',
      text: 'Новая первая реплика',
    });
    // The choice on screen showed nothing; what was read before it stays.
    expect(timeline.history).toEqual([
      { kind: 'line', speaker: 'anna', text: 'Первая' },
      { kind: 'narration', text: 'Новая первая реплика' },
    ]);
  });

  it('puts the new first line in the history in place of the old line on screen', () => {
    const save = roundTrip(begin().timeline);
    const edited = edit({ intro: [say('Иначе'), ...(scenes.intro ?? [])] });
    expect(restored(save, edited).history).toEqual([{ kind: 'narration', text: 'Иначе' }]);
  });

  it('starts over when the saved step is not a line or a choice', () => {
    const save = roundTrip(begin().timeline);
    const [checkpoint] = save.checkpoints;
    const moved = {
      ...save,
      checkpoints: [
        {
          ...checkpoint!,
          state: { ...checkpoint!.state, position: { sceneId: 'intro', step: 2 } },
        },
      ],
    };
    expect(onScreen(restored(moved)).position).toEqual({ sceneId: 'intro', step: 5 });
  });

  it('stops rollback short of the newest checkpoint in an edited scene', () => {
    const walked = next(next(next(begin()), 1));
    const timeline = restored(roundTrip(walked.timeline), edit({ intro: [say('Другая')] }));

    expect(timeline.checkpoints.map(({ state }) => state.position)).toEqual([
      { sceneId: 'walk', step: 0 },
      { sceneId: 'walk', step: 1 },
    ]);
    expect(timeline.current).toBe(1);
    // What was read stays read.
    expect(timeline.history).toEqual(walked.timeline.history);
  });

  it('stops the way forward short of the oldest checkpoint in an edited scene', () => {
    const back = rollBack(rollBack(rollBack(next(next(next(begin()), 1)).timeline)!)!)!;
    const timeline = restored(roundTrip(back), edit({ walk: [say('Не та улица')] }));

    expect(timeline.current).toBe(0);
    expect(timeline.checkpoints.map(({ state }) => state.position.sceneId)).toEqual([
      'intro',
      'intro',
    ]);
  });

  it('has nothing to resume when the scene is gone', () => {
    const save = roundTrip(begin().timeline);
    const without = createSceneRegistry({ walk: scenes.walk ?? [] }, 'walk');
    expect(restoreSave(save, without, defaults)).toEqual({
      ok: false,
      reason: 'scene "intro" is gone',
    });
  });

  it('has nothing to resume when the edited scene has no line left', () => {
    const save = roundTrip(begin().timeline);
    expect(restoreSave(save, edit({ intro: [] }), defaults).ok).toBe(false);
  });
});

describe('parseSave', () => {
  const valid = () => createSave(begin().timeline, registry, { savedAt: 1, playTime: 0 });

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
    const save = valid();
    const [checkpoint] = save.checkpoints;
    const broken = {
      ...save,
      checkpoints: [{ ...checkpoint, state: { ...checkpoint!.state, stage: null } }],
      history: [{ kind: 'thought', text: 'Хм' }],
    };
    const parsed = parseSave(JSON.stringify(broken));

    expect(parsed.ok).toBe(false);
    expect(!parsed.ok && parsed.reason).toContain('checkpoints.0.state.stage');
    expect(!parsed.ok && parsed.reason).toContain('history.0');
  });

  it('refuses a save without a checkpoint', () => {
    expect(parseSave(JSON.stringify({ ...valid(), checkpoints: [] })).ok).toBe(false);
  });

  it('refuses a sprite in a place the engine has no column for', () => {
    const save = valid();
    const [checkpoint] = save.checkpoints;
    const sprites = [{ tag: 'anna', emotion: 'happy', at: 'top' }];
    const odd = {
      ...save,
      checkpoints: [
        { ...checkpoint, state: { ...checkpoint!.state, stage: { background: null, sprites } } },
      ],
    };
    expect(parseSave(JSON.stringify(odd)).ok).toBe(false);
  });

  it('leaves a save whose screen is past its checkpoints to restoreSave, which refuses it', () => {
    const parsed = parseSave(JSON.stringify({ ...valid(), current: 3 }));
    expect(parsed.ok && restoreSave(parsed.save, registry, defaults)).toEqual({
      ok: false,
      reason: 'no checkpoint 3, the save has 1',
    });
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
