"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import type { WorkspaceFsResponse } from "@/components/workspace-editor/fs-types";
import type {
  DraftState,
  OpenTab,
  RightPanel,
  WorkspaceFile,
} from "@/components/workspace-editor/types";
import {
  buildExplorerTreeFromFs,
  buildWorkspaceFilesFromFs,
  collectFolderIds,
  createDraftState,
  getInitialActiveFileId,
  syncDraftsWithFiles,
  syncOpenTabsWithFiles,
} from "@/components/workspace-editor/utils";

type UseWorkspaceEditorOptions = {
  workspaceId?: string;
  enabled: boolean;
};

type CreateDialogState = {
  open: boolean;
  mode: "folder" | "note" | null;
  targetFolderId?: string;
  value: string;
  isSubmitting: boolean;
};

const INITIAL_CREATE_DIALOG_STATE: CreateDialogState = {
  open: false,
  mode: null,
  targetFolderId: undefined,
  value: "",
  isSubmitting: false,
};

export function useWorkspaceEditor({
  workspaceId,
  enabled,
}: UseWorkspaceEditorOptions) {
  const { getWorkspaceFs, updateNote, createFolder, createNote } =
    useWorkspaces();

  const [workspaceFs, setWorkspaceFs] = useState<WorkspaceFsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({});
  const [rightPanel, setRightPanel] = useState<RightPanel>("tasks");
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({});
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [createDialog, setCreateDialog] = useState<CreateDialogState>(
    INITIAL_CREATE_DIALOG_STATE,
  );

  const autosaveTimersRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  useEffect(() => {
    if (!workspaceId || !enabled) return;

    let cancelled = false;

    async function loadWorkspaceFs() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getWorkspaceFs(workspaceId);

        if (!cancelled) {
          setWorkspaceFs(data);
        }
      } catch (err) {
        if (!cancelled) {
          setWorkspaceFs(null);
          setError(
            err instanceof Error ? err.message : "Failed to load workspace",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadWorkspaceFs();

    return () => {
      cancelled = true;
    };
  }, [enabled, getWorkspaceFs, workspaceId]);

  const files = useMemo<WorkspaceFile[]>(
    () => (workspaceFs ? buildWorkspaceFilesFromFs(workspaceFs) : []),
    [workspaceFs],
  );

  const fileMap = useMemo<Record<string, WorkspaceFile>>(() => {
    return Object.fromEntries(files.map((file) => [file.id, file]));
  }, [files]);

  const tree = useMemo(() => {
    if (!workspaceFs) return [];
    return buildExplorerTreeFromFs(workspaceFs.folders, files);
  }, [workspaceFs, files]);

  useEffect(() => {
    const folderIds = collectFolderIds(tree);

    setExpandedFolders((current) => {
      const next = { ...current };

      for (const folderId of folderIds) {
        if (!(folderId in next)) {
          next[folderId] = true;
        }
      }

      return next;
    });
  }, [tree]);

  useEffect(() => {
    if (!files.length) {
      setOpenTabs([]);
      setActiveFileId(null);
      setDrafts({});
      return;
    }

    setDrafts((current) => syncDraftsWithFiles(files, current));
    setOpenTabs((current) => syncOpenTabsWithFiles(files, current, fileMap));
    setActiveFileId((current) =>
      getInitialActiveFileId(files, fileMap, current),
    );
  }, [fileMap, files]);

  const openFile = useCallback(
    (fileId: string) => {
      const file = fileMap[fileId];
      if (!file) return;

      setOpenTabs((current) => {
        if (current.some((tab) => tab.fileId === fileId)) {
          return current;
        }

        return [...current, { fileId }];
      });

      setDrafts((current) => {
        if (current[fileId]) return current;

        return {
          ...current,
          [fileId]: createDraftState(file),
        };
      });

      setActiveFileId(fileId);
    },
    [fileMap],
  );

  const closeTab = useCallback((fileId: string) => {
    setOpenTabs((current) => {
      const next = current.filter((tab) => tab.fileId !== fileId);

      setActiveFileId((active) => {
        if (active !== fileId) {
          return active;
        }

        if (!next.length) {
          return null;
        }

        const closedIndex = current.findIndex((tab) => tab.fileId === fileId);
        const fallback = next[Math.max(0, closedIndex - 1)] ?? next[0];
        return fallback.fileId;
      });

      return next;
    });
  }, []);

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((current) => ({
      ...current,
      [folderId]: !(current[folderId] ?? true),
    }));
  }, []);

  const changeDraft = useCallback((fileId: string, value: string) => {
    setDrafts((current) => {
      const existing = current[fileId];
      if (!existing) return current;

      return {
        ...current,
        [fileId]: {
          ...existing,
          value,
          isDirty: value !== existing.savedValue,
          saveStatus: value !== existing.savedValue ? "idle" : "saved",
          errorMessage: null,
        },
      };
    });
  }, []);

  const replaceNoteInFs = useCallback(
    (updatedNote: WorkspaceFsResponse["notes"][number]) => {
      setWorkspaceFs((current) => {
        if (!current) return current;

        return {
          ...current,
          notes: current.notes.map((note) =>
            note.id === updatedNote.id ? updatedNote : note,
          ),
        };
      });
    },
    [],
  );

  const addFolderToFs = useCallback(
    (folder: WorkspaceFsResponse["folders"][number]) => {
      setWorkspaceFs((current) => {
        if (!current) return current;

        return {
          ...current,
          folders: [...current.folders, folder],
        };
      });
    },
    [],
  );

  const addNoteToFs = useCallback(
    (note: WorkspaceFsResponse["notes"][number]) => {
      setWorkspaceFs((current) => {
        if (!current) return current;

        return {
          ...current,
          notes: [note, ...current.notes],
        };
      });
    },
    [],
  );

  const closeCreateDialog = useCallback(() => {
    setCreateDialog(INITIAL_CREATE_DIALOG_STATE);
  }, []);

  const setCreateDialogOpen = useCallback(
    (open: boolean) => {
      if (!open) {
        closeCreateDialog();
      }
    },
    [closeCreateDialog],
  );

  const setCreateDialogValue = useCallback((value: string) => {
    setCreateDialog((current) => ({
      ...current,
      value,
    }));
  }, []);

  const handleCreateFolder = useCallback(
    (targetFolderId?: string) => {
      setCreateDialog({
        open: true,
        mode: "folder",
        targetFolderId: targetFolderId ?? selectedFolderId ?? undefined,
        value: "",
        isSubmitting: false,
      });
    },
    [selectedFolderId],
  );

  const handleCreateNote = useCallback(
    (targetFolderId?: string) => {
      setCreateDialog({
        open: true,
        mode: "note",
        targetFolderId: targetFolderId ?? selectedFolderId ?? undefined,
        value: "",
        isSubmitting: false,
      });
    },
    [selectedFolderId],
  );

  const submitCreateDialog = useCallback(async () => {
    if (!workspaceFs || !createDialog.mode) return;

    const trimmedValue = createDialog.value.trim();
    if (!trimmedValue) return;

    setCreateDialog((current) => ({
      ...current,
      isSubmitting: true,
    }));

    try {
      if (createDialog.mode === "folder") {
        const folder = await createFolder(workspaceFs.workspace.id, {
          name: trimmedValue,
          parentId: createDialog.targetFolderId ?? undefined,
          kind: "MIXED",
        });

        addFolderToFs(folder);
        setExpandedFolders((current) => ({
          ...current,
          [folder.id]: true,
        }));
        setSelectedFolderId(folder.id);
        closeCreateDialog();
        return;
      }

      const note = await createNote(workspaceFs.workspace.id, {
        title: trimmedValue,
        folderId: createDialog.targetFolderId ?? undefined,
        contentMd: `# ${trimmedValue}\n`,
      });

      addNoteToFs(note);

      setDrafts((current) => ({
        ...current,
        [note.id]: createDraftState({
          id: note.id,
          name: `${note.slug}.md`,
          path: note.relativePath,
          kind: "note",
          subtitle: `v${note.version}`,
          content: note.contentMd,
        }),
      }));

      setOpenTabs((current) => {
        if (current.some((tab) => tab.fileId === note.id)) {
          return current;
        }

        return [...current, { fileId: note.id }];
      });

      setActiveFileId(note.id);
      closeCreateDialog();
    } catch (err) {
      setCreateDialog((current) => ({
        ...current,
        isSubmitting: false,
      }));
      setError(
        err instanceof Error
          ? err.message
          : createDialog.mode === "folder"
            ? "Failed to create folder"
            : "Failed to create file",
      );
    }
  }, [
    addFolderToFs,
    addNoteToFs,
    closeCreateDialog,
    createDialog.mode,
    createDialog.targetFolderId,
    createDialog.value,
    createFolder,
    createNote,
    workspaceFs,
  ]);

  const saveFile = useCallback(
    async (fileId: string) => {
      if (!workspaceFs) return;

      const file = fileMap[fileId];
      const draft = drafts[fileId];

      if (!file || !draft || !draft.isDirty) {
        return;
      }

      if (file.kind !== "note") {
        return;
      }

      setDrafts((current) => {
        const existing = current[fileId];
        if (!existing) return current;

        return {
          ...current,
          [fileId]: {
            ...existing,
            saveStatus: "saving",
            errorMessage: null,
          },
        };
      });

      try {
        const note = workspaceFs.notes.find((item) => item.id === fileId);

        if (!note) {
          throw new Error("Note not found");
        }

        const updated = await updateNote(workspaceFs.workspace.id, fileId, {
          contentMd: draft.value,
          version: note.version,
        });

        replaceNoteInFs(updated);

        setDrafts((current) => {
          const existing = current[fileId];
          if (!existing) return current;

          return {
            ...current,
            [fileId]: {
              ...existing,
              value: updated.contentMd,
              savedValue: updated.contentMd,
              isDirty: false,
              saveStatus: "saved",
              errorMessage: null,
            },
          };
        });
      } catch (err) {
        setDrafts((current) => {
          const existing = current[fileId];
          if (!existing) return current;

          return {
            ...current,
            [fileId]: {
              ...existing,
              saveStatus: "error",
              errorMessage: err instanceof Error ? err.message : "Save failed",
            },
          };
        });
      }
    },
    [drafts, fileMap, replaceNoteInFs, updateNote, workspaceFs],
  );

  useEffect(() => {
    for (const [fileId, draft] of Object.entries(drafts)) {
      const file = fileMap[fileId];

      if (!file || file.kind !== "note") {
        continue;
      }

      if (!draft.isDirty) {
        if (autosaveTimersRef.current[fileId]) {
          clearTimeout(autosaveTimersRef.current[fileId]);
          delete autosaveTimersRef.current[fileId];
        }
        continue;
      }

      if (autosaveTimersRef.current[fileId]) {
        clearTimeout(autosaveTimersRef.current[fileId]);
      }

      autosaveTimersRef.current[fileId] = setTimeout(() => {
        void saveFile(fileId);
      }, 1000);
    }

    return () => {
      for (const timer of Object.values(autosaveTimersRef.current)) {
        clearTimeout(timer);
      }
      autosaveTimersRef.current = {};
    };
  }, [drafts, fileMap, saveFile]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isSaveShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s";

      if (!isSaveShortcut) return;

      event.preventDefault();

      if (activeFileId) {
        void saveFile(activeFileId);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeFileId, saveFile]);

  const activeFile = activeFileId ? fileMap[activeFileId] : null;
  const activeDraft = activeFile ? (drafts[activeFile.id] ?? null) : null;
  const tasks = workspaceFs?.tasks ?? [];
  const workspace = workspaceFs?.workspace ?? null;
  const taskFiles = files.filter((file) => file.kind === "task");

  return {
    workspaceFs,
    workspace,
    tasks,
    taskFiles,
    tree,
    fileMap,
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
    createDialog,
    setActiveFileId,
    setSelectedFolderId,
    setRightPanel,
    setCreateDialogOpen,
    setCreateDialogValue,
    closeCreateDialog,
    openFile,
    closeTab,
    toggleFolder,
    changeDraft,
    saveFile,
    handleCreateFolder,
    handleCreateNote,
    submitCreateDialog,
  };
}
