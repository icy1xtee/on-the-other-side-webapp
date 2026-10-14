import { describe, expect, it } from 'vitest';
import { UiStore } from './UiStore';

describe('UiStore.openControls (F1)', () => {
  it('opens the game menu on «Управление», or turns the open menu to it', () => {
    const ui = new UiStore();
    ui.openControls();
    expect(ui.overlay).toEqual({ type: 'gameMenu', section: 'controls', question: null });

    ui.showMenuSection('history');
    ui.openControls();
    expect(ui.overlay).toEqual({ type: 'gameMenu', section: 'controls', question: null });
  });

  it('leaves a question waiting for its answer where it is', () => {
    const ui = new UiStore();
    ui.confirmNewGame();
    ui.openControls();
    expect(ui.overlay).toEqual({ type: 'confirmNewGame' });

    ui.openGameMenu('save');
    ui.ask({ type: 'delete', slot: 2 });
    ui.openControls();
    expect(ui.overlay).toEqual({
      type: 'gameMenu',
      section: 'save',
      question: { type: 'delete', slot: 2 },
    });
  });
});
