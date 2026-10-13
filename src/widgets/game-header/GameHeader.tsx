import { Cog, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { u } from '@/shared/lib/units';
import { RevealButton, RevealGroup } from '@/shared/ui/RevealButton';

type GameHeaderProps = {
  /** The cog: opens the game menu on the settings. */
  onSettings: () => void;
  /** The player's avatar. */
  onProfile: () => void;
};

/** The bar across the top of the game screen: the logo; the settings and the player on the right. */
export function GameHeader({ onSettings, onProfile }: GameHeaderProps) {
  const { t } = useTranslation();

  return (
    <Header>
      <Logo>
        <LogoMark />
        <LogoText>on the other side</LogoText>
      </Logo>
      <Controls>
        <RevealButton
          variant="header"
          label={t('header.settings')}
          icon={<Cog />}
          onClick={onSettings}
        />
        <RevealButton
          variant="header"
          round
          label={t('header.profile')}
          icon={<UserRound />}
          onClick={onProfile}
        />
      </Controls>
    </Header>
  );
}

const Header = styled.header`
  position: absolute;
  inset: 0 0 auto;
  height: ${({ theme }) => u(theme.header.height)};
  padding: 0 ${({ theme }) => u(theme.header.paddingX)};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${u(24)};
  background: ${({ theme }) => theme.surfaces.header};
  backdrop-filter: blur(14px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.headerBorder};
  box-shadow: ${({ theme }) => theme.shadows.header};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${u(10)};
`;

const LogoMark = styled.div`
  flex: none;
  width: ${({ theme }) => u(theme.header.logoMarkSize)};
  height: ${({ theme }) => u(theme.header.logoMarkSize)};
  border-radius: 50%;
  background: ${({ theme }) => theme.surfaces.logoMark};
  box-shadow: ${({ theme }) => theme.shadows.logoMark};
`;

const LogoText = styled.div`
  width: ${({ theme }) => u(theme.header.logoTextWidth)};
  margin-top: ${u(12)};
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: ${({ theme }) => u(theme.typography.logoSize)};
  line-height: 1.3;
  letter-spacing: 0.52em;
`;

const Controls = styled(RevealGroup)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => u(theme.header.gap)};
`;
