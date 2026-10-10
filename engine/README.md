# engine

The visual novel engine: pure TypeScript over plain data. It knows nothing about React, MobX,
the DOM, the app in `src/` or the story in `src/content/` — scenes are handed to it from outside.
The model follows Ren'Py; see `.claude/engine-research.md` for what was taken and why.

## Rules

- No imports from `src/`, no React, no MobX — enforced by oxlint. The one dependency is
  `zod/mini`, for reading saves.
- Checked by its own `tsconfig.engine.json` without DOM types: no browser APIs either. Storage
  is the app's business: the engine turns a state into a save and back, as plain data and text.
- The app imports only the public API: `from '@engine'` (`index.ts`).
- Every function returns a new state; nothing is mutated.
- Tests sit next to the code (`*.test.ts`).

## How it runs

```ts
const registry = createSceneRegistry(scenes, 'intro'); // compiles scenes, checks jump targets
let result = startGame(registry, variableDefaults); // runs up to the first line or choice
result = advance(result.state, registry); // the player clicked: next line
result = choose(result.state, registry, 1); // the player picked option 1 of a choice

const text = JSON.stringify(createSave(result.state, registry, Date.now())); // autosave
const parsed = parseSave(text); // validated: { ok: true, save } or { ok: false, reason }
const state = parsed.ok && restoreSave(parsed.save, registry, variableDefaults);
if (state) result = run(state, registry); // loading runs the saved line or choice, no replay
```

`result` is `{ state, interaction, effects }`:

- `state` — the snapshot a save stores: `{ position, vars, stage, audio }`;
- `interaction` — what the player sees: a `say`, a `choice`, or `end`;
- `effects` — sounds and music changes met on the way, for the audio layer.

## Model

- **Commands** are either instant (`scene`, `show`, `hide`, `music`, `sfx`, `set`, `jump`) or
  need the player (`say`, `choice`). A run applies instant ones until it reaches one that needs
  the player — Ren'Py's interaction loop.
- **Ren'Py conventions:** `scene` clears the sprites; `show` with a tag already on screen
  replaces that sprite in place and keeps its position unless `at` is given; positions are
  `left / center / right`.
- **Choices** hold blocks. A block plays and execution continues after the choice, like a
  Ren'Py `menu`; a block ending with `jump` leaves for another scene. A choice may carry a
  `prompt` — the line on screen while the player chooses (the say statement inside a `menu`).
- **Conditions.** An option whose `when` fails is reported as `available: false`, and the app
  hides it; `choose()` takes the index among all options and refuses a hidden one. A choice with
  no available option is skipped, as Ren'Py skips such a menu.
- **Programs.** Each scene is compiled once into a flat list of instructions, choice blocks
  included, so a position is always `{ sceneId, step }`.
- **The end.** A scene that runs out without a `jump` ends the game.
- **Step limit.** A run that executes more than `STEP_LIMIT` instructions without reaching the
  player throws instead of hanging the page.
- **Typing.** Every id is a plain `string` by default; content narrows them with
  `Command<ContentIds>`, so typos are compile errors while the engine stays generic-free.
- **Saves** are snapshots, not replays — Ren'Py's "saving occurs at the start of a statement".
  A save is the state on a line or a choice, plus the format `version` and the scene's
  fingerprint (`sceneHash`, a hash of its compiled program). Loading checks the shape with
  `zod/mini` and migrates older formats (a newer one is refused); vars follow Ren'Py's
  `default` — the story's defaults first, then the saved values, minus the removed or retyped.
  A scene changed since the save starts over with the saved vars; a scene that is gone leaves
  nothing to resume.

## Layout

```
types/        commands, ids, text
state/        GameState, applyInstant (instant commands), effects
program/      compileScene (flattening), sceneRegistry, hashProgram (scene fingerprints)
interpreter/  startGame, run, advance, choose, step limit
save/         schema (format + zod), migrate, createSave / parseSave / restoreSave
```
