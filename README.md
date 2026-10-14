# On the Other Side

A visual novel built as a web application. React + TypeScript on Vite, MobX for state,
styled-components for styles, i18next for Russian and English. The story is written as typed
TypeScript modules, and the engine grows out of what the game actually needs.

**Status:** version 0.1 is done — a playable demo: lines that type out, choices with branches
and variables, an autosave with Continue, music, settings (volume, text speed, language) and
scene transitions. Target browser: Chrome.
See [the 0.1 plan](.claude/plan-0.1.md) and its [progress log](.claude/tasks/version-0.1/progress.md);
next is [0.2](.claude/plan-0.2.md).

## Requirements

- Node.js **24.12.0** (pinned in `.nvmrc` and `engines`; `npm install` refuses other versions)
- npm
- For the e2e tests, Chromium for Playwright, once: `npx playwright install chromium`

## Getting started

```sh
nvm use
npm install
npm run dev
```

## Scripts

| Command                | What it does                                             |
| ---------------------- | -------------------------------------------------------- |
| `npm run dev`          | Dev server with HMR                                      |
| `npm run build`        | Type-check and build into `dist/`                        |
| `npm run preview`      | Serve the production build locally                       |
| `npm run typecheck`    | TypeScript project check, no emit                        |
| `npm run lint`         | oxlint                                                   |
| `npm run format`       | Prettier, rewrites files                                 |
| `npm run format:check` | Prettier, check only                                     |
| `npm test`             | Vitest, single run                                       |
| `npm run test:watch`   | Vitest in watch mode                                     |
| `npm run e2e`          | Build, then the Playwright smoke tests against the build |

## Project layout

```
engine/      the engine, standalone: pure TypeScript, no React, no DOM, no knowledge of the
             story — see engine/README.md
src/
  main.tsx   the composition root: the story, the engine, storage and audio meet here
  app/ pages/ widgets/ features/ entities/ shared/   UI, Feature-Sliced Design in spirit
  content/   scenes, ids, speakers, variables, assets, translations — the only place that
             knows the plot; __dev__/ holds test scenes (`?dev=branching` on the dev server)
  assets/    backgrounds, characters, portraits, music
e2e/         Playwright smoke tests: a playthrough, the choice, Continue after a reload
```

## Playing

Click or Space / Enter — next line (a click while a line types shows it whole). At a choice:
read the prompt, then click an option or press 1–9. Esc — settings, with the way back to the
main menu. «Авто» turns the pages by itself; «Пропуск» (or Tab, or Ctrl held) skips what has
been read, in this playthrough or an earlier one, and stops at a choice. «Назад», the wheel up or
Page Up — back to the line before, a choice to pick again; the wheel down or Page Down — forward
along the way read. «История» lists what has been read and chosen. The game saves itself on every
line; «Продолжить» in the menu picks it up.

## Docs

- [Project brief](.claude/project-brief.md) — what we build and why
- [Plan 0.1](.claude/plan-0.1.md) — decisions, architecture, stages
- [Plan 0.2](.claude/plan-0.2.md) — what comes next
- [Engine research](.claude/engine-research.md) — what was taken from Ren'Py and ink, and why
- Stage tasks and progress, per version: [0.1](.claude/tasks/version-0.1/),
  [0.2](.claude/tasks/version-0.2/); [tech debt](.claude/tasks/tech-debt.md) across versions
