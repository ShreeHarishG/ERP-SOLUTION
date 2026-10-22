-- Task 4: per-line reserved qty so confirm/cancel are idempotent
ALTER TABLE "sales_order_items"
  ADD COLUMN IF NOT EXISTS "quantity_reserved" DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- Task 7: distinct login/logout audit actions
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'login';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'logout';

-- Task 5: atomic document numbers
CREATE SEQUENCE IF NOT EXISTS so_seq;
CREATE SEQUENCE IF NOT EXISTS mo_seq;
CREATE SEQUENCE IF NOT EXISTS po_seq;

DO $$
DECLARE
  so_max INTEGER;
  mo_max INTEGER;
  po_max INTEGER;
BEGIN
  SELECT MAX(CAST(substring(order_number FROM '[0-9]+$') AS INTEGER))
    INTO so_max FROM sales_orders WHERE order_number ~ '^SO-[0-9]+$';
  IF so_max IS NOT NULL THEN
    PERFORM setval('so_seq', so_max, true);
  END IF;

  SELECT MAX(CAST(substring(order_number FROM '[0-9]+$') AS INTEGER))
    INTO mo_max FROM manufacturing_orders WHERE order_number ~ '^MO-[0-9]+$';
  IF mo_max IS NOT NULL THEN
    PERFORM setval('mo_seq', mo_max, true);
  END IF;

  SELECT MAX(CAST(substring(order_number FROM '[0-9]+$') AS INTEGER))
    INTO po_max FROM purchase_orders WHERE order_number ~ '^PO-[0-9]+$';
  IF po_max IS NOT NULL THEN
    PERFORM setval('po_seq', po_max, true);
  END IF;
END $$;

-- Task 18: last line of defence against stock races
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS products_on_hand_nonneg;
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS products_reserved_nonneg;
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS products_reserved_lte_on_hand;

ALTER TABLE "products"
  ADD CONSTRAINT products_on_hand_nonneg CHECK (on_hand_quantity >= 0) NOT VALID;
ALTER TABLE "products"
  ADD CONSTRAINT products_reserved_nonneg CHECK (reserved_quantity >= 0) NOT VALID;
ALTER TABLE "products"
  ADD CONSTRAINT products_reserved_lte_on_hand CHECK (reserved_quantity <= on_hand_quantity) NOT VALID;

ALTER TABLE "products" VALIDATE CONSTRAINT products_on_hand_nonneg;
ALTER TABLE "products" VALIDATE CONSTRAINT products_reserved_nonneg;
ALTER TABLE "products" VALIDATE CONSTRAINT products_reserved_lte_on_hand;

