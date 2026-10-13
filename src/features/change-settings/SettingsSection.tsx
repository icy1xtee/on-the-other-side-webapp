import { observer } from 'mobx-react-lite';
import { useId, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { AUTO_DELAY, MIN_WINDOW_OPACITY, SKIP_MODES, TEXT_SIZES } from '@/shared/config/settings';
import { languageNames, languages } from '@/shared/i18n/languages';
import { formatTenths } from '@/shared/lib/format';
import { useStores } from '@/shared/lib/stores/useStores';
import { u } from '@/shared/lib/units';
import { useFullscreen } from '@/shared/lib/useFullscreen';
import { ActionButton } from '@/shared/ui/ActionButton';
import { PlainButton } from '@/shared/ui/PlainButton';
import { Segmented } from '@/shared/ui/Segmented';
import { Slider } from '@/shared/ui/Slider';
import { Switch } from '@/shared/ui/Switch';

const TABS = ['text', 'audio', 'display'] as const;
type Tab = (typeof TABS)[number];

/**
 * Text speed on the slider: characters per second from slow to fast, and one more notch past
 * the fastest for "instant" — Ren'Py's text speed bar ends the same way.
 */
const TEXT_SPEED = { min: 10, max: 120 } as const;
const INSTANT_NOTCH = TEXT_SPEED.max + 1;

const percent = (share: number) => `${Math.round(share * 100)}%`;

/**
 * The settings, as the game menu's part: tabs of rows, each a name with what it does and its
 * control. Every change applies and is kept at once; "Сбросить" brings the defaults back,
 * "Готово" closes the menu.
 */
export const SettingsSection = observer(function SettingsSection({
  onDone,
}: {
  onDone: () => void;
}) {
  const { settings } = useStores();
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('text');
  const panelId = useId();

  return (
    <>
      <Tabs role="tablist" aria-label={t('settings.tabs')}>
        {TABS.map((id) => (
          <TabButton
            key={id}
            role="tab"
            aria-selected={tab === id}
            aria-controls={panelId}
            onClick={() => setTab(id)}
          >
            {t(`settings.tab.${id}`)}
          </TabButton>
        ))}
      </Tabs>
      <Rows id={panelId} role="tabpanel">
        {tab === 'text' && <TextSettings />}
        {tab === 'audio' && <AudioSettings />}
        {tab === 'display' && <DisplaySettings />}
      </Rows>
      <Footer>
        <ActionButton onClick={settings.reset}>{t('settings.reset')}</ActionButton>
        <ActionButton $tone="primary" onClick={onDone}>
          {t('settings.done')}
        </ActionButton>
      </Footer>
    </>
  );
});

const TextSettings = observer(function TextSettings() {
  const { settings } = useStores();
  const { t } = useTranslation();
  const instant = settings.textCps === 0;

  return (
    <>
      <SliderRow
        label={t('settings.textSpeed')}
        valueText={
          instant ? t('settings.textInstant') : t('settings.textCps', { cps: settings.textCps })
        }
        value={instant ? INSTANT_NOTCH : settings.textCps}
        min={TEXT_SPEED.min}
        max={INSTANT_NOTCH}
        step={1}
        onChange={(notch) => settings.setTextCps(notch >= INSTANT_NOTCH ? 0 : notch)}
      />
      <SliderRow
        label={t('settings.autoDelay')}
        hint={t('settings.autoDelayHint')}
        valueText={t('settings.seconds', {
          value: formatTenths(settings.autoDelay, settings.language),
        })}
        value={settings.autoDelay}
        onChange={settings.setAutoDelay}
        {...AUTO_DELAY}
      />
      <Row label={t('settings.skip')}>
        <Segmented
          label={t('settings.skip')}
          value={settings.skipMode}
          options={SKIP_MODES.map((mode) => ({ value: mode, label: t(`settings.skip.${mode}`) }))}
          onChange={settings.setSkipMode}
        />
      </Row>
    </>
  );
});

const AudioSettings = observer(function AudioSettings() {
  const { settings } = useStores();
  const { t } = useTranslation();
  const volume = { min: 0, max: 1, step: 0.01, dimmed: settings.muted };

  return (
    <>
      <Row label={t('settings.mute')}>
        <Switch label={t('settings.mute')} checked={settings.muted} onChange={settings.setMuted} />
      </Row>
      <SliderRow
        label={t('settings.masterVolume')}
        valueText={percent(settings.masterVolume)}
        value={settings.masterVolume}
        onChange={settings.setMasterVolume}
        {...volume}
      />
      <SliderRow
        label={t('settings.musicVolume')}
        valueText={percent(settings.musicVolume)}
        value={settings.musicVolume}
        onChange={settings.setMusicVolume}
        {...volume}
      />
      <SliderRow
        label={t('settings.soundVolume')}
        valueText={percent(settings.soundVolume)}
        value={settings.soundVolume}
        onChange={settings.setSoundVolume}
        {...volume}
      />
      {/* Placeholders: the game has no voice acting yet. */}
      <SliderRow
        label={t('settings.voiceVolume')}
        hint={t('settings.voiceLater')}
        valueText={percent(1)}
        value={1}
        onChange={() => {}}
        min={0}
        max={1}
        step={0.01}
        disabled
      />
      <Row label={t('settings.voiceContinue')} hint={t('settings.voiceLater')} dimmed>
        <Switch label={t('settings.voiceContinue')} checked={false} onChange={() => {}} disabled />
      </Row>
    </>
  );
});

const DisplaySettings = observer(function DisplaySettings() {
  const { settings } = useStores();
  const { t } = useTranslation();
  const [fullscreen, setFullscreen] = useFullscreen();

  return (
    <>
      <Row label={t('settings.language')}>
        <Segmented
          label={t('settings.language')}
          value={settings.language}
          options={languages.map((language) => ({
            value: language,
            label: languageNames[language],
            lang: language,
          }))}
          onChange={settings.setLanguage}
        />
      </Row>
      <Row label={t('settings.textSize')}>
        <Segmented
          label={t('settings.textSize')}
          value={settings.textSize}
          options={TEXT_SIZES.map((size) => ({
            value: size,
            label: t(`settings.textSize.${size}`),
          }))}
          onChange={settings.setTextSize}
        />
      </Row>
      <SliderRow
        label={t('settings.windowOpacity')}
        hint={t('settings.windowOpacityHint')}
        valueText={percent(settings.windowOpacity)}
        value={settings.windowOpacity}
        onChange={settings.setWindowOpacity}
        min={MIN_WINDOW_OPACITY}
        max={1}
        step={0.01}
      />
      <Row label={t('settings.fullscreen')}>
        <Switch label={t('settings.fullscreen')} checked={fullscreen} onChange={setFullscreen} />
      </Row>
    </>
  );
});

type RowProps = {
  label: string;
  /** What the setting does, under its name. */
  hint?: string;
  /** Faded: it does nothing now — the volumes while muted, the voice before there is any. */
  dimmed?: boolean;
  /** The label's id, for a control that names itself by it. */
  labelId?: string;
  children: ReactNode;
};

/** One setting: its name and what it does on the left, its control on the right. */
function Row({ label, hint, dimmed = false, labelId, children }: RowProps) {
  return (
    <RowBox $dimmed={dimmed}>
      <RowText>
        <Label id={labelId}>{label}</Label>
        {hint && <Hint>{hint}</Hint>}
      </RowText>
      <Control>{children}</Control>
    </RowBox>
  );
}

type SliderRowProps = Omit<RowProps, 'children' | 'labelId'> & {
  /** What the value means to the player — shown and read out by screen readers. */
  valueText: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

function SliderRow({ label, hint, dimmed, valueText, disabled, ...slider }: SliderRowProps) {
  const labelId = useId();
  return (
    <Row label={label} hint={hint} dimmed={dimmed || disabled} labelId={labelId}>
      <SliderBox>
        <Slider
          aria-labelledby={labelId}
          aria-valuetext={valueText}
          disabled={disabled}
          {...slider}
        />
        <Value aria-hidden>{valueText}</Value>
      </SliderBox>
    </Row>
  );
}

const Tabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => u(theme.settings.tabGap)};
  padding: ${({ theme }) =>
    `${u(theme.settings.tabsPaddingTop)} ${u(theme.gameMenu.contentPaddingX)} ${u(theme.settings.tabsPaddingBottom)}`};
`;

const TabButton = styled(PlainButton)`
  padding: ${({ theme }) => `${u(theme.settings.tabPaddingY)} ${u(theme.settings.tabPaddingX)}`};
  border-radius: ${({ theme }) => u(theme.settings.tabRadius)};
  color: ${({ theme }) => theme.colors.textNav};
  font-size: ${({ theme }) => u(theme.typography.tabSize)};
  line-height: 1.2;
  transition: color 150ms;

  &:hover {
    color: ${({ theme }) => theme.colors.textStrong};
  }

  &[aria-selected='true'] {
    color: ${({ theme }) => theme.colors.textStrong};
    background: ${({ theme }) => theme.colors.navBackgroundActive};
    cursor: default;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.focusRing};
  }
`;

const Rows = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 0 ${({ theme }) => u(theme.gameMenu.contentPaddingX)} ${u(4)};
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
`;

const RowBox = styled.div<{ $dimmed: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => `${u(theme.settings.rowGapY)} ${u(theme.settings.rowGapX)}`};
  padding: ${({ theme }) => u(theme.settings.rowPaddingY)} 0;
  border-top: 1px solid ${({ theme }) => theme.colors.hairline};
  opacity: ${({ $dimmed }) => ($dimmed ? 0.4 : 1)};
  transition: opacity 200ms;
`;

const RowText = styled.div`
  flex: 1 1 ${u(200)};
  min-width: 0;
`;

const Label = styled.div`
  font-size: ${({ theme }) => u(theme.typography.labelSize)};
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.buttonText};
`;

const Hint = styled.div`
  margin-top: ${({ theme }) => u(theme.settings.hintGap)};
  font-size: ${({ theme }) => u(theme.typography.hintSize)};
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textHint};
  text-wrap: pretty;
`;

const Control = styled.div`
  flex: 0 1 ${({ theme }) => u(theme.settings.controlWidth)};
  min-width: 0;
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const SliderBox = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => u(theme.slider.gap)};
`;

const Value = styled.span`
  flex: 0 0 ${({ theme }) => u(theme.settings.valueWidth)};
  text-align: right;
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: ${({ theme }) => u(theme.typography.valueSize)};
  letter-spacing: 0.06em;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.sliderValue};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${u(12)};
  padding: ${({ theme }) =>
    `${u(theme.settings.footerPaddingY)} ${u(22)} ${u(18)} ${u(theme.gameMenu.contentPaddingX)}`};
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
`;
