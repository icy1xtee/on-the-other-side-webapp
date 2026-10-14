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
// The way taken, kept by the app: a checkpoint per line or choice, and the history.
let timeline = startTimeline({ state: result.state, entries: shownEntries(result.interaction) });

result = advance(result.state, registry); // the player clicked: next line
timeline = arrive(timeline, { state: result.state, entries: shownEntries(result.interaction) });
result = choose(result.state, registry, 1); // the player picked option 1 of a choice
timeline = arrive(timeline, { state: result.state, entries: [/* the pick, the line */] }, 1);
const back = rollBack(timeline); // the checkpoint before, its entries off the history

const save = createSave(timeline, registry, { savedAt: Date.now(), playTime }); // autosave, a slot
const text = JSON.stringify(save);
const parsed = parseSave(text); // validated: { ok: true, save } or { ok: false, reason }
const restored = parsed.ok && restoreSave(parsed.save, registry, variableDefaults);
if (restored && restored.ok) {
  const { checkpoints, current } = restored.timeline;
  result = run(checkpoints[current].state, registry); // the saved line or choice, no replay
}
```

`result` is `{ state, interaction, effects }`:

- `state` — the snapshot a checkpoint keeps: `{ position, vars, stage, audio }`;
- `interaction` — what the player sees: a `say`, a `choice`, or `end`;
- `effects` — sounds, music changes and transitions met on the way, for the audio layer and the
  scene.

## Model

- **Commands** are either instant (`scene`, `show`, `hide`, `music`, `sfx`, `set`, `jump`) or
  need the player (`say`, `choice`). A run applies instant ones until it reaches one that needs
  the player — Ren'Py's interaction loop.
- **Ren'Py conventions:** `scene` clears the sprites; `show` with a tag already on screen
  replaces that sprite in place and keeps its position unless `at` is given; positions are
  `left / center / right`.
- **Transitions.** `scene`, `show` and `hide` take `with` — Ren'Py's `fade`, `move` or `vpunch`
  (`TRANSITIONS`). It is an effect, not state: how the frame came in is the app's business and
  a save doesn't keep it. Every one met on the way to a line is reported, in order.
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
- **The way taken** (`timeline`) — Ren'Py's rollback log and history, as plain data: a checkpoint
  per line or choice (the state there, what arriving added to the history, the pick made there),
  128 steps back (`ROLLBACK_LENGTH`), the way forward the player rolled back over, and the
  history — 250 entries (`HISTORY_LENGTH`) kept as keys: the speaker's id and the Russian line.
  The history isn't copied into every checkpoint: each knows its own entries, and rolling back
  takes them off the end.
- **Saves** are snapshots, not replays — Ren'Py's "saving occurs at the start of a statement".
  A save (format 2) is the way taken, whole: the checkpoints with the one on screen at
  `current`, the history, the fingerprint of every scene a checkpoint stands in
  (`sceneHashes`, hashes of their compiled programs), when and after how long. Loading checks
  the shape with `zod/mini` and migrates older formats (format 1, a single state, becomes one
  checkpoint with no history; a newer format is refused); vars follow Ren'Py's `default` — the
  story's defaults first, then the saved values, minus the removed or retyped. A scene edited
  since the save can't be resumed mid-way: the one on screen starts over with the saved vars,
  rollback stops short of the newest checkpoint in an edited scene and the way forward short of
  the oldest; a scene that is gone leaves nothing to resume.
- **Fingerprints.** `hashText` is the hash behind `sceneHash` (cyrb53, base 36), exported for
  the app: it keys the lines the player has read without copying the story into storage.

## Layout

```
types/        commands, ids, text
state/        GameState, applyInstant (instant commands), effects
program/      compileScene (flattening), sceneRegistry, hashProgram (scene and text fingerprints)
interpreter/  startGame, run, advance, choose, step limit
timeline/     the way taken: checkpoints for rollback, the history
save/         schema (format + zod), migrate, createSave / parseSave / restoreSave
```
