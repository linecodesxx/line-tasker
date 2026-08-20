# Implementation Map

Карта кода и его связи с документацией.

## Связанные заметки

- [[00 LineTasker Index]]
- [[WORKSPACE_ARCHITECTURE]]
- [[Architecture Map]]
- [[TODO]]

## Web

- `apps/web/app/page.tsx` - список workspaces и вход в рабочее пространство.
- `apps/web/app/workspaces/[workspaceId]/page.tsx` - главный orchestration-компонент editor.
- `apps/web/hooks/useAuth.ts` - auth state, login/register/logout и восстановление сессии.
- `apps/web/hooks/useWorkspaces.ts` - API-слой клиента для workspaces, folders, notes и tasks.
- `apps/web/components/workspace-editor/*` - explorer, tabs, editor pane и типы виртуальных файлов.

## API

- `apps/api/src/auth` - регистрация, логин, JWT guard и стратегия.
- `apps/api/src/workspaces` - workspace CRUD, bootstrap и FS-срез.
- `apps/api/src/folders` - дерево папок и операции move/rename.
- `apps/api/src/notes` - CRUD заметок, version-based update и перемещения.
- `apps/api/prisma/schema.prisma` - доменная схема хранения.

## Будущие packages

Связано с [[TODO#3. Монорепа]] и [[Backlog Map]].

- `packages/shared-types`
- `packages/shared-validation`
- `packages/api-client`
- `packages/editor-core`
- `packages/markdown`
