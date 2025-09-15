-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "offerAtBusiness" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "offerAtClient" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "serviceAreas" TEXT;
