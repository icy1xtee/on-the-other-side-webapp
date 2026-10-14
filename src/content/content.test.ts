import { advance, choose, createSceneRegistry, startGame } from '@engine';
import { describe, expect, it } from 'vitest';
import { choice, goTo, hide, narrate, option, say, scene, set, show } from './dsl';
import { scenes, startScene, variableDefaults } from './index';

describe('demo content', () => {
  const registry = createSceneRegistry(scenes, startScene);

  /** Clicks through the demo, giving `answer` at its one choice: what the player went through. */
  function playThrough(answer: number) {
    let result = startGame(registry, variableDefaults);
    const lines: string[] = [];
    const visited: string[] = [];
    const transitions: string[] = [];
    const tracks: { asset: string | null; ifChanged: boolean }[] = [];
    const sounds: string[] = [];
    for (let guard = 0; guard < 200 && result.interaction.type !== 'end'; guard += 1) {
      const { interaction, state, effects } = result;
      if (visited.at(-1) !== state.position.sceneId) {
        visited.push(state.position.sceneId);
      }
      for (const effect of effects) {
        if (effect.type === 'transition') {
          transitions.push(effect.transition);
        } else if (effect.type === 'music') {
          tracks.push({ asset: effect.asset, ifChanged: effect.ifChanged });
        } else {
          sounds.push(effect.asset);
        }
      }
      if (interaction.type === 'say') {
        lines.push(interaction.text);
        result = advance(state, registry);
      } else if (interaction.type === 'choice') {
        lines.push(interaction.prompt?.text ?? '');
        result = choose(state, registry, answer);
      }
    }
    return { result, lines, visited, transitions, tracks, sounds };
  }

  it('boots: every scene compiles and every goTo leads somewhere', () => {
    expect(() => createSceneRegistry(scenes, startScene)).not.toThrow();
  });

  it.each([
    [0, 'opened'],
    [1, 'asked'],
    [2, 'silent'],
  ])(
    'plays to the end with answer %i at the door, the branches meeting on the street',
    (answer, doorAnswer) => {
      const { result, lines, visited } = playThrough(answer);

      expect(result.interaction).toEqual({ type: 'end' });
      expect(visited).toEqual(['intro', 'walk', 'home']);
      expect(lines).toHaveLength(30);
      expect(result.state.vars).toEqual({ metMila: false, trust: 0, doorAnswer });
      expect(result.state.stage).toEqual({
        background: 'room',
        sprites: [{ tag: 'mila', emotion: 'happy', at: 'left' }],
      });
    },
  );

  it('shows every transition on the way: the knock shakes, Mila moves, the scenes fade', () => {
    expect(playThrough(0).transitions).toEqual(['vpunch', 'move', 'fade', 'fade']);
  });

  it.each([
    [0, ['knock', 'door', 'steps']],
    [1, ['knock', 'steps', 'steps']],
    [2, ['knock', 'steps', 'steps']],
  ])(
    'keeps the theme the menu plays, and sounds the knock, the door and the steps (%i)',
    (answer, sounds) => {
      const played = playThrough(answer);

      expect(played.tracks).toEqual([
        { asset: 'theme', ifChanged: true },
        { asset: 'theme', ifChanged: true },
      ]);
      expect(played.sounds).toEqual(sounds);
    },
  );
});

describe('factories', () => {
  it('turns a single command or a block into an option block', () => {
    expect(option('В лес', goTo('walk'))).toEqual({
      text: 'В лес',
      then: [{ type: 'jump', scene: 'walk' }],
    });
    expect(option('Остаться', [say('mila', 'Ладно.')]).then).toHaveLength(1);
  });

  it('keeps a condition typed with the story vars', () => {
    const trusting = option('Довериться', [], { when: (vars) => vars.trust > 2 });
    expect(trusting.when?.({ ...variableDefaults, trust: 3 })).toBe(true);
  });

  it('rejects typos and mismatches at compile time', () => {
    const wrong = [
      // @ts-expect-error: no such background.
      scene('rooom'),
      // @ts-expect-error: Mila has no such emotion.
      show('mila', 'angry'),
      // @ts-expect-error: no such scene.
      goTo('forest'),
      // @ts-expect-error: trust is a number.
      set('trust', true),
      // @ts-expect-error: no such speaker.
      say('bob', 'Привет'),
      // @ts-expect-error: a choice asks with a line, not with any command.
      choice(scene('room'), []),
    ];
    expect(wrong).toHaveLength(6);
  });

  it('builds a choice that asks with a line, spoken or narrated', () => {
    expect(choice(say('mila', 'Куда пойдём?'), [option('Гулять', goTo('walk'))])).toMatchObject({
      type: 'choice',
      prompt: { speaker: 'mila', text: 'Куда пойдём?' },
      options: [{ text: 'Гулять' }],
    });
    expect(choice(narrate('Что делать?'), [])).toEqual({
      type: 'choice',
      prompt: { text: 'Что делать?' },
      options: [],
    });
  });

  it('gives scene, show and hide a transition with `with`, and no key at all without one', () => {
    expect(scene('street', { with: 'fade' })).toEqual({
      type: 'scene',
      background: 'street',
      with: 'fade',
    });
    expect(show('mila', 'happy', 'left', { with: 'move' })).toEqual({
      type: 'show',
      tag: 'mila',
      emotion: 'happy',
      at: 'left',
      with: 'move',
    });
    expect(show('mila', 'sad', { with: 'vpunch' })).toEqual({
      type: 'show',
      tag: 'mila',
      emotion: 'sad',
      with: 'vpunch',
    });
    expect(hide('mila', { with: 'fade' })).toEqual({ type: 'hide', tag: 'mila', with: 'fade' });
    expect(scene('room')).toEqual({ type: 'scene', background: 'room' });
    expect(show('mila', 'happy')).toEqual({ type: 'show', tag: 'mila', emotion: 'happy' });
    // @ts-expect-error: no such transition.
    expect(scene('room', { with: 'zoom' })).toBeDefined();
  });

  it('builds a choice that mixes leaving and reacting', () => {
    const fork = choice([
      option('Пойти гулять', goTo('walk')),
      option('Остаться', [say('mila', 'Тогда подождём.')]),
    ]);
    expect(fork).toMatchObject({
      type: 'choice',
      options: [{ text: 'Пойти гулять' }, { text: 'Остаться' }],
    });
  });
});
