/*
  Warnings:

  - A unique constraint covering the columns `[name,emoji]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "emoji" TEXT NOT NULL DEFAULT '🏷️';

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_emoji_key" ON "Tag"("name", "emoji");
