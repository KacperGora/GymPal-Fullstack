-- AlterTable
ALTER TABLE "MealTemplate" DROP COLUMN "baseRecipe",
DROP COLUMN "scaleableIngredients";

-- CreateTable
CREATE TABLE "CacheEntry" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CacheEntry_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "MealTemplateIngredient" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "grams" DOUBLE PRECISION NOT NULL,
    "scaleable" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MealTemplateIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CacheEntry_expiresAt_idx" ON "CacheEntry"("expiresAt");

-- CreateIndex
CREATE INDEX "MealTemplateIngredient_templateId_idx" ON "MealTemplateIngredient"("templateId");

-- CreateIndex
CREATE INDEX "MealTemplateIngredient_ingredientId_idx" ON "MealTemplateIngredient"("ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "MealTemplateIngredient_templateId_ingredientId_key" ON "MealTemplateIngredient"("templateId", "ingredientId");

-- AddForeignKey
ALTER TABLE "MealTemplateIngredient" ADD CONSTRAINT "MealTemplateIngredient_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MealTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealTemplateIngredient" ADD CONSTRAINT "MealTemplateIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
