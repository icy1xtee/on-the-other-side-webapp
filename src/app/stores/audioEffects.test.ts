import { describe, expect, it } from 'vitest';
import { playEffects } from './audioEffects';
import { fakeAudio } from './testDoubles';
import { presentation } from './testStory';

describe('playEffects', () => {
  it('plays the music and sounds in order, a sound without a file staying silent', () => {
    const audio = fakeAudio();
    playEffects(
      [
        { type: 'music', asset: 'theme', ifChanged: false },
        { type: 'sfx', asset: 'door' },
        { type: 'sfx', asset: 'silent' },
      ],
      audio,
      presentation.assets,
    );

    expect(audio.playMusic).toHaveBeenCalledWith('/theme.mp3', { ifChanged: false });
    expect(audio.playSound).toHaveBeenCalledExactlyOnceWith('/door.mp3');
  });

  it('plays a track without a file, or no track, as silence', () => {
    const audio = fakeAudio();
    playEffects(
      [
        { type: 'music', asset: 'unknown', ifChanged: true },
        { type: 'music', asset: null, ifChanged: false },
      ],
      audio,
      presentation.assets,
    );

    expect(audio.playMusic.mock.calls).toEqual([
      [null, { ifChanged: true }],
      [null, { ifChanged: false }],
    ]);
  });
});

describe('playEffects and transitions', () => {
  it('leaves a transition to the scene: nothing plays for it', () => {
    const audio = fakeAudio();
    playEffects([{ type: 'transition', transition: 'fade' }], audio, presentation.assets);

    expect(audio.playMusic).not.toHaveBeenCalled();
    expect(audio.playSound).not.toHaveBeenCalled();
  });
});
