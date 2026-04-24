"use client";

import { useCallback, useEffect, useState } from "react";
import { AUTH_TOKEN_KEY } from "@/hooks/useAuth";

export type Workspace = {
  id: string;
  ownerId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceFolderKind = "ROOT" | "NOTES" | "TASKS" | "MIXED";

export type WorkspaceFolder = {
  id: string;
  workspaceId: string;
  parentId: string | null;
  name: string;
  kind: WorkspaceFolderKind;
  color?: string | null;
  icon?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceNote = {
  id: string;
  workspaceId: string;
  folderId: string | null;
  slug: string;
  title: string;
  relativePath: string;
  contentMd: string;
  excerpt: string | null;
  lastEditedBy: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type WorkspaceTaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type WorkspaceTaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type WorkspaceTask = {
  id: string;
  workspaceId: string;
  folderId: string | null;
  slug: string;
  title: string;
  relativePath: string;
  descriptionMd: string | null;
  status: WorkspaceTaskStatus;
  priority: WorkspaceTaskPriority;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type WorkspaceDetails = Workspace & {
  notes: WorkspaceNote[];
  tasks: WorkspaceTask[];
};

export type WorkspaceFsResponse = {
  workspace: Workspace;
  folders: WorkspaceFolder[];
  notes: WorkspaceNote[];
  tasks: WorkspaceTask[];
};

export type CreateFolderPayload = {
  name: string;
  parentId?: string;
  kind?: WorkspaceFolderKind;
};

export type CreateNotePayload = {
  title: string;
  folderId?: string;
  contentMd?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function parseError(response: Response) {
  try {
    const data = (await response.json()) as { message?: string | string[] };

    if (Array.isArray(data.message)) {
      return data.message.join(", ");
    }

    return data.message ?? "Ошибка пространства";
  } catch {
    return "Ошибка пространства";
  }
}

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <T>(path: string, init?: RequestInit): Promise<T> => {
      const token = getToken();

      if (!token) {
        throw new Error("Нужно войти в аккаунт");
      }

      const response = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...init?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      return (await response.json()) as T;
    },
    [],
  );

  const loadWorkspaces = useCallback(async () => {
    setError(null);

    try {
      const data = await request<Workspace[]>("/workspaces");
      setWorkspaces(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить пространства",
      );
      setWorkspaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  const createWorkspace = useCallback(
    async (title: string) => {
      setError(null);
      setIsCreating(true);

      try {
        const workspace = await request<Workspace>("/workspaces", {
          method: "POST",
          body: JSON.stringify({ title }),
        });

        setWorkspaces((current) => [...current, workspace]);
        return workspace;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Не удалось создать пространство";
        setError(message);
        throw new Error(message);
      } finally {
        setIsCreating(false);
      }
    },
    [request],
  );

  const getWorkspace = useCallback(
    (id: string) => request<WorkspaceDetails>(`/workspaces/${id}`),
    [request],
  );

  const getWorkspaceFs = useCallback(
    (id: string) => request<WorkspaceFsResponse>(`/workspaces/${id}/fs`),
    [request],
  );

  const bootstrapWorkspace = useCallback(async () => {
    setError(null);
    setIsCreating(true);

    try {
      const workspace = await request<Workspace>("/workspaces/bootstrap", {
        method: "POST",
      });

      setWorkspaces((current) => {
        if (current.some((item) => item.id === workspace.id)) {
          return current;
        }

        return [...current, workspace].sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt),
        );
      });

      return workspace;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Не удалось создать пространство";
      setError(message);
      throw new Error(message);
    } finally {
      setIsCreating(false);
    }
  }, [request]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialWorkspaces() {
      try {
        const data = await request<Workspace[]>("/workspaces");

        if (!cancelled) {
          setWorkspaces(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Не удалось загрузить пространства",
          );
          setWorkspaces([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadInitialWorkspaces();

    return () => {
      cancelled = true;
    };
  }, [request]);

  const updateNote = useCallback(
    async (
      workspaceId: string,
      noteId: string,
      payload: {
        title?: string;
        contentMd?: string;
        folderId?: string | null;
        version?: number;
      },
    ) => {
      return request<WorkspaceNote>(`/notes/${noteId}?workspaceId=${workspaceId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    [request],
  );

  const updateTask = useCallback(
    async (
      workspaceId: string,
      taskId: string,
      payload: {
        title?: string;
        descriptionMd?: string;
        folderId?: string | null;
      },
    ) => {
      return request<WorkspaceTask>(`/tasks/${taskId}?workspaceId=${workspaceId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    [request],
  );

  const createFolder = useCallback(
    async (workspaceId: string, payload: CreateFolderPayload) => {
      return request<WorkspaceFolder>(`/folders?workspaceId=${workspaceId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    [request],
  );

  const createNote = useCallback(
    async (workspaceId: string, payload: CreateNotePayload) => {
      return request<WorkspaceNote>(`/notes?workspaceId=${workspaceId}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    [request],
  );

  return {
    workspaces,
    isLoading,
    isCreating,
    error,
    loadWorkspaces,
    getWorkspace,
    getWorkspaceFs,
    createWorkspace,
    bootstrapWorkspace,
    updateNote,
    updateTask,
    createFolder,
    createNote,
  };
}
