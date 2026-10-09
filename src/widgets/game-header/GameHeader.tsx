import styled from 'styled-components';
import { PillButton } from '@/shared/ui/PillButton';

/** The bar across the top of the game screen: logo and settings. */
export function GameHeader() {
  return (
    <Header>
      <Logo>
        <LogoMark />
        <LogoText>on the other side</LogoText>
      </Logo>
      <SettingsButton disabled aria-label="Настройки" title="Настройки — скоро">
        ⚙︎
      </SettingsButton>
    </Header>
  );
}

const Header = styled.header`
  position: absolute;
  inset: 0 0 auto;
  height: ${({ theme }) => theme.header.height}px;
  padding: 0 ${({ theme }) => theme.header.paddingX}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.surfaces.header};
  backdrop-filter: blur(21px);
  border-bottom: 1.5px solid ${({ theme }) => theme.colors.headerBorder};
  box-shadow: ${({ theme }) => theme.shadows.header};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const LogoMark = styled.div`
  width: ${({ theme }) => theme.header.logoMarkSize}px;
  height: ${({ theme }) => theme.header.logoMarkSize}px;
  border-radius: 50%;
  background: ${({ theme }) => theme.surfaces.logoMark};
  box-shadow: ${({ theme }) => theme.shadows.logoMark};
`;

const LogoText = styled.div`
  width: 195px;
  margin-top: 18px;
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: ${({ theme }) => theme.typography.logoSize}px;
  line-height: 1.3;
  letter-spacing: 0.52em;
`;

const SettingsButton = styled(PillButton)`
  width: 51px;
  padding: 0;
  font-size: 22px;
`;
