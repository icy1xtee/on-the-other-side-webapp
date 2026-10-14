import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
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

/** The windows open now, the newest last: Esc closes only the newest. */
const openWindows: object[] = [];

/**
 * A window over the screen on a dimmed, blurred backdrop: the game menu, confirmations. Esc or
 * a click on the backdrop closes it. Esc is caught in the capture phase, before the game's own
 * keys see it, so closing the window can't also reopen it; clicks inside never reach the stage
 * behind.
 *
 * A window may open inside another — a question over the game menu: its backdrop then covers
 * that window only (the nearest positioned box), Esc closes it alone, and on closing it gives the
 * focus back to where it was in the window under it.
 */
export function Modal({ labelledBy, onClose, role = 'dialog', className, children }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const latestOnClose = useRef(onClose);
  useLayoutEffect(() => {
    latestOnClose.current = onClose;
  });
  // Where the focus was, and the window it was in. Taken while rendering: once this window is in,
  // the one under it may be inert and lose the focus.
  const [opener] = useState(() => {
    const focused = document.activeElement;
    const within = focused?.closest<HTMLElement>('[aria-modal]');
    return focused instanceof HTMLElement && within ? { focused, window: within } : null;
  });

  useEffect(() => {
    const self = {};
    openWindows.push(self);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && openWindows.at(-1) === self) {
        event.preventDefault();
        event.stopPropagation();
        latestOnClose.current();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      openWindows.splice(openWindows.indexOf(self), 1);
    };
  }, []);

  // A keyboard player lands inside the window, not on the game behind it; leaving a window opened
  // from another, they land back where they were — or in that window, if what they were on has
  // gone (a deleted slot). Leaving for the game, no: a button of the panel in focus would take
  // the next Space instead of the story.
  useEffect(() => {
    panel.current?.focus();
    return () => {
      if (opener?.focused.isConnected) {
        opener.focused.focus();
      } else if (opener?.window.isConnected) {
        opener.window.focus();
      }
    };
  }, [opener]);

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
