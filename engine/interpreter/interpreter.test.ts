import { describe, expect, it } from 'vitest';
import { createSceneRegistry } from '../program/sceneRegistry';
import type { GameState } from '../state/state';
import type { Command } from '../types/command';
import { advance, choose, run, startGame, STEP_LIMIT } from './interpreter';

const defaults = { metAnna: false, trust: 0 };
const say = (text: string, speaker?: string): Command => ({ type: 'say', speaker, text });

describe('startGame and run', () => {
  it('applies instant commands in a row and stops on the first line', () => {
    const registry = createSceneRegistry(
      {
        intro: [
          { type: 'scene', background: 'room' },
          { type: 'show', tag: 'anna', emotion: 'happy', at: 'left' },
          { type: 'set', name: 'metAnna', value: true },
          say('Привет', 'anna'),
          say('Это не должно выполниться'),
        ],
      },
      'intro',
    );

    const { state, interaction } = startGame(registry, defaults);

    expect(interaction).toEqual({ type: 'say', speaker: 'anna', text: 'Привет' });
    expect(state.position).toEqual({ sceneId: 'intro', step: 3 });
    expect(state.stage).toEqual({
      background: 'room',
      sprites: [{ tag: 'anna', emotion: 'happy', at: 'left' }],
    });
    expect(state.vars).toEqual({ metAnna: true, trust: 0 });
  });

  it('collects sounds and music changes met on the way, in order', () => {
    const registry = createSceneRegistry(
      {
        intro: [{ type: 'music', asset: 'theme' }, { type: 'sfx', asset: 'door' }, say('Кто там?')],
      },
      'intro',
    );

    expect(startGame(registry, defaults).effects).toEqual([
      { type: 'music', asset: 'theme', ifChanged: false },
      { type: 'sfx', asset: 'door' },
    ]);
  });

  it('ends the game when the start scene is empty', () => {
    const registry = createSceneRegistry({ intro: [] }, 'intro');
    expect(startGame(registry, defaults).interaction).toEqual({ type: 'end' });
  });

  it('stops on a choice and reports which options are available', () => {
    const registry = createSceneRegistry(
      {
        intro: [
          {
            type: 'choice',
            options: [
              { text: 'Довериться', when: (vars) => vars.trust === 3, then: [] },
              { text: 'Уйти', then: [] },
            ],
          },
        ],
      },
      'intro',
    );

    expect(startGame(registry, defaults).interaction).toEqual({
      type: 'choice',
      options: [
        { text: 'Довериться', available: false },
        { text: 'Уйти', available: true },
      ],
    });
  });

  it("skips a choice whose every option is ruled out, as Ren'Py skips such a menu", () => {
    const registry = createSceneRegistry(
      {
        intro: [
          {
            type: 'choice',
            prompt: { text: 'Этого не видно' },
            options: [{ text: 'Довериться', when: (vars) => vars.trust === 3, then: [say('Нет')] }],
          },
          say('За развилкой'),
        ],
      },
      'intro',
    );

    expect(startGame(registry, defaults).interaction).toEqual({
      type: 'say',
      text: 'За развилкой',
    });
  });
});

describe('choose', () => {
  // A fork with a reaction, a nested choice and a way out into another scene.
  const registry = createSceneRegistry(
    {
      room: [
        { type: 'scene', background: 'room' },
        { type: 'show', tag: 'anna', emotion: 'happy', at: 'left' },
        {
          type: 'choice',
          prompt: { speaker: 'anna', text: 'Как ты?' },
          options: [
            {
              text: 'Отлично',
              then: [{ type: 'set', name: 'trust', value: 1 }, say('Рада слышать.', 'anna')],
            },
            {
              text: 'Так себе',
              then: [
                {
                  type: 'choice',
                  options: [
                    { text: 'Голова болит', then: [say('Кофе?', 'anna')] },
                    { text: 'Промолчать', then: [] },
                  ],
                },
              ],
            },
            {
              text: 'Уйти',
              then: [
                { type: 'set', name: 'metAnna', value: true },
                { type: 'jump', scene: 'street' },
              ],
            },
          ],
        },
        say('За развилкой.'),
      ],
      street: [
        {
          type: 'choice',
          options: [
            { text: 'Довериться', when: (vars) => vars.trust === 1, then: [] },
            { text: 'Промолчать', then: [] },
          ],
        },
      ],
    },
    'room',
  );

  it('stops on the choice together with its prompt', () => {
    expect(startGame(registry, defaults).interaction).toEqual({
      type: 'choice',
      prompt: { speaker: 'anna', text: 'Как ты?' },
      options: [
        { text: 'Отлично', available: true },
        { text: 'Так себе', available: true },
        { text: 'Уйти', available: true },
      ],
    });
  });

  it('plays a reaction block, then continues after the choice', () => {
    const reaction = choose(startGame(registry, defaults).state, registry, 0);
    expect(reaction.interaction).toEqual({ type: 'say', speaker: 'anna', text: 'Рада слышать.' });
    expect(reaction.state.vars.trust).toBe(1);

    expect(advance(reaction.state, registry).interaction).toEqual({
      type: 'say',
      text: 'За развилкой.',
    });
  });

  it('plays a nested choice, whose block also comes back after the outer choice', () => {
    const nested = choose(startGame(registry, defaults).state, registry, 1);
    expect(nested.interaction).toEqual({
      type: 'choice',
      options: [
        { text: 'Голова болит', available: true },
        { text: 'Промолчать', available: true },
      ],
    });

    expect(choose(nested.state, registry, 1).interaction).toEqual({
      type: 'say',
      text: 'За развилкой.',
    });
  });

  it('leaves for another scene with the vars set on the way and the stage untouched', () => {
    const left = choose(startGame(registry, defaults).state, registry, 2);

    expect(left.state.position).toEqual({ sceneId: 'street', step: 0 });
    expect(left.state.vars).toEqual({ metAnna: true, trust: 0 });
    // Clearing the stage is the next scene's own `scene` command, as in Ren'Py.
    expect(left.state.stage).toEqual({
      background: 'room',
      sprites: [{ tag: 'anna', emotion: 'happy', at: 'left' }],
    });
  });

  it('lets a variable decide what the next scene offers', () => {
    const start = startGame(registry, defaults).state;
    const distrustful = choose(start, registry, 2);
    const trusting = choose({ ...start, vars: { ...start.vars, trust: 1 } }, registry, 2);

    expect(distrustful.interaction).toMatchObject({
      options: [{ text: 'Довериться', available: false }, { available: true }],
    });
    expect(trusting.interaction).toMatchObject({
      options: [{ text: 'Довериться', available: true }, { available: true }],
    });
  });

  it('refuses an option hidden by its condition', () => {
    const { state } = choose(startGame(registry, defaults).state, registry, 2);
    expect(() => choose(state, registry, 0)).toThrow(
      'Scene "street", step 0: option 0 is not available',
    );
  });

  it('refuses an option that does not exist', () => {
    const { state } = startGame(registry, defaults);
    expect(() => choose(state, registry, 3)).toThrow(
      'Scene "room", step 2: the choice has no option 3',
    );
  });

  it('refuses to choose on a line', () => {
    const { state } = choose(startGame(registry, defaults).state, registry, 0);
    expect(() => choose(state, registry, 0)).toThrow('choose() needs a choice at scene "room"');
  });
});

describe('advance', () => {
  const registry = createSceneRegistry(
    {
      intro: [
        say('Первая'),
        { type: 'scene', background: 'street' },
        say('Вторая'),
        { type: 'jump', scene: 'walk' },
      ],
      walk: [say('В другой сцене')],
    },
    'intro',
  );

  it('moves past the current line to the next one', () => {
    const first = startGame(registry, defaults);
    const second = advance(first.state, registry);

    expect(second.interaction).toEqual({ type: 'say', text: 'Вторая' });
    expect(second.state.stage.background).toBe('street');
  });

  it('follows a jump into another scene from its first step', () => {
    const second = advance(startGame(registry, defaults).state, registry);
    const third = advance(second.state, registry);

    expect(third.interaction).toEqual({ type: 'say', text: 'В другой сцене' });
    expect(third.state.position).toEqual({ sceneId: 'walk', step: 0 });
  });

  it('ends the game when the last scene runs out without a jump', () => {
    let result = startGame(registry, defaults);
    result = advance(result.state, registry);
    result = advance(result.state, registry);
    result = advance(result.state, registry);

    expect(result.interaction).toEqual({ type: 'end' });
  });

  it('refuses to skip a choice: that is what choosing is for', () => {
    const withChoice = createSceneRegistry(
      { intro: [{ type: 'choice', options: [{ text: 'Да', then: [] }] }] },
      'intro',
    );
    const { state } = startGame(withChoice, defaults);

    expect(() => advance(state, withChoice)).toThrow(
      'advance() needs a line at scene "intro", step 0, but found a choice',
    );
  });

  it('refuses to go past the end of the game', () => {
    const empty = createSceneRegistry({ intro: [] }, 'intro');
    const { state } = startGame(empty, defaults);

    expect(() => advance(state, empty)).toThrow('but found the end of the scene');
  });
});

describe('step limit', () => {
  it('stops a jump loop without a single line with an error instead of hanging', () => {
    const registry = createSceneRegistry(
      {
        ping: [{ type: 'jump', scene: 'pong' }],
        pong: [{ type: 'jump', scene: 'ping' }],
      },
      'ping',
    );

    expect(() => startGame(registry, defaults)).toThrow(
      `Step limit of ${STEP_LIMIT} exceeded at scene "ping", step 0`,
    );
  });
});

describe('snapshot', () => {
  it('a saved state survives JSON and resumes on the same line without a replay', () => {
    const registry = createSceneRegistry(
      {
        intro: [
          { type: 'music', asset: 'theme' },
          { type: 'scene', background: 'room' },
          { type: 'show', tag: 'anna', emotion: 'sad', at: 'right' },
          say('Сохранись здесь', 'anna'),
          say('Дальше'),
        ],
      },
      'intro',
    );
    const playing = startGame(registry, defaults);

    const loaded: GameState = JSON.parse(JSON.stringify(playing.state));
    const resumed = run(loaded, registry);

    expect(resumed.state).toEqual(playing.state);
    expect(resumed.interaction).toEqual(playing.interaction);
    // Nothing is re-executed, so nothing is re-played: the app restores music from the state.
    expect(resumed.effects).toEqual([]);
  });
});
