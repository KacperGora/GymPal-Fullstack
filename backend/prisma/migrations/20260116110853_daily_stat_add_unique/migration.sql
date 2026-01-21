/*
  Warnings:

  - A unique constraint covering the columns `[userId,date]` on the table `DailyStat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DailyStat_userId_date_key" ON "DailyStat"("userId", "date");
