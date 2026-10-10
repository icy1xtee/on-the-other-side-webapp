import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';
import { u } from '@/shared/lib/units';

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * A window over the screen: a dimmed backdrop and a panel, for the settings and confirmations.
 * Esc or a click on the backdrop closes it. Esc is caught in the capture phase, before the
 * game's own keys see it, so closing the window can't also reopen it; clicks inside never reach
 * the stage behind.
 */
export function Modal({ title, onClose, children }: ModalProps) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const latestOnClose = useRef(onClose);
  useLayoutEffect(() => {
    latestOnClose.current = onClose;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        latestOnClose.current();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, []);

  // A keyboard player lands inside the window, not on the game behind it.
  useEffect(() => {
    panel.current?.focus();
  }, []);

  return (
    <Backdrop
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <Panel ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <Title id={titleId}>{title}</Title>
        {children}
      </Panel>
    </Backdrop>
  );
}

/** The window's buttons, at its bottom right; a first one of two goes to the left edge. */
export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => u(theme.button.gap)};

  & > :first-child:not(:last-child) {
    margin-right: auto;
  }
`;

const appear = keyframes`
  from { opacity: 0; }
`;

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: ${({ theme }) => u(theme.dialogue.insetX)};
  background: ${({ theme }) => theme.colors.backdrop};
  backdrop-filter: blur(6px);
  animation: ${appear} 150ms ease-out;
`;

const Panel = styled.div`
  width: min(${({ theme }) => u(theme.modal.width)}, 100%);
  max-height: 100%;
  overflow-y: auto;
  padding: ${({ theme }) => u(theme.modal.padding)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => u(theme.modal.gap)};
  border-radius: ${({ theme }) => u(theme.dialogue.radius)};
  border: 1px solid ${({ theme }) => theme.colors.panelBorder};
  background: ${({ theme }) => theme.surfaces.panel};
  box-shadow: ${({ theme }) => theme.shadows.panel};
  cursor: default;
  outline: none;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => u(theme.typography.interfaceSize)};
  font-weight: 500;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.speakerName};
`;
