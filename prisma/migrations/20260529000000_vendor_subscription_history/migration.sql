-- CreateTable
CREATE TABLE "VendorSubscription" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionEntitlement" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "price" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorSubscription_vendorId_createdAt_idx" ON "VendorSubscription"("vendorId", "createdAt");

-- CreateIndex
CREATE INDEX "SubscriptionEntitlement_subscriptionId_type_idx" ON "SubscriptionEntitlement"("subscriptionId", "type");

-- AddForeignKey
ALTER TABLE "VendorSubscription" ADD CONSTRAINT "VendorSubscription_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorSubscription" ADD CONSTRAINT "VendorSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionEntitlement" ADD CONSTRAINT "SubscriptionEntitlement_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "VendorSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve existing vendor-level quantities as the first subscription history rows.
INSERT INTO "VendorSubscription" ("id", "vendorId", "planId", "status", "createdAt")
SELECT
    'sub_' || v."id",
    v."id",
    v."planId",
    CASE
        WHEN v."status" IN ('TRIAL_ACTIVE', 'TRIAL_EXPIRING') THEN 'TRIAL_ACTIVE'
        ELSE 'ACTIVE'
    END,
    COALESCE(v."joinedAt", CURRENT_TIMESTAMP)
FROM "Vendors" v
WHERE NOT EXISTS (
    SELECT 1
    FROM "VendorSubscription" s
    WHERE s."vendorId" = v."id"
);

INSERT INTO "SubscriptionEntitlement" ("id", "subscriptionId", "type", "quantity", "source", "price", "createdAt")
SELECT
    'ent_prof_plan_' || s."id",
    s."id",
    'PROFESSIONAL',
    LEAST(GREATEST(v."subscriptionProfessionalCount", 1), GREATEST(p."professional", 1)),
    'PLAN',
    NULL,
    s."createdAt"
FROM "VendorSubscription" s
JOIN "Vendors" v ON v."id" = s."vendorId"
JOIN "Plans" p ON p."id" = s."planId"
WHERE v."subscriptionProfessionalCount" IS NOT NULL;

INSERT INTO "SubscriptionEntitlement" ("id", "subscriptionId", "type", "quantity", "source", "price", "createdAt")
SELECT
    'ent_prof_addon_' || s."id",
    s."id",
    'PROFESSIONAL',
    GREATEST(v."subscriptionProfessionalCount" - GREATEST(p."professional", 1), 0),
    'ADDON',
    p."extraProfessionalPrice",
    s."createdAt"
FROM "VendorSubscription" s
JOIN "Vendors" v ON v."id" = s."vendorId"
JOIN "Plans" p ON p."id" = s."planId"
WHERE GREATEST(v."subscriptionProfessionalCount" - GREATEST(p."professional", 1), 0) > 0;

INSERT INTO "SubscriptionEntitlement" ("id", "subscriptionId", "type", "quantity", "source", "price", "createdAt")
SELECT
    'ent_loc_plan_' || s."id",
    s."id",
    'LOCATION',
    LEAST(GREATEST(v."subscriptionLocationCount", 1), GREATEST(p."location", 1)),
    'PLAN',
    NULL,
    s."createdAt"
FROM "VendorSubscription" s
JOIN "Vendors" v ON v."id" = s."vendorId"
JOIN "Plans" p ON p."id" = s."planId"
WHERE v."subscriptionLocationCount" IS NOT NULL;

INSERT INTO "SubscriptionEntitlement" ("id", "subscriptionId", "type", "quantity", "source", "price", "createdAt")
SELECT
    'ent_loc_addon_' || s."id",
    s."id",
    'LOCATION',
    GREATEST(v."subscriptionLocationCount" - GREATEST(p."location", 1), 0),
    'ADDON',
    p."extraLocationPrice",
    s."createdAt"
FROM "VendorSubscription" s
JOIN "Vendors" v ON v."id" = s."vendorId"
JOIN "Plans" p ON p."id" = s."planId"
WHERE GREATEST(v."subscriptionLocationCount" - GREATEST(p."location", 1), 0) > 0;

-- AlterTable
ALTER TABLE "Vendors" DROP COLUMN "subscriptionLocationCount",
DROP COLUMN "subscriptionProfessionalCount";
