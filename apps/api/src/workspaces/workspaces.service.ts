import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateWorkspaceDto } from "./dto/createWorkspacesDTO";

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateWorkspaceDto) {
    return await this.prisma.workspace.create({
      data: {
        ownerId,
        title: dto.title,
      },
    });
  }

  async getMine(ownerId: string) {
    return await this.prisma.workspace.findMany({
      where: {
        ownerId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async getOne(ownerId: string, id: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id,
        ownerId,
      },
      include: {
        notes: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
        tasks: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException("Workspace не найден");
    }

    return workspace;
  }

  async getFileSystem(ownerId: string, workspaceId: string) {
    const workspace = await this.ensureWorkspaceAccess(ownerId, workspaceId);

    const [folders, notes, tasks] = await Promise.all([
      this.prisma.folder.findMany({
        where: { workspaceId },
        orderBy: [{ parentId: "asc" }, { name: "asc" }],
      }),
      this.prisma.note.findMany({
        where: { workspaceId, deletedAt: null },
        orderBy: { updatedAt: "desc" },
      }),
      this.prisma.task.findMany({
        where: { workspaceId, deletedAt: null },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return {
      workspace,
      folders,
      notes,
      tasks,
    };
  }

  private async ensureWorkspaceAccess(ownerId: string, workspaceId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        ownerId,
      },
    });

    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    return workspace;
  }
}
