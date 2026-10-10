import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { languages } from '@/shared/i18n/languages';
import { useStores } from '@/shared/lib/stores/useStores';
import { u } from '@/shared/lib/units';
import { PillButton } from '@/shared/ui/PillButton';

/**
 * RU / EN. Switches the interface and the story at once, and is remembered with the settings —
 * the same switch in the menu corner and in the settings window.
 */
export const LanguageSwitch = observer(function LanguageSwitch({
  className,
}: {
  className?: string;
}) {
  const { t } = useTranslation();
  const { settings } = useStores();

  return (
    <Group role="group" aria-label={t('menu.language')} className={className}>
      {languages.map((language) => (
        <PillButton
          key={language}
          lang={language}
          aria-pressed={settings.language === language}
          onClick={() => settings.setLanguage(language)}
        >
          {language.toUpperCase()}
        </PillButton>
      ))}
    </Group>
  );
});

const Group = styled.div`
  display: flex;
  gap: ${({ theme }) => u(theme.button.gap)};
`;
