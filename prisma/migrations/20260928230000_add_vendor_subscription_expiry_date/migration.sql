@'
ALTER TABLE "VendorSubscription"
ADD COLUMN "expiryDate" TIMESTAMP(3);
'@ | Set-Content "prisma\migrations\20260928230000_add_vendor_subscription_expiry_date\migration.sql"