/*
  Warnings:

  - You are about to drop the column `exerciseId` on the `WorkoutExercise` table. All the data in the column will be lost.
  - Added the required column `exerciseName` to the `WorkoutExercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wgerExerciseId` to the `WorkoutExercise` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WorkoutExercise" DROP CONSTRAINT "WorkoutExercise_exerciseId_fkey";

-- AlterTable
ALTER TABLE "WorkoutExercise" DROP COLUMN "exerciseId",
ADD COLUMN     "exerciseCategory" TEXT,
ADD COLUMN     "exerciseName" TEXT NOT NULL,
ADD COLUMN     "wgerExerciseId" INTEGER NOT NULL;
