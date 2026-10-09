import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { languages } from '@/shared/i18n/languages';
import { u } from '@/shared/lib/units';
import { PillButton } from '@/shared/ui/PillButton';

/**
 * RU / EN. Switches the interface and the story at once. Not remembered between visits yet —
 * the language moves into the settings in stage 6.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();

  return (
    <Group role="group" aria-label={t('menu.language')} className={className}>
      {languages.map((language) => (
        <PillButton
          key={language}
          lang={language}
          aria-pressed={i18n.resolvedLanguage === language}
          onClick={() => void i18n.changeLanguage(language)}
        >
          {language.toUpperCase()}
        </PillButton>
      ))}
    </Group>
  );
}

const Group = styled.div`
  display: flex;
  gap: ${({ theme }) => u(theme.button.gap)};
`;
