/*
  Warnings:

  - Added the required column `userId` to the `Vendors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vendors" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Vendors" ADD CONSTRAINT "Vendors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
