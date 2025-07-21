/*
  Warnings:

  - You are about to drop the column `trialPeriod` on the `Plans` table. All the data in the column will be lost.
  - Added the required column `trial_period` to the `Plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Plans" DROP COLUMN "trialPeriod",
ADD COLUMN     "trial_period" INTEGER NOT NULL;
