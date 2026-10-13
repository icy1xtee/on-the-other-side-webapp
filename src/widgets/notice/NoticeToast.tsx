import styled, { css, keyframes } from 'styled-components';
import { u } from '@/shared/lib/units';

type NoticeToastProps = {
  notice: { id: number; text: string; tone: 'info' | 'error' } | null;
  onHide: () => void;
};

/**
 * A short message under the header: it comes in, stays a couple of seconds and goes, then hides
 * itself. A teal dot says it went well, a red one that it didn't. A new notice starts over.
 */
export function NoticeToast({ notice, onHide }: NoticeToastProps) {
  if (!notice) {
    return null;
  }
  return (
    <Toast
      key={notice.id}
      role="status"
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) {
          onHide();
        }
      }}
    >
      <Dot $error={notice.tone === 'error'} />
      {notice.text}
    </Toast>
  );
}

// In over a tenth of its life, out over the last tenth.
const life = keyframes`
  0% { opacity: 0; transform: translate(-50%, -6px); }
  11%, 89% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, 0); }
`;

const Toast = styled.div`
  position: absolute;
  top: ${({ theme }) => u(theme.toast.top)};
  left: 50%;
  max-width: calc(100% - ${u(48)});
  display: flex;
  align-items: center;
  gap: ${({ theme }) => u(theme.toast.gap)};
  padding: ${({ theme }) => `${u(theme.toast.paddingY)} ${u(theme.toast.paddingX)}`};
  border: 1px solid ${({ theme }) => theme.colors.dialogBorder};
  border-radius: ${({ theme }) => u(theme.toast.radius)};
  background: ${({ theme }) => theme.surfaces.toast};
  box-shadow: ${({ theme }) => theme.shadows.toast};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => u(theme.typography.toastSize)};
  line-height: 1.4;
  pointer-events: none;
  transform: translateX(-50%);
  animation: ${life} ${({ theme }) => theme.timing.toastVisibleMs + 2 * theme.timing.toastMs}ms ease
    forwards;
`;

const Dot = styled.span<{ $error: boolean }>`
  flex: none;
  width: ${({ theme }) => u(theme.toast.dotSize)};
  height: ${({ theme }) => u(theme.toast.dotSize)};
  border-radius: 50%;
  ${({ $error, theme }) =>
    $error
      ? css`
          background: ${theme.colors.dangerDot};
          box-shadow: ${theme.shadows.dangerDot};
        `
      : css`
          background: ${theme.colors.accent};
          box-shadow: ${theme.shadows.dot};
        `}
`;
