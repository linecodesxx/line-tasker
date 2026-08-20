"use client";

import Link from "next/link";
import { ArrowRight, CornerDownRight, MoveRight } from "lucide-react";

const workspaceStats = [
  { label: "Notes", value: "12" },
  { label: "Tasks", value: "34" },
  { label: "Folders", value: "7" },
];

const taskCards = [
  {
    title: "Редизайн домашнего экрана",
    status: "IN PROGRESS",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
    body: "Собрать Homepage из тех же панелей, табов и меток, что используются в editor workspace.",
  },
  {
    title: "Подготовить структуру workspace",
    status: "TODO",
    tone: "border-neutral-200 bg-neutral-100 text-neutral-600",
    body: "Свести заметки, задачи и файлы в один поток работы без визуального переключения контекста.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-neutral-300 bg-white shadow-[0_24px_80px_rgba(10,10,10,0.08)]">
          <header className="border-b border-neutral-200 bg-neutral-100/90 px-5 py-4 backdrop-blur sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">
                  LineTasker
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                  <MoveRight className="h-3.5 w-3.5 text-neutral-900" />
                  Main flow starts here
                </div>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
                  LineTasker 
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">
                  Заметки, задачи и структура workspace собраны в одну интерфейсную систему:
                  спокойные поверхности, рабочие статусы и крупные панели без лишнего декора.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500">
                  начать работу
                </p>
                <div className="flex flex-wrap gap-3">
                <Link
                  href="/workspaces"
                  className="inline-flex animate-pulse hover:animate-none items-center gap-2 rounded-xl border border-neutral-900 bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Открыть workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                >
                  Войти
                </Link>
                </div>
              </div>
            </div>
          </header>

          <section className="grid gap-px bg-neutral-300 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <div className="grid min-h-[640px] gap-px bg-neutral-300 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="flex flex-col bg-white">
                <div className="border-b border-neutral-200 px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                      Explorer
                    </p>
                    <span className="rounded-full border border-dashed border-neutral-300 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                      preview
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold">Структура пространства</h2>
                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                    Та же боковая навигация, те же мягкие состояния выбора и тот же ритм,
                    который уже задан в редакторе.
                  </p>
                </div>

                <div className="flex-1 space-y-1 px-3 py-4 text-sm text-neutral-500">
                  <div className="rounded-xl bg-neutral-100 px-3 py-2 font-medium text-neutral-600">
                    Product
                  </div>
                  <div className="rounded-xl px-3 py-2">Research</div>
                  <div className="rounded-xl px-3 py-2">Roadmap</div>
                  <div className="rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2 text-neutral-700">
                    homepage.md
                  </div>
                  <div className="rounded-xl px-3 py-2">tasks.task</div>
                  <div className="rounded-xl px-3 py-2">workspace.meta</div>
                </div>
              </aside>

              <div className="flex min-w-0 flex-col bg-white">
                <div className="border-b border-neutral-200 bg-white px-3 pt-3">
                  <div className="flex gap-2 overflow-x-auto">
                    <div className="flex items-center gap-2 rounded-t-2xl border border-neutral-200 border-b-white bg-white px-3 py-2 text-sm font-medium text-neutral-700">
                      <CornerDownRight className="h-3.5 w-3.5 text-neutral-400" />
                      <span>homepage.md</span>
                      <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-400">
                        preview
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-t-2xl bg-neutral-100 px-3 py-2 text-sm text-neutral-400">
                      <span>tasks.task</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                      app/homepage
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">homepage.md</h2>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                    <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5">
                      Note
                    </span>
                    <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5">
                      Layout system
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
                      Synced
                    </span>
                  </div>
                </div>

                <div className="flex-1 bg-neutral-50 px-5 py-5">
                  <div className="mx-auto max-w-3xl space-y-5 rounded-[24px] border border-neutral-200 bg-white p-6 shadow-[0_8px_30px_rgba(10,10,10,0.04)]">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">
                        Homepage Brief
                      </p>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                        <CornerDownRight className="h-3.5 w-3.5 text-neutral-900" />
                        Important focus
                      </div>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                        Интерфейс должен ощущаться продолжением workspace.
                      </h3>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {workspaceStats.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4"
                        >
                          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
                            {item.label}
                          </p>
                          <p className="mt-3 text-2xl font-semibold text-neutral-900">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-600">
                      Вместо отдельного промо-стиля главный экран показывает состояние продукта:
                      навигацию, статусные метки, рабочие карточки и прямой вход в пространство.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="flex min-w-0 flex-col bg-white">
              <div className="border-b border-neutral-200 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                    Task Panel
                  </p>
                  <span className="rounded-full border border-dashed border-neutral-300 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                    preview
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Фокус на задачах</h2>
                  <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-500">
                    {taskCards.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3 px-4 py-4">
                {taskCards.map((task) => (
                  <div
                    key={task.title}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-neutral-900">{task.title}</p>
                      <span
                        className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${task.tone}`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-neutral-500">{task.body}</p>
                  </div>
                ))}
              </div>
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}
