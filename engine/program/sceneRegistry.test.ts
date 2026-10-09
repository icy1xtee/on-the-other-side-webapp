import { describe, expect, it } from 'vitest';
import { createSceneRegistry } from './sceneRegistry';

describe('createSceneRegistry', () => {
  it('compiles every scene and hands out its program', () => {
    const registry = createSceneRegistry(
      {
        intro: [
          { type: 'say', text: 'Привет' },
          { type: 'jump', scene: 'walk' },
        ],
        walk: [{ type: 'say', text: 'Пока' }],
      },
      'intro',
    );

    expect(registry.startScene).toBe('intro');
    expect(registry.getProgram('walk')).toEqual([{ type: 'say', text: 'Пока' }]);
  });

  it('fails at boot on a missing start scene', () => {
    expect(() => createSceneRegistry({ intro: [] }, 'prologue')).toThrow(
      'Start scene "prologue" is not registered',
    );
  });

  it('fails at boot on a jump to a missing scene, naming where it is', () => {
    expect(() =>
      createSceneRegistry(
        {
          intro: [
            { type: 'say', text: 'Привет' },
            {
              type: 'choice',
              options: [{ text: 'В лес', then: [{ type: 'jump', scene: 'forest' }] }],
            },
          ],
        },
        'intro',
      ),
    ).toThrow('Scene "intro", step 2: jump to unknown scene "forest"');
  });

  it('fails on a request for a scene it does not know', () => {
    const registry = createSceneRegistry({ intro: [] }, 'intro');
    expect(() => registry.getProgram('nowhere')).toThrow('Scene "nowhere" is not registered');
  });
});
