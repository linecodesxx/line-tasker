# LineTasker Index

Главная карта проекта. Отсюда удобно начинать, если открываешь vault как Obsidian brain.

## Быстрый вход

- [[WORKSPACE_ARCHITECTURE|Workspace architecture]] - как устроены web, editor и backend.
- [[TODO|Roadmap tasks]] - что запланировано и что уже отмечено.
- [[Architecture Map]] - ключевые архитектурные решения и зоны риска.
- [[Product Map]] - продуктовые домены, MVP и сценарии пользователя.
- [[Implementation Map]] - где в коде живут основные части системы.
- [[Backlog Map]] - как связаны roadmap, приоритеты и post-MVP.

## Главные линии проекта

- [[Product Map]] задаёт зачем существует LineTasker и чем он отличается от Obsidian/Notion.
- [[Architecture Map]] объясняет модульный монолит, FS-представление workspace и границы клиента/сервера.
- [[Implementation Map]] связывает документацию с реальными папками `apps/web`, `apps/api` и будущими `packages/*`.
- [[Backlog Map]] помогает превращать идеи из [[TODO|roadmap]] в последовательность работ.

## Следующие хорошие связи

- Из задач про `tasks` стоит вести в [[Implementation Map]] и обратно в [[Architecture Map]].
- Из задач про `sync`, `offline` и `CRDT` стоит вести в [[Backlog Map]], потому что это post-MVP слой.
- Из заметок про editor стоит связывать [[WORKSPACE_ARCHITECTURE|архитектуру workspace]] с компонентами `workspace-editor`.
