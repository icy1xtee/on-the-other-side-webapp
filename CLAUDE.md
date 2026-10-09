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
- `zod` arrives at stage 5, `howler` at stage 6 — don't add them earlier.
- Fonts: Geist / Geist Mono from `@fontsource/geist` and `@fontsource/geist-mono` (the Google
  Fonts builds, **with Cyrillic** — `@fontsource/geist-sans` is Latin-only). Import the
  per-weight CSS (`400.css`); the per-subset files lack `unicode-range` and can't be combined.

## Design

The design comes from Claude Design: `.claude/ref/html/on-the-other-side-demo-layout-design.html`
(git-ignored, a bundled page — unpack its template rather than reading it raw), demo art in
`.claude/ref/images/`. It is drawn for a ~1280px page: **design px × 1.5** = stage px. Tokens
live in `src/app/styles/theme.ts`; components never hard-code colours or sizes.

## Layout and boundaries

```
engine/       the engine, standalone: pure TS over plain data — no React, MobX, DOM or src/
              imports. Read engine/README.md before touching it.
src/main.tsx  composition root: content scenes + engine registry → RootStore
src/app, pages, widgets, features, entities, shared   FSD in spirit; import only downward
src/app/stores  RootStore, UiStore, GameStore (MobX wrapper around the engine; resolves ids
              into image URLs and names via `presentation`, so UI never sees content ids)
src/shared/lib/stores  AppStores + useStores(): lower layers reach stores without importing app/
src/features/advance-dialogue  the single requestAdvance: click on the frame (not on system
              controls), Space/Enter; typewriter state; Esc → menu
src/content   the story: ids, speakers, variables, assets (files behind ids), factories
              (dsl.ts), scenes
src/assets    art files (WebP / SVG)
```

Enforced by `no-restricted-imports` in `.oxlintrc.json`: `engine/` can't import `src/`,
React or MobX; `src/` can't import the engine except via `@engine`. The downward-only rule
between FSD layers is kept by hand.

Scenes are written with the factories from `src/content/dsl.ts` (`scene`, `show`, `say`,
`narrate`, `goTo`, `choice`, `option`, …), never as raw command objects.

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
