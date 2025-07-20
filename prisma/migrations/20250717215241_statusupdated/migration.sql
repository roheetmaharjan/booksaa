-- AlterEnum
ALTER TYPE "AccountStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "Vendors" ADD COLUMN     "photos" TEXT;
