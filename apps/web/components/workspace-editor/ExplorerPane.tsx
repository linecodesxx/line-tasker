"use client";

import { useContextMenu } from "@/hooks/useContextMenu";
import type { ExplorerNode } from "./types";

type ExplorerPaneProps = {
  nodes: ExplorerNode[];
  activeFileId: string | null;
  expandedFolders: Record<string, boolean>;
  selectedFolderId: string | null;
  onToggleFolder: (folderId: string) => void;
  onSelectFolder: (folderId: string) => void;
  onOpenFile: (fileId: string) => void;
  onCreateFolder: (folderId?: string) => void;
  onCreateNote: (folderId?: string) => void;
};

type ExplorerContextMenuPayload = {
  folderId?: string;
};

function ExplorerTree({
  nodes,
  activeFileId,
  expandedFolders,
  selectedFolderId,
  onToggleFolder,
  onSelectFolder,
  onOpenFile,
  onCreateFolder,
  onCreateNote,
  onOpenContextMenu,
  level = 0,
}: ExplorerPaneProps & {
  level?: number;
  onOpenContextMenu: (
    event: React.MouseEvent,
    payload: ExplorerContextMenuPayload,
  ) => void;
}) {
  return (
    <div className="grid gap-1">
      {nodes.map((node) => {
        if (node.type === "folder") {
          const isExpanded = expandedFolders[node.id] ?? true;
          const isSelected = selectedFolderId === node.id;

          return (
            <div key={node.id}>
              <div
                onContextMenu={(event) =>
                  onOpenContextMenu(event, { folderId: node.id })
                }
                className={`flex items-center rounded-xl transition ${
                  isSelected ? "bg-neutral-100" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectFolder(node.id);
                    onToggleFolder(node.id);
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-2 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                  style={{ paddingLeft: `${12 + level * 14}px` }}
                >
                  <span className="truncate">{node.name}</span>
                </button>
              </div>

              {isExpanded ? (
                <ExplorerTree
                  nodes={node.children}
                  activeFileId={activeFileId}
                  expandedFolders={expandedFolders}
                  selectedFolderId={selectedFolderId}
                  onToggleFolder={onToggleFolder}
                  onSelectFolder={onSelectFolder}
                  onOpenFile={onOpenFile}
                  onCreateFolder={onCreateFolder}
                  onCreateNote={onCreateNote}
                  onOpenContextMenu={onOpenContextMenu}
                  level={level + 1}
                />
              ) : null}
            </div>
          );
        }

        const isActive = node.id === activeFileId;

        return (
          <button
            key={node.id}
            type="button"
            onClick={() => onOpenFile(node.id)}
            onContextMenu={(event) => onOpenContextMenu(event, {})}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
              isActive
                ? "bg-neutral-900 text-white"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
            style={{ paddingLeft: `${28 + level * 14}px` }}
          >
            <span className="w-4 shrink-0 text-xs opacity-70">
              {node.fileKind === "note" ? "M" : node.fileKind === "task" ? "T" : "W"}
            </span>
            <span className="truncate">{node.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ExplorerPane({
  selectedFolderId,
  onCreateFolder,
  onCreateNote,
  ...props
}: ExplorerPaneProps) {
  const { contextMenu, openContextMenu, closeContextMenu } =
    useContextMenu<ExplorerContextMenuPayload>();

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden border-b border-neutral-200 bg-white lg:border-b-0 lg:border-r">
      <div className="border-b border-neutral-200 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Проводник</p>
        <h2 className="mt-2 text-lg font-semibold">Файлы пространства</h2>

        <p className="mt-2 text-xs text-neutral-500">
          {selectedFolderId
            ? "Выбранная папка подсвечена. Нажмите правой кнопкой по папке, чтобы создать внутри нее."
            : "Нажмите правой кнопкой по папке или пустому месту, чтобы создать новый элемент."}
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto px-3 py-4"
        onContextMenu={(event) => openContextMenu(event, {})}
      >
        <ExplorerTree
          {...props}
          selectedFolderId={selectedFolderId}
          onCreateFolder={onCreateFolder}
          onCreateNote={onCreateNote}
          onOpenContextMenu={openContextMenu}
        />
      </div>

      {contextMenu ? (
        <div
          className="fixed z-50 min-w-44 rounded-xl border border-neutral-200 bg-white p-1 shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              onCreateFolder(contextMenu.payload.folderId);
              closeContextMenu();
            }}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            Создать папку
          </button>
          <button
            type="button"
            onClick={() => {
              onCreateNote(contextMenu.payload.folderId);
              closeContextMenu();
            }}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            Создать файл
          </button>
        </div>
      ) : null}
    </aside>
  );
}
