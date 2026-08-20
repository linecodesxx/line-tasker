# Backlog Map

Карта roadmap, приоритетов и отложенных решений.

## Связанные заметки

- [[00 LineTasker Index]]
- [[TODO]]
- [[Product Map]]
- [[Architecture Map]]
- [[Implementation Map]]

## P0

P0 связывает продуктовую формулировку, web MVP, API, auth, workspaces, notes, tasks и vertical slice. Это основной маршрут от [[Product Map]] к [[Implementation Map]].

## P1

P1 расширяет продукт событиями, календарём, reminders, search и basic sync. Эти задачи стоит проектировать после того, как base workspace flow стабилен.

## P2

P2 добавляет AI editor actions, worker, mobile и offline-first base. Это мост к более умному и более автономному LineTasker.

## P3

P3 включает collaboration, CRDT, comments, shared workspaces и advanced editor. Эти темы связаны с [[Architecture Map]], но не должны утягивать MVP.

## Не делать сейчас

- Не начинать с микросервисов.
- Не делать CRDT на всё сразу.
- Не делать сложный realtime editor сразу.
- Не распыляться на mobile до первого web MVP.
