import styled, { keyframes } from 'styled-components';
import { PillButton } from '@/shared/ui/PillButton';

type DialogueBoxProps = {
  /** Null for narration: no name, no portrait. */
  speaker: { name: string; portrait: string | undefined } | null;
  /** The whole line. */
  text: string;
  /** The part revealed so far. */
  visibleText: string;
};

// System controls from the design. None works yet: save and load arrive in stage 5; auto,
// skip and history are beyond 0.1. They are here so the layout is the real one, and clicks on
// them prove they never advance the dialogue.
const SYSTEM_ACTIONS = ['Auto', 'Skip', 'History', 'Save', 'Load', 'Choices'] as const;

/** The design's dialogue panel along the bottom of the frame. */
export function DialogueBox({ speaker, text, visibleText }: DialogueBoxProps) {
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
          <PillButton key={action} disabled title="Скоро">
            {action}
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

const Panel = styled.section`
  position: absolute;
  left: ${({ theme }) => theme.dialogue.insetX}px;
  right: ${({ theme }) => theme.dialogue.insetX}px;
  bottom: ${({ theme }) => theme.dialogue.bottom}px;
  padding: ${({ theme }) =>
    `${theme.dialogue.paddingTop}px ${theme.dialogue.paddingX}px ${theme.dialogue.paddingBottom}px`};
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => `${theme.dialogue.gapY}px ${theme.dialogue.gapX}px`};
  border-radius: ${({ theme }) => theme.dialogue.radius}px;
  border: 1.5px solid ${({ theme }) => theme.colors.panelBorder};
  background: ${({ theme }) => theme.surfaces.panel};
  box-shadow: ${({ theme }) => theme.shadows.panel};
  cursor: pointer;
`;

const Portrait = styled.img`
  flex: 0 0 auto;
  width: ${({ theme }) => theme.dialogue.portraitSize}px;
  height: ${({ theme }) => theme.dialogue.portraitSize}px;
  border-radius: ${({ theme }) => theme.dialogue.portraitRadius}px;
  object-fit: cover;
  object-position: center top;
`;

// Room for a name and two lines even in narration, like Ren'Py's fixed textbox height: the panel
// keeps its size when narration and dialogue alternate.
const Body = styled.div`
  flex: 1 1 0;
  min-width: 0;
  min-height: ${({ theme }) =>
    theme.typography.speakerNameSize +
    theme.dialogue.nameGap +
    2 * theme.typography.dialogueSize * theme.typography.lineHeight}px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.dialogue.nameGap}px;
`;

const Name = styled.div`
  font-size: ${({ theme }) => theme.typography.speakerNameSize}px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.speakerName};
`;

const Text = styled.p`
  position: relative;
  max-width: ${({ theme }) => theme.dialogue.textMaxWidth}px;
  min-height: ${({ theme }) => 2 * theme.typography.dialogueSize * theme.typography.lineHeight}px;
  font-size: ${({ theme }) => theme.typography.dialogueSize}px;
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
  width: ${({ theme }) => theme.dialogue.caretWidth}px;
  height: ${({ theme }) => theme.dialogue.caretHeight}px;
  margin-left: 3px;
  vertical-align: -4.5px;
  background: ${({ theme }) => theme.colors.accent};
  animation: ${blink} 1s steps(1) infinite;
`;

const Actions = styled.div`
  flex: 0 0 auto;
  margin-left: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.button.gap}px;
`;
