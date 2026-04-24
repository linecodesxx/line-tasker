export type FolderKind = "ROOT" | "NOTES" | "TASKS" | "MIXED";

export type FolderDto = {
  id: string;
  workspaceId: string;
  parentId: string | null;
  name: string;
  kind: FolderKind;
  createdAt: string;
  updatedAt: string;
};

export type NoteDto = {
  id: string;
  workspaceId: string;
  folderId: string | null;
  title: string;
  slug: string;
  relativePath: string;
  contentMd: string;
  excerpt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type TaskDto = {
  id: string;
  workspaceId: string;
  folderId: string | null;
  title: string;
  slug: string;
  relativePath: string;
  descriptionMd: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceDto = {
  id: string;
  ownerId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceFsResponse = {
  workspace: WorkspaceDto;
  folders: FolderDto[];
  notes: NoteDto[];
  tasks: TaskDto[];
};