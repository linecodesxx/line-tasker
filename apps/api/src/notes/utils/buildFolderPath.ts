import { PrismaService } from "src/prisma/prisma.service";

export async function buildFolderPath(
  prisma: PrismaService,
  workspaceId: string,
  folderId: string | null,
) {
  if (!folderId) return "";

  const folders = await prisma.folder.findMany({
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