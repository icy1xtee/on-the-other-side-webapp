import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';
import { u } from '@/shared/lib/units';

type ModalProps = {
  /** The id of the window's title, which names it for screen readers. */
  labelledBy: string;
  onClose: () => void;
  /** `alertdialog` for a question that has to be answered — a confirmation. */
  role?: 'dialog' | 'alertdialog';
  /** Styles the window itself: its size, surface and layout are the caller's. */
  className?: string;
  children: ReactNode;
};

/**
 * A window over the screen on a dimmed, blurred backdrop: the game menu, confirmations. Esc or
 * a click on the backdrop closes it. Esc is caught in the capture phase, before the game's own
 * keys see it, so closing the window can't also reopen it; clicks inside never reach the stage
 * behind.
 */
export function Modal({ labelledBy, onClose, role = 'dialog', className, children }: ModalProps) {
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
      <Panel
        ref={panel}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={className}
      >
        {children}
      </Panel>
    </Backdrop>
  );
}

const appear = keyframes`
  from { opacity: 0; }
`;

// One cell the size of the screen, less the margin: the window's `max-height: 100%` is measured
// against it, so a window taller than a small screen shrinks and scrolls inside.
const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  grid-template: minmax(0, 1fr) / minmax(0, 1fr);
  place-items: center;
  padding: ${({ theme }) => u(theme.gameMenu.margin)};
  background: ${({ theme }) => theme.colors.backdrop};
  backdrop-filter: blur(6px);
  animation: ${appear} 150ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Panel = styled.div`
  max-width: 100%;
  max-height: 100%;
  cursor: default;
  outline: none;
`;
