/**
 * Tokens from the Claude Design layouts (.claude/ref/layout-design: Reader, Main Menu, Game Menu,
 * Confirm Dialog). Sizes are design px — the design's own numbers for a 1280×720 page — and
 * reach the screen through `u()`, scaled by the UI scale: at 1920×1080 everything is 1.5× larger.
 * Proportions and positions are percentages of the window.
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
    /** Names and titles. */
    textStrong: '#f4f5f8',
    /** The lines of a save or a confirmation under their titles. */
    textSecondary: '#b9bfca',
    /** Mono meta lines: scene and play time, save dates. */
    textMuted: '#7c8492',
    /** A setting's explanation under its name. */
    textHint: '#8a919e',
    /** Tabs and menu items that aren't the current one. */
    textNav: '#a7aebb',
    textMenu: '#c3c8d1',
    textDisabled: '#5f6673',
    dialogueText: '#d6dae2',
    accent: '#7cc3d6',
    accentFill: '#5fb0c6',
    accentText: '#a6dbe6',
    /** A quiet teal edge: the AUTO / SKIP plaque, the history's choice mark. */
    accentBorderQuiet: 'rgba(110, 190, 210, 0.28)',
    /** The history's choice mark. */
    accentTextQuiet: '#6fa5b3',
    focusRing: 'rgba(124, 195, 214, 0.5)',
    panelBorder: 'rgba(255, 255, 255, 0.08)',
    windowBorder: 'rgba(255, 255, 255, 0.09)',
    dialogBorder: 'rgba(255, 255, 255, 0.1)',
    headerBorder: 'rgba(120, 160, 230, 0.16)',
    /** Between a window's parts, and between its rows. */
    divider: 'rgba(255, 255, 255, 0.07)',
    hairline: 'rgba(255, 255, 255, 0.06)',
    buttonText: '#eef0f4',
    buttonBackground: 'rgba(255, 255, 255, 0.03)',
    buttonBackgroundHover: 'rgba(255, 255, 255, 0.08)',
    buttonBorder: 'rgba(255, 255, 255, 0.12)',
    buttonBorderDisabled: 'rgba(255, 255, 255, 0.06)',
    /** Small square controls: the cog, the close cross. */
    controlText: '#aab1bd',
    controlBackground: 'rgba(255, 255, 255, 0.035)',
    controlBackgroundHover: 'rgba(255, 255, 255, 0.07)',
    controlBorder: 'rgba(255, 255, 255, 0.09)',
    navBackgroundActive: 'rgba(255, 255, 255, 0.09)',
    navBackgroundHover: 'rgba(255, 255, 255, 0.04)',
    railBackground: 'rgba(255, 255, 255, 0.015)',
    menuBackgroundHover: 'rgba(255, 255, 255, 0.07)',
    /** What is chosen: a segment, a pressed mode, the teal button. */
    selectedText: '#d4f1f7',
    selectedBackground: 'rgba(56, 130, 150, 0.26)',
    selectedBorder: 'rgba(110, 190, 210, 0.4)',
    primaryBackground: 'rgba(56, 130, 150, 0.3)',
    primaryBackgroundHover: 'rgba(56, 130, 150, 0.42)',
    primaryBorder: 'rgba(110, 190, 210, 0.48)',
    dangerText: '#f2c1b8',
    dangerBackground: 'rgba(190, 92, 78, 0.2)',
    dangerBackgroundHover: 'rgba(190, 92, 78, 0.32)',
    dangerBorder: 'rgba(226, 140, 126, 0.45)',
    dangerDot: '#e09a8f',
    // A choice's options are plain text that lights up in the colour of the logo mark.
    choiceText: '#d6dae2',
    choiceTextLit: '#a9e3ee',
    // Opaque: a cut prompt's tooltip may lie over the system buttons.
    tooltipBackground: '#26292f',
    tooltipBorder: 'rgba(255, 255, 255, 0.08)',
    tooltipText: '#e8eaef',
    voiceBackground: 'rgba(56, 130, 150, 0.2)',
    voiceBackgroundHover: 'rgba(56, 130, 150, 0.32)',
    voiceBorder: 'rgba(110, 190, 210, 0.38)',
    backdrop: 'rgba(3, 5, 10, 0.56)',
    sliderTrack: 'rgba(255, 255, 255, 0.08)',
    sliderThumb: '#e6f6fa',
    sliderValue: '#c9cfd9',
    switchOnBackground: 'rgba(56, 130, 150, 0.38)',
    switchOnBorder: 'rgba(110, 190, 210, 0.5)',
    switchOnKnob: '#bfe8f1',
    switchOffBackground: 'rgba(255, 255, 255, 0.05)',
    switchOffBorder: 'rgba(255, 255, 255, 0.13)',
    switchOffKnob: '#7d8594',
  },
  surfaces: {
    stage:
      'radial-gradient(70% 45% at 52% 82%, rgba(38, 72, 150, 0.42), rgba(5, 7, 11, 0) 70%), ' +
      'radial-gradient(40% 50% at 58% 40%, rgba(80, 130, 220, 0.35), rgba(5, 7, 11, 0) 70%), ' +
      'linear-gradient(180deg, #0b1222 0%, #0a1020 60%, #05070b 100%)',
    menuStage:
      'radial-gradient(60% 50% at 70% 45%, rgba(80, 130, 220, 0.32), rgba(5, 7, 11, 0) 70%), ' +
      'radial-gradient(70% 45% at 40% 95%, rgba(38, 72, 150, 0.38), rgba(5, 7, 11, 0) 70%), ' +
      'linear-gradient(180deg, #0b1222 0%, #0a1020 60%, #05070b 100%)',
    sceneShade:
      'linear-gradient(180deg, rgba(5, 7, 11, 0) 0%, rgba(5, 7, 11, 0) 72%, rgba(8, 14, 32, 0.55) 100%), ' +
      'linear-gradient(90deg, rgba(5, 7, 11, 0.35) 0%, rgba(5, 7, 11, 0) 30%, rgba(5, 7, 11, 0) 80%, rgba(5, 7, 11, 0.3) 100%)',
    /** The main menu's art, darkened on the left where the menu stands. */
    menuShade:
      'linear-gradient(90deg, rgba(5, 7, 11, 0.92) 0%, rgba(5, 7, 11, 0.72) 30%, rgba(5, 7, 11, 0.12) 60%, rgba(5, 7, 11, 0) 100%), ' +
      'linear-gradient(180deg, rgba(5, 7, 11, 0) 60%, rgba(5, 7, 11, 0.6) 100%)',
    header: 'linear-gradient(180deg, rgba(5, 7, 11, 0.94), rgba(7, 10, 16, 0.82))',
    /**
     * The dialogue panel's gradient, top to bottom, as RGB: its opacity is the player's
     * "Окно диалога" setting.
     */
    panelTopRgb: '14, 18, 27',
    panelBottomRgb: '8, 11, 17',
    namebox: 'linear-gradient(180deg, rgba(20, 26, 38, 0.98), rgba(11, 15, 23, 0.98))',
    card: 'linear-gradient(180deg, rgba(14, 18, 27, 0.92), rgba(8, 11, 17, 0.94))',
    window: 'linear-gradient(180deg, rgba(15, 19, 29, 0.98), rgba(8, 11, 17, 0.98))',
    dialog: 'linear-gradient(180deg, rgba(18, 23, 34, 0.99), rgba(10, 13, 20, 0.99))',
    toast: 'rgba(14, 18, 27, 0.96)',
    modeIndicator: 'rgba(8, 11, 17, 0.62)',
    logoMark: 'radial-gradient(circle at 32% 30%, #a9e3ee 0%, #4f9fb8 40%, #1c4e66 100%)',
  },
  shadows: {
    header: '0 1px 18px rgba(60, 110, 210, 0.18)',
    panel: '0 -10px 40px rgba(0, 0, 0, 0.35)',
    namebox: '0 6px 20px rgba(0, 0, 0, 0.4)',
    /** A text-shadow: the glow of a lit choice option. */
    choiceGlow: '0 0 14px rgba(110, 190, 215, 0.55)',
    tooltip: '0 6px 18px rgba(0, 0, 0, 0.45)',
    card: '0 20px 50px rgba(0, 0, 0, 0.35)',
    window: '0 30px 80px rgba(0, 0, 0, 0.55), 0 0 48px rgba(60, 110, 210, 0.14)',
    dialog: '0 24px 60px rgba(0, 0, 0, 0.55), 0 0 36px rgba(60, 110, 210, 0.1)',
    toast: '0 16px 40px rgba(0, 0, 0, 0.45)',
    logoMark: '0 0 14px rgba(110, 190, 215, 0.35)',
    logoMarkLarge: '0 0 26px rgba(110, 190, 215, 0.4)',
    sliderThumb: '0 0 0 4px rgba(124, 195, 214, 0.16), 0 0 12px rgba(124, 195, 214, 0.45)',
    switchKnob: '0 0 10px rgba(124, 195, 214, 0.5)',
    /** The glow of a teal dot: a lit choice option, a toast. */
    dot: '0 0 10px rgba(124, 195, 214, 0.7)',
    dangerDot: '0 0 10px rgba(224, 154, 143, 0.6)',
  },
  typography: {
    fontFamily: "'Geist', system-ui, sans-serif",
    monoFamily: "'Geist Mono', ui-monospace, monospace",
    lineHeight: 1.6,
    /** The dialogue text by the player's "Размер текста". */
    dialogueSizes: { small: 15, normal: 16.5, large: 18.5 },
    speakerNameSize: 18,
    buttonSize: 13,
    tooltipSize: 12,
    /** Mono meta lines, spaced out: `0.2em`. */
    metaSize: 10,
    logoSize: 11,
    menuLogoSize: 24,
    windowTitleSize: 22,
    dialogTitleSize: 18,
    bodySize: 14,
    labelSize: 14.5,
    hintSize: 12.5,
    tabSize: 14,
    menuNavSize: 17,
    cardTitleSize: 20,
    cardLineSize: 13.5,
    toastSize: 13.5,
    modeSize: 10.5,
    historyNameSize: 15,
    historyTextSize: 15.5,
    historyChoiceSize: 14,
    historyMarkSize: 9.5,
    valueSize: 11,
    voiceSize: 9,
  },
  header: {
    height: 68,
    paddingX: 52,
    gap: 12,
    logoMarkSize: 22,
    logoTextWidth: 130,
    /** The cog and the avatar. */
    buttonSize: 34,
    buttonRadius: 10,
    iconSize: 16,
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
  /** The "▶ ГОЛОС" button beside the name. */
  voice: {
    height: 24,
    paddingX: 10,
    radius: 7,
    gap: 6,
  },
  button: {
    height: 30,
    radius: 11,
    gap: 7,
    paddingX: 12,
    iconSize: 15,
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
   * back — lifted, dimmed, cut to one line.
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
  menu: {
    insetX: 52,
    width: 440,
    paddingTop: 56,
    paddingBottom: 52,
    logoMarkSize: 40,
    logoGap: 18,
    /** Between the Continue card and the items. */
    gap: 18,
    itemHeight: 46,
    itemPaddingX: 16,
    itemRadius: 10,
    itemGap: 2,
    /** The character's column, in % of the window. */
    characterLeft: 56,
    characterWidth: 30,
    characterTop: 6,
  },
  card: {
    paddingY: 16,
    paddingX: 18,
    radius: 16,
    gap: 18,
    thumbSize: 67,
    thumbRadius: 12,
    lineGap: 7,
  },
  /** Ren'Py's game menu: the history and the settings now, the saves with stage 4. */
  gameMenu: {
    width: 960,
    height: 600,
    radius: 16,
    /** Kept free around the window on small screens. */
    margin: 24,
    railWidth: 208,
    railPaddingTop: 22,
    railPaddingX: 12,
    railPaddingBottom: 14,
    logoMarkSize: 20,
    logoTextWidth: 128,
    navHeight: 38,
    navPaddingX: 12,
    navRadius: 8,
    navGap: 2,
    headerPaddingTop: 22,
    contentPaddingX: 28,
    closeSize: 32,
    closeRadius: 10,
  },
  /** The History section: the lines read and the choices made, newest at the bottom. */
  history: {
    paddingTop: 14,
    paddingBottom: 28,
    gap: 20,
    maxWidth: 660,
    nameGap: 5,
    markGap: 10,
    markPaddingY: 3,
    markPaddingX: 7,
    markRadius: 6,
  },
  settings: {
    tabsPaddingTop: 18,
    tabsPaddingBottom: 16,
    tabPaddingY: 7,
    tabPaddingX: 14,
    tabRadius: 8,
    tabGap: 4,
    rowPaddingY: 16,
    rowGapX: 28,
    rowGapY: 12,
    hintGap: 4,
    controlWidth: 300,
    valueWidth: 58,
    footerPaddingY: 16,
  },
  actionButton: {
    height: 32,
    paddingX: 14,
    radius: 11,
  },
  slider: {
    height: 22,
    trackHeight: 4,
    thumbSize: 14,
    gap: 14,
  },
  switch: {
    width: 40,
    height: 22,
    knobSize: 16,
    padding: 2,
  },
  segmented: {
    padding: 3,
    radius: 10,
    gap: 2,
    height: 26,
    minWidth: 34,
    paddingX: 12,
    optionRadius: 7,
  },
  dialog: {
    width: 400,
    paddingTop: 22,
    paddingRight: 22,
    paddingBottom: 18,
    paddingLeft: 24,
    radius: 14,
    gap: 9,
    actionsGap: 8,
    actionsTop: 12,
  },
  toast: {
    /** Under the header. */
    top: 84,
    paddingY: 10,
    paddingX: 16,
    radius: 12,
    gap: 10,
    dotSize: 7,
  },
  /** AUTO ▸ / SKIP ▸▸ under the header, on the left: what is turning the pages. */
  modeIndicator: {
    top: 88,
    left: 52,
    height: 26,
    paddingX: 10,
    radius: 8,
  },
  zIndex: {
    /** Background and characters together: they dissolve as one frame. */
    scene: 0,
    ui: 20,
    overlay: 30,
  },
  timing: {
    /** Scene transitions and music fades — Ren'Py's default `dissolve`. */
    transitionMs: 500,
    /** The options coming in under the prompt, one after another. */
    choiceRevealMs: 320,
    choiceStaggerMs: 70,
    /** An icon button opening its label. */
    revealMs: 180,
    tooltipMs: 140,
    /** Hover this long before a tooltip shows: passing the pointer over buttons shows nothing. */
    tooltipDelayMs: 250,
    toastMs: 350,
    toastVisibleMs: 2600,
  },
};

export type AppTheme = typeof theme;
