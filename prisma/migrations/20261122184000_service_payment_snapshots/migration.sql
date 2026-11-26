ALTER TABLE "VendorSettings"
ADD COLUMN "defaultPrepaymentType" TEXT NOT NULL DEFAULT 'pay_later',
ADD COLUMN "defaultAllowPayAtBusiness" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Bookings"
ADD COLUMN "depositAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Existing bookings did not store their required deposit; seed it from the saved booking price and current service rule.
UPDATE "Bookings" AS booking
SET "depositAmount" = CASE
  WHEN booking."paymentRequirement" = 'full'
    THEN ROUND(GREATEST(0, booking."paymentAmount")::numeric, 2)::double precision
  WHEN booking."paymentRequirement" = 'deposit' AND service."depositType" = 'fixed'
    THEN LEAST(
      ROUND(GREATEST(0, booking."paymentAmount")::numeric, 2),
      ROUND(GREATEST(0, COALESCE(service."depositValue", 0))::numeric, 2)
    )::double precision
  WHEN booking."paymentRequirement" = 'deposit' AND service."depositType" IN ('percent', 'percentage')
    THEN LEAST(
      ROUND(GREATEST(0, booking."paymentAmount")::numeric, 2),
      ROUND(GREATEST(0, booking."paymentAmount" * COALESCE(service."depositValue", 0) / 100)::numeric, 2)
    )::double precision
  ELSE 0
END
FROM "Service" AS service
WHERE service."id" = booking."serviceId";

-- Normalize the stored spelling without changing the configured percentage values.
UPDATE "Service"
SET "depositType" = 'percentage'
WHERE "depositType" = 'percent';
