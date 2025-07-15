/*
  Warnings:

  - You are about to drop the column `categoryID` on the `Vendor` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_categoryID_fkey";

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "categoryID",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
