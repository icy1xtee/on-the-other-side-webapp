import {
  FastForward,
  FolderOpen,
  Play,
  Save,
  ScrollText,
  Signpost,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import { useIsTruncated } from '@/shared/lib/useIsTruncated';
import { u } from '@/shared/lib/units';
import { PlainButton } from '@/shared/ui/PlainButton';
import { RevealButton, RevealGroup } from '@/shared/ui/RevealButton';
import { Tooltip } from '@/shared/ui/Tooltip';

// System controls from the design, as icons whose names open beside them. What they do is up to
// the page: «Назад» rolls back (inactive with nowhere to go), Auto and Skip switch modes and stay
// pressed while theirs runs (`aria-pressed`), «История» opens the history, Save saves at once;
// Load comes with the save slots, and the choice history is not there yet.
// Clicks on any of them never advance the dialogue.
const SYSTEM_ACTIONS = [
  ['back', Undo2],
  ['auto', Play],
  ['skip', FastForward],
  ['history', ScrollText],
  ['save', Save],
  ['load', FolderOpen],
  ['choices', Signpost],
] as const satisfies ReadonlyArray<readonly [string, LucideIcon]>;
const UNAVAILABLE_ACTIONS: ReadonlySet<SystemAction> = new Set(['choices']);
/** Buttons that stay pressed while their mode runs. */
const TOGGLE_ACTIONS: ReadonlySet<SystemAction> = new Set(['auto', 'skip']);

export type SystemAction = (typeof SYSTEM_ACTIONS)[number][0];

type DialogueBoxProps = {
  /** Null for narration: no namebox. */
  speaker: { name: string; portrait: string | undefined } | null;
  /** The whole line. */
  text: string;
  /** The part revealed so far. */
  visibleText: string;
  /**
   * The options of a choice, once the player has read its prompt. They go under the prompt, and
   * the prompt steps back — lifted, dimmed, cut to one line. No caret then: a click won't go on.
   */
  choice?: ReactNode;
  /** The text's size in design px: the player's "Размер текста". */
  textSize: number;
  /** The panel's opacity: the player's "Окно диалога". */
  opacity: number;
  /** In the panel's lower corner: where the story is and how long it has been played. */
  meta: ReactNode;
  /** A system button was pressed. */
  onSystemAction: (action: SystemAction) => void;
  /** Buttons that can't be used just now: «Назад» with nowhere to go back to. */
  inactive: ReadonlySet<SystemAction>;
  /** The toggles that are on: Auto or Skip while its mode runs. */
  pressed: ReadonlySet<SystemAction>;
  /** The voice button beside the name. */
  onVoice: () => void;
};

/**
 * The design's dialogue panel along the bottom of the window. The speaker's namebox sits across
 * its top edge, apart from the text, so every line starts at the same place; the system buttons
 * sit in the corner above the first line and the meta line in the corner below the last, so
 * the text has the whole width. The panel holds three lines whatever is said: it keeps its size
 * from one line to the next.
 */
export function DialogueBox({
  speaker,
  text,
  visibleText,
  choice,
  textSize,
  opacity,
  meta,
  onSystemAction,
  pressed,
  inactive,
  onVoice,
}: DialogueBoxProps) {
  const { t } = useTranslation();
  const style = { '--panel-opacity': opacity, '--text-size': textSize } as CSSProperties;

  return (
    <Panel $clickable={!choice} style={style}>
      {speaker && (
        <Namebox $withAvatar={Boolean(speaker.portrait)}>
          {speaker.portrait && <Avatar src={speaker.portrait} alt="" draggable={false} />}
          <Name>{speaker.name}</Name>
          <VoiceButton onClick={onVoice}>
            <Play aria-hidden />
            {t('dialogue.voice')}
          </VoiceButton>
        </Namebox>
      )}
      <Body>
        {choice ? (
          <>
            {text && <Prompt text={text} />}
            {choice}
          </>
        ) : (
          <Text>
            {/*
              Ren'Py's {done} trick: the whole line, invisible, holds the final height from the
              first character, so the panel doesn't grow while the text types out.
            */}
            <Ghost aria-hidden>
              {text}
              <Caret />
            </Ghost>
            <Typed>
              {visibleText}
              <Caret />
            </Typed>
          </Text>
        )}
      </Body>
      <Actions role="toolbar" aria-label={t('dialogue.actions')}>
        {SYSTEM_ACTIONS.map(([action, Icon]) => {
          const name = t(`dialogue.action.${action}`);
          const locked = UNAVAILABLE_ACTIONS.has(action);
          return (
            <RevealButton
              key={action}
              label={locked ? t('dialogue.locked', { action: name }) : name}
              icon={<Icon />}
              unavailable={locked || inactive.has(action)}
              aria-pressed={TOGGLE_ACTIONS.has(action) ? pressed.has(action) : undefined}
              onClick={() => onSystemAction(action)}
            />
          );
        })}
      </Actions>
      <Meta>{meta}</Meta>
    </Panel>
  );
}

/** The line a choice answers, stepped back once the options are out; whole in a tooltip if cut. */
function Prompt({ text }: { text: string }) {
  const { ref, truncated } = useIsTruncated<HTMLParagraphElement>(text);

  return (
    <PromptAnchor text={truncated ? text : null} align="start">
      <PromptText ref={ref}>{text}</PromptText>
    </PromptAnchor>
  );
}

const blink = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

const stepBack = keyframes`
  from {
    opacity: 1;
    transform: none;
  }
`;

/** The text's size in design px from the panel's `--text-size`, scaled like everything else. */
const scaledText = (factor = 1) => `calc(var(--text-size) * ${factor}px * var(--u, 1))`;

// The top padding makes room for the namebox's lower half whether there is one or not, so the
// text never moves. The gradient's alpha is the player's opacity; the bottom a shade denser, as
// in the design.
const Panel = styled.section<{ $clickable: boolean }>`
  position: absolute;
  left: ${({ theme }) => u(theme.dialogue.insetX)};
  right: ${({ theme }) => u(theme.dialogue.insetX)};
  bottom: ${({ theme }) => u(theme.dialogue.bottom)};
  padding: ${({ theme }) =>
    `${u(theme.namebox.height / 2 + theme.dialogue.textGap)} ${u(theme.dialogue.paddingX)} ${u(theme.dialogue.paddingBottom)}`};
  border-radius: ${({ theme }) => u(theme.dialogue.radius)};
  border: 1px solid ${({ theme }) => theme.colors.panelBorder};
  background: ${({ theme }) =>
    `linear-gradient(180deg, rgba(${theme.surfaces.panelTopRgb}, var(--panel-opacity)), rgba(${theme.surfaces.panelBottomRgb}, calc(var(--panel-opacity) + 0.01)))`};
  box-shadow: ${({ theme }) => theme.shadows.panel};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
`;

const Namebox = styled.div<{ $withAvatar: boolean }>`
  position: absolute;
  top: 0;
  left: ${({ theme }) => u(theme.dialogue.paddingX)};
  max-width: ${({ theme }) => `calc(50% - ${u(theme.dialogue.paddingX)})`};
  height: ${({ theme }) => u(theme.namebox.height)};
  transform: translateY(-50%);
  padding: ${({ theme, $withAvatar }) =>
    `0 ${u(theme.namebox.paddingEnd)} 0 ${u($withAvatar ? theme.namebox.paddingStart : theme.namebox.paddingEnd)}`};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => u(theme.namebox.gap)};
  border-radius: ${({ theme }) => u(theme.namebox.radius)};
  border: 1px solid ${({ theme }) => theme.colors.panelBorder};
  background: ${({ theme }) => theme.surfaces.namebox};
  box-shadow: ${({ theme }) => theme.shadows.namebox};
`;

const Avatar = styled.img`
  flex: none;
  width: ${({ theme }) => u(theme.namebox.avatarSize)};
  height: ${({ theme }) => u(theme.namebox.avatarSize)};
  border-radius: ${({ theme }) => u(theme.namebox.avatarRadius)};
  object-fit: cover;
`;

const Name = styled.div`
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: ${({ theme }) => u(theme.typography.speakerNameSize)};
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.textStrong};
`;

const VoiceButton = styled(PlainButton)`
  flex: none;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => u(theme.voice.gap)};
  height: ${({ theme }) => u(theme.voice.height)};
  padding: 0 ${({ theme }) => u(theme.voice.paddingX)};
  border: 1px solid ${({ theme }) => theme.colors.voiceBorder};
  border-radius: ${({ theme }) => u(theme.voice.radius)};
  background: ${({ theme }) => theme.colors.voiceBackground};
  color: ${({ theme }) => theme.colors.accentText};
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: ${({ theme }) => u(theme.typography.voiceSize)};
  letter-spacing: 0.2em;
  line-height: 1;
  text-transform: uppercase;
  transition: background 150ms;

  & > svg {
    width: ${({ theme }) => u(theme.typography.voiceSize)};
    height: ${({ theme }) => u(theme.typography.voiceSize)};
    fill: currentColor;
    stroke: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.voiceBackgroundHover};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.focusRing};
  }
`;

// Room for a few lines even when the line is short, like Ren'Py's fixed textbox height: the
// panel keeps its size from line to line, and a prompt with two options fits as well.
const Body = styled.div`
  max-width: ${({ theme }) => u(theme.dialogue.textMaxWidth)};
  min-height: ${({ theme }) => scaledText(theme.dialogue.minLines * theme.typography.lineHeight)};
  display: flex;
  flex-direction: column;
`;

const Text = styled.p`
  position: relative;
  font-size: ${scaledText()};
  line-height: ${({ theme }) => theme.typography.lineHeight};
  color: ${({ theme }) => theme.colors.dialogueText};
  text-wrap: pretty;
`;

const Ghost = styled.span`
  visibility: hidden;
`;

const Typed = styled.span`
  position: absolute;
  inset: 0;
`;

// Sized from the text, so it grows with "Размер текста": 8×19 at the design's 16.5.
const Caret = styled.span`
  display: inline-block;
  width: ${({ theme }) => `${theme.dialogue.caretWidth / theme.typography.dialogueSizes.normal}em`};
  height: ${({ theme }) =>
    `${theme.dialogue.caretHeight / theme.typography.dialogueSizes.normal}em`};
  margin-left: ${u(2)};
  vertical-align: -0.18em;
  background: ${({ theme }) => theme.colors.accent};
  animation: ${blink} 1s steps(1) infinite;
`;

const PromptAnchor = styled(Tooltip)`
  display: flex;
`;

const PromptText = styled.p`
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: ${scaledText()};
  line-height: ${({ theme }) => theme.typography.lineHeight};
  color: ${({ theme }) => theme.colors.dialogueText};
  opacity: ${({ theme }) => theme.choice.promptOpacity};
  transform: translateY(${({ theme }) => u(-theme.choice.promptLift)});
  animation: ${stepBack} ${({ theme }) => theme.timing.choiceRevealMs}ms ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// As far from the panel's edges as the buttons are from each other. Anchored on the right: a
// label opens to the left and pushes the buttons there.
const Actions = styled(RevealGroup)`
  position: absolute;
  top: ${({ theme }) => u(theme.button.gap)};
  right: ${({ theme }) => u(theme.button.gap)};
  display: flex;
  gap: ${({ theme }) => u(theme.button.gap)};
`;

// In the bottom padding, under the last line's end.
const Meta = styled.div`
  position: absolute;
  right: ${({ theme }) => u(theme.dialogue.paddingX)};
  bottom: ${({ theme }) => u((theme.dialogue.paddingBottom - theme.typography.metaSize * 1.4) / 2)};
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: ${({ theme }) => u(theme.typography.metaSize)};
  letter-spacing: 0.2em;
  line-height: 1.4;
  text-transform: uppercase;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.textMuted};
  pointer-events: none;
`;
