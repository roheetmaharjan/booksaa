-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BookingStatus" ADD VALUE 'DRAFT';
ALTER TYPE "BookingStatus" ADD VALUE 'PENDING_PAYMENT';
ALTER TYPE "BookingStatus" ADD VALUE 'CHECKED_IN';
ALTER TYPE "BookingStatus" ADD VALUE 'IN_SERVICE';
ALTER TYPE "BookingStatus" ADD VALUE 'PAYMENT_EXPIRED';

-- DropIndex
DROP INDEX "Customer_customerCode_key";

-- AlterTable
ALTER TABLE "Bookings" ADD COLUMN     "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "paymentGroupId" TEXT,
ADD COLUMN     "paymentLink" TEXT,
ADD COLUMN     "paymentLinkExpiresAt" TIMESTAMP(3),
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "remainingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "stripePaymentIntentId" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "allowPayAtBusiness" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "VendorSubscription" ADD COLUMN     "expiryDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Vendors" ADD COLUMN     "stripePublishableKey" TEXT,
ADD COLUMN     "stripeSecretKey" TEXT,
DROP COLUMN "photos",
ADD COLUMN     "photos" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_vendorId_customerCode_key" ON "Customer"("vendorId", "customerCode");
