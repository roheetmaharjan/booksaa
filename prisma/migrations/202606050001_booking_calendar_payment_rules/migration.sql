-- Add professional assignment, customer details, and payment-rule snapshots for bookings.
ALTER TABLE "Bookings"
ADD COLUMN "customerName" TEXT,
ADD COLUMN "customerEmail" TEXT,
ADD COLUMN "customerPhone" TEXT,
ADD COLUMN "notes" TEXT,
ADD COLUMN "paymentRequirement" TEXT NOT NULL DEFAULT 'pay_later',
ADD COLUMN "paymentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "professionalId" TEXT;

ALTER TABLE "Bookings"
ADD CONSTRAINT "Bookings_professionalId_fkey"
FOREIGN KEY ("professionalId") REFERENCES "Professional"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Bookings_professionalId_idx" ON "Bookings"("professionalId");
CREATE INDEX "Bookings_scheduledAt_idx" ON "Bookings"("scheduledAt");

-- Store the rule the booking flow should apply for each service.
ALTER TABLE "Service"
ADD COLUMN "prepaymentType" TEXT NOT NULL DEFAULT 'pay_later',
ADD COLUMN "depositType" TEXT,
ADD COLUMN "depositValue" DOUBLE PRECISION;
