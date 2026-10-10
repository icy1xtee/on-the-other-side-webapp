import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { LanguageSwitch } from '@/features/switch-language/LanguageSwitch';
import { useStores } from '@/shared/lib/stores/useStores';
import { u } from '@/shared/lib/units';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/widgets/confirm-dialog/ConfirmDialog';
import { SettingsOverlay } from '@/widgets/settings-overlay/SettingsOverlay';
import { Stage } from '@/widgets/stage/Stage';

// The menu lives on the same stage as the game, like Ren'Py's main_menu: one set of sizes and
// the same "turn your device" hint.
export const MainMenuPage = observer(function MainMenuPage() {
  const { ui, game, requestNewGame, newGame, continueGame } = useStores();
  const { t } = useTranslation();

  return (
    <Stage
      modal={ui.overlay !== null}
      ui={
        <>
          <Menu>
            <Title>On the Other Side</Title>
            <Actions>
              <Button onClick={requestNewGame}>{t('menu.newGame')}</Button>
              {/* Without a save Continue just stays off — no message: there is nothing to lose. */}
              <Button disabled={!game.canContinue} onClick={continueGame}>
                {t('menu.continue')}
              </Button>
              <Button onClick={ui.openSettings}>{t('menu.settings')}</Button>
            </Actions>
          </Menu>
          <CornerLanguageSwitch />
        </>
      }
      overlay={
        <>
          {ui.overlay === 'settings' && <SettingsOverlay onClose={ui.closeOverlay} />}
          {ui.overlay === 'confirmNewGame' && (
            <ConfirmDialog
              title={t('confirm.newGame.title')}
              text={t('confirm.newGame.text')}
              confirmLabel={t('confirm.newGame.confirm')}
              onConfirm={newGame}
              onCancel={ui.closeOverlay}
            />
          )}
        </>
      }
    />
  );
});

const Menu = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${u(42)};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => u(theme.typography.titleSize)};
  font-weight: 400;
  text-align: center;
`;

const Actions = styled.nav`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${u(10)};
`;

const CornerLanguageSwitch = styled(LanguageSwitch)`
  position: absolute;
  top: ${u(20)};
  right: ${({ theme }) => u(theme.header.paddingX)};
`;
