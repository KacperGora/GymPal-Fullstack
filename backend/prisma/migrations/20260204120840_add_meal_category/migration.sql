-- CreateEnum
CREATE TYPE "MealCategory" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- AlterTable
ALTER TABLE "Meal" ADD COLUMN     "category" "MealCategory" NOT NULL DEFAULT 'SNACK';
