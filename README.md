# On the Other Side

A visual novel built as a web application. React + TypeScript on Vite, MobX for state,
styled-components for styles, i18next for Russian and English. The story is written as typed
TypeScript modules, and the engine grows out of what the game actually needs.

**Status:** version 0.2 is done — the genre's interface on a three-scene demo: Auto and Skip,
the history and rollback, six save slots besides the autosave, transitions (`fade`, `move`,
`vpunch`), music in the menu and sounds in the scenes, settings, and a Controls screen. 0.1 made
the playable core: lines that type out, choices with branches and variables, Continue, music.
Target browser: Chrome. See the plans — [0.1](.claude/plan-0.1.md), [0.2](.claude/plan-0.2.md) —
and their progress logs: [0.1](.claude/tasks/version-0.1/progress.md),
[0.2](.claude/tasks/version-0.2/progress.md).

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
  assets/    backgrounds, characters, portraits, music, sounds (sounds/CREDITS.md — where they
             come from)
e2e/         Playwright smoke tests: a playthrough, the choice, Continue after a reload, rollback,
             the history, save slots, a line waiting for a transition, the Controls screen
```

## Playing

Click or Space / Enter — next line (a click while a line types shows it whole). At a choice:
read the prompt, then click an option or press 1–9. Esc — the game menu: saving and loading,
the history, the settings, the way back to the main menu. «Авто» turns the pages by itself;
«Пропуск» (or Tab, or Ctrl held) skips what has been read, in this playthrough or an earlier one,
and stops at a choice. «Назад», the wheel up or Page Up — back to the line before, a choice to
pick again; the wheel down or Page Down — forward along the way read. «История» lists what has
been read and chosen. The game saves itself on every line; «Продолжить» in the menu picks it up.
«Сохранить» puts the game into one of six slots; «Загрузить» — here or in the main menu — brings
one back, its history and the way back included. F1 — «Управление»: every key and what it does;
a key pressed there lights up and the game doesn't see it. The music starts on the first click or
key: the browser keeps a page silent until then.

## Docs

- [Project brief](.claude/project-brief.md) — what we build and why
- [Plan 0.1](.claude/plan-0.1.md) — decisions, architecture, stages
- [Plan 0.2](.claude/plan-0.2.md) — the genre's interface
- [Engine research](.claude/engine-research.md) — what was taken from Ren'Py and ink, and why
- Stage tasks and progress, per version: [0.1](.claude/tasks/version-0.1/),
  [0.2](.claude/tasks/version-0.2/); [tech debt](.claude/tasks/tech-debt.md) across versions
