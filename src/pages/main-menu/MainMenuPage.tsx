import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { SlotQuestionDialog } from '@/features/save-slots/SlotQuestionDialog';
import type { MenuSection } from '@/shared/config/gameMenu';
import { formatSavedAt } from '@/shared/lib/format';
import { useStores } from '@/shared/lib/stores/useStores';
import { u } from '@/shared/lib/units';
import { PlainButton } from '@/shared/ui/PlainButton';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { ContinueCard } from '@/widgets/continue-card/ContinueCard';
import { GameMenu } from '@/widgets/game-menu/GameMenu';
import { Stage } from '@/widgets/stage/Stage';

/** What the game menu offers from here: no saving or history before a game is started. */
const MENU_SECTIONS: readonly MenuSection[] = ['load', 'settings'];

// The menu lives on the same stage as the game, like Ren'Py's main_menu: one set of sizes and
// the same "turn your device" hint. The art is the stage's scene layer.
export const MainMenuPage = observer(function MainMenuPage() {
  const { ui, saves, settings, menuArt, requestNewGame, newGame, continueGame } = useStores();
  const { t } = useTranslation();
  const { t: tStory } = useTranslation('story');
  const preview = saves.preview('auto');
  const overlay = ui.overlay;

  const line =
    preview?.line &&
    (preview.line.speaker
      ? `${tStory(preview.line.speaker)}: ${tStory(preview.line.text)}`
      : tStory(preview.line.text));

  return (
    <Stage
      modal={overlay !== null}
      scene={
        <Art>
          <ArtBackground src={menuArt.background} alt="" draggable={false} />
          <ArtShade />
          <ArtCharacter src={menuArt.character} alt="" draggable={false} />
        </Art>
      }
      ui={
        <Column>
          <Logo>
            <LogoMark />
            <LogoText>on the other side</LogoText>
          </Logo>
          <Choices>
            {/* Without a save there is no card at all: nothing to lose, nothing to say. */}
            {preview && (
              <ContinueCard
                frame={preview.frame}
                meta={t('menu.continueMeta', {
                  savedAt: formatSavedAt(preview.savedAt, settings.language),
                })}
                line={line || null}
                onContinue={continueGame}
              />
            )}
            <Nav aria-label={t('menu.items')}>
              <Item onClick={requestNewGame}>{t('menu.newGame')}</Item>
              <Item onClick={() => ui.openGameMenu('load')}>{t('menu.load')}</Item>
              <Item onClick={() => ui.openGameMenu('settings')}>{t('menu.settings')}</Item>
            </Nav>
          </Choices>
        </Column>
      }
      overlay={
        <>
          {overlay?.type === 'gameMenu' && (
            <GameMenu
              section={overlay.section}
              sections={MENU_SECTIONS}
              onSection={ui.showMenuSection}
              onClose={ui.closeOverlay}
              dialog={overlay.question && <SlotQuestionDialog question={overlay.question} />}
            />
          )}
          {overlay?.type === 'confirmNewGame' && (
            <ConfirmDialog
              title={t('confirm.newGame.title')}
              text={t('confirm.newGame.text')}
              confirmLabel={t('confirm.newGame.confirm')}
              tone="danger"
              onConfirm={newGame}
              onCancel={ui.closeOverlay}
            />
          )}
        </>
      }
    />
  );
});

const Art = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.surfaces.menuStage};
`;

const ArtBackground = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ArtShade = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.surfaces.menuShade};
`;

const ArtCharacter = styled.img`
  position: absolute;
  left: ${({ theme }) => theme.menu.characterLeft}%;
  width: ${({ theme }) => theme.menu.characterWidth}%;
  top: ${({ theme }) => theme.menu.characterTop}%;
  height: ${({ theme }) => 100 - theme.menu.characterTop}%;
  object-fit: contain;
  object-position: center bottom;
`;

const Column = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${({ theme }) => u(theme.menu.insetX)};
  width: min(
    ${({ theme }) => u(theme.menu.width)},
    calc(100% - ${({ theme }) => u(2 * theme.menu.insetX)})
  );
  padding: ${({ theme }) => `${u(theme.menu.paddingTop)} 0 ${u(theme.menu.paddingBottom)}`};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${u(40)};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => u(theme.menu.logoGap)};
`;

const LogoMark = styled.div`
  flex: none;
  width: ${({ theme }) => u(theme.menu.logoMarkSize)};
  height: ${({ theme }) => u(theme.menu.logoMarkSize)};
  border-radius: 50%;
  background: ${({ theme }) => theme.surfaces.logoMark};
  box-shadow: ${({ theme }) => theme.shadows.logoMarkLarge};
`;

const LogoText = styled.h1`
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: ${({ theme }) => u(theme.typography.menuLogoSize)};
  font-weight: 400;
  line-height: 1.35;
  letter-spacing: 0.42em;
  color: ${({ theme }) => theme.colors.text};
`;

const Choices = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => u(theme.menu.gap)};
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => u(theme.menu.itemGap)};
`;

const Item = styled(PlainButton)`
  display: flex;
  align-items: center;
  height: ${({ theme }) => u(theme.menu.itemHeight)};
  padding: 0 ${({ theme }) => u(theme.menu.itemPaddingX)};
  border-radius: ${({ theme }) => u(theme.menu.itemRadius)};
  color: ${({ theme }) => theme.colors.textMenu};
  font-size: ${({ theme }) => u(theme.typography.menuNavSize)};
  text-align: left;
  transition:
    color 150ms,
    background 150ms;

  &:hover {
    color: ${({ theme }) => theme.colors.textStrong};
    background: ${({ theme }) => theme.colors.menuBackgroundHover};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.focusRing};
  }
`;
