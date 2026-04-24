import type {
  FolderDto,
  WorkspaceFsResponse,
} from "./fs-types";
import type {
  DraftState,
  ExplorerFileNode,
  ExplorerFolderNode,
  ExplorerNode,
  OpenTab,
  WorkspaceFile,
} from "./types";

export function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("ru-RU");
}

export function buildWorkspaceFilesFromFs(fs: WorkspaceFsResponse): WorkspaceFile[] {
  const metaFiles: WorkspaceFile[] = [
    {
      id: `workspace-${fs.workspace.id}-readme`,
      name: "README.md",
      path: "workspace/README.md",
      kind: "meta",
      subtitle: "Обзор пространства",
      content: [
        `# ${fs.workspace.title}`,
        "",
        `ID пространства: ${fs.workspace.id}`,
        `Создано: ${formatTimestamp(fs.workspace.createdAt)}`,
        `Обновлено: ${formatTimestamp(fs.workspace.updatedAt)}`,
        "",
        `Папок: ${fs.folders.length}`,
        `Заметок: ${fs.notes.length}`,
        `Задач: ${fs.tasks.length}`,
      ].join("\n"),
    },
  ];

  const noteFiles: WorkspaceFile[] = fs.notes.map((note) => ({
    id: note.id,
    name: `${note.slug}.md`,
    path: note.relativePath,
    kind: "note",
    subtitle: `v${note.version} · ${formatTimestamp(note.updatedAt)}`,
    content:
      note.contentMd ||
      [
        `# ${note.title}`,
        "",
        "_Эта заметка пуста._",
      ].join("\n"),
  }));

  const taskFiles: WorkspaceFile[] = fs.tasks.map((task) => ({
    id: task.id,
    name: `${task.slug}.task`,
    path: task.relativePath,
    kind: "task",
    subtitle: task.status,
    content: [
      `title: ${task.title}`,
      `status: ${task.status}`,
      `priority: ${task.priority}`,
      `createdAt: ${task.createdAt}`,
      `updatedAt: ${task.updatedAt}`,
      "",
      task.descriptionMd ?? "Без описания",
    ].join("\n"),
  }));

  return [...metaFiles, ...noteFiles, ...taskFiles];
}

export function createDraftState(file: WorkspaceFile): DraftState {
  return {
    value: file.content,
    savedValue: file.content,
    isDirty: false,
    saveStatus: "idle",
    errorMessage: null,
  };
}

export function syncDraftsWithFiles(
  files: WorkspaceFile[],
  current: Record<string, DraftState>,
): Record<string, DraftState> {
  const fileMap = Object.fromEntries(files.map((file) => [file.id, file]));
  const next = { ...current };

  for (const file of files) {
    if (!(file.id in next)) {
      next[file.id] = createDraftState(file);
    }
  }

  for (const key of Object.keys(next)) {
    if (!fileMap[key]) {
      delete next[key];
    }
  }

  return next;
}

export function syncOpenTabsWithFiles(
  files: WorkspaceFile[],
  current: OpenTab[],
  fileMap: Record<string, WorkspaceFile>,
): OpenTab[] {
  if (current.length) {
    return current.filter((tab) => Boolean(fileMap[tab.fileId]));
  }

  return files.length ? [{ fileId: files[0].id }] : [];
}

export function getInitialActiveFileId(
  files: WorkspaceFile[],
  fileMap: Record<string, WorkspaceFile>,
  current: string | null,
) {
  if (current && fileMap[current]) {
    return current;
  }

  return files.length ? files[0].id : null;
}

function sortNodes(nodes: ExplorerNode[]): ExplorerNode[] {
  return [...nodes].sort((a, b) => {
    if (a.type === "folder" && b.type === "file") return -1;
    if (a.type === "file" && b.type === "folder") return 1;
    return a.name.localeCompare(b.name, "ru");
  });
}

function buildFolderPathMap(folders: FolderDto[]) {
  const byId = new Map(folders.map((folder) => [folder.id, folder]));
  const cache = new Map<string, string>();

  function getPath(folderId: string): string {
    const cached = cache.get(folderId);
    if (cached) return cached;

    const parts: string[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const folder = byId.get(currentId);
      if (!folder) break;
      parts.unshift(folder.name);
      currentId = folder.parentId;
    }

    const path = parts.join("/");
    cache.set(folderId, path);
    return path;
  }

  return { getPath, byId };
}

export function buildExplorerTreeFromFs(
  folders: FolderDto[],
  files: WorkspaceFile[],
): ExplorerNode[] {
  const folderNodeMap = new Map<string, ExplorerFolderNode>();
  const root: ExplorerNode[] = [];

  const { getPath } = buildFolderPathMap(folders);

  // 1. Создаём folder nodes с реальными id из БД
  for (const folder of folders) {
    folderNodeMap.set(folder.id, {
      id: folder.id,
      name: folder.name,
      type: "folder",
      path: getPath(folder.id),
      children: [],
    });
  }

  // 2. Собираем дерево папок
  for (const folder of folders) {
    const currentNode = folderNodeMap.get(folder.id);
    if (!currentNode) continue;

    if (folder.parentId) {
      const parentNode = folderNodeMap.get(folder.parentId);

      if (parentNode) {
        parentNode.children.push(currentNode);
      } else {
        root.push(currentNode);
      }
    } else {
      root.push(currentNode);
    }
  }

  // 3. Раскладываем файлы по папкам через path
  for (const file of files) {
    // meta кладём в root, как раньше
    if (file.kind === "meta" || !file.path.includes("/")) {
      root.push({
        id: file.id,
        name: file.name,
        type: "file",
        path: file.path,
        fileKind: file.kind,
      });
      continue;
    }

    const parts = file.path.split("/");
    const fileName = parts[parts.length - 1];
    const folderPath = parts.slice(0, -1).join("/");

    const targetFolder = [...folderNodeMap.values()].find(
      (folderNode) => folderNode.path === folderPath,
    );

    const fileNode: ExplorerFileNode = {
      id: file.id,
      name: fileName,
      type: "file",
      path: file.path,
      fileKind: file.kind,
    };

    if (targetFolder) {
      targetFolder.children.push(fileNode);
    } else {
      root.push(fileNode);
    }
  }

  function deepSort(nodes: ExplorerNode[]): ExplorerNode[] {
    return sortNodes(
      nodes.map((node) =>
        node.type === "folder"
          ? { ...node, children: deepSort(node.children) }
          : node,
      ),
    );
  }

  return deepSort(root);
}

export function collectFolderIds(nodes: ExplorerNode[]): string[] {
  const ids: string[] = [];

  function walk(items: ExplorerNode[]) {
    for (const node of items) {
      if (node.type === "folder") {
        ids.push(node.id);
        walk(node.children);
      }
    }
  }

  walk(nodes);
  return ids;
}

export function getTaskBadgeLabel(status: "TODO" | "IN_PROGRESS" | "DONE") {
  switch (status) {
    case "DONE":
      return "готово";
    case "IN_PROGRESS":
      return "в работе";
    default:
      return "открыто";
  }
}

export function getTaskBadgeClass(status: "TODO" | "IN_PROGRESS" | "DONE") {
  switch (status) {
    case "DONE":
      return "bg-emerald-100 text-emerald-700";
    case "IN_PROGRESS":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-sky-100 text-sky-700";
  }
}

