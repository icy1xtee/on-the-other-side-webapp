import {
  FastForward,
  FolderOpen,
  Play,
  Save,
  ScrollText,
  Signpost,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import { useIsTruncated } from '@/shared/lib/useIsTruncated';
import { u } from '@/shared/lib/units';
import { IconButton } from '@/shared/ui/IconButton';
import { Tooltip } from '@/shared/ui/Tooltip';

// System controls from the design, as icons named by their tooltips. What they do is up to the
// page: in 0.1 Save saves at once; load, auto, skip and history are beyond 0.1 and are stubs;
// the choice history is locked. Clicks on any of them never advance the dialogue.
const SYSTEM_ACTIONS = [
  ['auto', Play],
  ['skip', FastForward],
  ['history', ScrollText],
  ['save', Save],
  ['load', FolderOpen],
  ['choices', Signpost],
] as const satisfies ReadonlyArray<readonly [string, LucideIcon]>;
const LOCKED_ACTIONS: ReadonlySet<SystemAction> = new Set(['choices']);

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
  /** A system button was pressed. */
  onSystemAction: (action: SystemAction) => void;
};

/**
 * The design's dialogue panel along the bottom of the window. The speaker's namebox sits across
 * its top edge, apart from the text, so every line starts at the same place.
 */
export function DialogueBox({
  speaker,
  text,
  visibleText,
  choice,
  onSystemAction,
}: DialogueBoxProps) {
  const { t } = useTranslation();

  return (
    <Panel $clickable={!choice}>
      {speaker && (
        <Namebox $withAvatar={Boolean(speaker.portrait)}>
          {speaker.portrait && <Avatar src={speaker.portrait} alt="" draggable={false} />}
          <Name>{speaker.name}</Name>
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
      <Actions>
        {SYSTEM_ACTIONS.map(([action, Icon]) => {
          const name = t(`dialogue.action.${action}`);
          const locked = LOCKED_ACTIONS.has(action);
          return (
            <IconButton
              key={action}
              label={locked ? t('dialogue.locked', { action: name }) : name}
              disabled={locked}
              onClick={() => onSystemAction(action)}
            >
              <Icon />
            </IconButton>
          );
        })}
      </Actions>
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

// The top padding makes room for the namebox's lower half whether there is one or not, so the
// text never moves; the system buttons sit in the corner above the first line, so the text has
// the whole width.
const Panel = styled.section<{ $clickable: boolean }>`
  position: absolute;
  left: ${({ theme }) => u(theme.dialogue.insetX)};
  right: ${({ theme }) => u(theme.dialogue.insetX)};
  bottom: ${({ theme }) => u(theme.dialogue.bottom)};
  padding: ${({ theme }) =>
    `${u(theme.namebox.height / 2 + theme.dialogue.textGap)} ${u(theme.dialogue.paddingX)} ${u(theme.dialogue.paddingBottom)}`};
  border-radius: ${({ theme }) => u(theme.dialogue.radius)};
  border: 1px solid ${({ theme }) => theme.colors.panelBorder};
  background: ${({ theme }) => theme.surfaces.panel};
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
  color: ${({ theme }) => theme.colors.speakerName};
`;

// Room for a few lines even when the line is short, like Ren'Py's fixed textbox height: the
// panel keeps its size from line to line, and a prompt with two options fits as well.
const Body = styled.div`
  max-width: ${({ theme }) => u(theme.dialogue.textMaxWidth)};
  min-height: ${({ theme }) =>
    u(theme.dialogue.minLines * theme.typography.dialogueSize * theme.typography.lineHeight)};
  display: flex;
  flex-direction: column;
`;

const Text = styled.p`
  position: relative;
  font-size: ${({ theme }) => u(theme.typography.dialogueSize)};
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

const Caret = styled.span`
  display: inline-block;
  width: ${({ theme }) => u(theme.dialogue.caretWidth)};
  height: ${({ theme }) => u(theme.dialogue.caretHeight)};
  margin-left: ${u(2)};
  vertical-align: ${u(-3)};
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
  font-size: ${({ theme }) => u(theme.typography.dialogueSize)};
  line-height: ${({ theme }) => theme.typography.lineHeight};
  color: ${({ theme }) => theme.colors.dialogueText};
  opacity: ${({ theme }) => theme.choice.promptOpacity};
  transform: translateY(${({ theme }) => u(-theme.choice.promptLift)});
  animation: ${stepBack} ${({ theme }) => theme.timing.choiceRevealMs}ms ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// As far from the panel's edges as the buttons are from each other.
const Actions = styled.div`
  position: absolute;
  top: ${({ theme }) => u(theme.button.gap)};
  right: ${({ theme }) => u(theme.button.gap)};
  display: flex;
  gap: ${({ theme }) => u(theme.button.gap)};
`;
