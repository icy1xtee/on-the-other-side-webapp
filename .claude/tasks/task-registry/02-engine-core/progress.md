# Этап 2. Ядро движка — прогресс

Контекст этапа — [context.md](./context.md).

**Ветка:** `feat/stage-2-engine-core`
**Статус этапа:** готов
**PR:** #3, влит в `main` (`0aadd09`); весь этап — одним коммитом `5848d2c`

---

## Шаги

| # | Шаг | Статус | Коммит |
|---|---|---|---|
| 1 | Типы команд: `Ids`, `Command<I>`, `ChoiceOption` с блоком, `resolveText`, `requiresInteraction` | закоммичен `5848d2c` | `feat(stage-2): engine` — весь этап одним коммитом |
| 2 | Состояние и мгновенные команды: `GameState`, `createInitialState`, `applyInstant`, эффекты | закоммичен `5848d2c` | ↑ |
| 3 | Реестр сцен и плоская программа (включая разворот блоков `choice`), проверка целей `jump` | закоммичен `5848d2c` | ↑ |
| 4 | Интерпретатор: проход до interaction, `jump`, конец игры, лимит шагов | закоммичен `5848d2c` | ↑ |
| 5 | Контент: id, говорящие, `variableDefaults`, фабрики, демо-сцена | закоммичен `5848d2c` | ↑ |
| 6 | `AppStores` и `useStores()` в `shared/` по приёму темы | закоммичен `5848d2c` | ↑ |
| 7 | `GameStore`: состояние движка в MobX, «Новая игра» → движок, конец → меню | закоммичен `5848d2c` | ↑ |

Статусы: `не начат` → `в работе` → `на проверке` → `закоммичен`.

Шаги делались подряд, без коммитов между ними, по просьбе Павла; закоммичены одним коммитом.

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

## Спорные моменты — решения ревью (2026-10-09)

Записаны по ходу этапа (решал сам, по Ren'Py где неоднозначно) и разобраны с Павлом после
мержа. Все 12 — по рекомендации.

| # | Момент | Решение | Куда перенесено |
|---|---|---|---|
| 1 | Где лежит движок | **Оставить корневую `engine/`** вне `src/`: алиас `@engine`, `tsconfig.engine.json` без DOM, oxlint-границы. `GameStore` — обвязка FE в `src/app/stores/` | — |
| 2 | Разворот блоков `choice` сделан на этапе 2, а не 4 | **Оставить.** На этапе 4 — выбор варианта (`choose`), UI, dev-контент | [04-choices.md](../../04-choices.md) |
| 3 | Сейв указывает на шаг скомпилированной программы: правка сцены выше позиции сдвигает номера | **Хэш программы сцены в сейве.** Совпал — грузим точно; не совпал — начинаем эту сцену с начала с переменными из сейва. Игрок теряет максимум одну сцену и не попадает в середину чужой реплики | [05-save-load.md](../../05-save-load.md), план |
| 4 | `show` без `at` у показанного персонажа сохраняет позицию, новый — в центр | **Оставить** (правило Ren'Py) | — |
| 5 | `Ids.vars` (тип переменных целиком) вместо `variable` | **Оставить:** иначе `vars.trust > 2` в `when` не компилируется | — |
| 6 | Эффекты `music` / `sfx` движок отдаёт, `GameStore` пока выбрасывает | **Оставить** до этапа 6; при загрузке музыка — из `state.audio` | — |
| 7 | Недоступный по `when` вариант: скрывать или серым | **Скрывать по умолчанию**, как Ren'Py (`config.menu_include_disabled = False`): не спойлерит. Флаг `available` уже есть — показ серым включается настройкой | [04-choices.md](../../04-choices.md), план |
| 8 | `scene` требует фон, чёрного экрана без картинки нет | **Фон `black` в контенте**, когда понадобится: `scene('black')` читается однозначно; движок не меняем | [03-rendering.md](../../03-rendering.md), план |
| 9 | Id сцен объявлены списком отдельно от сцен | **Оставить:** тип не вывести из сцен из-за взаимных `goTo`; рассинхрон ловит `satisfies` | — |
| 10 | `GameState` без `version` и `savedAt` | **Оставить:** это поля обёртки сейва на этапе 5 | — |
| 11 | Тесты на `GameStore` и `RootStore` | **Оставить:** логика сторов без UI попадает под правило «тестируем чистую логику» | — |
| 12 | Список файлов в спецификации этапа устарел | **Ок:** источник правды — реестр и `engine/README.md`, пометка в спецификации есть | — |

---

## Журнал

Записи добавляются в начало.

### 2026-10-09 · этап готов, ревью спорных моментов

Весь этап закоммичен одним коммитом `5848d2c`, PR #3 влит в `main` (`0aadd09`). После мержа
разобраны 12 спорных моментов — все приняты по рекомендации (таблица выше). Пункты 3, 7, 8
перенесены в задачи этапов 5, 4, 3 и в план.

### 2026-10-09 · шаги 1–7 · закоммичены `5848d2c`

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
