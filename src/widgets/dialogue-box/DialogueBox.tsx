import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import { u } from '@/shared/lib/units';
import { PillButton } from '@/shared/ui/PillButton';

// System controls from the design. Save and load arrive in stage 5; auto, skip and history are
// beyond 0.1 and are stubs until then; the choice history is locked. Clicks on any of them never
// advance the dialogue.
const SYSTEM_ACTIONS = ['auto', 'skip', 'history', 'save', 'load', 'choices'] as const;
const LOCKED_ACTIONS: ReadonlySet<SystemAction> = new Set(['choices']);

export type SystemAction = (typeof SYSTEM_ACTIONS)[number];

type DialogueBoxProps = {
  /** Null for narration: no name, no portrait. */
  speaker: { name: string; portrait: string | undefined } | null;
  /** The whole line. */
  text: string;
  /** The part revealed so far. */
  visibleText: string;
  /** A system button was pressed; none of them is wired to a feature yet. */
  onSystemAction: (action: SystemAction) => void;
};

/** The design's dialogue panel along the bottom of the window. */
export function DialogueBox({ speaker, text, visibleText, onSystemAction }: DialogueBoxProps) {
  const { t } = useTranslation();

  return (
    <Panel>
      {speaker?.portrait && <Portrait src={speaker.portrait} alt="" draggable={false} />}
      <Body>
        {speaker && <Name>{speaker.name}</Name>}
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
      </Body>
      <Actions>
        {SYSTEM_ACTIONS.map((action) => (
          <PillButton
            key={action}
            disabled={LOCKED_ACTIONS.has(action)}
            title={LOCKED_ACTIONS.has(action) ? t('dialogue.locked') : undefined}
            onClick={() => onSystemAction(action)}
          >
            {t(`dialogue.action.${action}`)}
          </PillButton>
        ))}
      </Actions>
    </Panel>
  );
}

const blink = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

// The text takes what the buttons leave, down to a readable minimum; below that — on a narrow
// window — the buttons wrap under the text instead of squeezing it. The minimum is smaller than
// the design's: Russian button labels are longer than the English ones it was drawn with.
const Panel = styled.section`
  position: absolute;
  left: ${({ theme }) => u(theme.dialogue.insetX)};
  right: ${({ theme }) => u(theme.dialogue.insetX)};
  bottom: ${({ theme }) => u(theme.dialogue.bottom)};
  padding: ${({ theme }) =>
    `${u(theme.dialogue.paddingTop)} ${u(theme.dialogue.paddingX)} ${u(theme.dialogue.paddingBottom)}`};
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: ${({ theme }) => `${u(theme.dialogue.gapY)} ${u(theme.dialogue.gapX)}`};
  border-radius: ${({ theme }) => u(theme.dialogue.radius)};
  border: 1px solid ${({ theme }) => theme.colors.panelBorder};
  background: ${({ theme }) => theme.surfaces.panel};
  box-shadow: ${({ theme }) => theme.shadows.panel};
  cursor: pointer;
`;

const Portrait = styled.img`
  flex: 0 0 auto;
  width: ${({ theme }) => u(theme.dialogue.portraitSize)};
  height: ${({ theme }) => u(theme.dialogue.portraitSize)};
  border-radius: ${({ theme }) => u(theme.dialogue.portraitRadius)};
  object-fit: cover;
  object-position: center top;
`;

// Room for a name and two lines even in narration, like Ren'Py's fixed textbox height: the panel
// keeps its size when narration and dialogue alternate.
const Body = styled.div`
  flex: 1 1 0;
  min-width: min(
    ${({ theme }) => u(theme.dialogue.textMinWidth)},
    100% - ${({ theme }) => u(theme.dialogue.portraitSize + theme.dialogue.gapX)}
  );
  min-height: ${({ theme }) =>
    u(
      theme.typography.speakerNameSize +
        theme.dialogue.nameGap +
        2 * theme.typography.dialogueSize * theme.typography.lineHeight,
    )};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => u(theme.dialogue.nameGap)};
`;

const Name = styled.div`
  font-size: ${({ theme }) => u(theme.typography.speakerNameSize)};
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.speakerName};
`;

const Text = styled.p`
  position: relative;
  max-width: ${({ theme }) => u(theme.dialogue.textMaxWidth)};
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

const Actions = styled.div`
  flex: 0 1 auto;
  min-width: 0;
  margin-left: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${({ theme }) => u(theme.button.gap)};
`;
