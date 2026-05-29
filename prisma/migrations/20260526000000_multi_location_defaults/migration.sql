-- Allow one business to own multiple locations.
DROP INDEX IF EXISTS "Location_vendorId_key";

ALTER TABLE "Vendors"
ADD COLUMN IF NOT EXISTS "defaultLocationId" TEXT;

ALTER TABLE "Location"
ADD COLUMN IF NOT EXISTS "name" TEXT,
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "photos" TEXT,
ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Professional"
ADD COLUMN IF NOT EXISTS "locationId" TEXT;

ALTER TABLE "BusinessHour"
ADD COLUMN IF NOT EXISTS "locationId" TEXT;

-- Backfill branch names and default location pointers for existing businesses.
UPDATE "Location"
SET "name" = COALESCE("name", 'Main Location');

UPDATE "Location" l
SET "isDefault" = true
WHERE l."id" = (
  SELECT l2."id"
  FROM "Location" l2
  WHERE l2."vendorId" = l."vendorId"
  ORDER BY l2."createdAt" ASC
  LIMIT 1
);

UPDATE "Vendors" v
SET "defaultLocationId" = l."id"
FROM "Location" l
WHERE l."vendorId" = v."id"
  AND l."isDefault" = true
  AND v."defaultLocationId" IS NULL;

UPDATE "Service" s
SET "locationId" = v."defaultLocationId"
FROM "Vendors" v
WHERE s."vendorId" = v."id"
  AND s."locationId" IS NULL
  AND v."defaultLocationId" IS NOT NULL;

UPDATE "Professional" p
SET "locationId" = v."defaultLocationId"
FROM "Vendors" v
WHERE p."vendorId" = v."id"
  AND p."locationId" IS NULL
  AND v."defaultLocationId" IS NOT NULL;

UPDATE "BusinessHour" h
SET "locationId" = v."defaultLocationId"
FROM "Vendors" v
WHERE h."vendorId" = v."id"
  AND h."locationId" IS NULL
  AND v."defaultLocationId" IS NOT NULL;

DROP INDEX IF EXISTS "BusinessHour_vendorId_day_key";

CREATE UNIQUE INDEX IF NOT EXISTS "Vendors_defaultLocationId_key"
ON "Vendors"("defaultLocationId");

CREATE INDEX IF NOT EXISTS "Location_vendorId_idx"
ON "Location"("vendorId");

CREATE INDEX IF NOT EXISTS "BusinessHour_vendorId_idx"
ON "BusinessHour"("vendorId");

CREATE UNIQUE INDEX IF NOT EXISTS "BusinessHour_locationId_day_key"
ON "BusinessHour"("locationId", "day");

ALTER TABLE "Vendors"
ADD CONSTRAINT "Vendors_defaultLocationId_fkey"
FOREIGN KEY ("defaultLocationId") REFERENCES "Location"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Professional"
ADD CONSTRAINT "Professional_locationId_fkey"
FOREIGN KEY ("locationId") REFERENCES "Location"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BusinessHour"
ADD CONSTRAINT "BusinessHour_locationId_fkey"
FOREIGN KEY ("locationId") REFERENCES "Location"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
