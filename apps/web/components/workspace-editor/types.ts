export type WorkspaceFileKind = "note" | "task" | "meta";

export type WorkspaceFile = {
  id: string;
  name: string;
  path: string;
  kind: WorkspaceFileKind;
  subtitle: string;
  content: string;
};

export type OpenTab = {
  fileId: string;
};

export type RightPanel = "tasks" | null;

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type DraftState = {
  value: string;
  savedValue: string;
  isDirty: boolean;
  saveStatus: SaveStatus;
  errorMessage: string | null;
};

export type ExplorerFileNode = {
  id: string;
  name: string;
  type: "file";
  path: string;
  fileKind: WorkspaceFileKind;
};

export type ExplorerFolderNode = {
  id: string;          // реальный Folder.id из БД
  name: string;
  type: "folder";
  path: string;
  children: ExplorerNode[];
};

export type ExplorerNode = ExplorerFileNode | ExplorerFolderNode;