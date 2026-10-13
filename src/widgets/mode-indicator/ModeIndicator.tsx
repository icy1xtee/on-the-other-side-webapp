import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { u } from '@/shared/lib/units';

type ModeIndicatorProps = {
  /** What turns the pages now; null while the player reads by hand. */
  mode: 'auto' | 'skip' | null;
};

/**
 * The design's plaque under the header: `AUTO ▸` or `SKIP ▸▸` while Auto or Skip runs. Its place
 * is always there, empty while neither runs, so a screen reader hears the mode come and go.
 */
export function ModeIndicator({ mode }: ModeIndicatorProps) {
  const { t } = useTranslation();

  return <Live aria-live="polite">{mode && <Plaque>{t(`mode.${mode}`)}</Plaque>}</Live>;
}

const Live = styled.div`
  position: absolute;
  top: ${({ theme }) => u(theme.modeIndicator.top)};
  left: ${({ theme }) => u(theme.modeIndicator.left)};
  pointer-events: none;
`;

const Plaque = styled.div`
  display: flex;
  align-items: center;
  height: ${({ theme }) => u(theme.modeIndicator.height)};
  padding: 0 ${({ theme }) => u(theme.modeIndicator.paddingX)};
  border: 1px solid ${({ theme }) => theme.colors.modeBorder};
  border-radius: ${({ theme }) => u(theme.modeIndicator.radius)};
  background: ${({ theme }) => theme.surfaces.modeIndicator};
  backdrop-filter: blur(8px);
  color: ${({ theme }) => theme.colors.accentText};
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: ${({ theme }) => u(theme.typography.modeSize)};
  letter-spacing: 0.24em;
  white-space: nowrap;
`;
