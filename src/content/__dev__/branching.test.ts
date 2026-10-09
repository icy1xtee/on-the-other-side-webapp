import { advance, choose, createSceneRegistry, resolveText, startGame } from '@engine';
import { describe, expect, it } from 'vitest';
import { scenes } from '../scenes';
import { variableDefaults } from '../variables';
import { devScenes, devStartScene } from './index';

/** Plays the dev scenes to the end: clicks through every line, picks options by their text. */
function play(picks: readonly string[]) {
  const registry = createSceneRegistry({ ...scenes, ...devScenes }, devStartScene);
  let result = startGame(registry, variableDefaults);
  const lines: string[] = [];
  const offered: string[][] = [];
  const queue = [...picks];

  for (let guard = 0; result.interaction.type !== 'end' && guard < 100; guard++) {
    const { interaction } = result;
    if (interaction.type === 'say') {
      lines.push(resolveText(interaction.text));
      result = advance(result.state, registry);
      continue;
    }
    const pick = queue.shift();
    const visible = interaction.options.filter((option) => option.available);
    offered.push(visible.map((option) => resolveText(option.text)));
    const index = interaction.options.findIndex(
      (option) => option.available && option.text === pick,
    );
    if (index < 0) {
      throw new Error(`"${pick}" is not offered, only: ${offered.at(-1)?.join(', ')}`);
    }
    result = choose(result.state, registry, index);
  }

  return { lines, offered, state: result.state, end: result.interaction.type === 'end' };
}

describe('dev branching scenes', () => {
  it('boot together with the story: every goTo leads somewhere', () => {
    expect(() => createSceneRegistry({ ...scenes, ...devScenes }, devStartScene)).not.toThrow();
  });

  it('remember a good answer: the street then offers more', () => {
    const run = play(['Отлично!', 'На улицу', 'Взять её за руку']);

    expect(run.end).toBe(true);
    expect(run.offered.at(-1)).toEqual(['Взять её за руку', 'Идти молча']);
    expect(run.lines).toContain('Мила улыбается.');
    expect(run.state.vars).toEqual({ metMila: true, trust: 1 });
    expect(run.state.stage.background).toBe('street');
  });

  it('take another way through a nested choice: the street option stays hidden', () => {
    const run = play(['Так себе.', 'Голова болит.', 'На улицу', 'Идти молча']);

    expect(run.end).toBe(true);
    expect(run.lines).toContain('Тогда начнём с кофе.');
    expect(run.lines).toContain('Обе реакции сходятся здесь, за развилкой.');
    expect(run.offered.at(-1)).toEqual(['Идти молча']);
    expect(run.state.vars).toEqual({ metMila: true, trust: 0 });
  });

  it('stay home: the stage carries over and a choice with nothing to offer is skipped', () => {
    const run = play(['Отлично!', 'Остаться дома']);

    expect(run.end).toBe(true);
    expect(run.offered).toHaveLength(2);
    expect(run.lines).not.toContain('И этой реплики тоже.');
    expect(run.lines).toContain('Выбор без доступных вариантов пропущен.');
    expect(run.state.stage).toEqual({
      background: 'room',
      sprites: [{ tag: 'mila', emotion: 'happy', at: 'center' }],
    });
  });
});
