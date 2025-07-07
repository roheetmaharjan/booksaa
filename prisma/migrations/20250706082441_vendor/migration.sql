/*
  Warnings:

  - You are about to drop the column `type` on the `Vendor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "type",
ALTER COLUMN "description" DROP NOT NULL;
