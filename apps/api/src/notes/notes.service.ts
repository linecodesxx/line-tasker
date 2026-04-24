import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateNoteDto } from "./dto/createNoteDTO";
import { MoveNoteDto } from "./dto/moveNoteDTO";
import { UpdateNoteDto } from "./dto/updateNoteDTO";
import { slugify } from "./utils/slugify";

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(workspaceId: string) {
    return this.prisma.note.findMany({
      where: {
        workspaceId,
        deletedAt: null,
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getById(id: string, workspaceId: string) {
    const note = await this.prisma.note.findFirst({
      where: {
        id,
        workspaceId,
        deletedAt: null,
      },
    });

    if (!note) {
      throw new NotFoundException("Note not found");
    }

    return note;
  }

  async create(workspaceId: string, userId: string, dto: CreateNoteDto) {
    const slugBase = slugify(dto.title) || "untitled";
    const slug = await this.makeUniqueSlug(workspaceId, slugBase);

    const folderPath = await this.getFolderPath(
      workspaceId,
      dto.folderId ?? null,
    );
    const relativePath = folderPath ? `${folderPath}/${slug}.md` : `${slug}.md`;

    return this.prisma.note.create({
      data: {
        workspaceId,
        folderId: dto.folderId ?? null,
        title: dto.title,
        slug,
        relativePath,
        contentMd: dto.contentMd ?? "",
        excerpt: "",
        version: 1,
        lastEditedBy: userId,
      },
    });
  }

  async update(
    id: string,
    workspaceId: string,
    userId: string,
    dto: UpdateNoteDto,
  ) {
    const note = await this.getById(id, workspaceId);

    if (dto.version && dto.version !== note.version) {
      throw new ConflictException("Version conflict");
    }

    const nextTitle = dto.title ?? note.title;
    const nextContent = dto.contentMd ?? note.contentMd;
    const nextFolderId =
      dto.folderId !== undefined ? dto.folderId : note.folderId;

    let slug = note.slug;

    if (dto.title && dto.title !== note.title) {
      slug = await this.makeUniqueSlug(
        workspaceId,
        slugify(nextTitle) || "untitled",
        id,
      );
    }

    const folderPath = await this.getFolderPath(
      workspaceId,
      nextFolderId ?? null,
    );
    const relativePath = folderPath ? `${folderPath}/${slug}.md` : `${slug}.md`;

    return this.prisma.note.update({
      where: { id },
      data: {
        title: nextTitle,
        contentMd: nextContent,
        folderId: nextFolderId ?? null,
        slug,
        relativePath,
        excerpt: nextContent.slice(0, 180),
        version: { increment: 1 },
        lastEditedBy: userId,
      },
    });
  }

  async move(id: string, workspaceId: string, dto: MoveNoteDto) {
    const note = await this.getById(id, workspaceId);
    const folderId = dto.folderId ?? null;
    const folderPath = await this.getFolderPath(workspaceId, folderId);
    const relativePath = folderPath
      ? `${folderPath}/${note.slug}.md`
      : `${note.slug}.md`;

    return this.prisma.note.update({
      where: { id },
      data: {
        folderId,
        relativePath,
        version: { increment: 1 },
      },
    });
  }

  async remove(id: string, workspaceId: string) {
    await this.getById(id, workspaceId);

    return this.prisma.note.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  private async makeUniqueSlug(
    workspaceId: string,
    base: string,
    excludeId?: string,
  ) {
    let slug = base;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.note.findFirst({
        where: {
          workspaceId,
          slug,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
      });

      if (!existing) {
        return slug;
      }

      counter += 1;
      slug = `${base}-${counter}`;
    }
  }

  private async getFolderPath(workspaceId: string, folderId: string | null) {
    if (!folderId) return "";

    const folders = await this.prisma.folder.findMany({
      where: { workspaceId },
      select: { id: true, name: true, parentId: true },
    });

    const map = new Map(folders.map((folder) => [folder.id, folder]));
    const parts: string[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const folder = map.get(currentId);
      if (!folder) break;
      parts.unshift(folder.name);
      currentId = folder.parentId;
    }

    return parts.join("/");
  }
}
