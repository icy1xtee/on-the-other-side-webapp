# engine

The visual novel engine: pure TypeScript over plain data. It knows nothing about React, MobX,
the DOM, the app in `src/` or the story in `src/content/` — scenes are handed to it from outside.
The model follows Ren'Py; see `.claude/engine-research.md` for what was taken and why.

## Rules

- No imports from `src/`, no React, no MobX — enforced by oxlint.
- Checked by its own `tsconfig.engine.json` without DOM types: no browser APIs either.
- The app imports only the public API: `from '@engine'` (`index.ts`).
- Every function returns a new state; nothing is mutated.
- Tests sit next to the code (`*.test.ts`).

## How it runs

```ts
const registry = createSceneRegistry(scenes, 'intro'); // compiles scenes, checks jump targets
let result = startGame(registry, variableDefaults); // runs up to the first line or choice
result = advance(result.state, registry); // the player clicked: next line
result = run(savedState, registry); // loading a save: no replay needed
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
  Ren'Py `menu`; a block ending with `jump` leaves for another scene.
- **Programs.** Each scene is compiled once into a flat list of instructions, choice blocks
  included, so a position is always `{ sceneId, step }`.
- **The end.** A scene that runs out without a `jump` ends the game.
- **Step limit.** A run that executes more than `STEP_LIMIT` instructions without reaching the
  player throws instead of hanging the page.
- **Typing.** Every id is a plain `string` by default; content narrows them with
  `Command<ContentIds>`, so typos are compile errors while the engine stays generic-free.

## Layout

```
types/        commands, ids, text
state/        GameState, applyInstant (instant commands), effects
program/      compileScene (flattening), sceneRegistry
interpreter/  startGame, run, advance, step limit
```
