# Product Map

Карта продуктовой стороны LineTasker.

## Связанные заметки

- [[00 LineTasker Index]]
- [[TODO]]
- [[WORKSPACE_ARCHITECTURE]]
- [[Backlog Map]]

## Позиционирование

LineTasker сейчас читается как workspace-ориентированный редактор, где заметки, задачи и файловая структура живут в одном рабочем контексте.

## Core-домены

- Tasks - действия, статусы, приоритеты, сроки и напоминания.
- Notes / Documents - markdown-контент, версии и editor flow.
- Calendar / Events - post-MVP слой для времени и расписания.
- Sync / AI / Notifications - будущие усилители продукта.

## MVP

Для первой стабильной версии полезно держать фокус на:

- auth и базовом workspace flow;
- создании workspace, folders, notes и tasks;
- сохранении заметок без потери изменений;
- понятном dashboard/inbox/today/workspace входе.

## Отличие от соседних продуктов

- От Obsidian: LineTasker не только knowledge graph, а рабочий workspace с task flow и backend-состоянием.
- От Notion: LineTasker ближе к editor/workspace experience и может быть проще, быстрее, более dev-oriented.
