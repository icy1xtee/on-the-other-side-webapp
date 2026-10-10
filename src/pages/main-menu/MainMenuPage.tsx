import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { LanguageSwitch } from '@/features/switch-language/LanguageSwitch';
import { u } from '@/shared/lib/units';
import { Button } from '@/shared/ui/Button';
import { Stage } from '@/widgets/stage/Stage';

type MainMenuPageProps = {
  onNewGame: () => void;
  onContinue: () => void;
  /** A game to resume: the autosave of an unfinished playthrough. */
  canContinue: boolean;
};

// The menu lives on the same stage as the game, like Ren'Py's main_menu: one set of sizes and
// the same "turn your device" hint.
export function MainMenuPage({ onNewGame, onContinue, canContinue }: MainMenuPageProps) {
  const { t } = useTranslation();

  return (
    <Stage
      ui={
        <>
          <Menu>
            <Title>On the Other Side</Title>
            <Actions>
              <Button onClick={onNewGame}>{t('menu.newGame')}</Button>
              {/* Without a save Continue just stays off — no message: there is nothing to lose. */}
              <Button disabled={!canContinue} onClick={onContinue}>
                {t('menu.continue')}
              </Button>
              {/* Enabled once the settings overlay lands (stage 6). */}
              <Button disabled>{t('menu.settings')}</Button>
            </Actions>
          </Menu>
          <CornerLanguageSwitch />
        </>
      }
    />
  );
}

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
