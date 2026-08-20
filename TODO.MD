# LineTasker — Roadmap Tasks

> Карта связей: [[00 LineTasker Index]] · [[Product Map]] · [[Backlog Map]] · [[WORKSPACE_ARCHITECTURE|Architecture]]

to install: pnpm --filter web add @tanstack/react-query axios zustand react-hook-form zod

## 0. Product foundation

- [ ] Сформулировать краткое позиционирование LineTasker
  - [ ] Описать продукт в 1 предложении
  - [ ] Описать, чем он отличается от Obsidian
  - [ ] Описать, чем он отличается от Notion
  - [ ] Зафиксировать главный сценарий пользователя
- [ ] Определить core-домены продукта
  - [ ] Tasks
  - [ ] Notes / Documents
  - [ ] Calendar / Events
  - [ ] Sync / AI / Notifications
- [ ] Определить MVP scope
  - [ ] Что обязательно войдёт в первую версию
  - [ ] Что точно не войдёт в первую версию
  - [ ] Какие фичи откладываются на post-MVP
- [ ] Определить главный домашний экран
  - [ ] Решить, что открывается первым: dashboard / inbox / today / workspace
- [ ] Описать ключевые пользовательские сценарии
  - [ ] Регистрация и вход
  - [ ] Создание workspace
  - [ ] Создание задачи
  - [ ] Создание заметки
  - [ ] Создание события
  - [ ] Получение напоминания
  - [ ] Синхронизация между устройствами

---

## 1. Архитектурное проектирование

- [ ] Зафиксировать общий стек проекта
  - [x] Web: Next.js + TypeScript
  - [x] Backend: NestJS
  - [ ] DB: PostgreSQL
  - [x] ORM: Prisma 
  - [ ] Cache / Queue: Redis
  - [ ] Mobile later: Expo / React Native
- [x] Зафиксировать архитектурный стиль
  - [x] Выбрать modular monolith для старта
  - [x] Не использовать микросервисы в MVP
  - [x] Не использовать GraphQL в MVP
- [ ] Нарисовать общую схему системы
  - [ ] Web client
  - [ ] API server
  - [ ] PostgreSQL
  - [ ] Redis
  - [ ] File storage
  - [ ] Worker
  - [ ] Realtime / sync слой
- [ ] Разделить ответственность клиента и сервера
  - [ ] Что хранится локально
  - [ ] Что является source of truth
  - [ ] Что делает клиент
  - [ ] Что делает сервер
- [ ] Зафиксировать стратегию синхронизации
  - [ ] Local-first только как future-ready слой
  - [ ] Для MVP выбрать version-based sync
  - [ ] Для простых сущностей выбрать last-write-wins
  - [ ] Для документов выбрать version field
  - [ ] Описать outbox-модель на будущее

---

## 2. Проектирование доменных сущностей

- [x] Описать сущность User
  - [ ] id
  - [ ] email
  - [ ] name
  - [ ] avatar
  - [ ] settings
- [ ] Описать сущность Workspace
  - [ ] id
  - [ ] ownerId
  - [ ] title
  - [ ] type
- [ ] Описать сущность Task
  - [ ] id
  - [ ] workspaceId
  - [ ] parentId
  - [ ] title
  - [ ] descriptionMd
  - [ ] status
  - [ ] priority
  - [ ] dueDate
  - [ ] startDate
  - [ ] completedAt
  - [ ] order
  - [ ] tags
  - [ ] reminderAt
- [x] Описать сущность Note
  - [ ] id
  - [ ] workspaceId
  - [ ] title
  - [ ] slug
  - [ ] contentMd
  - [ ] excerpt
  - [ ] icon
  - [ ] cover
  - [ ] version
  - [ ] lastEditedBy
- [ ] Описать сущность Event
  - [ ] id
  - [ ] workspaceId
  - [ ] title
  - [ ] descriptionMd
  - [ ] startAt
  - [ ] endAt
  - [ ] isAllDay
  - [ ] linkedTaskId
- [ ] Описать сущность Reminder
  - [ ] id
  - [ ] entityType
  - [ ] entityId
  - [ ] fireAt
  - [ ] channel
  - [ ] status
- [ ] Описать сущность Attachment
  - [ ] id
  - [ ] ownerId
  - [ ] fileName
  - [ ] mimeType
  - [ ] size
  - [ ] storageKey
- [ ] Описать сущность SyncOperation
  - [ ] id
  - [ ] userId
  - [ ] deviceId
  - [ ] entityType
  - [ ] entityId
  - [ ] operationType
  - [ ] payload
  - [ ] createdAt

---

## 3. Монорепа

- [ ] Создать корень монорепы
  - [x] `package.json`
  - [x] `pnpm-workspace.yaml`
  - [ ] `turbo.json`
  - [ ] `tsconfig.base.json`
  - [ ] `.env.example`
- [ ] Создать минимальную стартовую структуру
  - [x] `apps/web`
  - [x] `apps/api`
  - [ ] `packages/shared-types`
  - [ ] `packages/shared-validation`
  - [ ] `packages/api-client`
- [ ] Подготовить целевую структуру на будущее
  - [ ] `apps/mobile`
  - [ ] `apps/worker`
  - [ ] `packages/shared-domain`
  - [ ] `packages/markdown`
  - [ ] `packages/editor-core`
  - [ ] `packages/ui`
  - [ ] `packages/ui-mobile`
  - [ ] `packages/config-eslint`
  - [ ] `packages/config-typescript`
- [ ] Создать docs-папку
  - [ ] `docs/product`
  - [ ] `docs/architecture`
  - [ ] `docs/database`
  - [ ] `docs/api`

---

## 4. Shared packages

### shared-types
- [ ] Создать `packages/shared-types`
- [ ] Вынести тип User
- [ ] Вынести тип Workspace
- [ ] Вынести тип Task
- [ ] Вынести тип Note
- [ ] Вынести тип Event
- [ ] Вынести тип Reminder
- [ ] Вынести enums
  - [ ] TaskStatus
  - [ ] TaskPriority
  - [ ] ReminderChannel

### shared-validation
- [ ] Создать `packages/shared-validation`
- [ ] Добавить `auth.schema.ts`
- [ ] Добавить `workspace.schema.ts`
- [ ] Добавить `task.schema.ts`
- [ ] Добавить `note.schema.ts`
- [ ] Добавить `event.schema.ts`
- [ ] Сделать `index.ts`

### api-client
- [ ] Создать `packages/api-client`
- [ ] Настроить базовый HTTP client
- [ ] Добавить auth API
  - [ ] login
  - [ ] register
  - [ ] refresh token
  - [ ] logout
- [ ] Добавить tasks API
  - [ ] getTasks
  - [ ] createTask
  - [ ] updateTask
  - [ ] deleteTask
- [ ] Добавить notes API
  - [ ] getNotes
  - [ ] getNoteById
  - [ ] createNote
  - [ ] updateNote
  - [ ] deleteNote
- [ ] Добавить workspaces API
- [ ] Добавить events API позже
- [ ] Убрать прямой `fetch` из клиентов, использовать только api-client

---

## 5. Backend foundation

- [ ] Создать `apps/api`
- [ ] Инициализировать NestJS app
- [ ] Настроить env config
- [ ] Настроить PostgreSQL connection
- [ ] Подключить Prisma
- [ ] Создать первую schema.prisma
- [ ] Подключить миграции
- [ ] Подключить Redis
- [ ] Подготовить BullMQ
- [ ] Подготовить базовую структуру модулей

### backend modules — first wave
- [ ] auth
- [ ] users
- [ ] workspaces
- [ ] tasks
- [ ] notes

### backend modules — second wave
- [ ] events
- [ ] reminders
- [ ] search

### backend modules — third wave
- [ ] sync
- [ ] ai

### backend modules — fourth wave
- [ ] comments
- [ ] collaboration
- [ ] shared workspace tools

---

## 6. База данных

- [ ] Спроектировать таблицу users
- [ ] Спроектировать таблицу workspaces
- [ ] Спроектировать таблицу tasks
- [ ] Спроектировать таблицу notes
- [ ] Спроектировать таблицу events
- [ ] Спроектировать таблицу reminders
- [ ] Спроектировать таблицу attachments
- [ ] Спроектировать таблицу sync_operations
- [ ] Продумать индексы
  - [ ] tasks by workspaceId
  - [ ] notes by workspaceId
  - [ ] events by workspaceId
  - [ ] reminders by fireAt
- [ ] Продумать soft delete стратегию
- [ ] Добавить `createdAt` / `updatedAt` почти везде
- [ ] Добавить `version` для documents
- [ ] Продумать поиск по title / contentMd / tags
- [ ] Подготовить full-text search для MVP

---

## 7. Auth

- [ ] Реализовать регистрацию
- [ ] Реализовать логин
- [ ] Реализовать refresh token
- [ ] Реализовать logout
- [ ] Реализовать protected routes
- [ ] Реализовать device sessions
- [ ] Продумать Google sign-in как post-MVP
- [ ] Продумать magic link как post-MVP

---

## 8. Web app foundation

- [ ] Создать `apps/web`
- [ ] Инициализировать Next.js
- [ ] Подключить TypeScript
- [ ] Подключить Tailwind
- [ ] Подключить TanStack Query
- [ ] Подключить Radix UI / shadcn-слой
- [ ] Настроить providers
- [ ] Настроить базовую структуру app router
- [ ] Настроить layout
- [ ] Сделать sidebar
- [ ] Сделать topbar
- [ ] Сделать route groups

### web pages — first wave
- [ ] `/login`
- [ ] `/register`
- [ ] `/dashboard`
- [ ] `/tasks`
- [ ] `/notes`
- [ ] `/notes/[id]`

### web pages — second wave
- [ ] `/calendar`
- [ ] `/settings`

### web pages — third wave
- [ ] `/search`
- [ ] `/workspace/[id]`
- [ ] `/inbox`

---

## 9. Web features

### Dashboard
- [ ] Показать краткую сводку
  - [ ] задачи на сегодня
  - [ ] ближайшие события
  - [ ] последние заметки
- [ ] Добавить блок быстрого создания
  - [ ] task
  - [ ] note
  - [ ] event

### Tasks
- [ ] Сделать список задач
- [ ] Сделать создание задачи
- [ ] Сделать редактирование задачи
- [ ] Сделать удаление задачи
- [ ] Добавить статусы
- [ ] Добавить приоритеты
- [ ] Добавить due date
- [ ] Добавить теги
- [ ] Добавить подзадачи позже

### Notes
- [ ] Сделать список заметок
- [ ] Сделать создание заметки
- [ ] Сделать страницу заметки
- [ ] Сделать markdown editor
- [ ] Сделать preview
- [ ] Сохранять `contentMd`
- [ ] Сохранять `excerpt`
- [ ] Добавить slug
- [ ] Добавить auto-save
- [ ] Добавить version field support

### Calendar
- [ ] Сделать страницу календаря
- [ ] Показать список событий
- [ ] Сделать создание события
- [ ] Сделать привязку task ↔ event позже

### Settings
- [ ] Страница профиля
- [ ] Базовые настройки workspace
- [ ] Настройки уведомлений позже

---

## 10. Первый вертикальный срез

- [ ] Пользователь регистрируется
- [ ] Пользователь входит
- [ ] Создаётся workspace
- [ ] Пользователь создаёт задачу
- [ ] Пользователь создаёт заметку
- [ ] Dashboard показывает задачу и заметку
- [ ] Данные идут через api-client
- [ ] Все формы проходят shared-validation
- [ ] Все сущности используют shared-types

---

## 11. Markdown и редактор

- [ ] Выбрать markdown-first подход для MVP
- [ ] Хранить документ как `contentMd`
- [ ] Сделать editor + preview
- [ ] Сделать генерацию excerpt
- [ ] Сделать heading extractor позже
- [ ] Сделать links parser позже
- [ ] Добавить MDX / rich blocks только потом
- [ ] Не внедрять сложный block editor в MVP

### packages/markdown — later
- [ ] `parse.ts`
- [ ] `render.ts`
- [ ] `sanitize.ts`
- [ ] `excerpt.ts`
- [ ] `links.ts`
- [ ] `headings.ts`

### packages/editor-core — later
- [ ] `commands/`
- [ ] `transforms/`
- [ ] `shortcuts/`
- [ ] summary transform
- [ ] template insert
- [ ] normalize content

---

## 12. Search

- [ ] Сделать простой backend search endpoint
- [ ] Искать по title
- [ ] Искать по contentMd
- [ ] Искать по task description
- [ ] Искать по tags
- [ ] Использовать PostgreSQL full-text search
- [ ] Отложить semantic search
- [ ] Отложить embeddings
- [ ] Отложить OpenSearch / Meilisearch

---

## 13. Reminders / Notifications

- [ ] Подключить Redis
- [ ] Подключить BullMQ
- [ ] Создать worker later
- [ ] Реализовать планирование напоминаний
- [ ] Реализовать reminder scheduler
- [ ] Реализовать обработчик отправки напоминаний
- [ ] Сначала сделать простую серверную логику
- [ ] Web push позже
- [ ] Mobile push позже
- [ ] Email reminders позже

---

## 14. Sync

- [ ] Описать sync-модель
- [ ] Добавить `version` для notes
- [ ] Добавить `updatedAt` для sync
- [ ] Добавить `deletedAt` или `isDeleted`
- [ ] Реализовать простой refetch / polling
- [ ] Реализовать invalidate queries после мутаций
- [ ] Реализовать version-based save для notes
- [ ] Реализовать patch-based sync для tasks/events позже
- [ ] Добавить WebSocket позже
- [ ] Добавить outbox позже
- [ ] Добавить offline reconnect sync позже

---

## 15. AI layer

- [ ] Создать `ai` module
- [ ] Сделать provider abstraction
- [ ] Сделать editor actions API
  - [ ] shorten text
  - [ ] improve style
  - [ ] summarize
  - [ ] convert note to tasks
  - [ ] extract dates/events
- [ ] Не вшивать AI глубоко в редактор в MVP
- [ ] Сделать AI как отдельные действия над выделенным текстом

---

## 16. Mobile — после web MVP

- [ ] Создать `apps/mobile`
- [ ] Поднять Expo app
- [ ] Подключить shared-types
- [ ] Подключить shared-validation
- [ ] Подключить api-client
- [ ] Сделать auth flow
- [ ] Сделать tasks screen
- [ ] Сделать notes screen
- [ ] Сделать calendar screen
- [ ] Подключить локальную SQLite
- [ ] Подготовить offline storage
- [ ] Сделать sync после первой стабильной web-версии

---

## 17. Post-MVP

- [ ] Shared workspaces
- [ ] Roles: owner / admin / editor / viewer
- [ ] Comments
- [ ] Backlinks
- [ ] Templates
- [ ] Slash commands
- [ ] Rich markdown blocks
- [ ] Attachments
- [ ] Realtime presence
- [ ] Collaborative editing
- [ ] CRDT / Yjs только на этом этапе

---

## 18. Что не делать сейчас

- [ ] Не начинать с микросервисов
- [ ] Не делать CRDT на всё сразу
- [ ] Не делать сложный realtime editor сразу
- [ ] Не пытаться шарить весь UI между web и mobile
- [ ] Не делать GraphQL everywhere
- [ ] Не распыляться на mobile до первого web MVP

---

## 19. Priority tags

### P0
- [ ] Product spec
- [ ] Monorepo root
- [ ] apps/api
- [ ] apps/web
- [ ] shared-types
- [ ] shared-validation
- [ ] api-client
- [ ] auth
- [ ] workspaces
- [ ] tasks
- [ ] notes
- [ ] dashboard
- [ ] vertical slice

### P1
- [ ] events
- [ ] calendar
- [ ] reminders
- [ ] search
- [ ] basic sync

### P2
- [ ] AI editor actions
- [ ] worker
- [ ] mobile
- [ ] offline-first base

### P3
- [ ] collaboration
- [ ] CRDT
- [ ] comments
- [ ] shared workspaces
- [ ] advanced editor

---

## Obsidian links

- [[Product Map]] - зачем нужен продукт, core-домены и MVP-фокус.
- [[Architecture Map]] - решения из раздела архитектурного проектирования.
- [[Implementation Map]] - связь задач с текущими `apps/web`, `apps/api` и будущими `packages/*`.
- [[Backlog Map]] - P0/P1/P2/P3 и список того, что не стоит делать сейчас.
