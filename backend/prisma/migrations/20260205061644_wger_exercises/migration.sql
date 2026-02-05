/*
  Warnings:

  - You are about to drop the column `bodyPart` on the `FavoriteExercise` table. All the data in the column will be lost.
  - You are about to drop the column `exerciseDbId` on the `FavoriteExercise` table. All the data in the column will be lost.
  - You are about to drop the column `gifUrl` on the `FavoriteExercise` table. All the data in the column will be lost.
  - You are about to drop the column `target` on the `FavoriteExercise` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,wgerExerciseId]` on the table `FavoriteExercise` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `FavoriteExercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `muscles` to the `FavoriteExercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wgerExerciseId` to the `FavoriteExercise` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "FavoriteExercise_userId_exerciseDbId_key";

-- AlterTable
ALTER TABLE "FavoriteExercise" DROP COLUMN "bodyPart",
DROP COLUMN "exerciseDbId",
DROP COLUMN "gifUrl",
DROP COLUMN "target",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "muscles" TEXT NOT NULL,
ADD COLUMN     "wgerExerciseId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteExercise_userId_wgerExerciseId_key" ON "FavoriteExercise"("userId", "wgerExerciseId");
