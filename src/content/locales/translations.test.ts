import { describe, expect, it } from 'vitest';
import { scenes } from '../scenes';
import { speakers } from '../speakers';
import { en } from './en';
import { collectStoryText } from './storyText';

describe('English story translations', () => {
  const storyText = collectStoryText(scenes, speakers);

  it('cover every line, option and speaker name', () => {
    const missing = [...storyText].filter((text) => !(text in en));
    expect(missing).toEqual([]);
  });

  it('hold nothing stale: every key is still in the story', () => {
    const stale = Object.keys(en).filter((key) => !storyText.has(key));
    expect(stale).toEqual([]);
  });
});

describe('collectStoryText', () => {
  it('finds lines inside choice blocks, at any depth, prompts and option texts', () => {
    const texts = collectStoryText(
      {
        intro: [
          { type: 'say', text: 'Первая' },
          {
            type: 'choice',
            prompt: { text: 'Что делать?' },
            options: [
              {
                text: 'Спросить',
                then: [
                  {
                    type: 'choice',
                    options: [{ text: 'Вежливо', then: [{ type: 'say', text: 'Спасибо.' }] }],
                  },
                ],
              },
            ],
          },
        ],
      },
      { mila: { name: 'Мила' } },
    );

    expect([...texts].sort()).toEqual([
      'Вежливо',
      'Мила',
      'Первая',
      'Спасибо.',
      'Спросить',
      'Что делать?',
    ]);
  });
});
