/*
  Warnings:

  - You are about to drop the column `serviceAreas` on the `Location` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Location" DROP COLUMN "serviceAreas",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxTravelDistance" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
ADD COLUMN     "travelFee" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL;
