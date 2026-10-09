/**
 * Tokens from the Claude Design layout (.claude/ref/html). Sizes are design px — the design's own
 * numbers for a 1280×720 page — and reach the screen through `u()`, scaled by the UI scale:
 * at 1920×1080 everything is 1.5× larger. Proportions and positions are percentages of the window.
 */
export const theme = {
  layout: {
    /** The scene art fills the top 75% of the window; the dialogue panel lies over its bottom. */
    scenePercent: 75,
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
    header: '0 1px 18px rgba(60, 110, 210, 0.18)',
    panel: '0 -10px 40px rgba(0, 0, 0, 0.35)',
    logoMark: '0 0 14px rgba(110, 190, 215, 0.35)',
  },
  typography: {
    fontFamily: "'Geist', system-ui, sans-serif",
    monoFamily: "'Geist Mono', ui-monospace, monospace",
    titleSize: 64,
    interfaceSize: 22,
    speakerNameSize: 22,
    dialogueSize: 16.5,
    buttonSize: 13,
    logoSize: 11,
    captionSize: 10,
    lineHeight: 1.6,
  },
  header: {
    height: 68,
    paddingX: 52,
    logoMarkSize: 22,
  },
  dialogue: {
    insetX: 52,
    bottom: 6,
    paddingTop: 23,
    paddingX: 28,
    paddingBottom: 24,
    radius: 16,
    gapX: 22,
    gapY: 16,
    portraitSize: 67,
    portraitRadius: 12,
    nameGap: 9,
    textMaxWidth: 920,
    /** Narrower than this, the buttons wrap below the text. */
    textMinWidth: 440,
    caretWidth: 8,
    caretHeight: 19,
  },
  button: {
    height: 30,
    paddingX: 13,
    radius: 11,
    gap: 7,
  },
  icons: {
    /** Lucide draws at 2 on a 24px grid; thinner lines match the design's hairline borders. */
    strokeWidth: 1.75,
  },
  /** Sprite columns for `at left / center / right`, in % of the window width: the design's right column, mirrored. */
  sprite: {
    widthPercent: 27,
    left: 11,
    center: 36.5,
    right: 62,
  },
  choice: {
    width: 790,
    gap: 22,
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
