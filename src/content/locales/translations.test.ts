import { describe, expect, it } from 'vitest';
import { scenes } from '../scenes';
import { sceneTitles } from '../sceneTitles';
import { speakers } from '../speakers';
import { en } from './en';
import { collectStoryText } from './storyText';

describe('English story translations', () => {
  const storyText = collectStoryText(scenes, speakers, sceneTitles);

  it('cover every line, option, speaker name and scene title', () => {
    const missing = [...storyText].filter((text) => !(text in en));
    expect(missing).toEqual([]);
  });

  it('hold nothing stale: every key is still in the story', () => {
    const stale = Object.keys(en).filter((key) => !storyText.has(key));
    expect(stale).toEqual([]);
  });
});

describe('collectStoryText', () => {
  it('finds lines inside choice blocks, at any depth, prompts, option texts and titles', () => {
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
      { intro: 'Начало' },
    );

    expect([...texts].sort()).toEqual([
      'Вежливо',
      'Мила',
      'Начало',
      'Первая',
      'Спасибо.',
      'Спросить',
      'Что делать?',
    ]);
  });
});
