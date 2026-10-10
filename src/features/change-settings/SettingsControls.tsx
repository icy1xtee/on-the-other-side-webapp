import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { LanguageSwitch } from '@/features/switch-language/LanguageSwitch';
import { useStores } from '@/shared/lib/stores/useStores';
import { SettingsGroup, SliderRow } from './SettingsRows';

/**
 * Text speed on the slider: characters per second from slow to fast, and one more notch past
 * the fastest for "instant" — Ren'Py's text speed bar ends the same way.
 */
const TEXT_SPEED = { min: 10, max: 100 } as const;
const INSTANT_NOTCH = TEXT_SPEED.max + 1;

const VOLUME = { min: 0, max: 1, step: 0.05 } as const;

/** Volumes, text speed and language. Every change applies and is kept at once. */
export const SettingsControls = observer(function SettingsControls() {
  const { settings } = useStores();
  const { t } = useTranslation();
  const percent = (volume: number) => `${Math.round(volume * 100)}%`;

  return (
    <>
      <SettingsGroup title={t('settings.sound')}>
        <SliderRow
          label={t('settings.masterVolume')}
          valueText={percent(settings.masterVolume)}
          value={settings.masterVolume}
          onChange={settings.setMasterVolume}
          {...VOLUME}
        />
        <SliderRow
          label={t('settings.musicVolume')}
          valueText={percent(settings.musicVolume)}
          value={settings.musicVolume}
          onChange={settings.setMusicVolume}
          {...VOLUME}
        />
        <SliderRow
          label={t('settings.soundVolume')}
          valueText={percent(settings.soundVolume)}
          value={settings.soundVolume}
          onChange={settings.setSoundVolume}
          {...VOLUME}
        />
      </SettingsGroup>
      <SettingsGroup title={t('settings.text')}>
        <SliderRow
          label={t('settings.textSpeed')}
          valueText={
            settings.textCps === 0
              ? t('settings.textInstant')
              : t('settings.textCps', { cps: settings.textCps })
          }
          value={settings.textCps === 0 ? INSTANT_NOTCH : settings.textCps}
          onChange={(notch) => settings.setTextCps(notch >= INSTANT_NOTCH ? 0 : notch)}
          min={TEXT_SPEED.min}
          max={INSTANT_NOTCH}
          step={1}
        />
      </SettingsGroup>
      <SettingsGroup title={t('settings.language')}>
        <LanguageSwitch />
      </SettingsGroup>
    </>
  );
});
