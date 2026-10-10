import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, readSettings, SettingsStore } from './SettingsStore';
import { memorySlot } from './testDoubles';

describe('readSettings', () => {
  it('gives the defaults with nothing stored, or with something that is not JSON', () => {
    expect(readSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(readSettings('{oops')).toEqual(DEFAULT_SETTINGS);
    expect(readSettings('[1, 2]')).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps every valid field and replaces only the broken ones', () => {
    const stored = JSON.stringify({
      masterVolume: 0.4,
      musicVolume: 7,
      soundVolume: 'loud',
      textCps: 0,
      language: 'de',
    });
    expect(readSettings(stored)).toEqual({
      masterVolume: 0.4,
      musicVolume: DEFAULT_SETTINGS.musicVolume,
      soundVolume: DEFAULT_SETTINGS.soundVolume,
      textCps: 0,
      language: DEFAULT_SETTINGS.language,
    });
  });
});

describe('SettingsStore', () => {
  it('starts from what was stored', () => {
    const slot = memorySlot(JSON.stringify({ ...DEFAULT_SETTINGS, textCps: 60, language: 'en' }));
    const settings = new SettingsStore(slot);

    expect(settings.textCps).toBe(60);
    expect(settings.language).toBe('en');
    expect(settings.volumes).toEqual({ master: 1, music: 0.5, sound: 1 });
  });

  it('keeps every change at once, under its own key', () => {
    const slot = memorySlot();
    const settings = new SettingsStore(slot);
    settings.setMusicVolume(0.25);
    settings.setTextCps(0);
    settings.setLanguage('en');

    expect(new SettingsStore(memorySlot(slot.value))).toMatchObject({
      musicVolume: 0.25,
      textCps: 0,
      language: 'en',
    });
  });

  it('keeps volumes between silence and full', () => {
    const settings = new SettingsStore(memorySlot());
    settings.setMasterVolume(1.5);
    settings.setSoundVolume(-1);

    expect(settings.volumes).toMatchObject({ master: 1, sound: 0 });
  });

  it('works on when storage refuses', () => {
    const settings = new SettingsStore(memorySlot(null, { refusing: true }));
    settings.setMasterVolume(0.3);
    expect(settings.masterVolume).toBe(0.3);
  });
});
