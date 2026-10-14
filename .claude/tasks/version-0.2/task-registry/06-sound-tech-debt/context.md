# Этап 6. Звук и техдолг — контекст

Исходная спецификация — [../../06-sound-tech-debt.md](../../06-sound-tech-debt.md). Ход работ —
[progress.md](./progress.md). Решения планирования — [plan-0.2.md](../../../../plan-0.2.md).

---

## Цель

Трек звучит и в меню, без перерыва; у сцен есть звуки; CSS шрифтов похудел.

## Опирается на

- Версия 0.1 — `shared/lib/audio.ts`, `ifChanged`, `presentation.assets.sounds`.
- Этап 0 — «Без звука».
- [tech-debt.md](../../../tech-debt.md), п. 1 и 2.

## Решения

| Решение | Суть | Чьё |
|---|---|---|
| Файлы | Музыка меню — `main-demo.mp3`; звуки — Kenney (CC0), свои Павел подложит позже (решение 7) | планирование, Павел, 2026-10-12 |
| Музыка | `ifChanged` везде: меню → игра → меню без перерыва (решение 31) | планирование, Павел, 2026-10-12 |
| Звуки интерфейса | Нет (решение 32) | планирование, Павел, 2026-10-12 |
| Техдолг | Шрифты — в этом этапе; трек — пока MP3, Opus/OGG подложит Павел (решение 33) | планирование, Павел, 2026-10-12 |
| Ren'Py: музыка меню | `_main_menu` играет `config.main_menu_music` с `if_changed=True`; на входе в меню глушит каналы `config.main_menu_stop_channels` — `sound`, `voice`, `movie`, музыку — нет. `config.skip_sounds = False`: при Skip звуки играют — у нас так и было | исходники `renpy/common/00start.rpy`, доки Ren'Py |
| Музыка меню | `RootStore` получает `menuMusic` (файл; `content/assets.ts` — тот же `theme`) и играет его с `ifChanged` при старте и в `toMainMenu`; там же `stopSounds()` — как в Ren'Py. Демо — `music('theme', { ifChanged: true })` в первой сцене. «Продолжить» и загрузка и так возвращали музыку с `ifChanged` | спецификация; глушение звуков — Ren'Py |
| Автоплей | Трек просят сразу, браузер отказывает до первого жеста; howler на `unlock` (первый клик или клавиша где угодно) запускает его. Howler может сообщить об одном отказе дважды — ожидание `unlock` одно (`off` перед `once`), иначе заиграли бы две копии трека | по факту; howler 2.2.4 |
| Звуки | `src/assets/sounds/`: `knock.ogg` (три `bookPlace`), `door.ogg` (`doorOpen_2`), `steps.ogg` (шесть `footstep`, затихают) — Ogg Vorbis, моно, собраны ffmpeg; уровень — около музыки на громкости по умолчанию. `assets.sounds` — `satisfies Record<SfxId, string>`: звук без файла — ошибка компиляции. Откуда что — `CREDITS.md` рядом | спецификация; сборка — по факту |
| Откуда звуки | kenney.nl, itch.io и archive.org из сети Павла не открываются (сброс на TLS). RPG Audio — из загрузки самого Kenney на OpenGameArt («50 RPG sound effects», 2014, `license.txt` — CC0) | по факту |
| Загрузка звуков | `createAudioPlayer({ sounds })` — звуки грузятся при старте (~45 КБ), первый стук не опаздывает к тряске | по факту |
| Шрифты | `app/styles/fonts.css` вместо `fonts.ts`: шесть `@font-face` — Geist 400 и 500, Geist Mono 400, латиница и кириллица с `unicode-range` из `unicode.json` пакетов, только woff2. Vite сам находит `@fontsource/…/files/…` в `url()`. Начертания — обходом всех экранов (вычисленные стили) и по макетам: Geist 600 и Mono 500 не нужны. CSS 69,8 → 1,55 КБ | спецификация; начертания — по факту |

## Что вошло

- **`shared/lib/audio.ts`** — `stopSounds`, загрузка звуков при старте, одно ожидание `unlock`.
- **Сторы** — `RootStore`: `menuMusic`, музыка меню при старте и на выходе в меню, звуки глохнут; тесты.
- **Контент** — `assets.ts`: три звука, `menuMusic`; `intro` — `ifChanged`; тест: трек не перезапускается, звуки по пути.
- **Файлы** — `src/assets/sounds/` (`knock`, `door`, `steps`, `CREDITS.md`).
- **Шрифты** — `app/styles/fonts.css`; `fonts.ts` удалён; `main.tsx` импортирует CSS.
- **Документы** — CLAUDE.md, README, техдолг (п. 1 закрыт).

## Готово, когда

См. [06-sound-tech-debt.md → Готово, когда](../../06-sound-tech-debt.md).
