import { describe, expect, it } from 'vitest';
import type { Command } from '../types/command';
import { compileScene } from './compileScene';

const say = (text: string): Command => ({ type: 'say', text });

describe('compileScene', () => {
  it('keeps a linear scene as is', () => {
    const commands: Command[] = [{ type: 'scene', background: 'room' }, say('Привет')];
    expect(compileScene(commands)).toEqual(commands);
  });

  it('flattens reaction blocks and makes them continue after the choice', () => {
    const program = compileScene([
      {
        type: 'choice',
        options: [
          { text: 'Резко', then: [say('Ну и ладно.')] },
          { text: 'Промолчать', then: [say('...'), say('Пойдём.')] },
        ],
      },
      say('Темнеет.'),
    ]);

    expect(program).toEqual([
      {
        type: 'choice',
        options: [
          { text: 'Резко', when: undefined, target: 1 },
          { text: 'Промолчать', when: undefined, target: 3 },
        ],
      },
      say('Ну и ладно.'),
      { type: 'goto', step: 6 },
      say('...'),
      say('Пойдём.'),
      { type: 'goto', step: 6 },
      say('Темнеет.'),
    ]);
  });

  it('gives a block that leaves the scene no way back', () => {
    const program = compileScene([
      {
        type: 'choice',
        options: [
          { text: 'В лес', then: [{ type: 'jump', scene: 'forest' }] },
          { text: 'Остаться', then: [] },
        ],
      },
    ]);

    expect(program).toEqual([
      {
        type: 'choice',
        options: [
          { text: 'В лес', when: undefined, target: 1 },
          { text: 'Остаться', when: undefined, target: 2 },
        ],
      },
      { type: 'jump', scene: 'forest' },
      { type: 'goto', step: 3 },
    ]);
  });

  it('flattens nested choices, each block continuing after its own choice', () => {
    const program = compileScene([
      {
        type: 'choice',
        options: [
          {
            text: 'Спросить',
            then: [
              {
                type: 'choice',
                options: [
                  { text: 'Вежливо', then: [say('Спасибо.')] },
                  { text: 'В лоб', then: [{ type: 'jump', scene: 'fight' }] },
                ],
              },
            ],
          },
          { text: 'Уйти', then: [say('Пока.')] },
        ],
      },
      say('Дальше.'),
    ]);

    expect(program).toEqual([
      {
        type: 'choice',
        options: [
          { text: 'Спросить', when: undefined, target: 1 },
          { text: 'Уйти', when: undefined, target: 6 },
        ],
      },
      {
        type: 'choice',
        options: [
          { text: 'Вежливо', when: undefined, target: 2 },
          { text: 'В лоб', when: undefined, target: 4 },
        ],
      },
      say('Спасибо.'),
      { type: 'goto', step: 5 }, // inner block → after the inner choice…
      { type: 'jump', scene: 'fight' },
      { type: 'goto', step: 8 }, // …which is the end of the outer block → after the outer choice
      say('Пока.'),
      { type: 'goto', step: 8 },
      say('Дальше.'),
    ]);
  });

  it('keeps an option condition', () => {
    const when = (vars: Readonly<Record<string, unknown>>) => vars.trust === 3;
    const [choice] = compileScene([
      { type: 'choice', options: [{ text: 'Довериться', when, then: [] }] },
    ]);
    expect(choice).toMatchObject({ type: 'choice', options: [{ when }] });
  });
});
