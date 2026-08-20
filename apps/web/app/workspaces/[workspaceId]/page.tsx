"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceEditor } from "@/hooks/useWorkspaceEditor";
import { CreateItemDialog } from "@/components/workspace-editor/CreateItemDialog";
import { ExplorerPane } from "@/components/workspace-editor/ExplorerPane";
import { TabsBar } from "@/components/workspace-editor/TabsBar";
import { EditorPane } from "@/components/workspace-editor/EditorPane";
import {
  getTaskBadgeClass,
  getTaskBadgeLabel,
} from "@/components/workspace-editor/utils";
import { ArrowLeft } from "lucide-react";

export default function WorkspacePage() {
  const params = useParams<{ workspaceId: string }>();

  const {
    user,
    isLoading: isAuthLoading,
    logout,
  } = useAuth({
    redirectIfUnauthenticated: "/login",
  });

  const {
    workspaceFs,
    workspace,
    tasks,
    taskFiles,
    tree,
    fileMap,
    createDialog,
    openTabs,
    activeFileId,
    activeFile,
    activeDraft,
    drafts,
    rightPanel,
    expandedFolders,
    selectedFolderId,
    isLoading,
    error,
    setActiveFileId,
    setSelectedFolderId,
    setRightPanel,
    setCreateDialogOpen,
    setCreateDialogValue,
    openFile,
    closeTab,
    toggleFolder,
    changeDraft,
    saveFile,
    handleCreateFolder,
    handleCreateNote,
    submitCreateDialog,
  } = useWorkspaceEditor({
    workspaceId: params.workspaceId,
    enabled: Boolean(user),
  });

  if (isAuthLoading || isLoading) {
    return (
      <main className="flex min-h-screen bg-neutral-200 text-neutral-900">
        <div className="flex min-h-screen w-full items-center px-6">
          <p className="text-sm text-neutral-500">Загружаем пространство...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (error || !workspaceFs || !workspace) {
    return (
      <main className="flex min-h-screen bg-neutral-200 text-neutral-900">
        <div className="flex min-h-screen w-full items-center justify-center px-6">
          <div className="w-full rounded-lg bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold">Пространство недоступно</h1>
            <p className="mt-3 text-sm text-red-500">{error}</p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-lg bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Назад к пространствам
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-neutral-200 text-neutral-900">
      <div className="flex items-center justify-between gap-4 border-b border-neutral-300 bg-neutral-100 px-4 py-3">
        <header className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <Link
                href="/workspaces"
                className=" flex gap-1 items-center text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
              >
                <ArrowLeft className="w-6" />
                Все пространства
              </Link>

              <div className="mt-2 flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {workspace.title}
                  </h1>
                  <p className="mt-1 text-sm text-neutral-500">
                    {user.name} ({user.email})
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                  <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5">
                    {workspaceFs.notes.length} заметок
                  </span>
                  <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5">
                    {workspaceFs.tasks.length} задач
                  </span>
                  <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5">
                    {workspaceFs.folders.length} папок
                  </span>
                  <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-neutral-600">
                    локальный режим редактирования
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>
        <button
          type="button"
          onClick={logout}
          className="shrink-0 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium transition hover:border-neutral-900"
        >
          Выйти
        </button>
      </div>

      <section
        className={`grid min-h-0 flex-1 gap-px bg-neutral-300 ${
          rightPanel === "tasks"
            ? "lg:grid-cols-[minmax(0,1fr)_374px]"
            : "lg:grid-cols-[minmax(0,1fr)_54px]"
        }`}
      >
        <div className="grid min-h-0 min-w-0 overflow-hidden bg-white lg:grid-cols-[300px_minmax(0,1fr)]">
          <ExplorerPane
            nodes={tree}
            activeFileId={activeFileId}
            expandedFolders={expandedFolders}
            selectedFolderId={selectedFolderId}
            onToggleFolder={toggleFolder}
            onSelectFolder={setSelectedFolderId}
            onOpenFile={openFile}
            onCreateFolder={handleCreateFolder}
            onCreateNote={handleCreateNote}
          />

          <div className="flex min-w-0 flex-col overflow-hidden">
            <TabsBar
              openTabs={openTabs}
              fileMap={fileMap}
              activeFileId={activeFileId}
              drafts={drafts}
              onSelectTab={setActiveFileId}
              onCloseTab={closeTab}
            />

            <EditorPane
              activeFile={activeFile}
              draft={activeDraft}
              onChange={changeDraft}
              onSave={saveFile}
            />
          </div>
        </div>

        <div className="flex min-w-0 overflow-hidden bg-white">
          {rightPanel === "tasks" ? (
            <aside className="w-full min-w-0 flex-1 border-r border-neutral-200 bg-white">
              <div className="border-b border-neutral-200 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                  Боковая панель
                </p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Задачи</h2>
                  <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-500">
                    {tasks.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto px-4 py-4">
                {tasks.length ? (
                  tasks.map((task) => {
                    const taskFile = taskFiles.find(
                      (file) => file.id === task.id,
                    );

                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => taskFile && openFile(taskFile.id)}
                        className="block w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-left transition hover:border-neutral-300 hover:bg-neutral-100"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-neutral-900">
                            {task.title}
                          </p>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${getTaskBadgeClass(task.status)}`}
                          >
                            {getTaskBadgeLabel(task.status)}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-3 text-sm text-neutral-500">
                          {task.descriptionMd || "Без описания"}
                        </p>

                        <p className="mt-3 text-xs text-neutral-500">
                          Откроется как вкладка: {taskFile?.name ?? `${task.slug}.task`}
                        </p>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-neutral-200 px-4 py-6 text-sm text-neutral-500">
                    В этом пространстве пока нет задач.
                  </div>
                )}
              </div>
            </aside>
          ) : null}

          <div className="flex w-[54px] flex-col items-center gap-2 bg-neutral-100 px-2 py-3">
            <button
              type="button"
              onClick={() =>
                setRightPanel((current) =>
                  current === "tasks" ? null : "tasks",
                )
              }
              className={`flex h-11 w-10 items-center justify-center rounded-2xl border text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                rightPanel === "tasks"
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-100"
              }`}
              aria-pressed={rightPanel === "tasks"}
              aria-label="Переключить боковую панель задач"
            >
              T
            </button>
          </div>
        </div>
      </section>

      <CreateItemDialog
        open={createDialog.open}
        mode={createDialog.mode}
        value={createDialog.value}
        isSubmitting={createDialog.isSubmitting}
        onOpenChange={setCreateDialogOpen}
        onValueChange={setCreateDialogValue}
        onSubmit={submitCreateDialog}
      />
    </main>
  );
}
