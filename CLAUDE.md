# CLAUDE.md

Visual novel as a web app. Vision in [.claude/project-brief.md](.claude/project-brief.md),
decisions and stages per version in `.claude/plan-<version>.md` —
[0.1](.claude/plan-0.1.md) (closed), [0.2](.claude/plan-0.2.md) (current). Per-stage specs, the
registry and the progress summary live per version in `.claude/tasks/version-<version>/`
([0.1](.claude/tasks/version-0.1/), [0.2](.claude/tasks/version-0.2/)). Read the plan before
changing architecture.

**Start of any session:** read the current stage's folder in the current version's registry —
now [.claude/tasks/version-0.2/task-registry/](.claude/tasks/version-0.2/task-registry/):
`context.md` (full picture, agreed decisions) and `progress.md` (branch, step statuses,
journal, open questions). Consciously postponed compromises, across versions, live in
[.claude/tasks/tech-debt.md](.claude/tasks/tech-debt.md); add to it rather than leaving a TODO
in code.

## Commands

```sh
npm run dev           # dev server
npm run build         # tsc -b && vite build
npm run typecheck     # tsc -b
npm run lint          # oxlint
npm run format        # prettier --write .   (format:check for CI-style check)
npm test              # vitest run
npm run e2e           # build, then the Playwright smoke tests against `vite preview`
```

Before reporting a step as done: `lint`, `typecheck`, `test`, `format:check`, `build` all pass;
before handing over a stage, `e2e` too. CI (`.github/workflows/ci.yml`) runs all of them on every
PR into `main` and on `main` itself.

## Stack notes

- Node **24.12.0**, pinned in `.nvmrc` + `engines`; `.npmrc` has `engine-strict=true`.
- Vite 8 (Rolldown + Oxc), `@vitejs/plugin-react` 6 — **no Babel**. styled-components display
  names come from Oxc's built-in `styledComponents` plugin in `vite.config.ts`
  (`oxc.plugins`), not from `babel-plugin-styled-components`.
- TypeScript 6: `strict`, `noUncheckedIndexedAccess`. No `baseUrl` (deprecated in TS 6).
- Lint is **oxlint** (`.oxlintrc.json`), not ESLint.
- Aliases: `@/*` → `src/*`, `@engine` → `engine/index.ts` (exact match, public API only).
  Defined in two places that must stay in sync: `tsconfig.app.json` `paths` and
  `vite.config.ts` `resolve.alias`. Vitest reads them from the Vite config.
- Four TS projects under `tsc -b`: `tsconfig.app.json` (src, DOM), `tsconfig.engine.json`
  (engine, **no DOM**), `tsconfig.node.json` (vite config), `tsconfig.e2e.json` (e2e tests and
  the Playwright config: Node, plus DOM for the callbacks that run in the page).
- e2e: **Playwright**, Chromium only (`npx playwright install chromium` once per machine). The
  tests run against the production build on port 4180 and find things by role and text, never
  by pixels. They store instant text in `ots:settings` before the page loads, so no test waits
  for the typewriter — except the ones that test it. The demo text they rely on is in
  `e2e/game.ts`, the one file to update when the demo changes.
- `zod` validates saves in `engine/save` and settings — import **`zod/mini`** (classic `zod`
  added ~90 KB to the bundle, mini ~26 KB).
- Audio: **howler.js**, touched only by `shared/lib/audio.ts` (`AudioOutput`: channels `music`
  and `sound`, crossfade, `ifChanged`). The engine reports music and sounds as effects;
  `GameStore` plays them. The main menu has a track of its own (`menuMusic`, Ren'Py's
  `config.main_menu_music`) — the game's theme, played `ifChanged` like the demo's first, so the
  music goes on without a break from the menu into the game and back; the way to the menu stops
  the sounds, as Ren'Py does. The page asks for the track at once; the autoplay policy holds it
  until the first click or key anywhere, and howler's `unlock` starts it then. Scene sounds are
  Kenney's (CC0) for now, Ogg in `src/assets/sounds/` with `CREDITS.md` (where each comes from),
  loaded at boot.
- Icons: **lucide-react**, named imports only (`import { Cog } from 'lucide-react'`) so the
  bundle keeps just the icons in use. Don't pass `size` / `strokeWidth`: the button holding an
  icon sizes it through `u()` and draws it at `theme.icons.strokeWidth`. Icons are decorative by
  default (`aria-hidden`). An icon-only button is `shared/ui/RevealButton`: its `label` is the
  `aria-label` and opens on the icon's left on hover and keyboard focus, pushing the buttons
  beside it. In a `RevealGroup` (a row anchored on its right) the label stays open while the
  pointer is in the row, so a moved button never slips from under it. No `title` attributes;
  a cut line shows whole in `shared/ui/Tooltip`.
- Buttons are styled from `shared/ui/PlainButton` (no look of its own; a mouse click doesn't
  take focus, so Space keeps advancing the story); worded window buttons are
  `shared/ui/ActionButton` (`secondary` / `primary` / `danger`).
- Lint: oxlint's `only-export-components` knows MobX's `observer` (`customHOCs`), so a file
  may hold several `observer` components.
- Fonts: Geist / Geist Mono from `@fontsource/geist` and `@fontsource/geist-mono` (the Google
  Fonts builds, **with Cyrillic** — `@fontsource/geist-sans` is Latin-only). The package CSS isn't
  imported: `app/styles/fonts.css` declares its own `@font-face` for the faces in use only —
  Geist 400 and 500, Geist Mono 400 — Latin and Cyrillic, each with the package's `unicode-range`
  (`unicode.json`), woff2 from `@fontsource/<font>/files/`. Another weight needs its faces there.

## Design

The design comes from Claude Design: `.claude/ref/layout-design/` (git-ignored, a Claude Design
export — one `*.dc.html` per screen: `Reader`, `Main Menu`, `Game Menu`, `Confirm Dialog`;
`Reader v1` and `Settings Modal` are superseded drafts; inline styles and a small component
script, readable as is), demo art in `.claude/ref/images/`. Deliberate departures from it are
listed in plan-0.2 (icon buttons, no scene controls in the corner, no option numbers) and the
stage registries (0.1's namebox over the panel's edge, the stepping-back prompt, a panel that
never changes size). Tokens live in
`src/app/styles/theme.ts` as **design px** (the design's own numbers for a 1280×720 page);
components never hard-code colours or sizes. Screens for 0.2 are ordered from Claude Design; a
screen the design lacks is drawn in its language.

Target browser: **Chrome** (0.1 and 0.2). Other browsers and platforms come later.

The layout is fluid — no fixed frame, no bars. `Stage` sets the UI scale
`min(width/1280, height/720)` (≥ 0.75) as `--u`; every size goes through `u(designPx)` from
`shared/lib/units.ts`, every position is a percentage. A phone held upright gets a "rotate your
device" hint. Check layout changes at 1920×1080, 2560×1080, 1024×768 and 844×390.

## Localisation

i18next, Russian by default, English additional. Never hard-code a visible string.

- Interface: namespace `ui`, flat keys (`'menu.newGame'`). `shared/i18n/locales/ru.ts` defines
  the keys; `en.ts` must `satisfies UiDictionary`. `t()` is typed (`src/i18next.d.ts`).
- Story: namespace `story`. Scenes are written in Russian and **the Russian line is the key**;
  English lives in `src/content/locales/en.ts`. Editing a line in a scene orphans its
  translation — `translations.test.ts` lists missing and stale keys.

## Layout and boundaries

```
engine/       the engine, standalone: pure TS over plain data — no React, MobX, DOM or src/
              imports; the way taken (`timeline/`: rollback checkpoints, 128 back, and the
              history, 250 entries kept as keys) and saves of it (`save/`, format 2). Read
              engine/README.md before touching it.
src/main.tsx  composition root: content scenes + engine registry → RootStore
src/app, pages, widgets, features, entities, shared   FSD in spirit; import only downward
src/app/stores  RootStore (wires the stores; the main menu's art and music; saving, loading,
              deleting — asking first where it must), UiStore (screen, the `overlay` over it — the
              game menu on one of its sections, maybe with a question about a save over it, or a
              confirmation — and notices; F1's «Управление»), GameStore (the game loop: MobX wrapper around the
              engine — new game, resume a save, advance, choose, roll back and forward; keeps the
              engine's timeline; its views go through `presentation.ts`, pure functions that
              turn ids into image URLs, names and scene titles, so UI never sees content ids; the
              engine's audio effects are played by `audioEffects.ts`),
              SaveStore (the autosave written on every line and choice, "Продолжить" resumes
              from it; six slots, read as the Save or Load section opens; a save holds the way
              taken, so a loaded game rolls back; previews for the menus; the play time — a clock
              the game screen runs while the player is there),
              ReadingStore (how far the line on screen is read: typed out or not, the prompt read
              or not, read in an earlier pass or not; the one `requestAdvance`, keys 1–9; Auto
              and Skip as in Ren'Py — what they do next is `nextStep`, the UI's timer calls
              `step()`; rolling back and forward shows the line whole, a choice with its options
              out; a transition the story asks for (`with`) holds the line back until the scene
              says it is over, a click cuts it short),
              PersistentStore (Ren'Py's `persistent`: the lines read, keyed by scene and a hash of
              the Russian line — `ots:persistent`, outlives every playthrough), SettingsStore
              (volumes, mute, text speed and size, Auto's pause, what Skip passes, panel opacity,
              language — `ots:settings`, apart from the save)
src/shared/lib/stores  AppStores + useStores(): lower layers reach stores without importing app/
src/shared/lib/storage.ts  localStorage that never throws (blocked, private, full → no saves,
              the game plays on); keys in shared/config/storageKeys.ts, prefix `ots:` — saves
              under `ots:save:auto`, `ots:save:1` … `ots:save:6` (`?dev=` runs: `ots:save:dev…`)
src/shared/lib/audio.ts  the only file that knows howler
src/shared/config/keymap.ts  what the keys and the mouse do — Ren'Py's `config.keymap`: each
              action with its inputs, and «Управление»'s groups. The input handlers ask it which
              action a key is, «Управление» draws it: a key bound here shows up there
src/features/advance-dialogue  input into ReadingStore's commands, keys by the keymap: click on
              the frame (not on system controls), Space/Enter → requestAdvance; keys 1–9; Tab →
              Skip on and off (unless the focus is on a control), Ctrl → Skip while held; PageUp /
              the wheel up → roll back, PageDown / the wheel down → forward (shared/lib/wheelSteps:
              a notch or a swipe is a step); Esc → the game menu on Save; nothing reaches the game
              while a window is open. Runs the typewriter (shared/lib/useTypewriter, rAF; held while a
              transition plays), which tells the store when a line has typed out, and Auto's and
              Skip's timer (useReadingModes) while the player is in the game
src/entities/frame  a frame drawn: the stage's (scene art, shade, characters) and a thumbnail of
              it in a box of any shape (the save slots; the Continue card, its characters put in
              the middle so the small square shows them)
src/widgets/scene-view  the scene: background and characters as one frame, with Ren'Py's
              `dissolve` (0.5 s) whenever the frame changes — the engine already gathers every
              change up to the next line into one state, so it is one transition. Or the story's
              own, `with` — the last one before the line: `fade` through black (0.5 + 0.5 s),
              `move` (characters glide to their new places, evenly, 0.5 s), `vpunch` (the frame
              shakes, 0.275 s); it tells the reading store when it is over. Less motion
              (`prefers-reduced-motion`): `fade` is a short dissolve, `move` and `vpunch` none.
              None while skipping, rolling back and forward, or after a load
src/widgets/game-menu  Ren'Py's game menu: a window with its sections in a rail ("Сохранить",
              "Загрузить", "История", "Настройки", "Управление"), "Главное меню" at the foot in the
              game; on `shared/ui/Modal` (Esc and a click outside close it, caught before the game;
              a window opened inside another — a question about a save — dims that one only, and
              Esc closes it alone). From the main menu it offers "Загрузить", "Настройки" and
              "Управление"
src/features/save-slots  SlotsSection: Ren'Py's file slots — Save and Load, six slots with a
              thumbnail of the saved frame, the date, the scene and the line; Load has the
              autosave over them; a bin on hover and focus, Delete on a slot. SlotQuestionDialog:
              overwrite, delete, load in the game — asked over the menu
src/features/change-settings  SettingsSection: the settings' tabs and rows, the game menu's part
src/features/view-history  HistorySection: the lines read and the choices made, the game menu's
              part, translated as it is shown
src/features/view-controls  ControlsSection: «Управление», Ren'Py's help — the keymap by groups,
              keys as keycaps (shared/ui/Keycap), the mouse as a glyph (shared/ui/MouseGlyph); a
              key held while it is open lights up, and the game doesn't see it. useControlsKey: F1
              opens it on every screen (mounted once, in App)
src/features/make-choice  ChoiceList: options as lines of text under the prompt, inside the
              dialogue panel (widgets/dialogue-box renders it in place of the caret)
src/widgets   also: dialogue-box (namebox, line, icon buttons — Auto and Skip pressed while on,
              «Назад» greyed with nowhere to go back to; meta line), mode-indicator (AUTO ▸ /
              SKIP ▸▸), game-header, continue-card, notice (the toast), stage. The confirmation
              window is `shared/ui/ConfirmDialog`, on `shared/ui/Modal`
src/content   the story: ids, speakers, variables, assets (files behind ids; the menu's art and
              music), scene titles, factories (dsl.ts), scenes
src/content/__dev__  test scenes, not part of the game (branching): `?dev=branching` on the
              dev server; `?dev=<scene>` starts from any scene. Left out of production builds
src/assets    art, music and sound files (WebP / SVG / MP3 / Ogg); sounds/CREDITS.md says where
              the sounds come from
e2e/          Playwright smoke tests of the main paths: a playthrough to the end, the choice
              (click and digit), Continue after a reload, reading at a speed, Auto and Skip,
              rollback through the choice, the history, save slots (save, load in the game and
              from the main menu, overwrite, delete), a line waiting for a transition,
              «Управление» (F1, keys tried there leave the game alone)
.github/workflows/ci.yml  CI on PRs into main: the checks above in one job, e2e in another
```

Enforced by `no-restricted-imports` in `.oxlintrc.json`: `engine/` can't import `src/`,
React or MobX; `src/` can't import the engine except via `@engine`. The downward-only rule
between FSD layers is kept by hand: no import up, none sideways between two slices of one layer
(what two features share goes down to `shared/`, as the keymap did).

Scenes are written with the factories from `src/content/dsl.ts` (`scene`, `show`, `say`,
`narrate`, `goTo`, `choice`, `option`, …), never as raw command objects. A choice may ask with a
line that stays on screen while the player chooses: `choice(say('mila', 'Куда пойдём?'), [...])`.
A frame may come in with a transition: `scene('street', { with: 'fade' })`,
`show('mila', 'sad', 'left', { with: 'move' })`, `show('mila', 'sad', { with: 'vpunch' })`.

## Conventions

- Code, identifiers, comments, commits: **English**. Russian only in game text and in the
  docs under `.claude/`.
- Prettier: `printWidth: 100`, single quotes, semicolons, trailing commas, `arrowParens: always`.
  `.claude/` is excluded from formatting on purpose.
- Tests: Vitest, next to the code (`engine/**/*.test.ts`, `src/**/*.test.ts`), pure logic
  (engine, content, stores, presentation, lib helpers). Components have no unit tests: the UI is
  checked by e2e of the main paths (`e2e/`). Compile-time guarantees are tested with
  `@ts-expect-error`.
- When something in the engine is ambiguous, follow Ren'Py
  ([.claude/engine-research.md](.claude/engine-research.md)).
- Commits follow **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `test:`,
  `refactor:`, `build:`).

## How we work

- Small atomic steps: one verifiable thing per step, then stop and report what to check.
- **Pavel commits**, one commit per step — never leave the project broken between steps. Don't
  commit unless asked; propose a commit message instead.
- Git: one branch per stage (`feat/<version>-stage-N-<name>`, e.g. `feat/0.2-stage-0-design`;
  0.1 used `feat/stage-N-<name>`), one commit per step inside it, PR into `main` at the end of
  the stage.
- Anything that shapes structure or later code is asked as a question **before** implementing.
  Small reversible choices: decide and name them in the report.
- After every step update the stage's registry `progress.md` (step status, journal entry);
  record new decisions in its `context.md`. Open questions are closed as we hit them, with the
  answer written into the registry.
- At the end of a stage add a summary entry to the version's `progress.md` — now
  [.claude/tasks/version-0.2/progress.md](.claude/tasks/version-0.2/progress.md). If reality
  diverges from the plan, update that version's plan too.
- A new version gets its own `plan-<version>.md` in `.claude/` and its own
  `.claude/tasks/version-<version>/` (stage specs, `task-registry/`, `progress.md`); decisions of
  earlier versions stay in force unless the new plan says otherwise.
- Design comes from Claude Design (see Design above); a screen it lacks is drawn in its
  language, values live in theme tokens.
- Don't grow the engine ahead of the game: every abstraction in `engine/` must be needed by
  the demo scene now.
