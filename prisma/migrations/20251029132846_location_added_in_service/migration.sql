/*
  Warnings:

  - A unique constraint covering the columns `[name,vendorId,locationId]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Service_name_vendorId_key";

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "locationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_vendorId_locationId_key" ON "Service"("name", "vendorId", "locationId");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
