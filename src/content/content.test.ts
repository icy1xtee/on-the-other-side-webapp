import { advance, createSceneRegistry, startGame, type Interaction } from '@engine';
import { describe, expect, it } from 'vitest';
import { choice, goTo, option, say, scene, set, show } from './dsl';
import { scenes, startScene, variableDefaults } from './index';

describe('demo content', () => {
  it('boots: every scene compiles and every goTo leads somewhere', () => {
    expect(() => createSceneRegistry(scenes, startScene)).not.toThrow();
  });

  it('plays from the start to the end of the game by clicking through', () => {
    const registry = createSceneRegistry(scenes, startScene);
    let result = startGame(registry, variableDefaults);
    const seen: Interaction[] = [result.interaction];

    while (result.interaction.type === 'say' && seen.length < 100) {
      result = advance(result.state, registry);
      seen.push(result.interaction);
    }

    expect(result.interaction).toEqual({ type: 'end' });
    expect(seen.filter((interaction) => interaction.type === 'say')).toHaveLength(7);
    expect(result.state.position.sceneId).toBe('walk');
    expect(result.state.vars).toEqual({ metAnna: true, trust: 1 });
    expect(result.state.stage).toEqual({
      background: 'street',
      sprites: [{ tag: 'anna', emotion: 'sad', at: 'right' }],
    });
  });
});

describe('factories', () => {
  it('turns a single command or a block into an option block', () => {
    expect(option('В лес', goTo('walk'))).toEqual({
      text: 'В лес',
      then: [{ type: 'jump', scene: 'walk' }],
    });
    expect(option('Остаться', [say('anna', 'Ладно.')]).then).toHaveLength(1);
  });

  it('keeps a condition typed with the story vars', () => {
    const trusting = option('Довериться', [], { when: (vars) => vars.trust > 2 });
    expect(trusting.when?.({ metAnna: true, trust: 3 })).toBe(true);
  });

  it('rejects typos and mismatches at compile time', () => {
    const wrong = [
      // @ts-expect-error: no such background.
      scene('rooom'),
      // @ts-expect-error: Anna has no such emotion.
      show('anna', 'angry'),
      // @ts-expect-error: no such scene.
      goTo('forest'),
      // @ts-expect-error: trust is a number.
      set('trust', true),
      // @ts-expect-error: no such speaker.
      say('bob', 'Привет'),
    ];
    expect(wrong).toHaveLength(5);
  });

  it('builds a choice that mixes leaving and reacting', () => {
    const fork = choice([
      option('Пойти гулять', goTo('walk')),
      option('Остаться', [say('anna', 'Тогда подождём.')]),
    ]);
    expect(fork).toMatchObject({
      type: 'choice',
      options: [{ text: 'Пойти гулять' }, { text: 'Остаться' }],
    });
  });
});
