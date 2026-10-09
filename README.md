# On the Other Side

A visual novel built as a web application. React + TypeScript on Vite, MobX for state,
styled-components for styles. The story is written as typed TypeScript modules, and the engine
grows out of what the game actually needs.

**Status:** version 0.1 is in progress — the first playable build with a single linear scene.
See [the 0.1 plan](.claude/plan-0.1.md) and [progress log](.claude/tasks/progress.md).

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
- [Engine research](.claude/engine-research.md) — what was taken from Ren'Py and ink, and why
- [Stage tasks](.claude/tasks/) and the [progress log](.claude/tasks/progress.md)
