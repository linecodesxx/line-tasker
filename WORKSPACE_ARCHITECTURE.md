# LineTasker: как устроен workspace, editor и backend

## Что это за проект

`line-tasker` - это `pnpm`-монорепозиторий с двумя основными приложениями:

- `apps/web` - фронтенд на `Next.js 16`, `React 19`, `Tailwind CSS 4`, `CodeMirror`.
- `apps/api` - backend на `NestJS 11` + `Prisma` + `PostgreSQL`.

Корневой `package.json` почти пустой и используется как точка запуска воркспейса:

- `pnpm dev:web` запускает фронтенд.
- `pnpm dev:api` запускает backend.

Пакетный воркспейс описан в `pnpm-workspace.yaml`: туда входят `apps/*` и `packages/*`.

## Общая идея приложения

Система строится вокруг сущности `Workspace`.

Каждый workspace принадлежит одному пользователю и содержит:

- папки (`Folder`);
- заметки (`Note`);
- задачи (`Task`).

На фронтенде workspace отображается как псевдо-файловая система:

- слева дерево папок и файлов;
- по центру вкладки и редактор;
- справа боковая панель задач.

Важно: это не настоящий доступ к файловой системе ОС. Это UI-представление данных из базы, где `relativePath` у note/task имитирует путь файла.

## Структура монорепо

### Корень

- `package.json` - общие команды запуска.
- `pnpm-workspace.yaml` - состав монорепо.
- `TODO.MD` - список задач/заметок по проекту.
- `docker-compose.yml` - сейчас пустой.

### `apps/web`

Основные части:

- `app/` - страницы через App Router.
- `hooks/` - клиентские хуки для auth и API.
- `features/workspace-editor/` - UI и логика editor shell.

### `apps/api`

Основные части:

- `src/main.ts` - bootstrap Nest-приложения.
- `src/app.module.ts` - корневой модуль.
- `src/auth` - регистрация, логин, JWT.
- `src/workspaces` - workspaces и FS-представление.
- `src/folders` - дерево папок.
- `src/notes` - CRUD заметок.
- `src/prisma` - PrismaService.
- `prisma/schema.prisma` - схема БД.

## Как устроен frontend

### 1. Layout и базовая оболочка

Файл `apps/web/app/layout.tsx` подключает глобальные стили и шрифты `Geist`.

Файл `apps/web/app/globals.css`:

- подключает `tailwindcss`;
- объявляет CSS-переменные для фона и текста;
- включает тёмную тему через `prefers-color-scheme`;
- задаёт глобальный `font-family`.

На этом уровне нет специального состояния workspace, только базовый каркас приложения.

### 2. Авторизация на фронтенде

Главный клиентский хук - `apps/web/hooks/useAuth.ts`.

Он отвечает за:

- хранение JWT в `localStorage` по ключу `line-tasker-token`;
- логин через `POST /auth/login`;
- регистрацию через `POST /auth/register`;
- восстановление сессии через `GET /auth/me`;
- logout с очисткой токена и редиректом на `/login`.

Как работает:

1. При монтировании хук берёт токен из `localStorage`.
2. Если токена нет, пользователь считается неавторизованным.
3. Если токен есть, фронт идёт в `GET /auth/me`.
4. Если запрос успешен, `user` заполняется.
5. Если запрос неуспешен, токен удаляется.

Страницы:

- `app/login/page.tsx` - форма логина.
- `app/register/page.tsx` - форма регистрации.
- `app/page.tsx` - главная страница со списком workspace, доступна только после авторизации.

### 3. API-слой фронтенда

Главный хук для рабочих данных - `apps/web/hooks/useWorkspaces.ts`.

Он оборачивает запросы к backend и предоставляет методы:

- `loadWorkspaces()`
- `createWorkspace(title)`
- `bootstrapWorkspace()`
- `getWorkspace(id)`
- `getWorkspaceFs(id)`
- `createFolder(workspaceId, payload)`
- `createNote(workspaceId, payload)`
- `updateNote(workspaceId, noteId, payload)`
- `updateTask(workspaceId, taskId, payload)`

Базовый URL берётся из `NEXT_PUBLIC_API_URL`, иначе используется `http://localhost:3001`.

Особенности:

- Каждый защищённый запрос автоматически добавляет `Authorization: Bearer <token>`.
- Ошибки backend распаковываются из `response.json().message`.
- Хук хранит клиентское состояние списка workspace и флаги загрузки/создания.

Важно: метод `updateTask()` на фронтенде есть, но в `apps/api/src` нет отдельного task-controller/task-service. То есть фронтенд уже готов к части task API, а backend пока реализован только частично.

## Как устроена главная страница workspaces

Файл `apps/web/app/page.tsx` - это список всех workspace пользователя.

Он делает следующее:

- проверяет авторизацию через `useAuth`;
- загружает список workspace через `useWorkspaces`;
- показывает карточки workspace;
- даёт создать новый workspace вручную;
- даёт вызвать `bootstrapWorkspace()`, чтобы создать стартовый workspace.

`bootstrapWorkspace()` на backend создаёт первый workspace с папками:

- `notes`
- `tasks`

Если у пользователя уже есть хотя бы один workspace, bootstrap просто возвращает существующий.

## Как устроена страница workspace

Ключевой файл: `apps/web/app/workspaces/[workspaceId]/page.tsx`.

Это основной orchestration-компонент всего редактора. Он не просто рендерит UI, а держит почти всё рабочее состояние.

### Какие данные страница хранит

- `workspaceFs` - полный слепок workspace из API.
- `isLoading`, `error` - состояние загрузки.
- `openTabs` - открытые вкладки.
- `activeFileId` - текущий активный файл.
- `drafts` - локальные черновики по каждому открытому/загруженному файлу.
- `rightPanel` - состояние правой панели, сейчас это только `"tasks"` или `null`.
- `expandedFolders` - какие папки раскрыты в explorer.
- `selectedFolderId` - папка, в которую будут создаваться новые note/folder.
- `autosaveTimersRef` - таймеры автосохранения по файлам.

### Откуда берутся данные

После авторизации страница вызывает:

- `getWorkspaceFs(workspaceId)`

Backend отдаёт объект вида:

- `workspace`
- `folders`
- `notes`
- `tasks`

Дальше уже на клиенте эти сущности преобразуются в псевдо-файлы и дерево explorer.

## Как работает модель "workspace как файловая система"

Типы для ответа API лежат в `apps/web/features/workspace-editor/fs-types.ts`.

Основные DTO:

- `WorkspaceDto`
- `FolderDto`
- `NoteDto`
- `TaskDto`
- `WorkspaceFsResponse`

На их основе фронтенд строит внутреннюю модель editor-а через `types.ts`:

- `WorkspaceFile` - абстрактный файл редактора;
- `ExplorerNode` - узел дерева;
- `DraftState` - локальное состояние текста и сохранения;
- `OpenTab` - вкладка;
- `RightPanel` - правая панель.

### Виды файлов редактора

Фронтенд оперирует тремя типами файлов:

- `meta`
- `note`
- `task`

#### `meta`

Это виртуальный файл, не существующий в БД как отдельная запись. Сейчас создаётся один файл:

- `workspace/README.md`

Он генерируется на клиенте и показывает сводку по workspace:

- id;
- даты;
- число папок, заметок и задач.

Этот файл read-only.

#### `note`

Это обычные заметки из таблицы `Note`. Они редактируемые и сохраняются в backend.

#### `task`

Это задачи из таблицы `Task`, но сейчас на фронтенде они открываются скорее как текстовый read-only-like файл без полноценного backend-редактирования. В `EditorPane` задача не помечена как read-only, но `saveFile()` сохраняет только `note`. Поэтому task можно увидеть в редакторе, но сохранить через текущую реализацию нельзя.

## Утилиты editor shell

Логика преобразования данных живёт в `apps/web/features/workspace-editor/utils.ts`.

### `buildWorkspaceFilesFromFs(fs)`

Функция создаёт массив `WorkspaceFile[]`.

Что делает:

1. Генерирует виртуальный `README.md` типа `meta`.
2. Преобразует все `notes` в файлы `<slug>.md`.
3. Преобразует все `tasks` в файлы `<slug>.task`.

Содержимое task-файла собирается как текстовый блок:

- `title`
- `status`
- `priority`
- `createdAt`
- `updatedAt`
- описание

То есть задача сейчас отображается как "плоский документ", а не как специализированная форма.

### `buildExplorerTreeFromFs(folders, files)`

Это главный конструктор дерева explorer.

Он:

1. Создаёт `folderNode` для каждой папки.
2. Связывает дочерние папки с родительскими через `parentId`.
3. Раскладывает файлы по папкам на основе `file.path`.
4. Сортирует дерево так, чтобы папки шли перед файлами.

Ключевой момент: размещение файла в дереве основано не на `folderId`, а на строковом `relativePath/path`.

Это означает:

- backend отвечает за консистентность `relativePath`;
- если путь будет неверным, дерево на фронтенде тоже построится неверно.

### `collectFolderIds(nodes)`

Собирает все id папок, чтобы автоматически раскрывать новые папки после загрузки дерева.

### `getTaskBadgeLabel()` и `getTaskBadgeClass()`

Превращают `TaskStatus` в подпись и CSS-класс бейджа в правой панели.

## Левый explorer

Компонент: `apps/web/features/workspace-editor/ExplorerPane.tsx`.

Он принимает:

- дерево `nodes`;
- активный файл;
- список раскрытых папок;
- выбранную папку;
- обработчики открытия файла, выбора папки, переключения папки;
- обработчики создания note/folder.

Как работает:

- папки можно раскрывать и сворачивать;
- папку можно выбрать как target для создания новых сущностей;
- клик по файлу открывает вкладку;
- есть кнопки `+ Note` и `+ Folder`.

Внутри используется рекурсивный `ExplorerTree`, который сам рендерит вложенность.

### Выбор папки

`selectedFolderId` не открывает саму папку как документ. Он нужен только как текущий контекст создания:

- если папка выбрана, новая note/folder создаётся в ней;
- если не выбрана, создание идёт в корень workspace.

## Вкладки

Компонент: `apps/web/features/workspace-editor/TabsBar.tsx`.

Хранит отображение уже открытых файлов.

Функции:

- переключение активной вкладки;
- закрытие вкладки;
- индикация `dirty`-состояния.

Сами вкладки не хранят данные, они работают поверх:

- `openTabs`
- `activeFileId`
- `drafts`

Если файл удалится из `fileMap`, вкладка автоматически исчезнет при синхронизации состояния в родительском компоненте.

## Центральный editor

Компонент: `apps/web/features/workspace-editor/EditorPane.tsx`.

Он отвечает за рендер текстового редактора на базе `@uiw/react-codemirror`.

### Какие расширения включаются

Функция `buildExtensions(file)`:

- включает перенос строк;
- задаёт кастомную тему;
- для `note` и `meta` включает markdown language support;
- для `meta` включает read-only режим через `EditorState.readOnly`.

### Статусы сохранения

Функция `renderSaveBadge()` отображает одно из состояний:

- `Read only`
- `Saving...`
- `Saved`
- `Error`
- `Unsaved`
- `Idle`

Это purely UI-статус, который зависит от `DraftState`.

### Что может редактироваться

- `meta` - нельзя редактировать.
- `note` - можно.
- `task` - текст в редакторе меняется локально, но не сохраняется через текущий `saveFile()`.

Это один из важных текущих архитектурных зазоров.

## Как устроены drafts и сохранение

В `app/workspaces/[workspaceId]/page.tsx` у каждого файла есть локальный `DraftState`:

- `value` - текущее содержимое в редакторе;
- `savedValue` - последнее подтверждённое сервером значение;
- `isDirty` - есть ли изменения;
- `saveStatus` - `idle/saving/saved/error`;
- `errorMessage` - текст ошибки сохранения.

### Начальная инициализация drafts

После загрузки файлов страница:

1. создаёт draft для каждого файла;
2. синхронизирует список вкладок;
3. выбирает активным первый доступный файл.

### Открытие файла

`openFile(fileId)`:

1. добавляет вкладку, если её ещё нет;
2. при необходимости создаёт draft;
3. делает файл активным.

### Изменение текста

`changeDraft(fileId, value)`:

- меняет `value`;
- сравнивает с `savedValue`;
- выставляет `isDirty`;
- сбрасывает прошлую ошибку.

### Ручное сохранение

`saveFile(fileId)` работает только для `note`.

Логика:

1. Проверяет наличие workspace, файла и draft.
2. Пропускает сохранение, если файл не dirty.
3. Пропускает всё, что не `note`.
4. Ставит статус `saving`.
5. Находит note в `workspaceFs`.
6. Отправляет `PATCH /notes/:id?workspaceId=...`.
7. Передаёт `contentMd` и `version`.
8. При успехе обновляет `workspaceFs` и draft.
9. При ошибке ставит статус `error`.

### Optimistic concurrency

Note обновляется с полем `version`.

Это значит:

- клиент отправляет свою версию note;
- backend сравнивает её с текущей;
- если версии не совпали, выбрасывается `ConflictException("Version conflict")`.

То есть в проекте уже есть базовая защита от перезаписи чужих изменений.

### Автосохранение

Отдельный `useEffect` проходит по `drafts` и:

- для каждого dirty note ставит таймер на `1000ms`;
- если пользователь продолжает печатать, таймер перезапускается;
- после паузы вызывает `saveFile(fileId)`.

Плюс есть обработчик клавиатуры для `Ctrl+S` / `Cmd+S`.

## Правая панель задач

На workspace-странице справа есть sidebar с задачами.

Она берёт `tasks` из `workspaceFs` и рендерит карточки:

- title;
- status;
- excerpt/description;
- подсказку, какой вкладкой задача откроется.

При клике:

- находится соответствующий `WorkspaceFile` типа `task`;
- он открывается как вкладка.

Это не отдельный kanban и не специализированный task editor. Это пока просто список задач плюс открытие их как псевдо-файлов.

## Создание папок и заметок на фронтенде

### Создание папки

`handleCreateFolder()`:

1. Спрашивает имя через `window.prompt`.
2. Вызывает `createFolder(workspaceId, { name, parentId, kind: "MIXED" })`.
3. Добавляет папку в локальный `workspaceFs`.
4. Сразу раскрывает новую папку.
5. Делает её выбранной.

### Создание заметки

`handleCreateNote()`:

1. Спрашивает title через `window.prompt`.
2. Вызывает `createNote(...)`.
3. Добавляет note в `workspaceFs`.
4. Создаёт draft для новой note.
5. Добавляет вкладку.
6. Делает note активной.

То есть UI не делает повторного refetch после создания, а дописывает данные локально.

## Как устроен backend

## Точка входа

Файл `apps/api/src/main.ts`:

- создаёт Nest app;
- включает `CORS`;
- подключает глобальный `ValidationPipe`;
- поднимает Swagger на `/docs`;
- слушает порт `3001`.

`ValidationPipe` включён с:

- `transform: true`
- `whitelist: true`

Это означает:

- DTO могут автоматически приводить типы;
- лишние поля из body отбрасываются.

## Корневой модуль

Файл `apps/api/src/app.module.ts`.

Подключены модули:

- `ConfigModule` как глобальный;
- `AuthModule`;
- `PrismaModule`;
- `WorkspacesModule`;
- `FoldersModule`;
- `NotesModule`.

Отдельного `TasksModule` здесь нет.

## Prisma и база данных

Главная схема описана в `apps/api/prisma/schema.prisma`.

### Datasource и client

- База: `postgresql`
- Prisma client генерируется в `apps/api/generated/prisma`
- Используется `moduleFormat = "cjs"`

### Сущности

#### `User`

Поля:

- `id`
- `email` - unique
- `name` - unique
- `password`
- `avatar`
- `createdAt`
- `updatedAt`

Связи:

- `workspaces`
- `notesEdited`

#### `Workspace`

Поля:

- `id`
- `ownerId`
- `title`
- `createdAt`
- `updatedAt`

Связи:

- `owner`
- `folders`
- `notes`
- `tasks`

#### `Folder`

Папка организует дерево через self-relation:

- `parentId`
- `parent`
- `children`

Также хранит:

- `workspaceId`
- `name`
- `kind`
- `color`
- `icon`

Ограничение:

- `@@unique([workspaceId, parentId, name])`

То есть в одной и той же родительской папке не может быть двух дочерних папок с одинаковым именем.

#### `Note`

Поля:

- `workspaceId`
- `folderId`
- `title`
- `slug`
- `relativePath`
- `contentMd`
- `excerpt`
- `version`
- `contentHash`
- `lastEditedBy`
- `createdAt`
- `updatedAt`
- `deletedAt`

Ключевые ограничения:

- `@@unique([workspaceId, relativePath])`
- `@@unique([workspaceId, slug])`

`deletedAt` означает мягкое удаление.

#### `Task`

Поля:

- `workspaceId`
- `folderId`
- `title`
- `slug`
- `relativePath`
- `descriptionMd`
- `status`
- `priority`
- `dueDate`
- `createdAt`
- `updatedAt`
- `deletedAt`

Есть enum:

- `TaskStatus`: `TODO`, `IN_PROGRESS`, `DONE`
- `TaskPriority`: `LOW`, `MEDIUM`, `HIGH`

### PrismaService

Файл `apps/api/src/prisma/prisma.service.ts`.

Особенности:

- наследуется от `PrismaClient`;
- получает `DATABASE_URL` из `ConfigService`;
- создаёт `pg.Pool`;
- подключает `PrismaPg` adapter;
- на `onModuleInit()` делает `$connect()`.

То есть приложение работает не через стандартную встроенную конфигурацию Prisma datasource URL, а через явный `pg` adapter.

## Модуль авторизации

Папка: `apps/api/src/auth`.

### DTO

`AuthDTO.ts` валидирует:

- email;
- password;
- username.

Для регистрации username ограничен regex-ом:

- только латиница, цифры и `_`.

### `AuthService`

Основные методы:

- `register(dto)`
- `login(dto)`
- `generateTokenResponse(userId)`

#### Регистрация

Что происходит:

1. Пароль хешируется через `bcrypt.hash(..., 10)`.
2. Username нормализуется через `normalizeUsernameHandle()` в lowercase.
3. Пользователь создаётся в БД.
4. Если Prisma возвращает `P2002`, backend кидает `ConflictException`.
5. В ответ возвращается JWT + безопасные данные пользователя.

#### Логин

Можно войти:

- по email;
- по username.

Backend:

1. Берёт введённый идентификатор.
2. Сравнивает его и как `email`, и как нормализованный `name`.
3. Проверяет пароль через `bcrypt.compare`.
4. Возвращает токен и user.

### JWT

`jwt.strategy.ts`:

- забирает токен из Bearer header;
- валидирует по `JWT_SECRET`;
- после проверки загружает пользователя из БД;
- в `req.user` попадает безопасный профиль.

`jwt.guard.ts` - обычный `AuthGuard('jwt')`.

### `AuthController`

Маршруты:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

`/auth/me` защищён `JwtAuthGuard`.

## Модуль workspaces

Папка: `apps/api/src/workspaces`.

### `WorkspacesController`

Маршруты:

- `GET /workspaces`
- `GET /workspaces/me`
- `GET /workspaces/:id`
- `POST /workspaces`
- `POST /workspaces/bootstrap`
- `GET /workspaces/:workspaceId/fs`

Все маршруты защищены `JwtAuthGuard`.

### `WorkspacesService`

#### `create(ownerId, dto)`

Создаёт workspace с указанным title.

#### `getMine(ownerId)`

Возвращает все workspace пользователя, отсортированные по `createdAt asc`.

#### `getOne(ownerId, id)`

Возвращает один workspace пользователя вместе с:

- notes без `deletedAt`;
- tasks без `deletedAt`.

Если workspace не найден, бросает `NotFoundException`.

#### `bootstrap(ownerId)`

Если у пользователя уже есть workspace, возвращает первый существующий.

Если нет - создаёт `My Workspace` и сразу две папки:

- `notes`
- `tasks`

#### `getFileSystem(workspaceId)`

Возвращает агрегированный payload для editor shell:

- `workspace`
- `folders`
- `notes`
- `tasks`

Это один из главных API-методов во всей системе, потому что именно он питает страницу `/workspaces/[workspaceId]`.

### Важная деталь по безопасности

`getFileSystem(workspaceId)` сейчас проверяет только существование workspace по id, но не проверяет `ownerId`.

То есть маршрут находится под JWT, но сам сервис не убеждается, что текущий пользователь владелец этого workspace.

С архитектурной точки зрения это слабое место: при знании чужого `workspaceId` можно потенциально получить его файловое представление.

## Модуль папок

Папка: `apps/api/src/folders`.

### `FoldersController`

Маршруты:

- `GET /folders/tree?workspaceId=...`
- `POST /folders?workspaceId=...`
- `PATCH /folders/:id/rename?workspaceId=...`
- `PATCH /folders/:id/move?workspaceId=...`
- `DELETE /folders/:id?workspaceId=...`

### `FoldersService`

#### `getTree(workspaceId)`

Возвращает все папки workspace в плоском виде. Дерево собирается уже на фронтенде.

#### `create(workspaceId, dto)`

Проверяет parent folder, если `parentId` задан, затем создаёт папку.

#### `rename(id, workspaceId, dto)`

1. Находит папку.
2. Меняет `name`.
3. Запускает `rebuildPathsForFolderTree()`.

Это важно: после переименования нужно обновить `relativePath` всех note/task внутри этой папки и её потомков.

#### `move(id, workspaceId, dto)`

Проверяет:

- что папка существует;
- что папка не перемещается сама в себя;
- что целевая папка существует;
- что папка не перемещается в собственного потомка.

После этого:

1. обновляет `parentId`;
2. вызывает `rebuildPathsForFolderTree()`.

#### `remove(id, workspaceId)`

Удаление запрещено, если внутри есть:

- дочерние папки;
- заметки;
- задачи.

То есть удаляются только пустые папки.

#### `rebuildPathsForFolderTree(workspaceId, folderId)`

Это одна из самых важных backend-функций проекта.

Она:

1. Загружает все папки workspace.
2. Строит map по `id`.
3. Находит все затронутые папки: указанную и всех потомков.
4. Для каждой note в этих папках пересчитывает `relativePath`.
5. Для каждой task в этих папках тоже пересчитывает `relativePath`.

Это и есть backend-механизм, который поддерживает иллюзию "файловой системы".

Если бы этой функции не было, после rename/move папки фронтенд строил бы дерево по устаревшим путям.

## Модуль заметок

Папка: `apps/api/src/notes`.

### `NotesController`

Маршруты:

- `GET /notes?workspaceId=...`
- `GET /notes/:id?workspaceId=...`
- `POST /notes?workspaceId=...`
- `PATCH /notes/:id?workspaceId=...`
- `PATCH /notes/:id/move?workspaceId=...`
- `DELETE /notes/:id?workspaceId=...`

### `NotesService`

#### `list(workspaceId)`

Возвращает все не удалённые заметки workspace, сортировка по `updatedAt desc`.

#### `getById(id, workspaceId)`

Находит заметку только внутри workspace и только если `deletedAt = null`.

#### `create(workspaceId, userId, dto)`

Логика:

1. Генерирует `slug` из title через `slugify()`.
2. Делает slug уникальным через `makeUniqueSlug()`.
3. Вычисляет путь папки через `getFolderPath()`.
4. Формирует `relativePath`.
5. Создаёт note с `version = 1`.
6. Сохраняет `lastEditedBy = userId`.

#### `update(id, workspaceId, userId, dto)`

Это ключевой метод сохранения из editor-а.

Он:

1. Загружает текущую note.
2. Проверяет `version`.
3. При необходимости пересчитывает slug.
4. При необходимости пересчитывает путь.
5. Обновляет title/content/folder/slug/path.
6. Пересчитывает `excerpt`.
7. Инкрементит `version`.
8. Обновляет `lastEditedBy`.

#### `move(id, workspaceId, dto)`

Меняет `folderId`, пересобирает `relativePath`, увеличивает `version`.

#### `remove(id, workspaceId)`

Удаляет мягко через установку `deletedAt`.

### Вспомогательные функции notes

`slugify.ts`:

- lowercases строку;
- удаляет лишние символы;
- заменяет пробелы на `-`;
- схлопывает повторные дефисы.

`makeUniqueSlug()`:

- ищет конфликтующий slug;
- если он занят, добавляет суффикс `-2`, `-3` и так далее.

`getFolderPath()`:

- загружает все папки workspace;
- поднимается по `parentId` вверх;
- собирает строковый путь через `/`.

## Как фронтенд и backend соединяются в editor flow

Ниже полный пользовательский сценарий.

### Открытие workspace

1. Пользователь заходит на `/workspaces/:workspaceId`.
2. `useAuth()` подтверждает токен через `/auth/me`.
3. `WorkspacePage` вызывает `/workspaces/:id/fs`.
4. Backend отдаёт workspace, folders, notes, tasks.
5. Фронтенд собирает виртуальные файлы.
6. Фронтенд собирает дерево explorer.
7. Открывается первый файл по умолчанию.

### Создание заметки

1. Пользователь жмёт `+ Note`.
2. Фронтенд берёт `selectedFolderId`.
3. Отправляет `POST /notes?workspaceId=...`.
4. Backend генерирует slug и relativePath.
5. Возвращённая note сразу вставляется в локальный `workspaceFs`.
6. Открывается вкладка новой note.

### Редактирование заметки

1. Пользователь печатает в CodeMirror.
2. Меняется `draft.value`.
3. Draft помечается dirty.
4. Через 1 секунду бездействия срабатывает autosave.
5. Фронт отправляет `PATCH /notes/:id`.
6. Backend проверяет `version`.
7. При успехе note обновляется в БД и возвращается обратно.
8. Фронтенд синхронизирует `workspaceFs` и draft.

### Переименование или перенос папки

1. Backend обновляет `Folder`.
2. Затем пересчитывает `relativePath` всех note/task в дереве этой папки.
3. Следующий `getWorkspaceFs()` или локальная синхронизация будут строить explorer уже по новым путям.

## Что сейчас важно понимать про задачи

В проекте задачи есть на уровне:

- Prisma schema;
- `WorkspaceFsResponse`;
- UI правой панели;
- представления в виде `.task` файла;
- пересчёта путей в `FoldersService`.

Но полноценного backend-модуля `tasks` сейчас не видно:

- нет `TasksModule`;
- нет `TasksController`;
- нет `TasksService`;
- нет маршрутов `PATCH /tasks/:id`, `POST /tasks`, `DELETE /tasks`.

При этом фронтенд уже содержит `updateTask()` в `useWorkspaces.ts`.

Вывод:

- модель данных для задач уже существует;
- UI их показывает;
- backend API для полноценной работы с задачами пока не доведён до конца.

## Основные архитектурные сильные стороны

### 1. Простая и понятная модель editor shell

Вместо сложной IDE-архитектуры здесь сделана компактная модель:

- один API-запрос на FS;
- клиентская сборка дерева;
- локальные drafts;
- autosave.

Это хорошо подходит для небольшого knowledge/task workspace.

### 2. Псевдо-файловая система держится на `relativePath`

Решение прагматичное:

- дерево не нужно хранить как отдельную сложную структуру на фронте;
- backend легко пересчитывает пути при rename/move;
- note/task можно отрисовывать как файлы.

### 3. Есть version-based conflict control

Для notes уже предусмотрен механизм защиты от потери изменений.

### 4. Чёткое разделение по Nest-модулям

`auth`, `workspaces`, `folders`, `notes` разделены достаточно чисто.

## Текущие слабые места и ограничения

### 1. `getFileSystem()` не проверяет владельца workspace

Это самая заметная backend-проблема по безопасности.

### 2. Task flow не завершён

Фронт уже умеет показывать задачи, но backend API под них не реализован симметрично.

### 3. Task в editor выглядит редактируемым, но не сохраняется

Для пользователя это может быть неочевидно:

- текст поменяется локально;
- но `saveFile()` игнорирует всё, что не `note`.

### 4. Много текстов отображаются с проблемами кодировки

В коде видно битые русские строки. Логика от этого не ломается, но UX и читаемость падают.

### 5. Создание note/folder через `window.prompt`

Это самый простой вариант, но не лучший UX:

- нет нормальной формы;
- нет валидации до запроса;
- нет контекстного UI.

### 6. Страница workspace держит слишком много логики в одном компоненте

`app/workspaces/[workspaceId]/page.tsx` сейчас объединяет:

- загрузку данных;
- формирование файлов;
- вкладки;
- drafts;
- autosave;
- keyboard shortcuts;
- создание сущностей;
- синхронизацию sidebar.

Файл уже работает как контейнер всей IDE. Это нормально для ранней стадии, но дальше его лучше будет дробить.

## Краткий вывод

Сейчас `LineTasker` - это workspace-ориентированное приложение, где backend хранит пользователей, workspaces, папки, заметки и задачи, а фронтенд превращает эти данные в редактор, похожий на небольшой файловый workspace.

Главная механика строится так:

- backend отдаёт агрегированный FS-срез workspace;
- фронтенд собирает дерево explorer и список виртуальных файлов;
- note редактируются в CodeMirror;
- изменения автосохраняются через `PATCH /notes`;
- папки поддерживают файловую структуру за счёт пересчёта `relativePath`.

В текущем состоянии система уже хорошо работает как markdown-workspace для заметок, но task-часть и некоторые вопросы безопасности/UX ещё требуют доведения до конца.
