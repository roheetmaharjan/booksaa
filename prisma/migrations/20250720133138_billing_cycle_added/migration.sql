/*
  Warnings:

  - Added the required column `billing_cycle` to the `Plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Plans" ADD COLUMN     "billing_cycle" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
