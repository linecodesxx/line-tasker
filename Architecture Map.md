# Architecture Map

Карта архитектурных решений LineTasker.

## Связанные заметки

- [[00 LineTasker Index]]
- [[WORKSPACE_ARCHITECTURE]]
- [[TODO]]
- [[Implementation Map]]
- [[Backlog Map]]

## Узлы архитектуры

- `Workspace` - центральная сущность, от неё расходятся folders, notes и tasks.
- `apps/web` - клиентская оболочка, auth flow, список workspaces и workspace editor.
- `apps/api` - NestJS backend, который отдаёт агрегированный FS-срез.
- `Prisma` и `PostgreSQL` - слой хранения для users, workspaces, folders, notes и tasks.
- `relativePath` - ключевой мост между доменной моделью и псевдо-файловой системой editor.

## Решения

- MVP лучше держать как modular monolith, см. [[TODO#1. Архитектурное проектирование]].
- GraphQL и микросервисы отложены, см. [[Backlog Map#Не делать сейчас]].
- Local-first, outbox и CRDT стоит рассматривать как будущий слой, а не как стартовую сложность.

## Риски

- Проверка владельца workspace в backend напрямую влияет на безопасность.
- Task flow пока не симметричен: frontend уже готов к части task API, backend ещё нужно довести.
- Большой orchestration-компонент workspace editor со временем стоит разделить на более узкие части.
