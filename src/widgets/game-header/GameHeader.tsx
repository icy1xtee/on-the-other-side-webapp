import { Cog } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { u } from '@/shared/lib/units';
import { IconButton } from '@/shared/ui/IconButton';

type GameHeaderProps = {
  /** Settings arrive in stage 6; until then the button is a stub. */
  onSettings: () => void;
};

/** The bar across the top of the game screen: logo and settings. */
export function GameHeader({ onSettings }: GameHeaderProps) {
  const { t } = useTranslation();

  return (
    <Header>
      <Logo>
        <LogoMark />
        <LogoText>on the other side</LogoText>
      </Logo>
      <SettingsButton label={t('header.settings')} tooltipPlacement="bottom" onClick={onSettings}>
        <Cog />
      </SettingsButton>
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
  width: ${({ theme }) => u(theme.header.logoMarkSize)};
  height: ${({ theme }) => u(theme.header.logoMarkSize)};
  border-radius: 50%;
  background: ${({ theme }) => theme.surfaces.logoMark};
  box-shadow: ${({ theme }) => theme.shadows.logoMark};
`;

const LogoText = styled.div`
  width: ${u(130)};
  margin-top: ${u(12)};
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: ${({ theme }) => u(theme.typography.logoSize)};
  line-height: 1.3;
  letter-spacing: 0.52em;
`;

const SettingsButton = styled(IconButton)`
  width: ${u(34)};
  height: ${u(34)};
  font-size: ${u(15)};
`;
