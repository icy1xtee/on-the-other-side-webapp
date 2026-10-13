import { advance, startGame } from '@engine';
import { describe, expect, it } from 'vitest';
import { frameView, lineView, optionViews, quotedLine, sceneTitle } from './presentation';
import { fork, presentation, registry } from './testStory';

const firstLine = startGame(registry, { trust: 0 });
const lastLine = advance(firstLine.state, registry);
const choice = startGame(fork, { trust: 0 });

describe('presentation', () => {
  it('draws the frame with ids resolved into files; no state draws an empty stage', () => {
    expect(frameView(firstLine.state, presentation)).toEqual({
      background: '/room.webp',
      sprites: [{ tag: 'mila', at: 'left', src: '/mila-happy.webp' }],
    });
    expect(frameView(null, presentation)).toEqual({ background: undefined, sprites: [] });
  });

  it('shows a spoken line with the name and portrait, narration without a speaker', () => {
    expect(lineView(firstLine.interaction, 'k1', presentation)).toEqual({
      key: 'k1',
      speaker: { name: 'Мила', portrait: '/mila-portrait.webp' },
      text: 'Первая',
    });
    expect(lineView(lastLine.interaction, 'k2', presentation)).toEqual({
      key: 'k2',
      speaker: null,
      text: 'Последняя',
    });
  });

  it("shows a choice's prompt as its line, and nothing at the end", () => {
    expect(lineView(choice.interaction, 'k', presentation)?.text).toBe('Куда пойдём?');
    expect(lineView({ type: 'end' }, 'k', presentation)).toBeNull();
  });

  it('offers only the options the player may pick, by their place among all of them', () => {
    expect(optionViews(choice.interaction)).toEqual([
      { index: 1, text: 'В парк' },
      { index: 2, text: 'Остаться' },
    ]);
    expect(optionViews(firstLine.interaction)).toBeNull();
  });

  it('names the scene; a scene without a title, or no scene, has none', () => {
    expect(sceneTitle(firstLine.state, presentation)).toBe('Начало');
    expect(sceneTitle(firstLine.state, { ...presentation, sceneTitles: {} })).toBe('');
    expect(sceneTitle(null, presentation)).toBe('');
  });

  it('quotes a line for the menu with the speaker by name', () => {
    expect(quotedLine(firstLine.interaction, presentation)).toEqual({
      speaker: 'Мила',
      text: 'Первая',
    });
    expect(quotedLine(lastLine.interaction, presentation)).toEqual({
      speaker: null,
      text: 'Последняя',
    });
  });
});
