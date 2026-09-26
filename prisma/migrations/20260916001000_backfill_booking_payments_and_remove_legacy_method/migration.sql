-- Preserve the legacy booking payment summary as one historical payment before
-- removing the single-method column. Historical split payments cannot be
-- reconstructed because the old schema stored only one method and one total.
INSERT INTO "Payment" ("id", "bookingId", "amount", "method", "type", "status", "createdAt")
SELECT
    'legacy_' || md5("id" || clock_timestamp()::TEXT || random()::TEXT),
    "id",
    "paidAmount",
    COALESCE(NULLIF("paymentMethod", ''), 'UNKNOWN'),
    CASE WHEN "paidAmount" < "paymentAmount" THEN 'DEPOSIT'::"PaymentType" ELSE 'BALANCE'::"PaymentType" END,
    CASE
        WHEN "paymentStatus" = 'FAILED' THEN 'FAILED'::"PaymentStatus"
        WHEN "paymentStatus" = 'REFUNDED' THEN 'REFUNDED'::"PaymentStatus"
        ELSE 'PAID'::"PaymentStatus"
    END,
    "createdAt"
FROM "Bookings"
WHERE "paidAmount" > 0;

ALTER TABLE "Bookings" DROP COLUMN "paymentMethod";
