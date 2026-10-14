import { X } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { SettingsSection } from '@/features/change-settings/SettingsSection';
import { ControlsSection } from '@/features/view-controls/ControlsSection';
import { SlotsSection } from '@/features/save-slots/SlotsSection';
import { HistorySection } from '@/features/view-history/HistorySection';
import type { MenuSection } from '@/shared/config/gameMenu';
import { u } from '@/shared/lib/units';
import { Modal } from '@/shared/ui/Modal';
import { PlainButton } from '@/shared/ui/PlainButton';

type GameMenuProps = {
  /** The part on screen. */
  section: MenuSection;
  /** The parts this menu offers, in the rail's order: the main menu offers fewer. */
  sections: readonly MenuSection[];
  onSection: (section: MenuSection) => void;
  onClose: () => void;
  /** In the game only: leave for the main menu, at the rail's foot. */
  onMainMenu?: () => void;
  /** A window over this one — a question about a save: the menu under it takes nothing. */
  dialog?: ReactNode;
};

/**
 * Ren'Py's game menu: one window over the dimmed game, its parts in a rail on the left, the part
 * itself on the right. The same window opens from the main menu with only the parts that make
 * sense there. Esc, the cross and a click outside close it.
 */
export function GameMenu({
  section,
  sections,
  onSection,
  onClose,
  onMainMenu,
  dialog,
}: GameMenuProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const covered = Boolean(dialog);

  return (
    <Window labelledBy={titleId} onClose={onClose}>
      <Rail inert={covered}>
        <Logo>
          <LogoMark />
          <LogoText>on the other side</LogoText>
        </Logo>
        <Nav aria-label={t('gameMenu.sections')}>
          {sections.map((id) => (
            <NavItem
              key={id}
              aria-current={id === section ? 'page' : undefined}
              onClick={() => onSection(id)}
            >
              {t(`gameMenu.${id}`)}
            </NavItem>
          ))}
        </Nav>
        {onMainMenu && (
          <RailFoot>
            <NavItem onClick={onMainMenu}>{t('gameMenu.mainMenu')}</NavItem>
          </RailFoot>
        )}
      </Rail>
      <Content inert={covered}>
        <Head>
          <Title id={titleId}>{t(`gameMenu.title.${section}`)}</Title>
          <Close aria-label={t('gameMenu.close')} onClick={onClose}>
            <X />
          </Close>
        </Head>
        {section === 'save' && <SlotsSection mode="save" />}
        {section === 'load' && <SlotsSection mode="load" />}
        {section === 'history' && <HistorySection />}
        {section === 'settings' && <SettingsSection onDone={onClose} />}
        {section === 'controls' && <ControlsSection />}
      </Content>
      {dialog}
    </Window>
  );
}

// Positioned: a window opened over this one dims this one only.
const Window = styled(Modal)`
  position: relative;
  width: ${({ theme }) => u(theme.gameMenu.width)};
  height: ${({ theme }) => u(theme.gameMenu.height)};
  display: flex;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.windowBorder};
  border-radius: ${({ theme }) => u(theme.gameMenu.radius)};
  background: ${({ theme }) => theme.surfaces.window};
  box-shadow: ${({ theme }) => theme.shadows.window};
  color: ${({ theme }) => theme.colors.text};
`;

const Rail = styled.aside`
  flex: 0 0 ${({ theme }) => u(theme.gameMenu.railWidth)};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) =>
    `${u(theme.gameMenu.railPaddingTop)} ${u(theme.gameMenu.railPaddingX)} ${u(theme.gameMenu.railPaddingBottom)}`};
  border-right: 1px solid ${({ theme }) => theme.colors.divider};
  background: ${({ theme }) => theme.colors.railBackground};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${u(10)};
  padding: 0 ${u(10)};
  margin-bottom: ${u(22)};
`;

const LogoMark = styled.div`
  flex: none;
  width: ${({ theme }) => u(theme.gameMenu.logoMarkSize)};
  height: ${({ theme }) => u(theme.gameMenu.logoMarkSize)};
  border-radius: 50%;
  background: ${({ theme }) => theme.surfaces.logoMark};
  box-shadow: ${({ theme }) => theme.shadows.logoMark};
`;

const LogoText = styled.div`
  width: ${({ theme }) => u(theme.gameMenu.logoTextWidth)};
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: ${u(10.5)};
  line-height: 1.35;
  letter-spacing: 0.48em;
  color: ${({ theme }) => theme.colors.sliderValue};
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => u(theme.gameMenu.navGap)};
`;

const NavItem = styled(PlainButton)`
  display: flex;
  align-items: center;
  width: 100%;
  height: ${({ theme }) => u(theme.gameMenu.navHeight)};
  padding: 0 ${({ theme }) => u(theme.gameMenu.navPaddingX)};
  border-radius: ${({ theme }) => u(theme.gameMenu.navRadius)};
  color: ${({ theme }) => theme.colors.textNav};
  font-size: ${({ theme }) => u(theme.typography.labelSize)};
  text-align: left;
  transition:
    color 150ms,
    background 150ms;

  &:hover {
    color: ${({ theme }) => theme.colors.textStrong};
    background: ${({ theme }) => theme.colors.navBackgroundHover};
  }

  &[aria-current='page'] {
    color: ${({ theme }) => theme.colors.textStrong};
    background: ${({ theme }) => theme.colors.navBackgroundActive};
    cursor: default;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.focusRing};
  }
`;

const RailFoot = styled.div`
  margin-top: auto;
  padding-top: ${u(10)};
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
`;

const Content = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${u(16)};
  padding: ${({ theme }) =>
    `${u(theme.gameMenu.headerPaddingTop)} ${u(22)} 0 ${u(theme.gameMenu.contentPaddingX)}`};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => u(theme.typography.windowTitleSize)};
  font-weight: 500;
  line-height: ${u(32)};
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.textStrong};
`;

const Close = styled(PlainButton)`
  flex: none;
  width: ${({ theme }) => u(theme.gameMenu.closeSize)};
  height: ${({ theme }) => u(theme.gameMenu.closeSize)};
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.controlBorder};
  border-radius: ${({ theme }) => u(theme.gameMenu.closeRadius)};
  background: ${({ theme }) => theme.colors.controlBackground};
  color: ${({ theme }) => theme.colors.controlText};
  transition:
    color 150ms,
    background 150ms;

  & > svg {
    width: ${u(14)};
    height: ${u(14)};
    stroke-width: ${({ theme }) => theme.icons.strokeWidth};
  }

  &:hover {
    color: ${({ theme }) => theme.colors.textStrong};
    background: ${({ theme }) => theme.colors.controlBackgroundHover};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.focusRing};
  }
`;
