# Этап 0. Инициализация проекта

**Цель:** пустой, но полностью настроенный проект, который запускается, линтится,
типизируется, тестируется и собирается.

**Зависимости:** нет, это первый этап.
**Контекст:** [plan-0.1.md → Этап 0](../plan-0.1.md)

---

## Шаги

### 1. Проверка совместимости — до всего остального

Шаблон Vite `react-ts` сейчас ставит React 19. Нужно убедиться, что `styled-components`
встаёт без конфликта peer-зависимостей.

- поставить шаблон в temp-каталог, добавить `styled-components`, посмотреть на вывод npm;
- если конфликт — зафиксировать React 18 и записать это в
  [progress.md](./progress.md) как отклонение от плана.

Причина, почему это шаг №1: откат версии React после того, как написан код, дороже, чем
проверка на пустом проекте.

### 2. Scaffold

- `npm create vite@latest` шаблон `react-ts` **в temp-каталог**, не в репозиторий: на непустой
  папке команда спрашивает подтверждение в интерактиве, а у меня неинтерактивная оболочка;
- перенести содержимое в репозиторий;
- **не затрагивать** `README.md`, `.claude/`, `.git/`;
- удалить демо-мусор шаблона: логотипы, `App.css`, счётчик в `App.tsx`.

### 3. Зависимости

Runtime: `react`, `react-dom`, `mobx`, `mobx-react-lite`, `styled-components`.

Dev: `typescript`, `vite`, `@vitejs/plugin-react`, `eslint`, `typescript-eslint`,
`eslint-plugin-react-hooks`, `prettier`, `eslint-config-prettier`, `vitest`,
`babel-plugin-styled-components`.

`zod` и `howler` **не ставим** — они появятся на этапах 5 и 6, где нужны.

### 4. tsconfig

- `strict: true`
- `noUncheckedIndexedAccess: true` — интерпретатор постоянно берёт команду по индексу,
  здесь это ловит реальные баги
- `jsx: react-jsx`
- алиас `@/*` → `src/*` (и в tsconfig, и в `vite.config`, и в vitest — три места, легко забыть)
- типизация темы styled-components: `declare module 'styled-components'` с расширением
  `DefaultTheme`

### 5. Конфиги сборки и качества

- `vite.config.ts`: `@vitejs/plugin-react` с `babel-plugin-styled-components` (читаемые имена
  классов в devtools), `resolve.alias`, секция `test` для vitest
- ESLint flat config (v9): `typescript-eslint` recommended + `react-hooks` +
  `eslint-config-prettier` последним
- `.prettierrc`
- `package.json` scripts: `dev`, `build`, `preview`, `lint`, `format`, `typecheck`, `test`
- `.gitignore`, `.editorconfig`

### 6. Документы проекта

- `README.md` — переписать; заодно убрать лишние кавычки вокруг заголовка
- `CLAUDE.md` — команды, конвенции, правила границ слоёв из
  [plan-0.1.md](../plan-0.1.md), явный запрет на импорты `engine/ → src/*` и `engine/ → content/`

### 7. Тривиальный тест

Один осмысленный тест, чтобы `npm test` не падал на «no tests found» и чтобы сразу было видно,
что vitest подхватывает алиасы.

---

## Файлы, которые появятся

```
package.json, package-lock.json
tsconfig.json, tsconfig.node.json
vite.config.ts
eslint.config.js
.prettierrc, .editorconfig, .gitignore
index.html
src/main.tsx, src/App.tsx, src/vite-env.d.ts
README.md (перезаписан), CLAUDE.md
```

---

## Готово, когда

- [ ] `npm run dev` открывает страницу без ошибок в консоли
- [ ] `npm run lint` — чисто
- [ ] `npm run typecheck` — чисто
- [ ] `npm run test` — зелёный
- [ ] `npm run build` — собирается
- [ ] импорт через алиас `@/` работает и в приложении, и в тестах
- [ ] `git status` чистый после коммита, ничего лишнего не закоммичено

---

## Открытые вопросы

- [ ] **(квиз)** Правила Prettier. Предлагаю: `printWidth: 100`, `singleQuote: true`,
      `semi: true`, `trailingComma: 'all'`, `arrowParens: 'always'`. Решить **до** первого
      прогона `format`, иначе он перепишет весь проект и следующий диф будет нечитаемым.
- [ ] **(квиз)** Добавлять ли встроенное правило `no-restricted-imports` для границ слоёв?
      План говорит «FSD по духу, без спец-линтера», но это правило штатное для ESLint и
      стоит десять строк конфига. Оно поймает импорт `content/` из `engine/` автоматически.
- [ ] **(доки)** Актуальный способ подключить styled-components к Vite. Нужен ли
      `babel-plugin-styled-components` через `@vitejs/plugin-react`, или уже есть SWC-вариант.
      Проверить по докам styled-components и плагина Vite, а не по памяти.
- [ ] **(по факту)** Включать ли `exactOptionalPropertyTypes`. Полезно для типов команд, где
      `at?: SpritePosition` не должен принимать `undefined` явно, но может потребовать
      возни в другом коде. Решить, когда появятся первые типы на этапе 2.
- [ ] **(квиз)** Нужны ли `.nvmrc` и поле `engines` в package.json. Сейчас на машине
      Node 24.12.0, npm 11.6.2. Полезно, если проект переедет на другую машину или в CI.
- [ ] **(по факту)** Отдельный `vitest.config.ts` или секция `test` внутри `vite.config.ts`.
      Второе проще, пока не понадобятся разные окружения для движка (node) и UI (jsdom).
      UI мы не тестируем, так что скорее всего хватит одной секции.
