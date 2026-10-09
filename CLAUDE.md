# CLAUDE.md

Visual novel as a web app. Vision in [.claude/project-brief.md](.claude/project-brief.md),
decisions and stages in [.claude/plan-0.1.md](.claude/plan-0.1.md), per-stage specs and the
progress summary in [.claude/tasks/](.claude/tasks/). Read the plan before changing architecture.

**Start of any session:** read the current stage's folder in
[.claude/tasks/task-registry/](.claude/tasks/task-registry/) — `context.md` (full picture,
agreed decisions) and `progress.md` (branch, step statuses, journal, open questions).

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
- `@/*` → `src/*`. Defined in two places that must stay in sync: `tsconfig.app.json` `paths`
  and `vite.config.ts` `resolve.alias`. Vitest reads the alias from the Vite config.
- `zod` arrives at stage 5, `howler` at stage 6 — don't add them earlier.

## Layer boundaries

```
src/app, pages, widgets, features, entities, shared   FSD in spirit; import only downward
src/engine    no React, no FSD layers, no content/ — scene registry is injected from app/
src/content   the only place that knows the story
```

`engine/` boundaries are enforced by `no-restricted-imports` in `.oxlintrc.json`. The
downward-only rule between FSD layers is kept by hand.

## Conventions

- Code, identifiers, comments, commits: **English**. Russian only in game text and in the
  docs under `.claude/`.
- Prettier: `printWidth: 100`, single quotes, semicolons, trailing commas, `arrowParens: always`.
  `.claude/` is excluded from formatting on purpose.
- Tests: Vitest, `src/**/*.test.ts`, pure logic only (engine, lib helpers). UI is not tested.
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
