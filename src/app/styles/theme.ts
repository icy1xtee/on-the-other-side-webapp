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
    // Choices are not in the design yet: options are plain text that lights up in the colour of
    // the logo mark.
    choiceText: '#d6dae2',
    choiceTextLit: '#a9e3ee',
    // Opaque: a line's tooltip may lie over the system buttons.
    tooltipBackground: '#26292f',
    tooltipBorder: 'rgba(255, 255, 255, 0.08)',
    tooltipText: '#e8eaef',
    // The settings and confirmation windows are not in the design either: drafted from the panel.
    backdrop: 'rgba(5, 7, 11, 0.6)',
    sliderTrack: 'rgba(255, 255, 255, 0.12)',
    sliderThumb: '#eef0f4',
    sliderRing: 'rgba(124, 195, 214, 0.3)',
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
    namebox: 'linear-gradient(180deg, rgba(20, 26, 38, 0.98), rgba(11, 15, 23, 0.98))',
    logoMark: 'radial-gradient(circle at 32% 30%, #a9e3ee 0%, #4f9fb8 40%, #1c4e66 100%)',
  },
  shadows: {
    header: '0 1px 18px rgba(60, 110, 210, 0.18)',
    panel: '0 -10px 40px rgba(0, 0, 0, 0.35)',
    namebox: '0 6px 20px rgba(0, 0, 0, 0.4)',
    /** A text-shadow: the glow of a lit choice option. */
    choiceGlow: '0 0 14px rgba(110, 190, 215, 0.55)',
    tooltip: '0 6px 18px rgba(0, 0, 0, 0.45)',
    logoMark: '0 0 14px rgba(110, 190, 215, 0.35)',
  },
  typography: {
    fontFamily: "'Geist', system-ui, sans-serif",
    monoFamily: "'Geist Mono', ui-monospace, monospace",
    titleSize: 64,
    interfaceSize: 22,
    speakerNameSize: 18,
    dialogueSize: 16.5,
    buttonSize: 13,
    tooltipSize: 12,
    labelSize: 14,
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
    paddingX: 28,
    paddingBottom: 24,
    /** From the namebox's lower half to the first line; the text starts there for everyone. */
    textGap: 14,
    radius: 16,
    /**
     * The panel's full inner width on a 16:9 window; a wider window stops the lines here, or
     * they would grow too long to read.
     */
    textMaxWidth: 1120,
    /** Lines the panel holds before it grows: a line of two, or a prompt and two options. */
    minLines: 3,
    caretWidth: 8,
    caretHeight: 19,
  },
  /**
   * The speaker's portrait and name on a plate across the panel's top edge, half over it —
   * Ren'Py's namebox. It sits apart from the text, so a line starts at the same place whoever
   * speaks, the narrator included.
   */
  namebox: {
    height: 52,
    avatarSize: 44,
    avatarRadius: 10,
    /** Around the avatar; a namebox without one is padded like its right side. */
    paddingStart: 4,
    paddingEnd: 18,
    gap: 12,
    radius: 14,
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
  /**
   * A choice inside the dialogue panel: options are lines of text under the prompt, which steps
   * back — lifted, dimmed, cut to one line. Draft: the design has no choices yet.
   */
  choice: {
    promptLift: 6,
    promptOpacity: 0.5,
    /** The dot that lights up beside a hovered option, in the panel's padding. */
    markerSize: 6,
    markerOffset: 15,
  },
  tooltip: {
    offset: 8,
    paddingX: 9,
    paddingY: 5,
    radius: 7,
  },
  /** A window over the screen — settings, confirmations. Draft in the dialogue panel's look. */
  modal: {
    width: 480,
    padding: 28,
    gap: 22,
    rowGap: 14,
    /** The settings' label and value columns; the slider takes what is left between them. */
    labelWidth: 150,
    valueWidth: 82,
  },
  slider: {
    height: 18,
    trackHeight: 4,
    thumbSize: 14,
  },
  zIndex: {
    background: 0,
    sprites: 10,
    ui: 20,
    overlay: 30,
  },
  timing: {
    /** Scene transitions and music fades — Ren'Py's default `dissolve`. */
    transitionMs: 500,
    /** The prompt stepping back and the options coming in, one after another. */
    choiceRevealMs: 320,
    choiceStaggerMs: 70,
    tooltipMs: 140,
    /** Hover this long before a tooltip shows: passing the pointer over buttons shows nothing. */
    tooltipDelayMs: 250,
  },
};

export type AppTheme = typeof theme;
