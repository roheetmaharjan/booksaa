/*
  Warnings:

  - A unique constraint covering the columns `[vendorId]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - Made the column `locationId` on table `Service` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_locationId_fkey";

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "locationId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Location_vendorId_key" ON "Location"("vendorId");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
