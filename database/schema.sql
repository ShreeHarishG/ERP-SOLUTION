-- ============================================================
-- ChainIQ ERP — Supabase PostgreSQL Schema
-- Company: Shiv Furniture Works
-- Version: 1.0.0
-- ============================================================
-- Design Decisions:
-- 1. All PKs are UUID for distributed safety and no ID guessing
-- 2. Every stock movement goes through inventory_movements (ledger pattern)
-- 3. reserved_quantity is tracked separately to support MTO/MTS flows
-- 4. audit_logs are append-only — no updates, no deletes
-- 5. soft deletes (is_active) on products to preserve historical data
-- 6. status columns use CHECK constraints to enforce valid state machines
-- ============================================================

-- Enable UUID extension (required by Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'admin',
  'product_manager',
  'sales',
  'purchase',
  'inventory'
);

CREATE TYPE procurement_type AS ENUM (
  'purchase',    -- sourced from vendor
  'manufacture'  -- produced internally
);

CREATE TYPE procurement_strategy AS ENUM (
  'mts', -- Make To Stock: manufacture before demand
  'mto'  -- Make To Order: manufacture after demand
);

CREATE TYPE sales_order_status AS ENUM (
  'draft',
  'confirmed',
  'partially_delivered',
  'delivered',
  'cancelled'
);

CREATE TYPE purchase_order_status AS ENUM (
  'draft',
  'confirmed',
  'partially_received',
  'received',
  'cancelled'
);

CREATE TYPE manufacturing_order_status AS ENUM (
  'draft',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TYPE movement_type AS ENUM (
  'purchase_receipt',       -- stock in from vendor
  'sales_delivery',         -- stock out to customer
  'manufacturing_consume',  -- raw materials consumed in production
  'manufacturing_produce',  -- finished goods produced
  'stock_adjustment',       -- manual correction
  'stock_reservation',      -- reserved for an order
  'reservation_release'     -- reservation released/cancelled
);

CREATE TYPE audit_action AS ENUM (
  'user_created',
  'user_updated',
  'user_deleted',
  'product_created',
  'product_updated',
  'product_deleted',
  'bom_created',
  'bom_updated',
  'bom_deleted',
  'sales_order_created',
  'sales_order_confirmed',
  'sales_order_delivered',
  'sales_order_cancelled',
  'purchase_order_created',
  'purchase_order_confirmed',
  'purchase_order_received',
  'purchase_order_cancelled',
  'manufacturing_order_created',
  'manufacturing_order_started',
  'manufacturing_order_completed',
  'manufacturing_order_cancelled',
  'stock_adjusted',
  'stock_reserved',
  'stock_reservation_released'
);

-- ============================================================
-- TABLE: users
-- Central user registry. Passwords are hashed (bcrypt).
-- Roles determine which modules and actions are accessible.
-- ============================================================

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(100)  NOT NULL,
  email           VARCHAR(150)  NOT NULL UNIQUE,
  password_hash   TEXT          NOT NULL,
  role            user_role     NOT NULL DEFAULT 'sales',
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_role     ON users(role);
CREATE INDEX idx_users_active   ON users(is_active);

-- ============================================================
-- TABLE: products
-- Master catalog. Tracks pricing, stock, and procurement config.
-- on_hand_quantity = physical stock in warehouse
-- reserved_quantity = allocated to confirmed orders, not yet shipped
-- free_quantity (virtual) = on_hand - reserved (computed at query time)
-- min_stock_level triggers Smart Procurement Alerts
-- ============================================================

CREATE TABLE products (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  VARCHAR(200)        NOT NULL,
  sku                   VARCHAR(100)        NOT NULL UNIQUE,
  description           TEXT,
  category              VARCHAR(100),
  unit_of_measure       VARCHAR(50)         NOT NULL DEFAULT 'pcs',
  sales_price           NUMERIC(12, 2)      NOT NULL DEFAULT 0,
  cost_price            NUMERIC(12, 2)      NOT NULL DEFAULT 0,
  on_hand_quantity      NUMERIC(12, 2)      NOT NULL DEFAULT 0,
  reserved_quantity     NUMERIC(12, 2)      NOT NULL DEFAULT 0,
  min_stock_level       NUMERIC(12, 2)      NOT NULL DEFAULT 0,
  reorder_quantity      NUMERIC(12, 2)      NOT NULL DEFAULT 0,
  procurement_type      procurement_type    NOT NULL DEFAULT 'purchase',
  procurement_strategy  procurement_strategy NOT NULL DEFAULT 'mts',
  is_active             BOOLEAN             NOT NULL DEFAULT TRUE,
  image_url             TEXT,
  created_by            UUID                REFERENCES users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_sku            ON products(sku);
CREATE INDEX idx_products_category       ON products(category);
CREATE INDEX idx_products_active         ON products(is_active);
CREATE INDEX idx_products_procurement    ON products(procurement_type);
CREATE INDEX idx_products_low_stock      ON products(on_hand_quantity, min_stock_level);

-- ============================================================
-- TABLE: boms (Bill of Materials headers)
-- Links a finished product to its component recipe.
-- A product can have multiple BoM versions but only one active.
-- quantity = how many finished goods this BoM produces per run
-- ============================================================

CREATE TABLE boms (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name            VARCHAR(200)  NOT NULL,
  quantity        NUMERIC(12, 2) NOT NULL DEFAULT 1,  -- output qty per production run
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  notes           TEXT,
  created_by      UUID          REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_boms_product    ON boms(product_id);
CREATE INDEX idx_boms_active     ON boms(is_active);

-- ============================================================
-- TABLE: bom_items (Bill of Materials line items)
-- Each row = one component required by a BoM.
-- quantity = amount of component needed per BoM output quantity
-- ============================================================

CREATE TABLE bom_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bom_id          UUID            NOT NULL REFERENCES boms(id) ON DELETE CASCADE,
  component_id    UUID            NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity        NUMERIC(12, 2)  NOT NULL,
  unit_of_measure VARCHAR(50)     NOT NULL DEFAULT 'pcs',
  notes           TEXT,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  UNIQUE(bom_id, component_id)   -- one component per BoM line
);

CREATE INDEX idx_bom_items_bom          ON bom_items(bom_id);
CREATE INDEX idx_bom_items_component    ON bom_items(component_id);

-- ============================================================
-- TABLE: sales_orders (Sales Order headers)
-- Represents a customer demand event.
-- Confirming triggers stock reservation.
-- Delivering triggers inventory_movements (sales_delivery).
-- ============================================================

CREATE TABLE sales_orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number        VARCHAR(50)         NOT NULL UNIQUE,
  customer_name       VARCHAR(200)        NOT NULL,
  customer_email      VARCHAR(150),
  customer_phone      VARCHAR(50),
  status              sales_order_status  NOT NULL DEFAULT 'draft',
  order_date          DATE                NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery   DATE,
  notes               TEXT,
  total_amount        NUMERIC(14, 2)      NOT NULL DEFAULT 0,
  created_by          UUID                REFERENCES users(id) ON DELETE SET NULL,
  confirmed_by        UUID                REFERENCES users(id) ON DELETE SET NULL,
  confirmed_at        TIMESTAMPTZ,
  delivered_by        UUID                REFERENCES users(id) ON DELETE SET NULL,
  delivered_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_orders_number     ON sales_orders(order_number);
CREATE INDEX idx_sales_orders_status     ON sales_orders(status);
CREATE INDEX idx_sales_orders_date       ON sales_orders(order_date);
CREATE INDEX idx_sales_orders_created_by ON sales_orders(created_by);

-- ============================================================
-- TABLE: sales_order_items (Sales Order line items)
-- quantity_ordered = customer wants
-- quantity_delivered = already shipped
-- unit_price snapshotted at order time (price may change later)
-- ============================================================

CREATE TABLE sales_order_items (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sales_order_id        UUID            NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id            UUID            NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity_ordered      NUMERIC(12, 2)  NOT NULL,
  quantity_delivered    NUMERIC(12, 2)  NOT NULL DEFAULT 0,
  unit_price            NUMERIC(12, 2)  NOT NULL,
  subtotal              NUMERIC(14, 2)  GENERATED ALWAYS AS (quantity_ordered * unit_price) STORED,
  created_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_so_items_order      ON sales_order_items(sales_order_id);
CREATE INDEX idx_so_items_product    ON sales_order_items(product_id);

-- ============================================================
-- TABLE: purchase_orders (Purchase Order headers)
-- Represents procurement from a vendor.
-- Receiving triggers inventory_movements (purchase_receipt).
-- ============================================================

CREATE TABLE purchase_orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number        VARCHAR(50)             NOT NULL UNIQUE,
  vendor_name         VARCHAR(200)            NOT NULL,
  vendor_email        VARCHAR(150),
  vendor_phone        VARCHAR(50),
  status              purchase_order_status   NOT NULL DEFAULT 'draft',
  order_date          DATE                    NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery   DATE,
  notes               TEXT,
  total_amount        NUMERIC(14, 2)          NOT NULL DEFAULT 0,
  -- traceability: which sales order triggered this PO (nullable for manual POs)
  triggered_by_so_id  UUID                    REFERENCES sales_orders(id) ON DELETE SET NULL,
  created_by          UUID                    REFERENCES users(id) ON DELETE SET NULL,
  confirmed_by        UUID                    REFERENCES users(id) ON DELETE SET NULL,
  confirmed_at        TIMESTAMPTZ,
  received_by         UUID                    REFERENCES users(id) ON DELETE SET NULL,
  received_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_purchase_orders_number       ON purchase_orders(order_number);
CREATE INDEX idx_purchase_orders_status       ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_vendor       ON purchase_orders(vendor_name);
CREATE INDEX idx_purchase_orders_triggered_by ON purchase_orders(triggered_by_so_id);

-- ============================================================
-- TABLE: purchase_order_items (Purchase Order line items)
-- quantity_ordered = ordered from vendor
-- quantity_received = already received into warehouse
-- unit_cost snapshotted at PO creation time
-- ============================================================

CREATE TABLE purchase_order_items (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id     UUID            NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id            UUID            NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity_ordered      NUMERIC(12, 2)  NOT NULL,
  quantity_received     NUMERIC(12, 2)  NOT NULL DEFAULT 0,
  unit_cost             NUMERIC(12, 2)  NOT NULL,
  subtotal              NUMERIC(14, 2)  GENERATED ALWAYS AS (quantity_ordered * unit_cost) STORED,
  created_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_po_items_order      ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_po_items_product    ON purchase_order_items(product_id);

-- ============================================================
-- TABLE: manufacturing_orders (Manufacturing Order headers)
-- Links a finished product BoM to a production run.
-- triggered_by_so_id = traceability: which SO triggered this MO
-- Completing triggers inventory_movements for component consumption
-- and finished goods production.
-- ============================================================

CREATE TABLE manufacturing_orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number          VARCHAR(50)                 NOT NULL UNIQUE,
  product_id            UUID                        NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  bom_id                UUID                        NOT NULL REFERENCES boms(id) ON DELETE RESTRICT,
  quantity_to_produce   NUMERIC(12, 2)              NOT NULL,
  quantity_produced     NUMERIC(12, 2)              NOT NULL DEFAULT 0,
  status                manufacturing_order_status  NOT NULL DEFAULT 'draft',
  scheduled_start       DATE,
  scheduled_end         DATE,
  actual_start          TIMESTAMPTZ,
  actual_end            TIMESTAMPTZ,
  notes                 TEXT,
  -- traceability: which sales order triggered this MO
  triggered_by_so_id    UUID                        REFERENCES sales_orders(id) ON DELETE SET NULL,
  created_by            UUID                        REFERENCES users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ                 NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mo_product         ON manufacturing_orders(product_id);
CREATE INDEX idx_mo_bom             ON manufacturing_orders(bom_id);
CREATE INDEX idx_mo_status          ON manufacturing_orders(status);
CREATE INDEX idx_mo_triggered_by    ON manufacturing_orders(triggered_by_so_id);

-- ============================================================
-- TABLE: inventory_movements (Stock Ledger)
-- THE most critical table in the ERP.
-- Every single quantity change MUST be recorded here.
-- This is an append-only ledger — never update or delete rows.
-- quantity is always POSITIVE — direction is determined by movement_type.
-- Reference columns provide full traceability to source documents.
-- ============================================================

CREATE TABLE inventory_movements (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id                UUID            NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  movement_type             movement_type   NOT NULL,
  quantity                  NUMERIC(12, 2)  NOT NULL CHECK (quantity > 0),
  -- direction: +1 = stock in, -1 = stock out
  direction                 SMALLINT        NOT NULL CHECK (direction IN (1, -1)),
  -- snapshot of stock level after this movement (for easy reporting)
  quantity_before           NUMERIC(12, 2)  NOT NULL,
  quantity_after            NUMERIC(12, 2)  NOT NULL,
  -- source document references (all nullable — depends on movement type)
  reference_so_id           UUID            REFERENCES sales_orders(id) ON DELETE SET NULL,
  reference_po_id           UUID            REFERENCES purchase_orders(id) ON DELETE SET NULL,
  reference_mo_id           UUID            REFERENCES manufacturing_orders(id) ON DELETE SET NULL,
  notes                     TEXT,
  created_by                UUID            REFERENCES users(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ     NOT NULL DEFAULT NOW()
  -- NO updated_at — this is an immutable ledger
);

CREATE INDEX idx_inv_movements_product     ON inventory_movements(product_id);
CREATE INDEX idx_inv_movements_type        ON inventory_movements(movement_type);
CREATE INDEX idx_inv_movements_date        ON inventory_movements(created_at);
CREATE INDEX idx_inv_movements_so          ON inventory_movements(reference_so_id);
CREATE INDEX idx_inv_movements_po          ON inventory_movements(reference_po_id);
CREATE INDEX idx_inv_movements_mo          ON inventory_movements(reference_mo_id);

-- ============================================================
-- TABLE: audit_logs (Immutable Action Trail)
-- Tracks every important business action.
-- Append-only — never update or delete.
-- entity_type + entity_id = what was affected
-- old_values / new_values = JSON snapshots of state change
-- ============================================================

CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID            REFERENCES users(id) ON DELETE SET NULL,
  user_name       VARCHAR(100),   -- snapshot in case user is later deleted
  user_role       user_role,      -- snapshot at time of action
  action          audit_action    NOT NULL,
  entity_type     VARCHAR(100)    NOT NULL,  -- e.g. 'product', 'sales_order'
  entity_id       UUID,                      -- PK of affected record
  entity_name     VARCHAR(200),              -- human readable snapshot
  old_values      JSONB,                     -- state before change
  new_values      JSONB,                     -- state after change
  ip_address      VARCHAR(45),               -- IPv4 or IPv6
  user_agent      TEXT,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
  -- NO updated_at — immutable
);

CREATE INDEX idx_audit_user         ON audit_logs(user_id);
CREATE INDEX idx_audit_action       ON audit_logs(action);
CREATE INDEX idx_audit_entity_type  ON audit_logs(entity_type);
CREATE INDEX idx_audit_entity_id    ON audit_logs(entity_id);
CREATE INDEX idx_audit_date         ON audit_logs(created_at);

-- ============================================================
-- AUTO-UPDATE TRIGGERS
-- Keep updated_at timestamps current automatically
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_boms_updated_at
  BEFORE UPDATE ON boms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_bom_items_updated_at
  BEFORE UPDATE ON bom_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_sales_orders_updated_at
  BEFORE UPDATE ON sales_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_sales_order_items_updated_at
  BEFORE UPDATE ON sales_order_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_purchase_order_items_updated_at
  BEFORE UPDATE ON purchase_order_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_manufacturing_orders_updated_at
  BEFORE UPDATE ON manufacturing_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ORDER NUMBER GENERATORS
-- Auto-generate human-readable order numbers
-- Format: SO-20240001, PO-20240001, MO-20240001
-- ============================================================

CREATE SEQUENCE sales_order_seq     START 1;
CREATE SEQUENCE purchase_order_seq  START 1;
CREATE SEQUENCE manufacturing_order_seq START 1;

CREATE OR REPLACE FUNCTION generate_sales_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'SO-' || TO_CHAR(NOW(), 'YYYY') || LPAD(nextval('sales_order_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_purchase_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'PO-' || TO_CHAR(NOW(), 'YYYY') || LPAD(nextval('purchase_order_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_manufacturing_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'MO-' || TO_CHAR(NOW(), 'YYYY') || LPAD(nextval('manufacturing_order_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_so_order_number
  BEFORE INSERT ON sales_orders
  FOR EACH ROW EXECUTE FUNCTION generate_sales_order_number();

CREATE TRIGGER trg_po_order_number
  BEFORE INSERT ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION generate_purchase_order_number();

CREATE TRIGGER trg_mo_order_number
  BEFORE INSERT ON manufacturing_orders
  FOR EACH ROW EXECUTE FUNCTION generate_manufacturing_order_number();

-- ============================================================
-- VIEWS (for dashboard & reporting queries)
-- ============================================================

-- Free stock view (on_hand - reserved)
CREATE OR REPLACE VIEW product_stock_view AS
SELECT
  p.id,
  p.sku,
  p.name,
  p.category,
  p.unit_of_measure,
  p.on_hand_quantity,
  p.reserved_quantity,
  (p.on_hand_quantity - p.reserved_quantity) AS free_quantity,
  p.min_stock_level,
  p.reorder_quantity,
  p.procurement_type,
  p.procurement_strategy,
  p.sales_price,
  p.cost_price,
  -- Low stock flag: free quantity below minimum threshold
  CASE
    WHEN (p.on_hand_quantity - p.reserved_quantity) <= p.min_stock_level
    THEN TRUE
    ELSE FALSE
  END AS is_low_stock,
  -- Reorder suggestion: how much to order to restore healthy levels
  GREATEST(
    p.reorder_quantity,
    p.min_stock_level - (p.on_hand_quantity - p.reserved_quantity)
  ) AS suggested_reorder_qty
FROM products p
WHERE p.is_active = TRUE;

-- Dashboard summary view
CREATE OR REPLACE VIEW dashboard_summary AS
SELECT
  (SELECT COUNT(*) FROM products WHERE is_active = TRUE)                                        AS total_products,
  (SELECT COUNT(*) FROM sales_orders WHERE status NOT IN ('cancelled'))                         AS total_sales_orders,
  (SELECT COUNT(*) FROM sales_orders WHERE status IN ('draft', 'confirmed'))                    AS pending_sales_orders,
  (SELECT COUNT(*) FROM purchase_orders WHERE status NOT IN ('cancelled'))                      AS total_purchase_orders,
  (SELECT COUNT(*) FROM purchase_orders WHERE status IN ('draft', 'confirmed'))                 AS pending_purchase_orders,
  (SELECT COUNT(*) FROM manufacturing_orders WHERE status NOT IN ('cancelled'))                 AS total_manufacturing_orders,
  (SELECT COUNT(*) FROM manufacturing_orders WHERE status IN ('draft', 'confirmed', 'in_progress')) AS active_manufacturing_orders,
  (SELECT COUNT(*) FROM products
   WHERE is_active = TRUE
   AND (on_hand_quantity - reserved_quantity) <= min_stock_level)                               AS low_stock_count;

-- Order traceability view (Winning Feature #2)
CREATE OR REPLACE VIEW order_traceability AS
SELECT
  so.id                   AS sales_order_id,
  so.order_number         AS sales_order_number,
  so.customer_name,
  so.status               AS so_status,
  so.created_at           AS so_created_at,
  so.delivered_at,
  -- Purchase Orders triggered by this SO
  po.id                   AS purchase_order_id,
  po.order_number         AS po_number,
  po.status               AS po_status,
  po.vendor_name,
  -- Manufacturing Orders triggered by this SO
  mo.id                   AS manufacturing_order_id,
  mo.order_number         AS mo_number,
  mo.status               AS mo_status,
  mo.quantity_to_produce,
  mo.quantity_produced
FROM sales_orders so
LEFT JOIN purchase_orders po      ON po.triggered_by_so_id = so.id
LEFT JOIN manufacturing_orders mo ON mo.triggered_by_so_id = so.id;

-- ============================================================
-- ROW LEVEL SECURITY (Supabase RLS)
-- We use JWT + our own middleware for auth, but enable RLS
-- as a defence-in-depth layer.
-- Service role key (used by backend) bypasses RLS.
-- ============================================================

ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE boms                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturing_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs           ENABLE ROW LEVEL SECURITY;

-- Allow full access for service_role (backend API)
-- Individual user policies are enforced at API middleware level
CREATE POLICY "service_role_all" ON users                USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_role_all" ON products             USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_role_all" ON boms                 USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_role_all" ON bom_items            USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_role_all" ON sales_orders         USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_role_all" ON sales_order_items    USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_role_all" ON purchase_orders      USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_role_all" ON purchase_order_items USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_role_all" ON manufacturing_orders USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_role_all" ON inventory_movements  USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "service_role_all" ON audit_logs           USING (TRUE) WITH CHECK (TRUE);
