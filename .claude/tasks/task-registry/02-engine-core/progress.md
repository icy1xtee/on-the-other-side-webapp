# Этап 2. Ядро движка — прогресс

Контекст этапа — [context.md](./context.md).

**Ветка:** `feat/stage-2-engine-core`
**Статус этапа:** на проверке — все 7 шагов сделаны одним заходом по просьбе Павла, ждём
ревью, коммитов и PR
**PR:** — (открывается после ревью)

---

## Шаги

| # | Шаг | Статус | Коммит |
|---|---|---|---|
| 1 | Типы команд: `Ids`, `Command<I>`, `ChoiceOption` с блоком, `resolveText`, `requiresInteraction` | на проверке | `feat(engine): add command types` |
| 2 | Состояние и мгновенные команды: `GameState`, `createInitialState`, `applyInstant`, эффекты | на проверке | `feat(engine): add game state and instant commands` |
| 3 | Реестр сцен и плоская программа (включая разворот блоков `choice`), проверка целей `jump` | на проверке | `feat(engine): add scene registry` |
| 4 | Интерпретатор: проход до interaction, `jump`, конец игры, лимит шагов | на проверке | `feat(engine): add interpreter loop` |
| 5 | Контент: id, говорящие, `variableDefaults`, фабрики, демо-сцена | на проверке | `feat(content): add ids, command factories and demo scene` |
| 6 | `AppStores` и `useStores()` в `shared/` по приёму темы | на проверке | `refactor(app): move store access to shared via AppStores` |
| 7 | `GameStore`: состояние движка в MobX, «Новая игра» → движок, конец → меню | на проверке | `feat(app): add game store` |

Статусы: `не начат` → `в работе` → `на проверке` → `закоммичен`.

Шаги делались подряд, без коммитов между ними: файлы шагов не пересекаются, кроме конфигов
(первыми, до шага 1) — разбивку по коммитам см. в журнале.

---

## Открытые вопросы

| Вопрос | Тип | Шаг | Статус |
|---|---|---|---|
| Типизация id ассетов | квиз | 1 | **закрыт**: дженерик с дефолтом `string` |
| Конец сцены без `jump` | квиз | 4 | **закрыт**: конец игры → меню |
| `call` / `return` | квиз | — | **закрыт**: будут, не в 0.1; позиция — объект |
| Защита от бесконечного `jump` | доки | 4 | **закрыт**: лимит шагов (у Ren'Py — таймер, см. контекст) |
| Детерминированный ГСЧ | доки | — | **закрыт**: не нужен, случайности нет |
| Где живёт `StageState` | по факту | 2 | **закрыт**: в чистом состоянии движка |
| Размер лимита шагов | по факту | 4 | **закрыт**: 10 000 инструкций на один проход |
| `resolveText` для `{ $key }` | по факту | 1 | **закрыт**: возвращает ключ — видимая заглушка |
| Отдельные `StageStore` / `DialogueStore` | по факту | 7 | **закрыт**: один `GameStore` с вычисляемыми `stage` и `line` |
| Говорящие | по факту | 5 | **закрыт**: отдельный реестр `speakers` (имя; цвет — с дизайном) |

---

## Риски и спорные моменты — вернуться на ревью

Записано по ходу, как договорились: решал сам, по Ren'Py где неоднозначно.

1. **Где лежит движок.** Понял «отдельно от FE-приложения» как корневую папку `engine/` вне
   `src/`: свой алиас `@engine` (только публичный API), свой `tsconfig.engine.json` без DOM,
   правило oxlint без импортов из `src/`, React и MobX. Если имелся в виду `src/engine/` —
   переезд механический. `GameStore` (MobX-обвязка) остаётся в `src/app/stores/`: это
   склейка FE с движком, не сам движок.
2. **Разворот блоков `choice` сделан сейчас, а не на этапе 4.** Это одна чистая функция
   `compileScene` в составе реестра, без неё интерпретатору пришлось бы позже меняться. На
   этапе 4 остаются выбор варианта (`choose`), UI, dev-контент с развилками.
3. **Сейв указывает на шаг скомпилированной программы.** Любая правка сцены выше позиции
   (новая реплика, вариант выбора) сдвигает номера — старый сейв встанет не туда. Это вопрос
   этапа 5 про несовместимые сейвы; кандидаты — хэш программы сцены в сейве и откат на
   начало сцены при несовпадении.
4. **`show` без `at` у уже показанного персонажа сохраняет его позицию** (правило Ren'Py:
   при замене по тегу трансформ сохраняется). Новый персонаж без `at` — в центр. В
   спецификации это не было определено.
5. **Ключ `vars` в `Ids` вместо `variable` из плана:** тип переменных целиком, а не только
   имена. Без этого в `when` было бы `vars.trust: boolean | number | string`, и сравнение
   `vars.trust > 2` не компилировалось бы.
6. **Эффекты (`music`, `sfx`) движок отдаёт, `GameStore` их пока выбрасывает** — до
   аудио-слоя на этапе 6. При загрузке сейва эффектов нет (ничего не переисполняется):
   музыку приложение восстанавливает из `state.audio`.
7. **Доступность варианта (`when`) движок уже считает** и отдаёт флаг `available`. Скрывать
   недоступный вариант или показывать серым — по-прежнему вопрос этапа 4.
8. **`scene` требует фон.** `scene` без картинки (чёрный экран в Ren'Py) не поддержан —
   при необходимости фон `black` в контенте.
9. **Id сцен объявлены списком отдельно от самих сцен** (`content/ids.ts`): вывести тип из
   сцен нельзя, они ссылаются друг на друга через `goTo`. Новая сцена — две правки;
   `satisfies Record<SceneId, Scene>` ловит рассинхрон.
10. **`GameState` без `version` и `savedAt`.** Это поля обёртки сейва (этап 5), а не
    состояния движка.
11. **Тест на `GameStore` и `RootStore`** — логика сторов в Node, без UI; в рамках правила
    «тестируем только чистую логику», но это первые тесты вне движка.
12. **Файлы из спецификации этапа** (`src/engine/content-types/…`, `tests/engine/…`)
    устарели: раскладка — `engine/{types,state,program,interpreter}`, тесты рядом с кодом.

---

## Журнал

Записи добавляются в начало.

### 2026-10-09 · шаги 1–7 · на проверке

**Сделано (по шагам):**

- **Конфиги (до шага 1):** `tsconfig.engine.json` — движок проверяется отдельно, `lib`
  без DOM, `types: []`; добавлен в `references` корневого `tsconfig.json`. Алиас `@engine` →
  `engine/index.ts` (точное совпадение) в `tsconfig.app.json` и `vite.config.ts`. Vitest
  ищет тесты и в `engine/`. oxlint: для `engine/**` запрещены `@/…`, `../src`, React,
  MobX, styled-components; для `src/**` — относительный импорт движка в обход `@engine`.
- **Шаг 1** — `engine/types/`: `Ids` (всё `string` по умолчанию, `vars` —
  `Record<string, VarValue>`), `Command<I>`, `ChoiceOption<I>` (`when` — метод ради
  бивариантности, `then` — блок), `InteractionCommand`, `StateCommand`,
  `requiresInteraction`, `LocalizedText` + `resolveText`; `engine/errors.ts` — `EngineError`.
- **Шаг 2** — `engine/state/`: `GameState` = `{ position, vars, stage, audio }` (readonly,
  plain data), `createInitialState`, `applyInstant` → `{ state, effect }`; эффекты `music` и
  `sfx`. Правила Ren'Py: `scene` очищает спрайты, `show` заменяет по тегу на месте и
  сохраняет позицию, новый тег — сверху и в центр.
- **Шаг 3** — `engine/program/`: `compileScene` разворачивает блоки `choice` в плоскую
  программу с внутренними `goto`; блок, кончающийся `jump`, не получает выхода;
  вложенность любой глубины. `createSceneRegistry` компилирует все сцены и падает при
  старте на неизвестной стартовой сцене или `jump` в никуда, называя сцену и шаг.
- **Шаг 4** — `engine/interpreter/`: `startGame`, `run` (до `say` / `choice` / `end`),
  `advance` (только с реплики), лимит 10 000 инструкций. Загрузка сейва — это `run` от
  сохранённого состояния: встаёт на той же реплике, ничего не переисполняя.
- `engine/index.ts` — публичный API, `engine/README.md` — правила и модель.
- **Шаг 5** — `src/content/`: `ids.ts` (сцены, фоны, персонажи с эмоциями, музыка, звуки),
  `speakers.ts`, `variables.ts`, `types.ts` (`ContentIds`, `Cmd`, `Option`, `Scene`),
  `dsl.ts` (фабрики `scene`, `show`, `hide`, `music`, `stopMusic`, `sfx`, `set`, `goTo`,
  `say`, `narrate`, `choice`, `option`), демо-сцены `intro` → `walk` со всеми мгновенными
  командами, `index.ts`.
- **Шаг 6** — `src/shared/lib/stores/`: `AppStores` (пустой интерфейс), контекст,
  `StoreProvider`, `useStores`. `src/app/providers/` удалён.
- **Шаг 7** — `src/app/stores/GameStore.ts`: `state` и `interaction` как `observable.ref`,
  вычисляемые `stage` и `line`, `newGame()`, `advance()`, `onEnd`. `RootStore` принимает
  реестр и дефолты, расширяет `AppStores`, `newGame` открывает экран игры и запускает
  движок; конец сцены → меню. `main.tsx` — точка сборки: `createSceneRegistry(scenes,
  startScene)` при загрузке.

**Проверено:** `lint`, `typecheck`, `format:check`, `build` — проходят. Тестов 56 в 9
файлах: движок — 38, контент — 7 (включая 5 ошибок компиляции через `@ts-expect-error`:
опечатка в фоне, чужая эмоция, несуществующая сцена, неверный тип переменной, неизвестный
говорящий), сторы — 5, `stageScale` — 7. Пробы границ: oxlint поймал `@/content`, `../src`,
`react`, `mobx` в движке и относительный импорт движка из `src/`; `tsconfig.engine.json` не
знает `document`. В браузере (CDP): реестр собирается при загрузке, «Новая игра» без ошибок.

**Проверить глазами:** визуально ничего нового — рендер на этапе 3. Код движка — `engine/`,
начать с `engine/README.md`; контент — `src/content/scenes/intro.ts`.

**Предлагаемая разбивка по коммитам** — каждый собирается сам по себе:

1. `feat(engine): set up engine as a standalone module with command types` — `tsconfig.json`,
   `tsconfig.engine.json`, `tsconfig.app.json`, `vite.config.ts`, `.oxlintrc.json`,
   `engine/types/`, `engine/errors.ts` (конфиги отдельно не собрать: `tsconfig.engine.json`
   без файлов в `engine/` роняет `tsc` — «No inputs were found»)
2. `feat(engine): add game state and instant commands` — `engine/state/`
3. `feat(engine): add scene registry` — `engine/program/`
4. `feat(engine): add interpreter loop` — `engine/interpreter/`, `engine/index.ts`,
   `engine/README.md`
5. `feat(content): add ids, command factories and demo scene` — `src/content/`
6. `feat(app): add game store and shared store access` — `src/shared/lib/stores/`,
   удаление `src/app/providers/`, `src/app/stores/`, `src/app/App.tsx`, `src/main.tsx`
   (шаги 6 и 7 вместе: `App.tsx` переходит на `shared/` и на `newGame` из `RootStore`
   одновременно)
7. `docs: record stage 2 in plan, registry and project docs` — `.claude/`, `CLAUDE.md`,
   `README.md`

### 2026-10-09 · подготовка этапа

- Этап 1 влит в `main` (PR #2), этап 2 открыт.
- Проведён квиз: 8 вопросов плюс уточнения по ветвлению (оба механизма, `goTo`, разворот в
  плоскую программу). Решения — в [context.md](./context.md).
- Вопрос «(доки)» про защиту Ren'Py от бесконечного цикла закрыт поиском: у Ren'Py таймер,
  у нас лимит шагов.
- Этап разбит на 7 шагов (таблица выше).
