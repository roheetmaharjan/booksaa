/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Vendors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Vendors_userId_key" ON "Vendors"("userId");
