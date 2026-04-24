/*
  Warnings:

  - You are about to drop the column `description` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `done` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Task` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[workspaceId,relativePath]` on the table `Note` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workspaceId,relativePath]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workspaceId,slug]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `relativePath` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `relativePath` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FolderKind" AS ENUM ('ROOT', 'NOTES', 'TASKS', 'MIXED');

-- CreateEnum
CREATE TYPE "FileKind" AS ENUM ('NOTE', 'TASK');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- DropIndex
DROP INDEX "Note_lastEditedBy_idx";

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "contentHash" TEXT,
ADD COLUMN     "folderId" TEXT,
ADD COLUMN     "relativePath" TEXT NOT NULL,
ALTER COLUMN "contentMd" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "description",
DROP COLUMN "done",
DROP COLUMN "version",
ADD COLUMN     "descriptionMd" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "folderId" TEXT,
ADD COLUMN     "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "relativePath" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'TODO';

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "kind" "FolderKind" NOT NULL DEFAULT 'MIXED',
    "color" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Folder_workspaceId_idx" ON "Folder"("workspaceId");

-- CreateIndex
CREATE INDEX "Folder_parentId_idx" ON "Folder"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_workspaceId_parentId_name_key" ON "Folder"("workspaceId", "parentId", "name");

-- CreateIndex
CREATE INDEX "Note_folderId_idx" ON "Note"("folderId");

-- CreateIndex
CREATE INDEX "Note_deletedAt_idx" ON "Note"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Note_workspaceId_relativePath_key" ON "Note"("workspaceId", "relativePath");

-- CreateIndex
CREATE INDEX "Task_folderId_idx" ON "Task"("folderId");

-- CreateIndex
CREATE INDEX "Task_deletedAt_idx" ON "Task"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Task_workspaceId_relativePath_key" ON "Task"("workspaceId", "relativePath");

-- CreateIndex
CREATE UNIQUE INDEX "Task_workspaceId_slug_key" ON "Task"("workspaceId", "slug");

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
