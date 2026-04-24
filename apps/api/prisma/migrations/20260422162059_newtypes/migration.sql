/*
  Warnings:

  - A unique constraint covering the columns `[workspaceId,slug]` on the table `Note` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Note_slug_key";

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "excerpt" DROP NOT NULL,
ALTER COLUMN "lastEditedBy" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Workspace_ownerId_idx" ON "Workspace"("ownerId");

-- CreateIndex
CREATE INDEX "Note_workspaceId_idx" ON "Note"("workspaceId");

-- CreateIndex
CREATE INDEX "Note_lastEditedBy_idx" ON "Note"("lastEditedBy");

-- CreateIndex
CREATE UNIQUE INDEX "Note_workspaceId_slug_key" ON "Note"("workspaceId", "slug");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_lastEditedBy_fkey" FOREIGN KEY ("lastEditedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
