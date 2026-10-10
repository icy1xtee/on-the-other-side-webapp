# CLAUDE.md

Visual novel as a web app. Vision in [.claude/project-brief.md](.claude/project-brief.md),
decisions and stages in [.claude/plan-0.1.md](.claude/plan-0.1.md), per-stage specs and the
progress summary in [.claude/tasks/](.claude/tasks/). Read the plan before changing architecture.

**Start of any session:** read the current stage's folder in
[.claude/tasks/task-registry/](.claude/tasks/task-registry/) — `context.md` (full picture,
agreed decisions) and `progress.md` (branch, step statuses, journal, open questions).
Consciously postponed compromises live in [.claude/tasks/tech-debt.md](.claude/tasks/tech-debt.md);
add to it rather than leaving a TODO in code.

## Commands

```sh
npm run dev           # dev server
npm run build         # tsc -b && vite build
npm run typecheck     # tsc -b
npm run lint          # oxlint
npm run format        # prettier --write .   (format:check for CI-style check)
npm test              # vitest run
```

Before reporting a step as done: `lint`, `typecheck`, `test`, `format:check`, `build` all pass.

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
- Three TS projects under `tsc -b`: `tsconfig.app.json` (src, DOM), `tsconfig.engine.json`
  (engine, **no DOM**), `tsconfig.node.json` (vite config).
- `zod` validates saves in `engine/save` — import **`zod/mini`** (classic `zod` added ~90 KB to
  the bundle, mini ~26 KB). `howler` arrives at stage 6 — don't add it earlier.
- Icons: **lucide-react**, named imports only (`import { Cog } from 'lucide-react'`) so the
  bundle keeps just the icons in use. Don't pass `size` / `strokeWidth`: inside `PillButton`
  an icon is sized in `em` from the button font (so it scales with the UI) and drawn at
  `theme.icons.strokeWidth`. Icons are decorative by default (`aria-hidden`). An icon-only
  button is `shared/ui/IconButton`: its `label` is both the `aria-label` and the hover tooltip
  (`shared/ui/Tooltip`, pure CSS) — no `title` attributes.
- Fonts: Geist / Geist Mono from `@fontsource/geist` and `@fontsource/geist-mono` (the Google
  Fonts builds, **with Cyrillic** — `@fontsource/geist-sans` is Latin-only). Import the
  per-weight CSS (`400.css`); the per-subset files lack `unicode-range` and can't be combined.

## Design

The design comes from Claude Design: `.claude/ref/html/on-the-other-side-demo-layout-design.html`
(git-ignored, a bundled page — unpack its template rather than reading it raw), demo art in
`.claude/ref/images/`. Tokens live in `src/app/styles/theme.ts` as **design px** (the design's
own numbers for a 1280×720 page); components never hard-code colours or sizes.

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
              imports. Read engine/README.md before touching it.
src/main.tsx  composition root: content scenes + engine registry → RootStore
src/app, pages, widgets, features, entities, shared   FSD in spirit; import only downward
src/app/stores  RootStore, UiStore, GameStore (MobX wrapper around the engine; resolves ids
              into image URLs and names via `presentation`, so UI never sees content ids;
              autosaves on every line and choice, "Продолжить" resumes from it)
src/shared/lib/stores  AppStores + useStores(): lower layers reach stores without importing app/
src/shared/lib/storage.ts  localStorage that never throws (blocked, private, full → no saves,
              the game plays on); keys in shared/config/storageKeys.ts, prefix `ots:`
src/features/advance-dialogue  the single requestAdvance: click on the frame (not on system
              controls), Space/Enter; typewriter state; at a choice, the prompt is read before
              the options come out; Esc → menu
src/features/make-choice  ChoiceList: options as lines of text under the prompt, inside the
              dialogue panel (widgets/dialogue-box renders it in place of the caret)
src/content   the story: ids, speakers, variables, assets (files behind ids), factories
              (dsl.ts), scenes
src/content/__dev__  test scenes, not part of the game (branching): `?dev=branching` on the
              dev server; `?dev=<scene>` starts from any scene. Left out of production builds
src/assets    art files (WebP / SVG)
```

Enforced by `no-restricted-imports` in `.oxlintrc.json`: `engine/` can't import `src/`,
React or MobX; `src/` can't import the engine except via `@engine`. The downward-only rule
between FSD layers is kept by hand.

Scenes are written with the factories from `src/content/dsl.ts` (`scene`, `show`, `say`,
`narrate`, `goTo`, `choice`, `option`, …), never as raw command objects. A choice may ask with a
line that stays on screen while the player chooses: `choice(say('mila', 'Куда пойдём?'), [...])`.

## Conventions

- Code, identifiers, comments, commits: **English**. Russian only in game text and in the
  docs under `.claude/`.
- Prettier: `printWidth: 100`, single quotes, semicolons, trailing commas, `arrowParens: always`.
  `.claude/` is excluded from formatting on purpose.
- Tests: Vitest, next to the code (`engine/**/*.test.ts`, `src/**/*.test.ts`), pure logic
  only (engine, content, stores, lib helpers). UI is not tested. Compile-time guarantees are
  tested with `@ts-expect-error`.
- When something in the engine is ambiguous, follow Ren'Py
  ([.claude/engine-research.md](.claude/engine-research.md)).
- Commits follow **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `test:`,
  `refactor:`, `build:`).

## How we work

- Small atomic steps: one verifiable thing per step, then stop and report what to check.
- **Pavel commits**, one commit per step — never leave the project broken between steps. Don't
  commit unless asked; propose a commit message instead.
- Git: one branch per stage (`feat/stage-N-<name>`), one commit per step inside it, PR into
  `main` at the end of the stage.
- Anything that shapes structure or later code is asked as a question **before** implementing.
  Small reversible choices: decide and name them in the report.
- After every step update the stage's registry `progress.md` (step status, journal entry);
  record new decisions in its `context.md`. Open questions are closed as we hit them, with the
  answer written into the registry.
- At the end of a stage add a summary entry to
  [.claude/tasks/progress.md](.claude/tasks/progress.md). If reality diverges from the plan,
  update the plan too.
- Design (palette, fonts, menu and dialogue look) comes from Claude Design. Until it arrives,
  theme tokens hold deliberately rough draft values; design swaps values, not structure.
- Don't grow the engine ahead of the game: every abstraction in `engine/` must be needed by
  the demo scene now.
