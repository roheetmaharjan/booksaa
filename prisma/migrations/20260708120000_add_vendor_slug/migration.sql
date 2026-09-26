-- AlterTable
ALTER TABLE "Vendors"
ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Backfill existing vendor slugs from their business names
UPDATE "Vendors"
SET "slug" = lower(regexp_replace(regexp_replace(trim(COALESCE("name", '')), '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'))
WHERE ("slug" IS NULL OR trim(COALESCE("slug", '')) = '');
