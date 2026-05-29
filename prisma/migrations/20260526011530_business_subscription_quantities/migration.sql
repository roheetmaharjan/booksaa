-- AlterTable
ALTER TABLE "Vendors" ADD COLUMN     "subscriptionLocationCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "subscriptionProfessionalCount" INTEGER NOT NULL DEFAULT 1;
