"use client";

import type { DraftState, OpenTab, WorkspaceFile } from "./types";

type TabsBarProps = {
  openTabs: OpenTab[];
  fileMap: Record<string, WorkspaceFile>;
  activeFileId: string | null;
  drafts: Record<string, DraftState>;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
};

export function TabsBar({
  openTabs,
  fileMap,
  activeFileId,
  drafts,
  onSelectTab,
  onCloseTab,
}: TabsBarProps) {
  return (
    <div className="border-b border-neutral-200 bg-white px-3 pt-3">
      <div className="flex gap-2 overflow-x-auto overflow-y-hidden">
        {openTabs.length ? (
          openTabs.map((tab) => {
            const file = fileMap[tab.fileId];
            if (!file) return null;

            const isActive = activeFileId === file.id;
            const isDirty = drafts[file.id]?.isDirty ?? false;

            return (
              <div
                key={file.id}
                className={`-mb-px flex min-w-0 items-center gap-2 rounded-t-2xl border px-3 py-2 ${
                  isActive
                    ? "border-neutral-200 border-b-white bg-white text-neutral-900"
                    : "border-transparent bg-neutral-100 text-neutral-500"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectTab(file.id)}
                  className="flex max-w-[220px] items-center gap-2 truncate text-sm font-medium"
                >
                  {isDirty ? <span className="text-xs">•</span> : null}
                  <span className="truncate">{file.name}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onCloseTab(file.id)}
                  className="rounded-full px-1.5 py-0.5 text-xs transition hover:bg-neutral-200 hover:text-neutral-900"
                  aria-label={`Закрыть ${file.name}`}
                >
                  x
                </button>
              </div>
            );
          })
        ) : (
          <div className="px-3 py-2 pb-3 text-sm text-neutral-500">
            Откройте файл из проводника.
          </div>
        )}
      </div>
    </div>
  );
}
