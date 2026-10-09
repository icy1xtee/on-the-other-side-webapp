import { STAGE_HEIGHT, STAGE_WIDTH } from '@/shared/config/stage';

/**
 * Draft values. Palette and fonts will come from Claude Design and replace values, not structure.
 * Sizes are px of the 1920×1080 stage layout; geometry starts from Ren'Py's gui.rpy defaults.
 */
export const theme = {
  stage: {
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
  },
  colors: {
    letterbox: '#000000',
    stageBackground: '#1b1b22',
    text: '#f0f0f0',
    speakerName: '#ffcc66',
    accent: '#66aaff',
    dialogueBackground: 'rgba(12, 12, 16, 0.85)',
    dialogueBorder: '#55556a',
    choiceIdle: '#2b2b36',
    choiceHover: '#40405a',
  },
  typography: {
    // System fonts with Cyrillic coverage; replaced once the design brings its own font.
    fontFamily: "system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    dialogueSize: 33,
    speakerNameSize: 45,
    interfaceSize: 33,
    lineHeight: 1.4,
  },
  dialogue: {
    height: 278,
    bottom: 0,
    nameX: 360,
    nameY: 0,
    textX: 402,
    textY: 75,
    textWidth: 1116,
  },
  choice: {
    width: 1185,
    gap: 33,
  },
  zIndex: {
    background: 0,
    sprites: 10,
    ui: 20,
    overlay: 30,
  },
  timing: {
    transitionMs: 500,
    defaultTextCps: 40,
  },
};

export type AppTheme = typeof theme;
