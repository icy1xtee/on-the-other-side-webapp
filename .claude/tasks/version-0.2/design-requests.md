# Заказ макетов 0.2 в Claude Design

Экраны, которых нет в макетах `.claude/ref/layout-design/` (Reader, Main Menu, Settings Modal), а
0.2 они нужны. Промпты — на английском, для вставки в Claude Design; общий контекст — один раз,
перед первым промптом. Готовую сборку Павел кладёт в `.claude/ref/layout-design/`.

| # | Экран | Зачем | Этап 0.2 |
|---|---|---|---|
| 1 | Игровое меню | Каркас: «Сохранить», «Загрузить», «История», «Настройки», «Главное меню»; окно настроек становится его разделом | 3 |
| 2 | Сохранение и загрузка | 6 ручных слотов + автосейв (только загрузка) | 4 |
| 3 | История | Лог реплик и выборов | 3 |
| 4 | Состояния панели и диалоги | «Назад», Auto / Skip включены, развилка, подтверждения, уведомления | 2–4 |

Статус: заказано 2026-10-12, сборка — в `.claude/ref/layout-design/`. Claude Design собрал игровое меню одним файлом (`Game Menu`: сохранение, загрузка, история, настройки), окно подтверждения — отдельно (`Confirm Dialog`), состояния панели, индикатор и уведомления — в `Reader`.

---

## Общий контекст

```text
Project: "On the other side", a web visual novel. Desktop Chrome first, fluid layout,
reference size 1280×720 (also check 1024×768 and 1920×1080).

The existing screens are the source of truth for the visual language: Reader, Main Menu,
Settings Modal. Reuse their fonts (Geist / Geist Mono), surfaces, borders, radii, the teal
accent, the mono meta lines, hover and focus states, and the dimmed, blurred backdrop.

Copy: Russian is the game's default language, English is secondary. Write the UI copy in
Russian and size controls for it (Russian strings run about 25% longer than English).

Make each new screen its own .dc.html with props for its states, the way Main Menu has
hasSave and settingsOpen.
```

## 1. Игровое меню

```text
Game Menu. Grow the Settings Modal into the game's menu window: same frame, header (title +
close ✕), surfaces, row styles and footer buttons, but wider (about 960×600 at 1280×720),
with a vertical navigation rail on the left.

Rail items: «Сохранить» (Save), «Загрузить» (Load), «История» (History), «Настройки»
(Settings); set apart at the bottom of the rail: «Главное меню» (Main menu). The active item
is highlighted like the active Settings tab.

Opened in game from the dialogue panel buttons (Save, Load, History), the gear in the header
or Esc, straight into the matching section. The scene stays visible behind it, dimmed and
blurred, like the Settings Modal over the Reader today. Esc or ✕ closes it.

Opened from the Main Menu («Загрузить», «Настройки»): the rail shows only Load and Settings,
with no Save, History or Main menu.

The Settings section is the Settings Modal's content (Text / Audio / Display tabs, rows,
«Сбросить» / «Готово»), placed in the content area. Two new rows:
- Audio, first row: «Без звука» (Mute all), a toggle;
- Display: «Язык» (Language), segmented «Русский» / «English».

The Save, Load and History sections are described in the next prompts.
Props: section (save | load | history | settings), fromMainMenu (boolean).
```

## 2. Сохранение и загрузка

```text
Save and Load sections of the Game Menu.

Save: a grid of 6 manual slots, 3 columns × 2 rows.
Load: the same grid, plus the autosave above it as a wider card titled «Автосохранение».
The autosave can only be loaded, never written or deleted; «Продолжить» in the Main Menu
resumes from it.

A filled slot card:
- a 16:9 thumbnail: a miniature of the saved frame (scene background + characters). Use image
  slots; it is drawn from the save, not a screenshot;
- a mono meta line like the Continue card's: «СЛОТ 3 · 12.10.2026 · 18:42»;
- the scene title;
- the start of the last line, one line with an ellipsis: «Мила: Здесь всегда так тихо…».

An empty slot is a quiet card reading «Пустой слот». In Save, clicking it saves there. In
Load, it is inert.

Actions:
- Save, filled slot: click → overwrite, after a confirmation (prompt 4).
- Load, filled slot or autosave: click → load. In game it asks first, since play continues
  from that save.
- Delete: a small trash icon button on filled manual slots, on hover or focus, with a
  confirmation.

States: hover, keyboard focus ring, empty, filled.
Props: mode (save | load), slots (array of filled / empty), hasAutosave.
```

## 3. История

```text
History section of the Game Menu: the log of the lines read in this playthrough.

A scrollable list, oldest at the top and newest at the bottom. It opens scrolled to the
bottom.

Entries:
- a spoken line: the speaker's name (like the panel's name, smaller), then the line text in
  the reader's text colour;
- narration: the text only, no name;
- the player's choice: a distinct entry, e.g. «→ Пойти домой», in the teal accent and quieter,
  clearly marked as the player's choice.

Up to 250 entries. Empty state: «История пуста».
Props: entries (array of { kind: line | narration | choice, name?, text }).
```

## 4. Состояния панели и диалоги

```text
Additions to the Reader, plus small dialogs.

Reader:
- «Назад» (Back: return to the previous line) joins the panel buttons, first in the row, and
  the scene controls in the top right.
- Auto and Skip active states. While a mode is on, its button is lit (like the active
  segmented option in Settings), and a quiet indicator sits in a corner of the scene, e.g. mono
  «AUTO ▸» / «SKIP ▸▸». The indicator stays visible when the scene controls are hidden.
- «Выборы» (Choices) is not available yet: a disabled button state.
- Choice state. The panel shows the speaker's question line, then 2–4 options under it as
  lines of text, not big buttons, highlighted in teal on hover or focus. Options appear once
  the question has finished typing.
- Narration: the panel without portrait and name.

Dialogs (Settings Modal language, small):
- Confirmation: title, one sentence, «Отмена» and an action button. The action can be
  destructive (a quiet warning variant). Cases:
  - «Перезаписать слот 3?»
  - «Удалить сохранение?»
  - «Начать новую игру? Автосохранение будет перезаписано.»
  - «Загрузить сохранение? Игра продолжится с него.»
- Toast, a short notice that fades away: «Сохранено в слот 3»,
  «Не удалось сохранить: хранилище браузера недоступно».

Props: autoOn, skipOn, choiceState, narration, confirmOpen, toast.
```
