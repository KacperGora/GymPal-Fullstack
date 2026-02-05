-- CreateTable
CREATE TABLE "FavoriteExercise" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "exerciseDbId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bodyPart" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "equipment" TEXT NOT NULL,
    "gifUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteExercise_userId_exerciseDbId_key" ON "FavoriteExercise"("userId", "exerciseDbId");

-- AddForeignKey
ALTER TABLE "FavoriteExercise" ADD CONSTRAINT "FavoriteExercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
