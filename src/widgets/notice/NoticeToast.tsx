import { useEffect } from 'react';
import styled from 'styled-components';

const VISIBLE_MS = 2000;

type NoticeToastProps = {
  notice: { id: number; text: string } | null;
  onHide: () => void;
};

/** A short message under the header that hides itself; a new notice restarts the timer. */
export function NoticeToast({ notice, onHide }: NoticeToastProps) {
  const id = notice?.id;

  useEffect(() => {
    if (id === undefined) {
      return;
    }
    const timer = setTimeout(onHide, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [id, onHide]);

  return notice ? <Toast role="status">{notice.text}</Toast> : null;
}

const Toast = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.header.height + 24}px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 27px;
  border-radius: ${({ theme }) => theme.button.radius}px;
  border: 1.5px solid ${({ theme }) => theme.colors.buttonBorder};
  background: ${({ theme }) => theme.surfaces.panel};
  box-shadow: ${({ theme }) => theme.shadows.panel};
  color: ${({ theme }) => theme.colors.buttonText};
  font-size: ${({ theme }) => theme.typography.buttonSize}px;
  pointer-events: none;
`;
