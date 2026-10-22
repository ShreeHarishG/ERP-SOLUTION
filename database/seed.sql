-- ============================================================
-- ChainIQ ERP — Seed Data
-- Company: Shiv Furniture Works
-- Run AFTER schema.sql
-- Password for all seed users: Admin@123
-- (bcrypt hash of "Admin@123" with 10 rounds)
-- ============================================================

-- ============================================================
-- USERS
-- ============================================================

INSERT INTO users (id, name, email, password_hash, role) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Super Admin',
  'admin@shivfurniture.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Admin@123
  'admin'
),
(
  '00000000-0000-0000-0000-000000000002',
  'Ravi Sharma',
  'ravi@shivfurniture.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'product_manager'
),
(
  '00000000-0000-0000-0000-000000000003',
  'Priya Singh',
  'priya@shivfurniture.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'sales'
),
(
  '00000000-0000-0000-0000-000000000004',
  'Amit Patel',
  'amit@shivfurniture.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'purchase'
),
(
  '00000000-0000-0000-0000-000000000005',
  'Neha Gupta',
  'neha@shivfurniture.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'inventory'
);

-- ============================================================
-- PRODUCTS — Finished Goods
-- ============================================================

INSERT INTO products (id, name, sku, description, category, unit_of_measure, sales_price, cost_price, on_hand_quantity, reserved_quantity, min_stock_level, reorder_quantity, procurement_type, procurement_strategy, created_by) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  'Wooden Dining Table',
  'WDT-001',
  '6-seater solid wood dining table',
  'Furniture',
  'pcs',
  15000.00,
  8500.00,
  5,
  0,
  10,
  15,
  'manufacture',
  'mts',
  '00000000-0000-0000-0000-000000000002'
),
(
  '10000000-0000-0000-0000-000000000002',
  'Wooden Chair',
  'WCH-001',
  'Solid wood dining chair',
  'Furniture',
  'pcs',
  3500.00,
  1800.00,
  20,
  0,
  20,
  30,
  'manufacture',
  'mts',
  '00000000-0000-0000-0000-000000000002'
),
(
  '10000000-0000-0000-0000-000000000003',
  'Wooden Bookshelf',
  'WBS-001',
  '5-shelf solid wood bookshelf',
  'Furniture',
  'pcs',
  8000.00,
  4500.00,
  8,
  0,
  5,
  10,
  'manufacture',
  'mto',
  '00000000-0000-0000-0000-000000000002'
);

-- ============================================================
-- PRODUCTS — Raw Materials
-- ============================================================

INSERT INTO products (id, name, sku, description, category, unit_of_measure, sales_price, cost_price, on_hand_quantity, reserved_quantity, min_stock_level, reorder_quantity, procurement_type, procurement_strategy, created_by) VALUES
(
  '20000000-0000-0000-0000-000000000001',
  'Wooden Leg (Table)',
  'RM-WL-001',
  'Solid teak table leg, 75cm height',
  'Raw Material',
  'pcs',
  0,
  250.00,
  40,
  0,
  50,
  100,
  'purchase',
  'mts',
  '00000000-0000-0000-0000-000000000002'
),
(
  '20000000-0000-0000-0000-000000000002',
  'Wooden Table Top',
  'RM-WT-001',
  'Solid teak table top panel, 180x90cm',
  'Raw Material',
  'pcs',
  0,
  1200.00,
  12,
  0,
  10,
  20,
  'purchase',
  'mts',
  '00000000-0000-0000-0000-000000000002'
),
(
  '20000000-0000-0000-0000-000000000003',
  'Wood Screws (Box)',
  'RM-SC-001',
  'Box of 50 wood screws, 4x40mm',
  'Raw Material',
  'box',
  0,
  120.00,
  8,
  0,
  20,
  30,
  'purchase',
  'mts',
  '00000000-0000-0000-0000-000000000002'
),
(
  '20000000-0000-0000-0000-000000000004',
  'Wooden Chair Leg',
  'RM-CL-001',
  'Solid wood chair leg, 45cm',
  'Raw Material',
  'pcs',
  0,
  150.00,
  100,
  0,
  80,
  100,
  'purchase',
  'mts',
  '00000000-0000-0000-0000-000000000002'
),
(
  '20000000-0000-0000-0000-000000000005',
  'Chair Seat Panel',
  'RM-CS-001',
  'Solid wood chair seat panel, 45x45cm',
  'Raw Material',
  'pcs',
  0,
  400.00,
  30,
  0,
  20,
  30,
  'purchase',
  'mts',
  '00000000-0000-0000-0000-000000000002'
),
(
  '20000000-0000-0000-0000-000000000006',
  'Chair Back Panel',
  'RM-CB-001',
  'Solid wood chair back panel',
  'Raw Material',
  'pcs',
  0,
  350.00,
  25,
  0,
  20,
  30,
  'purchase',
  'mts',
  '00000000-0000-0000-0000-000000000002'
),
(
  '20000000-0000-0000-0000-000000000007',
  'Shelf Board',
  'RM-SB-001',
  'Solid wood shelf board, 80x30cm',
  'Raw Material',
  'pcs',
  0,
  300.00,
  20,
  0,
  15,
  25,
  'purchase',
  'mts',
  '00000000-0000-0000-0000-000000000002'
),
(
  '20000000-0000-0000-0000-000000000008',
  'Vertical Side Panel',
  'RM-VP-001',
  'Vertical side panel for bookshelf, 180x30cm',
  'Raw Material',
  'pcs',
  0,
  600.00,
  10,
  0,
  10,
  15,
  'purchase',
  'mts',
  '00000000-0000-0000-0000-000000000002'
),
(
  '20000000-0000-0000-0000-000000000009',
  'Wood Finish (Litre)',
  'RM-WF-001',
  'Teak wood finish varnish',
  'Raw Material',
  'ltr',
  0,
  180.00,
  15,
  0,
  10,
  20,
  'purchase',
  'mts',
  '00000000-0000-0000-0000-000000000002'
);

-- ============================================================
-- BILL OF MATERIALS
-- ============================================================

-- BoM: Wooden Dining Table (produces 1 table)
INSERT INTO boms (id, product_id, name, quantity, is_active, notes, created_by) VALUES
(
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'Wooden Dining Table - Standard BoM',
  1,
  TRUE,
  'Standard recipe for 6-seater dining table',
  '00000000-0000-0000-0000-000000000002'
);

INSERT INTO bom_items (bom_id, component_id, quantity, unit_of_measure) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 4,    'pcs'), -- 4 table legs
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 1,    'pcs'), -- 1 table top
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 0.24, 'box'), -- ~12 screws (0.24 box)
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000009', 0.5,  'ltr'); -- 0.5L wood finish

-- BoM: Wooden Chair (produces 1 chair)
INSERT INTO boms (id, product_id, name, quantity, is_active, notes, created_by) VALUES
(
  '30000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000002',
  'Wooden Chair - Standard BoM',
  1,
  TRUE,
  'Standard recipe for dining chair',
  '00000000-0000-0000-0000-000000000002'
);

INSERT INTO bom_items (bom_id, component_id, quantity, unit_of_measure) VALUES
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', 4,    'pcs'), -- 4 chair legs
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000005', 1,    'pcs'), -- 1 seat panel
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000006', 1,    'pcs'), -- 1 back panel
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 0.12, 'box'), -- ~6 screws
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000009', 0.25, 'ltr'); -- 0.25L finish

-- BoM: Wooden Bookshelf (produces 1 shelf)
INSERT INTO boms (id, product_id, name, quantity, is_active, notes, created_by) VALUES
(
  '30000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000003',
  'Wooden Bookshelf - Standard BoM',
  1,
  TRUE,
  'Standard recipe for 5-shelf bookshelf',
  '00000000-0000-0000-0000-000000000002'
);

INSERT INTO bom_items (bom_id, component_id, quantity, unit_of_measure) VALUES
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000007', 5,    'pcs'), -- 5 shelf boards
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000008', 2,    'pcs'), -- 2 side panels
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 0.40, 'box'), -- ~20 screws
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000009', 0.75, 'ltr'); -- 0.75L finish

-- ============================================================
-- AUDIT LOGS — Initial seeding activity
-- ============================================================

INSERT INTO audit_logs (user_id, user_name, user_role, action, entity_type, entity_id, entity_name, new_values) VALUES
('00000000-0000-0000-0000-000000000002', 'Ravi Sharma', 'product_manager', 'product_created', 'product', '10000000-0000-0000-0000-000000000001', 'Wooden Dining Table', '{"sku":"WDT-001","procurement_type":"manufacture"}'),
('00000000-0000-0000-0000-000000000002', 'Ravi Sharma', 'product_manager', 'product_created', 'product', '10000000-0000-0000-0000-000000000002', 'Wooden Chair',         '{"sku":"WCH-001","procurement_type":"manufacture"}'),
('00000000-0000-0000-0000-000000000002', 'Ravi Sharma', 'product_manager', 'product_created', 'product', '10000000-0000-0000-0000-000000000003', 'Wooden Bookshelf',     '{"sku":"WBS-001","procurement_type":"manufacture"}'),
('00000000-0000-0000-0000-000000000002', 'Ravi Sharma', 'product_manager', 'bom_created',     'bom',     '30000000-0000-0000-0000-000000000001', 'Wooden Dining Table - Standard BoM', '{"components":4}'),
('00000000-0000-0000-0000-000000000002', 'Ravi Sharma', 'product_manager', 'bom_created',     'bom',     '30000000-0000-0000-0000-000000000002', 'Wooden Chair - Standard BoM',        '{"components":5}'),
('00000000-0000-0000-0000-000000000002', 'Ravi Sharma', 'product_manager', 'bom_created',     'bom',     '30000000-0000-0000-0000-000000000003', 'Wooden Bookshelf - Standard BoM',    '{"components":4}');
