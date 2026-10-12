import { useTranslation } from 'react-i18next';
import { SettingsControls } from '@/features/change-settings/SettingsControls';
import { SettingsGroup } from '@/features/change-settings/SettingsRows';
import { LanguageSwitch } from '@/features/switch-language/LanguageSwitch';
import { Modal, ModalActions } from '@/shared/ui/Modal';
import { PillButton } from '@/shared/ui/PillButton';

type SettingsOverlayProps = {
  onClose: () => void;
  /** In the game only: leave for the main menu — Ren'Py's game menu has the same way out. */
  onMainMenu?: () => void;
};

/**
 * The settings window: opened by Esc and the cog in the game, by «Настройки» in the menu. Two
 * features meet here — the settings and the language switch — so the widget puts them together.
 */
export function SettingsOverlay({ onClose, onMainMenu }: SettingsOverlayProps) {
  const { t } = useTranslation();

  return (
    <Modal title={t('settings.title')} onClose={onClose}>
      <SettingsControls />
      <SettingsGroup title={t('settings.language')}>
        <LanguageSwitch />
      </SettingsGroup>
      <ModalActions>
        {onMainMenu && <PillButton onClick={onMainMenu}>{t('settings.mainMenu')}</PillButton>}
        <PillButton onClick={onClose}>{t('settings.close')}</PillButton>
      </ModalActions>
    </Modal>
  );
}
