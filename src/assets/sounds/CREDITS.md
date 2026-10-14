# Sound credits

The scene sounds are placeholders until the game's own arrive: replacing a file under the same
name needs no code.

All three come from **RPG Audio** by Kenney (Kenney Vleugels, [kenney.nl](https://www.kenney.nl)),
50 sounds, licensed [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) — no attribution
required. Taken from Kenney's own upload of the pack to OpenGameArt,
[50 RPG sound effects](https://opengameart.org/content/50-rpg-sound-effects)
(`RPGsounds_Kenney.zip`, its `license.txt` says CC0); the same pack is
[RPG Audio](https://kenney.nl/assets/rpg-audio) on kenney.nl.

| File        | What it is                                     | Made from                                                       |
| ----------- | ---------------------------------------------- | --------------------------------------------------------------- |
| `knock.ogg` | Three short knocks at the door                 | `bookPlace2`, `bookPlace1`, `bookPlace3` at 0, 0.23 and 0.44 s  |
| `door.ogg`  | The door opens                                 | `doorOpen_2`                                                    |
| `steps.ogg` | Six steps going away, each quieter, over 2.8 s | `footstep00` … `footstep05` every ~0.5 s, from 0 down to −12 dB |

Each is mono, 48 kHz Ogg Vorbis (`-q:a 4`), made with ffmpeg: every hit trimmed to its onset and
levelled with the others, then the whole raised under a limiter (peaks at −3 dBFS) to sit about as
loud as the music at its default volume.
