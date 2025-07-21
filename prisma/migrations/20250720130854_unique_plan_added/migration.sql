/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Plans` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Vendors" ALTER COLUMN "location" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Plans_name_key" ON "Plans"("name");
