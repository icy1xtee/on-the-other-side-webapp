# Этап 2. Ядро движка: типы и интерпретатор

**Цель:** типы команд и работающий интерпретатор с циклом interaction. Проверяется тестами —
визуально на этом этапе ничего не появляется, это осознанно.

**Зависимости:** [этап 0](./00-setup.md). Этап 1 не обязателен, но удобнее после него.
**Контекст:** [plan-0.1.md → Ключевое архитектурное решение](../plan-0.1.md),
[engine-research.md → Ren'Py: глубокий разбор](../engine-research.md)

Это самый важный этап проекта: почти все решения из разбора Ren'Py материализуются здесь.

---

## Шаги

### 1. `engine/content-types`

```ts
type SpritePosition = 'left' | 'center' | 'right';
type LocalizedText = string | { $key: string };

type Command =
  // мгновенные
  | { type: 'scene'; background: BackgroundId }
  | { type: 'show'; tag: CharacterId; emotion: EmotionId; at?: SpritePosition }
  | { type: 'hide'; tag: CharacterId }
  | { type: 'music'; asset: MusicId | null; ifChanged?: boolean }
  | { type: 'sfx'; asset: SfxId }
  | { type: 'set'; name: VarName; value: VarValue }
  | { type: 'jump'; scene: SceneId }
  // требуют interaction
  | { type: 'say'; speaker: SpeakerId; text: LocalizedText }
  | { type: 'choice'; options: ChoiceOption[] };
```

Плюс: `Scene`, `ChoiceOption`, `resolveText()` (в 0.1 просто возвращает строку),
предикат `requiresInteraction(cmd)`.

### 2. `engine/interpreter`

Состояние кадра — plain data, чтобы снапшот сериализовался без преобразований:

```ts
type StageState = {
  background: BackgroundId | null;
  sprites: Array<{ tag: CharacterId; emotion: EmotionId; at: SpritePosition }>;
};
```

Цикл:

```
advance():
  пока не кончился бюджет шагов:
    cmd = commands[position.step]
    если requiresInteraction(cmd): остановиться, отдать cmd в DialogueStore, выйти
    иначе: applyInstant(cmd); position.step++
```

Правила применения мгновенных команд — прямо из Ren'Py:

- **`scene`** очищает `sprites` целиком и ставит фон. Это не то же самое, что смена фона.
- **`show`** ищет спрайт с тем же `tag` и **заменяет** его, а не добавляет второй. Поэтому
  смена эмоции — просто `show anna sad`.
- **`hide`** убирает по тегу; нужен редко именно из-за автозамены.
- **`jump`** меняет `position` на `{ sceneId, step: 0 }`.

### 3. Защита от бесконечного цикла

`jump`, ведущий обратно в сцену без ни одной команды с interaction, повесит браузер. Нужен
бюджет шагов на один `advance()` — при превышении бросать понятную ошибку с указанием сцены
и шага, а не тихо зависать.

### 4. `engine/navigation`

Реестр сцен `Record<SceneId, Scene>`, передаётся в интерпретатор **снаружи** при инициализации:
`engine/` не импортирует `content/`. Резолв сцены, понятная ошибка на несуществующий `SceneId`.

### 5. `content/`

- реестры ассетов: `backgrounds`, `characters` (тег → эмоция → файл), `music`, `sfx`
- `variableDefaults` — все изменяемые переменные с дефолтами (механика `default` из Ren'Py)
- демо-сцена: линейная, текст-заглушка, но с полным набором мгновенных команд

### 6. Тесты

- мгновенные команды применяются подряд, выполнение встаёт на первой `say`
- `show` с тем же тегом **заменяет** спрайт, а не добавляет второй
- `show` с другим тегом добавляет второй спрайт
- `scene` очищает спрайты и ставит фон
- `hide` убирает по тегу, отсутствующий тег не роняет
- `jump` переключает сцену и сбрасывает шаг
- `set` меняет переменную, дефолты подхватываются из `variableDefaults`
- снапшот `{ position, vars, stage }` сериализуется в JSON и восстанавливается без потерь
- бесконечный `jump` упирается в бюджет шагов и даёт внятную ошибку

---

## Файлы, которые появятся

```
src/engine/content-types/   command.ts, scene.ts, text.ts, index.ts
src/engine/interpreter/     Interpreter.ts, applyInstant.ts, stageState.ts
src/engine/navigation/      SceneRegistry.ts
src/content/               ids.ts, variables.ts, scenes/intro.ts, index.ts
src/app/stores/            GameStore.ts, StageStore.ts, DialogueStore.ts
tests/engine/              interpreter.test.ts, navigation.test.ts, snapshot.test.ts
```

---

## Готово, когда

- [ ] `npm test` зелёный, все перечисленные тесты на месте
- [ ] `engine/` не содержит ни одного импорта из `content/` и из `src/app|pages|widgets|...`
- [ ] `engine/` не содержит React
- [ ] типы команд закрыты discriminated union: `switch` по `type` даёт исчерпывающую проверку
      (проверить, что `never` в default-ветке компилируется)

---

## Открытые вопросы

- [ ] **(квиз, решить до начала)** Как типизировать id ассетов, не завязывая `engine/` на
      `content/`? Два варианта:
      **(а)** дженерики — `Command<S extends ContentSchema>`; типобезопасно, но параметр
      протечёт во все сторы и подписи станут шумными;
      **(б)** в движке id — это branded string, а автокомплит даётся фабриками команд в
      `content/`: `say('anna', '…')`, `show('anna', 'happy')`, типизированными по реестрам.
      Склоняюсь к **(б)**: движок остаётся простым, автокомплит там, где пишут сценарий.
      Разворот потом задевает все типы команд и сторы — поэтому вопрос блокирующий.
- [ ] **(квиз)** Что делать, когда команды в сцене кончились и нет `jump`? Варианты: считать
      концом игры и вернуться в меню (так делает Ren'Py при пустом стеке вызовов), считать
      ошибкой контента, или требовать явную команду `end`. Влияет на тесты этого этапа.
- [ ] **(квиз)** Понадобятся ли вызываемые подсцены (`call` / `return`) — общие сценки,
      используемые из разных мест? В 0.1 их нет, но от ответа зависит, оставлять ли
      `position` объектом с заделом под `callStack`. Сейчас в плане оставлен именно объект.
- [ ] **(доки)** Как Ren'Py защищается от бесконечного `jump` без interaction. Выяснить
      механику и повторить, а не изобретать свой бюджет шагов наугад.
- [ ] **(доки)** Нужен ли детерминированный генератор случайных чисел. Monogatari держит для
      этого свой форк `random-js`, а Ren'Py сохраняет состояние RNG в записи rollback — значит
      проблема реальная. При снапшот-сейве она мягче, но проверить, где именно всплывает.
- [ ] **(по факту)** Где живёт `StageState`: интерпретатор мутирует MobX-стор напрямую, или
      возвращает чистую структуру, а стор её принимает? Второе чище для тестов (движок без
      MobX вообще), но добавляет прослойку. Решаю на первом тесте.
- [ ] **(по факту)** Размер бюджета шагов на один `advance()`. Зависит от того, сколько
      мгновенных команд реально идёт подряд в контенте. Начну с заведомо большого и уточню.
