# On the Other Side

A visual novel built as a web application. React + TypeScript on Vite, MobX for state,
styled-components for styles. The story is written as typed TypeScript modules, and the engine
grows out of what the game actually needs.

**Status:** version 0.1 is closing — a playable demo with branching, saves, music and settings.
See [the 0.1 plan](.claude/plan-0.1.md) and its [progress log](.claude/tasks/version-0.1/progress.md);
next is [0.2](.claude/plan-0.2.md).

## Requirements

- Node.js **24.12.0** (pinned in `.nvmrc` and `engines`; `npm install` refuses other versions)
- npm

## Getting started

```sh
nvm use
npm install
npm run dev
```

## Scripts

| Command                | What it does                       |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | Dev server with HMR                |
| `npm run build`        | Type-check and build into `dist/`  |
| `npm run preview`      | Serve the production build locally |
| `npm run typecheck`    | TypeScript project check, no emit  |
| `npm run lint`         | oxlint                             |
| `npm run format`       | Prettier, rewrites files           |
| `npm run format:check` | Prettier, check only               |
| `npm test`             | Vitest, single run                 |
| `npm run test:watch`   | Vitest in watch mode               |

## Project layout

```
engine/      the engine, standalone: pure TypeScript, no React, no DOM, no knowledge of the
             story — see engine/README.md
src/
  app/ pages/ widgets/ features/ entities/ shared/   UI, Feature-Sliced Design in spirit
  content/   scenes, ids, speakers, variable defaults — the only place that knows the plot
  assets/    backgrounds, characters, music, sfx
```

Most of these folders appear stage by stage; see the plan for the full picture.

## Docs

- [Project brief](.claude/project-brief.md) — what we build and why
- [Plan 0.1](.claude/plan-0.1.md) — decisions, architecture, stages
- [Plan 0.2](.claude/plan-0.2.md) — what comes next
- [Engine research](.claude/engine-research.md) — what was taken from Ren'Py and ink, and why
- Stage tasks and progress, per version: [0.1](.claude/tasks/version-0.1/),
  [0.2](.claude/tasks/version-0.2/); [tech debt](.claude/tasks/tech-debt.md) across versions
