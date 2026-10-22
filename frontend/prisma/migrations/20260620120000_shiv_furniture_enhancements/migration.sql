-- Shiv Furniture Works ERP schema enhancements
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductType') THEN
        CREATE TYPE "ProductType" AS ENUM ('raw_material', 'finished_good');
    END IF;
END$$;

ALTER TYPE "MovementType" ADD VALUE IF NOT EXISTS 'stock_release';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'shortage_detected';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'bom_exploded';

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "product_type" "ProductType" NOT NULL DEFAULT 'finished_good';

ALTER TABLE "inventory_movements" ADD COLUMN IF NOT EXISTS "reserved_before" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "inventory_movements" ADD COLUMN IF NOT EXISTS "reserved_after" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Set product types from category for existing rows
UPDATE "products" SET "product_type" = 'raw_material' WHERE "category" = 'Raw Material';
UPDATE "products" SET "product_type" = 'finished_good' WHERE "category" = 'Furniture';
