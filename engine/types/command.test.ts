import { describe, expect, it } from 'vitest';
import { requiresInteraction, type Command } from './command';

type NarrowIds = {
  scene: 'intro' | 'forest';
  background: 'room';
  character: 'anna';
  emotion: 'happy';
  speaker: 'anna';
  music: 'theme';
  sfx: 'door';
  vars: { trust: number };
};

describe('requiresInteraction', () => {
  it('is true for lines and choices', () => {
    expect(requiresInteraction({ type: 'say', text: 'Привет' })).toBe(true);
    expect(requiresInteraction({ type: 'choice', options: [] })).toBe(true);
  });

  it('is false for instant commands', () => {
    expect(requiresInteraction({ type: 'scene', background: 'room' })).toBe(false);
    expect(requiresInteraction({ type: 'jump', scene: 'forest' })).toBe(false);
  });
});

describe('Command typing', () => {
  it('lets content-narrowed commands, conditions included, pass as plain engine commands', () => {
    const narrowed: Command<NarrowIds>[] = [
      { type: 'scene', background: 'room' },
      {
        type: 'choice',
        options: [
          {
            text: 'В лес',
            when: (vars) => vars.trust > 1,
            then: [{ type: 'jump', scene: 'forest' }],
          },
        ],
      },
    ];
    const plain: readonly Command[] = narrowed;
    expect(plain).toHaveLength(2);
  });

  it('turns an unknown id into a compile error', () => {
    // @ts-expect-error: 'rooom' is not a background of NarrowIds.
    const typo: Command<NarrowIds> = { type: 'scene', background: 'rooom' };
    // @ts-expect-error: 'luck' is not a variable of NarrowIds.
    const unknownVar: Command<NarrowIds> = { type: 'set', name: 'luck', value: 1 };
    expect([typo, unknownVar]).toHaveLength(2);
  });
});
