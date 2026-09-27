-- Preserve every booking payment as an immutable history entry.

CREATE TYPE "PaymentType" AS ENUM ('DEPOSIT', 'BALANCE');

CREATE TYPE "PaymentStatus" AS ENUM (
  'UNPAID',
  'PARTIALLY_PAID',
  'PAID',
  'FAILED',
  'REFUNDED'
);

CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Payment_bookingId_createdAt_idx"
ON "Payment"("bookingId", "createdAt");

ALTER TABLE "Payment"
ADD CONSTRAINT "Payment_bookingId_fkey"
FOREIGN KEY ("bookingId")
REFERENCES "Bookings"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;