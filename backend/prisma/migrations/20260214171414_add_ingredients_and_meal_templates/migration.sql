-- CreateEnum
CREATE TYPE "IngredientCategory" AS ENUM ('PROTEIN', 'CARBS', 'VEGETABLES', 'FRUITS', 'DAIRY', 'FATS_OILS', 'GRAINS', 'LEGUMES', 'NUTS_SEEDS', 'BEVERAGES', 'CONDIMENTS', 'OTHER');

-- CreateEnum
CREATE TYPE "MealDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "MacroFocus" AS ENUM ('HIGH_PROTEIN', 'LOW_CARB', 'BALANCED', 'HIGH_CARB', 'LOW_FAT');

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "servingSize" DOUBLE PRECISION NOT NULL,
    "servingUnit" TEXT NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "proteins" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fats" DOUBLE PRECISION NOT NULL,
    "fiber" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "category" "IngredientCategory" NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'USDA',
    "sourceUrl" TEXT,
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "MealCategory" NOT NULL,
    "baseRecipe" JSONB NOT NULL,
    "totalCalories" DOUBLE PRECISION NOT NULL,
    "totalProteins" DOUBLE PRECISION NOT NULL,
    "totalCarbs" DOUBLE PRECISION NOT NULL,
    "totalFats" DOUBLE PRECISION NOT NULL,
    "scaleableIngredients" JSONB NOT NULL,
    "minScale" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "maxScale" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "preparationTime" INTEGER,
    "difficulty" "MealDifficulty" NOT NULL DEFAULT 'EASY',
    "macroFocus" "MacroFocus" NOT NULL DEFAULT 'BALANCED',
    "translations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ingredient_category_idx" ON "Ingredient"("category");

-- CreateIndex
CREATE INDEX "Ingredient_verified_idx" ON "Ingredient"("verified");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_name_servingSize_servingUnit_key" ON "Ingredient"("name", "servingSize", "servingUnit");

-- CreateIndex
CREATE INDEX "MealTemplate_category_idx" ON "MealTemplate"("category");

-- CreateIndex
CREATE INDEX "MealTemplate_macroFocus_idx" ON "MealTemplate"("macroFocus");

-- CreateIndex
CREATE INDEX "MealTemplate_totalCalories_idx" ON "MealTemplate"("totalCalories");
