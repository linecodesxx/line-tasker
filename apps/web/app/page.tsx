"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaces } from "@/hooks/useWorkspaces";

export default function Home() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, logout } = useAuth({
    redirectIfUnauthenticated: "/login",
  });
  const {
    workspaces,
    isLoading: isWorkspacesLoading,
    isCreating,
    error,
    createWorkspace,
    bootstrapWorkspace,
  } = useWorkspaces();

  const [title, setTitle] = useState("");
  const [formError, setFormError] = useState("");

  const isLoading = isAuthLoading || isWorkspacesLoading;

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setFormError("Введите название пространства");
      return;
    }

    try {
      const workspace = await createWorkspace(trimmedTitle);
      setTitle("");
      router.push(`/workspaces/${workspace.id}`);
    } catch {
      return;
    }
  };

  const handleBootstrap = async () => {
    const workspace = await bootstrapWorkspace();
    router.push(`/workspaces/${workspace.id}`);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-neutral-100">
        <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6">
          <p className="text-sm text-neutral-500">Загружаем пространства...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-neutral-100">
        <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
          <div className="w-full rounded-lg bg-white p-8 shadow-lg">
            <h1 className="text-2xl font-bold text-neutral-900">Нужно войти</h1>
            <Link
              href="/login"
              className="mt-6 block rounded-lg bg-neutral-900 px-4 py-3 text-center text-white transition hover:bg-neutral-800"
            >
              Войти
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
        <header className="flex flex-col gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-neutral-500">LineTasker</p>
            <h1 className="text-3xl font-bold">Пространства</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {user.name} ({user.email})
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:border-neutral-900"
          >
            Выйти
          </button>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Ваши пространства</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Всего: {workspaces.length}
                </p>
              </div>

              <button
                type="button"
                onClick={handleBootstrap}
                disabled={isCreating}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? "Создаем..." : "Создать стартовое"}
              </button>
            </div>

            {error ? <p className="mb-4 text-sm text-red-500">{error}</p> : null}

            {workspaces.length ? (
              <div className="grid gap-3">
                {workspaces.map((workspace) => (
                  <Link
                    key={workspace.id}
                    href={`/workspaces/${workspace.id}`}
                    className="rounded-lg border border-neutral-200 p-4 transition hover:border-neutral-900 hover:bg-neutral-50"
                  >
                    <h3 className="font-semibold">{workspace.title}</h3>
                    <p className="mt-1 text-xs text-neutral-500">
                      ID: {workspace.id}
                    </p>
                    <p className="mt-3 text-sm text-neutral-500">
                      Создано: {new Date(workspace.createdAt).toLocaleString("ru-RU")}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center">
                <h3 className="font-semibold">Пространств пока нет</h3>
                <p className="mt-2 text-sm text-neutral-500">
                  Создайте первое пространство вручную или кнопкой быстрого
                  создания.
                </p>
              </div>
            )}
          </div>

          <aside className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Новое пространство</h2>

            <form onSubmit={handleCreate} className="mt-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="title" className="text-sm font-medium text-neutral-700">
                  Название
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  maxLength={100}
                  placeholder="Например: Личное"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="rounded-lg border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-900"
                />
              </div>

              {formError ? <p className="text-sm text-red-500">{formError}</p> : null}

              <button
                type="submit"
                disabled={isCreating}
                className="rounded-lg bg-neutral-900 px-4 py-3 text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? "Создаем..." : "Создать"}
              </button>
            </form>
          </aside>
        </section>
      </div>
    </main>
  );
}
