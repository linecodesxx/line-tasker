import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { CreateFolderDto } from "./dto/createFolderDTO";
import { PrismaService } from "src/prisma/prisma.service";
import { MoveFolderDto } from "./dto/moveFolderDTO";
import { RenameFolderDto } from "./dto/renameFolderDTO";

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

  async getTree(ownerId: string, workspaceId: string) {
    await this.ensureWorkspaceAccess(ownerId, workspaceId);

    return this.prisma.folder.findMany({
      where: { workspaceId },
      orderBy: [{ parentId: "asc" }, { name: "asc" }],
    });
  }

  async create(ownerId: string, workspaceId: string, dto: CreateFolderDto) {
    await this.ensureWorkspaceAccess(ownerId, workspaceId);

    if (dto.parentId) {
      const parent = await this.prisma.folder.findFirst({
        where: { id: dto.parentId, workspaceId },
      });

      if (!parent) {
        throw new NotFoundException("Parent folder not found");
      }
    }

    return this.prisma.folder.create({
      data: {
        workspaceId,
        parentId: dto.parentId ?? null,
        name: dto.name,
        kind: dto.kind ?? "MIXED",
      },
    });
  }

  async rename(
    ownerId: string,
    id: string,
    workspaceId: string,
    dto: RenameFolderDto,
  ) {
    await this.ensureWorkspaceAccess(ownerId, workspaceId);

    const folder = await this.prisma.folder.findFirst({
      where: { id, workspaceId },
    });

    if (!folder) {
      throw new NotFoundException("Folder not found");
    }

    const updated = await this.prisma.folder.update({
      where: { id },
      data: { name: dto.name },
    });

    await this.rebuildPathsForFolderTree(workspaceId, id);

    return updated;
  }

  async move(
    ownerId: string,
    id: string,
    workspaceId: string,
    dto: MoveFolderDto,
  ) {
    await this.ensureWorkspaceAccess(ownerId, workspaceId);

    const folders = await this.prisma.folder.findMany({
      where: { workspaceId },
      select: {
        id: true,
        parentId: true,
      },
    });
    const folder = folders.find((item) => item.id === id);

    if (!folder) {
      throw new NotFoundException("Folder not found");
    }

    if (dto.parentId === id) {
      throw new BadRequestException("Folder cannot be moved into itself");
    }

    if (dto.parentId) {
      const parent = folders.find((item) => item.id === dto.parentId);

      if (!parent) {
        throw new NotFoundException("Target parent folder not found");
      }

      if (this.isDescendantFolder(id, dto.parentId, folders)) {
        throw new BadRequestException(
          "Folder cannot be moved into its own descendant",
        );
      }
    }

    const updated = await this.prisma.folder.update({
      where: { id },
      data: {
        parentId: dto.parentId ?? null,
      },
    });

    await this.rebuildPathsForFolderTree(workspaceId, id);

    return updated;
  }

  private isDescendantFolder(
    folderId: string,
    targetParentId: string,
    folders: Array<{ id: string; parentId: string | null }>,
  ) {
    const byId = new Map(folders.map((folder) => [folder.id, folder]));
    let currentId: string | null = targetParentId;

    while (currentId) {
      if (currentId === folderId) {
        return true;
      }

      currentId = byId.get(currentId)?.parentId ?? null;
    }

    return false;
  }

  async remove(ownerId: string, id: string, workspaceId: string) {
    await this.ensureWorkspaceAccess(ownerId, workspaceId);

    const folder = await this.prisma.folder.findFirst({
      where: { id, workspaceId },
      include: {
        children: true,
        notes: true,
        tasks: true,
      },
    });

    if (!folder) {
      throw new NotFoundException("Folder not found");
    }

    if (folder.children.length || folder.notes.length || folder.tasks.length) {
      throw new BadRequestException("Folder is not empty");
    }

    return this.prisma.folder.delete({
      where: { id },
    });
  }

  private async rebuildPathsForFolderTree(
    workspaceId: string,
    folderId: string,
  ) {
    const folders = await this.prisma.folder.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    const map = new Map(folders.map((folder) => [folder.id, folder]));

    const buildFolderPath = (id: string | null): string => {
      if (!id) return "";

      const parts: string[] = [];
      let currentId: string | null = id;

      while (currentId) {
        const current = map.get(currentId);
        if (!current) break;
        parts.unshift(current.name);
        currentId = current.parentId;
      }

      return parts.join("/");
    };

    const affectedFolders = new Set<string>();

    const markDescendants = (id: string) => {
      affectedFolders.add(id);
      for (const folder of folders) {
        if (folder.parentId === id) {
          markDescendants(folder.id);
        }
      }
    };

    markDescendants(folderId);

    const notes = await this.prisma.note.findMany({
      where: {
        workspaceId,
        folderId: { in: [...affectedFolders] },
        deletedAt: null,
      },
    });

    for (const note of notes) {
      const folderPath = buildFolderPath(note.folderId);
      const fileName = `${note.slug}.md`;
      const relativePath = folderPath ? `${folderPath}/${fileName}` : fileName;

      await this.prisma.note.update({
        where: { id: note.id },
        data: { relativePath },
      });
    }

    const tasks = await this.prisma.task.findMany({
      where: {
        workspaceId,
        folderId: { in: [...affectedFolders] },
        deletedAt: null,
      },
    });

    for (const task of tasks) {
      const folderPath = buildFolderPath(task.folderId);
      const fileName = `${task.slug}.task`;
      const relativePath = folderPath ? `${folderPath}/${fileName}` : fileName;

      await this.prisma.task.update({
        where: { id: task.id },
        data: { relativePath },
      });
    }
  }

  private async ensureWorkspaceAccess(ownerId: string, workspaceId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        ownerId,
      },
      select: { id: true },
    });

    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }
  }
}
