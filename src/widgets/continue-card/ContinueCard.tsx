import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FrameThumbnail, type Frame } from '@/entities/frame/ui/Frame';
import { u } from '@/shared/lib/units';
import { PlainButton } from '@/shared/ui/PlainButton';

type ContinueCardProps = {
  /** The picture where the game was left. */
  frame: Frame;
  /** The mono line: which save and when. */
  meta: string;
  /** The line on screen there, with its speaker; null at a choice without a prompt. */
  line: string | null;
  onContinue: () => void;
};

/** "Продолжить" as the main menu's card: where the game was left, at a glance. */
export function ContinueCard({ frame, meta, line, onContinue }: ContinueCardProps) {
  const { t } = useTranslation();

  return (
    <Card onClick={onContinue}>
      <Thumbnail frame={frame} />
      <Body>
        <TitleRow>
          <Title>{t('menu.continue')}</Title>
          <Arrow aria-hidden>→</Arrow>
        </TitleRow>
        <Meta>{meta}</Meta>
        {line && <Line>{line}</Line>}
      </Body>
    </Card>
  );
}

const Thumbnail = styled(FrameThumbnail)`
  flex: none;
  width: ${({ theme }) => u(theme.card.thumbSize)};
  height: ${({ theme }) => u(theme.card.thumbSize)};
  border-radius: ${({ theme }) => u(theme.card.thumbRadius)};
`;

const Card = styled(PlainButton)`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => u(theme.card.gap)};
  padding: ${({ theme }) => `${u(theme.card.paddingY)} ${u(theme.card.paddingX)}`};
  border: 1px solid ${({ theme }) => theme.colors.panelBorder};
  border-radius: ${({ theme }) => u(theme.card.radius)};
  background: ${({ theme }) => theme.surfaces.card};
  box-shadow: ${({ theme }) => theme.shadows.card};
  text-align: left;
  transition: border-color 150ms;

  &:hover {
    border-color: ${({ theme }) => theme.colors.selectedBorder};
  }

  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.colors.selectedBorder};
    box-shadow:
      0 0 0 2px ${({ theme }) => theme.colors.focusRing},
      ${({ theme }) => theme.shadows.card};
  }
`;

const Body = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => u(theme.card.lineGap)};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${u(12)};
`;

const Title = styled.div`
  font-size: ${({ theme }) => u(theme.typography.cardTitleSize)};
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.textStrong};
`;

const Arrow = styled.span`
  font-size: ${u(15)};
  line-height: 1;
  color: ${({ theme }) => theme.colors.accentText};
`;

const Meta = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: ${({ theme }) => u(theme.typography.metaSize)};
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Line = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: ${({ theme }) => u(theme.typography.cardLineSize)};
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
