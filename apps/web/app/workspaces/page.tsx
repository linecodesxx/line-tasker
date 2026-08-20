"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateWorkspaceModal } from "@/components/base/CreateWorkspaceModal";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaces } from "@/hooks/useWorkspaces";

export default function Workspaces() {
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
  } = useWorkspaces();

  const [title, setTitle] = useState("");
  const [formError, setFormError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isLoading = isAuthLoading || isWorkspacesLoading;

  const handleCreate = async () => {
    setFormError("");

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setFormError("Введите название workspace");
      return;
    }

    try {
      const workspace = await createWorkspace(trimmedTitle);
      setTitle("");
      setIsCreateOpen(false);
      router.push(`/workspaces/${workspace.id}`);
    } catch {
      return;
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsCreateOpen(open);

    if (!open) {
      setTitle("");
      setFormError("");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-neutral-100">
        <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6">
          <p className="text-sm text-neutral-500">Загрузка workspaces...</p>
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
            <h1 className="text-3xl font-bold">Workspaces</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {user.name} ({user.email})
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Создать workspace
            </button>

            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:border-neutral-900"
            >
              Выйти
            </button>
          </div>
        </header>

        <section className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Ваши workspaces</h2>
              <p className="mt-1 text-sm text-neutral-500">Всего: {workspaces.length}</p>
            </div>

            <p className="max-w-sm text-sm text-neutral-500">
              Каждый workspace создается пустым. Структуру, заметки и задачи вы собираете сами.
            </p>
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
                  <p className="mt-1 text-xs text-neutral-500">ID: {workspace.id}</p>
                  <p className="mt-3 text-sm text-neutral-500">
                    Создано: {new Date(workspace.createdAt).toLocaleString("ru-RU")}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center">
              <h3 className="font-semibold">Пока нет ни одного workspace</h3>
              <p className="mt-2 text-sm text-neutral-500">
                Начните с одного пустого пространства и соберите структуру под свой процесс.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="mt-5 rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Создать первый workspace
              </button>
            </div>
          )}
        </section>
      </div>

      <CreateWorkspaceModal
        open={isCreateOpen}
        value={title}
        error={formError}
        isSubmitting={isCreating}
        onOpenChange={handleOpenChange}
        onValueChange={setTitle}
        onSubmit={handleCreate}
      />
    </main>
  );
}
