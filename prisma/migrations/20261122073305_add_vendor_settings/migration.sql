-- CreateTable
CREATE TABLE "VendorSettings" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "businessEmail" TEXT,
    "website" TEXT,
    "countryCode" TEXT NOT NULL DEFAULT 'NP',
    "currencyCode" TEXT NOT NULL DEFAULT 'USD',
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Kathmandu',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "timeFormat" TEXT NOT NULL DEFAULT '12h',
    "onlineBookingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "manualBookingApproval" BOOLEAN NOT NULL DEFAULT false,
    "minAdvanceNoticeMinutes" INTEGER NOT NULL DEFAULT 0,
    "maxAdvanceBookingDays" INTEGER NOT NULL DEFAULT 365,
    "allowCustomerCancellations" BOOLEAN NOT NULL DEFAULT true,
    "allowCustomerRescheduling" BOOLEAN NOT NULL DEFAULT true,
    "cancellationDeadlineHours" INTEGER,
    "cashPaymentsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "onlinePaymentsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "payAtBusinessEnabled" BOOLEAN NOT NULL DEFAULT true,
    "depositsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "defaultDepositPercentage" DOUBLE PRECISION,
    "paymentInstructions" TEXT,
    "notifyNewBooking" BOOLEAN NOT NULL DEFAULT false,
    "notifyBookingConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "notifyBookingCancellation" BOOLEAN NOT NULL DEFAULT false,
    "notifyBookingReminder" BOOLEAN NOT NULL DEFAULT false,
    "notifyPaymentConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VendorSettings_vendorId_key" ON "VendorSettings"("vendorId");

-- CreateIndex
CREATE INDEX "VendorSettings_vendorId_idx" ON "VendorSettings"("vendorId");

-- AddForeignKey
ALTER TABLE "VendorSettings" ADD CONSTRAINT "VendorSettings_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
