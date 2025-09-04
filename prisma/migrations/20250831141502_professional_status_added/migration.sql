-- CreateEnum
CREATE TYPE "ProfessionalStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- AlterTable
ALTER TABLE "Professional" ADD COLUMN     "status" "ProfessionalStatus" NOT NULL DEFAULT 'INACTIVE';
