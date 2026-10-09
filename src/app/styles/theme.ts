import { STAGE_HEIGHT, STAGE_WIDTH } from '@/shared/config/stage';

/**
 * Tokens from the Claude Design layout (.claude/ref/html). The design was drawn for a ~1280px
 * wide page, so its pixel values are scaled by 1.5 to the 1920×1080 stage: the frame then looks
 * like the design at 1280. Sizes are px of the stage layout.
 */
export const theme = {
  stage: {
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    /** The scene art fills the top 75%; the dialogue panel lies over its shaded bottom edge. */
    sceneHeight: 810,
  },
  colors: {
    letterbox: '#000000',
    stageBackground: '#05070b',
    text: '#e8eaef',
    textMuted: '#7c8492',
    textDisabled: 'rgba(232, 234, 239, 0.35)',
    dialogueText: '#d6dae2',
    speakerName: '#f4f5f8',
    accent: '#7cc3d6',
    panelBorder: 'rgba(255, 255, 255, 0.08)',
    headerBorder: 'rgba(120, 160, 230, 0.16)',
    buttonText: '#eef0f4',
    buttonBackground: 'rgba(255, 255, 255, 0.03)',
    buttonBackgroundHover: 'rgba(255, 255, 255, 0.08)',
    buttonBorder: 'rgba(255, 255, 255, 0.12)',
    // Draft until stage 4 brings choices.
    choiceIdle: '#2b2b36',
    choiceHover: '#40405a',
  },
  surfaces: {
    stage:
      'radial-gradient(70% 45% at 52% 82%, rgba(38, 72, 150, 0.42), rgba(5, 7, 11, 0) 70%), ' +
      'radial-gradient(40% 50% at 58% 40%, rgba(80, 130, 220, 0.35), rgba(5, 7, 11, 0) 70%), ' +
      'linear-gradient(180deg, #0b1222 0%, #0a1020 60%, #05070b 100%)',
    sceneShade:
      'linear-gradient(180deg, rgba(5, 7, 11, 0) 0%, rgba(5, 7, 11, 0) 72%, rgba(8, 14, 32, 0.55) 100%), ' +
      'linear-gradient(90deg, rgba(5, 7, 11, 0.35) 0%, rgba(5, 7, 11, 0) 30%, rgba(5, 7, 11, 0) 80%, rgba(5, 7, 11, 0.3) 100%)',
    header: 'linear-gradient(180deg, rgba(5, 7, 11, 0.94), rgba(7, 10, 16, 0.82))',
    panel: 'linear-gradient(180deg, rgba(14, 18, 27, 0.96), rgba(8, 11, 17, 0.97))',
    logoMark: 'radial-gradient(circle at 32% 30%, #a9e3ee 0%, #4f9fb8 40%, #1c4e66 100%)',
  },
  shadows: {
    header: '0 1.5px 27px rgba(60, 110, 210, 0.18)',
    panel: '0 -15px 60px rgba(0, 0, 0, 0.35)',
    logoMark: '0 0 21px rgba(110, 190, 215, 0.35)',
  },
  typography: {
    fontFamily: "'Geist', system-ui, sans-serif",
    monoFamily: "'Geist Mono', ui-monospace, monospace",
    titleSize: 96,
    interfaceSize: 33,
    speakerNameSize: 33,
    dialogueSize: 24.75,
    buttonSize: 19.5,
    logoSize: 16.5,
    captionSize: 15,
    lineHeight: 1.6,
  },
  header: {
    height: 102,
    paddingX: 78,
    logoMarkSize: 33,
  },
  dialogue: {
    insetX: 78,
    bottom: 9,
    paddingTop: 35,
    paddingX: 42,
    paddingBottom: 36,
    radius: 24,
    gapX: 33,
    gapY: 24,
    portraitSize: 100,
    portraitRadius: 18,
    nameGap: 14,
    textMaxWidth: 1380,
    caretWidth: 12,
    caretHeight: 28,
  },
  button: {
    height: 45,
    paddingX: 19.5,
    radius: 16.5,
    gap: 10.5,
  },
  /** Sprite columns for `at left / center / right`: the design's right column, mirrored. */
  sprite: {
    width: 518,
    top: 102,
    bottom: 810,
    left: { left: 212 },
    center: { left: 701 },
    right: { left: 1190 },
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
    /** The design's typewriter speed; becomes a player setting in stage 6. */
    defaultTextCps: 38,
  },
};

export type AppTheme = typeof theme;
