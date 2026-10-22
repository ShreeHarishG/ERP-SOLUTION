# ChainIQ ERP — Master System Architecture & Operational Flows Guide

> **Enterprise Operations Control System (OCS) & Supply Chain Decision Engine**
> 
> *A comprehensive technical and operational breakdown of the unified architecture, transactional state machines, relational data schema, decoupled AI copilot, and Onchain Insights supply chain intelligence network.*

---

## Table of Contents

1. [Executive Summary & System Purpose](#1-executive-summary--system-purpose)
2. [High-Level System Architecture](#2-high-level-system-architecture)
   - [2.1 Decoupled Transaction and Intelligence Topology](#21-decoupled-transaction-and-intelligence-topology)
   - [2.2 Technology Stack Breakdown](#22-technology-stack-breakdown)
   - [2.3 Network, Security & Session Layer](#23-network-security--session-layer)
3. [Relational Data Models & Database Schemas](#3-relational-data-models--database-schemas)
   - [3.1 Relational Architecture (ERD Overview)](#31-relational-architecture-erd-overview)
   - [3.2 Entities & Table Dictionary](#32-entities--table-dictionary)
   - [3.3 Enumerations & System Constants](#33-enumerations--system-constants)
   - [3.4 The Inventory Ledger & Stock Mathematics](#34-the-inventory-ledger--stock-mathematics)
4. [Role-Based Access Control (RBAC) & Governance](#4-role-based-access-control-rbac--governance)
   - [4.1 Role Matrix & Workspace Permissions](#41-role-matrix--workspace-permissions)
   - [4.2 Authentication Flow & Cookie Lifecycle](#42-authentication-flow--cookie-lifecycle)
   - [4.3 In-Flight Role Switcher (Dev Sandbox)](#43-in-flight-role-switcher-dev-sandbox)
5. [Core ERP Operational Workflows (Deep-Dive)](#5-core-erp-operational-workflows-deep-dive)
   - [5.1 Flow 1: Sales Order Lifecycle, Stock Check & BOM Explosion](#51-flow-1-sales-order-lifecycle-stock-check--bom-explosion)
   - [5.2 Flow 2: Manufacturing Order Orchestration & Floor Execution](#52-flow-2-manufacturing-order-orchestration--floor-execution)
   - [5.3 Flow 3: Closed-Loop Procurement (RFQ, Bids, PO & Receipts)](#53-flow-3-closed-loop-procurement-rfq-bids-po--receipts)
   - [5.4 Flow 4: Inventory Movements Ledger & Stock Adjustments](#54-flow-4-inventory-movements-ledger--stock-adjustments)
   - [5.5 Flow 5: Order Dispatch & Delivery Fulfillment](#55-flow-5-order-dispatch--delivery-fulfillment)
   - [5.6 Flow 6: Cross-Entity Timeline Tracking & Immutable Audit Logs](#56-flow-6-cross-entity-timeline-tracking--immutable-audit-logs)
6. [AI Copilot & Operations Intelligence Engine](#6-ai-copilot--operations-intelligence-engine)
   - [6.1 LangGraph Multi-Node State Machine](#61-langgraph-multi-node-state-machine)
   - [6.2 Role-Aware SQL Tool Selection & Guardrails](#62-role-aware-sql-tool-selection--guardrails)
   - [6.3 Dynamic Operational Health Score Engine](#63-dynamic-operational-health-score-engine)
   - [6.4 Next.js In-Memory Caching & Local Fallback Strategy](#64-nextjs-in-memory-caching--local-fallback-strategy)
7. [The Onchain Insights Subsystem (Supply Chain Intelligence)](#7-the-onchain-insights-subsystem-supply-chain-intelligence)
   - [7.1 Architectural Overview & Zero ERP Regression Principle](#71-architectural-overview--zero-erp-regression-principle)
   - [7.2 The Adapter Provider Pattern (`mock` vs `api`)](#72-the-adapter-provider-pattern-mock-vs-api)
   - [7.3 Deep Dive: All 12 Workspaces & Workflows](#73-deep-dive-all-12-workspaces--workflows)
     - [Task 1: Executive Intelligence Command Center](#task-1-executive-intelligence-command-center)
     - [Task 2: Supplier Qualification & 6D Radar Capability Scorecard](#task-2-supplier-qualification--6d-radar-capability-scorecard)
     - [Task 3: Multi-Step Supplier Onboarding & Document Verification](#task-3-multi-step-supplier-onboarding--document-verification)
     - [Task 4: Supplier Switching Simulator (Retain vs Split vs Full Switch)](#task-4-supplier-switching-simulator-retain-vs-split-vs-full-switch)
     - [Task 5: SKU Transition Planning & 12-Week Crossover Modeling](#task-5-sku-transition-planning--12-week-crossover-modeling)
     - [Task 6: Real-time Disruption Signals & Freight Shipment Tracker](#task-6-real-time-disruption-signals--freight-shipment-tracker)
     - [Task 7: Explainable 5-Factor Risk Prioritization & Weight Sensitivity](#task-7-explainable-5-factor-risk-prioritization--weight-sensitivity)
     - [Task 8: Multi-Tier Dependency Explorer & BFS Blast-Radius Graph](#task-8-multi-tier-dependency-explorer--bfs-blast-radius-graph)
     - [Task 9: Mitigation Scenario Lab & Trade-Off Matrix](#task-9-mitigation-scenario-lab--trade-off-matrix)
     - [Task 10: Human Approval Governance & Action Audit Trail](#task-10-human-approval-governance--action-audit-trail)
     - [Task 11: Stakeholder Alerts & Notification Center](#task-11-stakeholder-alerts--notification-center)
     - [Task 12: Outcome Analytics, SLA Recovery & 5-Whys Post-Mortem Lab](#task-12-outcome-analytics-sla-recovery--5-whys-post-mortem-lab)
8. [End-to-End Walkthrough Scenario: "The Teak Dining Table Journey"](#8-end-to-end-walkthrough-scenario-the-teak-dining-table-journey)
9. [Development, Environment & Production Readiness Guide](#9-development-environment--production-readiness-guide)

---

## 1. Executive Summary & System Purpose

### The Manufacturing Dilemma
Traditional Enterprise Resource Planning (ERP) software (SAP ECC/S4HANA, Oracle NetSuite, Microsoft Dynamics) was engineered for retrospective accounting. They act as "data graveyards": operators log transactions *after* shipments are delayed, stockouts occur, or machine lines grind to a halt.

For medium and custom assembly manufacturers (furniture makers, machinery fabricators, electronics assemblers), a missing ₹50 fastener or an uncertified batch of varnish halts a ₹2,50,000 finished product line. Working capital becomes trapped in Work-in-Progress (WIP), customer delivery Service Level Agreements (SLAs) fail, and margins erode through frantic expedited freight charges.

### The ChainIQ Solution: Active Business Routing
ChainIQ ERP flips this paradigm by implementing **Active Business Routing**:
1. **Immediate BOM Material Explosion**: The exact millisecond a Sales Order is confirmed, the platform evaluates physical availability, explodes multi-level Bill of Materials (BOM), and quantifies exact raw material shortages.
2. **Predictive Stock Allocation**: Free stock is strictly segregated from physically on-hand stock:
   $$\text{Free Quantity} = \max(0, \text{On-Hand Quantity} - \text{Reserved Quantity})$$
   This prevents multiple sales reps from double-promising the same warehouse batch.
3. **Automated Procurement Bridge**: Raw component shortages immediately generate draft Purchase Orders and trigger competitive Request for Quotation (RFQ) biddings across verified suppliers.
4. **Synchronized Shop Floor Production**: Manufacturing Orders (MO) automatically reflect supplier delivery milestones—transitioning dynamically from `WAITING_FOR_PROCUREMENT` to `READY_TO_START` the instant verified raw materials pass inventory receipt quality checks.
5. **Decoupled AI Decision Orchestration**: Operational analytics, natural language ERP query copilot, and supplier risk projections run in an isolated FastAPI / LangGraph service, safeguarding transactional database throughput.
6. **Supply Chain Disruption Shield (Onchain Insights)**: Tracks geopolitical, port, and supplier incidents, models SKU transition inventory run-downs, simulates supplier switches, and enforces dual-party governance before executing recovery plans.

---

## 2. High-Level System Architecture

### 2.1 Decoupled Transaction and Intelligence Topology

ChainIQ operates on a high-concurrency, dual-engine topology:
- **Transactional Gateway (Next.js 15 App Router)**: Governs ACID ledger updates, relational entities, JWT authentication, cookie validation, and interactive UI views.
- **Relational Storage (PostgreSQL / Supabase)**: Houses the immutable ledger, relational constraints, composite indices, and JSONB audit snapshots.
- **Intelligence Copilot (FastAPI + LangGraph + Groq)**: Processes complex NLP queries, runs role-authorized database introspection tools, and calculates dynamic health radar scores.
- **Supply Chain Intelligence (Onchain Insights Subsystem)**: Operates within Next.js with an adapter layer (`mock` or `api`), delivering Recharts data analytics, React Flow multi-tier graph BFS traversal, and scenario simulations.

```
+───────────────────────────────────────────────────────────────────────────────────+
│                                 CLIENT WEB BROWSER                                │
│          React 19 Server/Client Components · TanStack Query v5 · Tailwind CSS      │
│          Zustand Auth Store · Recharts Visualizations · React Flow Canvas         │
+─────────────────────────────────────────┬─────────────────────────────────────────+
                                          │
                         (HTTP-Only JWT Cookie / JSON REST)
                                          │
                                          ▼
+───────────────────────────────────────────────────────────────────────────────────+
│                            NEXT.JS 15 APP ROUTER LAYER                            │
│  ├── /app/(auth)                   ──> Login, Registration, Session Management    │
│  ├── /app/(dashboard)              ──> Core ERP & Onchain Insights Workspaces    │
│  ├── /app/api/...                  ──> REST Route Handlers (Role-Guarded)        │
│  ├── /lib/server/modules/          ──> Service Layer (Atomic Prisma TXs)         │
│  └── /lib/server/ai/               ──> AI Context Aggregator & Local Fallback     │
+─────────────────────────────────────────┬─────────────────────────────────────────+
                     │                                         │
       (ACID Transactions via Prisma)            (Live JSON Context over HTTP POST)
                     │                                         │
                     ▼                                         ▼
+─────────────────────────────────────────+ +───────────────────────────────────────+
│       POSTGRESQL (SUPABASE CLOUD)       │ │      FASTAPI INTELLIGENCE ENGINE      │
│  - 11 Core Relational Tables            │ │  - LangGraph State Machine Graph      │
│  - Foreign Keys & Composite Indices     │ │  - LLM: Groq Llama-3.3-70b-versatile  │
│  - JSONB Pre/Post Audit Snapshots       │ │  - Role-Scoped SQL Read Tools         │
│  - Decimal Precision (Currency & Stock) │ │  - n8n Webhook Ingress Gateway        │
+─────────────────────────────────────────+ +───────────────────────────────────────+
```

---

### 2.2 Technology Stack Breakdown

| Layer | Technology | Version | Key Function & Justification |
|---|---|---|---|
| **Web Framework** | Next.js (App Router) | `15.1.0` | React Server Components (RSC) for lightning-fast initial page loads, integrated serverless route handlers, and unified frontend/backend repository. |
| **Language** | TypeScript | `5.x` | End-to-end type safety between database Prisma models, API payloads, and frontend component props. |
| **State Management** | TanStack Query | `v5.62` | Handles server-state caching, automatic cache invalidation upon mutations, optimistic UI updates, and background refetching. |
| **Client Auth Store** | Zustand | `v5.0` | Lightweight, non-intrusive client store managing active session state, current user profile, and dev-mode sandbox role switching. |
| **Data Mapping (ORM)** | Prisma Client | `v6.1` | Automated migration pipeline, type-safe query generation, and declarative nested relations (`$transaction`). |
| **Relational Database** | PostgreSQL (Supabase) | `15+` | Enterprise relational consistency, ACID guarantees, decimal precision for financial/stock records, and JSONB audit columns. |
| **Styling & Design Tokens** | Tailwind CSS | `v3.4` | Responsive grid layouts, CSS variable tokens, slide-in animation drawers, and status color badges. |
| **Data Visualizations** | Recharts | `v2.15` | Composable, responsive SVG/canvas charts (radar capability cards, area risk curves, stacked bar cost-benefit charts). |
| **Network Graph Canvas** | `@xyflow/react` (React Flow)| `v12.4` | Node-edge interactive multi-tier supply chain canvas featuring zoom, pan, node selection, and downstream blast-radius tracing. |
| **AI Orchestration** | LangGraph & LangChain | Python 3.11 | Graph-based state machine for tool selection, execution, and role guardrail enforcement. |
| **Large Language Model** | Groq (Llama-3.3-70b-versatile)| API Cloud | Low-latency inference (<800ms) for real-time natural language query answering and structured JSON recommendations. |
| **Icons & UI Micro-elements**| Lucide React | `v0.468` | Clean, standardized vector icons across dashboards, tables, action buttons, and alert feeds. |

---

### 2.3 Network, Security & Session Layer

```
[Browser Request]
       │
       ▼
[Next.js Middleware / Route Guard]
       ├── 1. Read HTTP-Only Cookie: `chainiq_token`
       ├── 2. Verify HMAC SHA-256 Signature (JWT Secret)
       ├── 3. Extract Payload: { sub: userId, role: userRole, email, name }
       └── 4. Check Authorization: `requireRole('admin', 'purchase')`
             ├── Unauthorized (401/403) ──> Return Standard Error JSON
             └── Authorized (200) ───────> Pass Execution to Service Layer
                                                │
                                                ▼
                                    [Prisma Atomic Transaction]
                                                │
                                                ▼
                                    [Immutable Audit Log Hook]
```

1. **Stateless HTTP-Only JWT Cookies**: Authentication tokens are stored inside strict HTTP-only, SameSite cookies (`chainiq_token` and `chainiq_refresh_token`). Client-side JavaScript cannot read these tokens, mitigating Cross-Site Scripting (XSS) risks.
2. **Role Verification Middleware**: Every API route imports `requireRole(...)`. If a Sales Executive attempts to call `POST /api/inventory/adjust`, the server terminates the request immediately with HTTP 403 Forbidden without touching the database.
3. **Atomic Transactions (`prisma.$transaction`)**: Multi-table state mutations (e.g., confirming a Sales Order, reserving stock, writing inventory movements, generating audit logs) execute inside a single transactional block. If any step fails, the entire transaction rolls back cleanly.

---

## 3. Relational Data Models & Database Schemas

### 3.1 Relational Architecture (ERD Overview)

```mermaid
erDiagram
    users ||--o{ sales_orders : "creates/confirms/delivers"
    users ||--o{ purchase_orders : "creates/confirms/receives"
    users ||--o{ manufacturing_orders : "creates"
    users ||--o{ inventory_movements : "creates"
    users ||--o{ audit_logs : "triggers"
    users ||--o{ products : "creates"
    users ||--o{ boms : "creates"

    products ||--o{ bom_items : "is component of"
    products ||--o{ boms : "has assembly recipe"
    products ||--o{ sales_order_items : "ordered in"
    products ||--o{ purchase_order_items : "procured in"
    products ||--o{ manufacturing_orders : "target product"
    products ||--o{ inventory_movements : "tracked in"

    boms ||--|{ bom_items : "contains components"
    boms ||--o{ manufacturing_orders : "recipe used"

    sales_orders ||--|{ sales_order_items : "contains lines"
    sales_orders ||--o{ manufacturing_orders : "triggers (shortage)"
    sales_orders ||--o{ purchase_orders : "triggers (shortage)"
    sales_orders ||--o{ inventory_movements : "references"

    purchase_orders ||--|{ purchase_order_items : "contains lines"
    purchase_orders ||--o{ vendor_quotations : "receives bids"
    purchase_orders ||--o{ invoices : "bills"
    purchase_orders ||--o{ inventory_movements : "references"

    manufacturing_orders ||--o{ inventory_movements : "consumes/produces"
```

---

### 3.2 Entities & Table Dictionary

#### 1. `users`
Stores user identities, hashed credentials, and system roles.
- `id` (UUID, PK)
- `name` (VARCHAR 100), `email` (VARCHAR 150, UNIQUE)
- `password_hash` (TEXT, bcrypt hash)
- `role` (ENUM: `admin`, `product_manager`, `sales`, `purchase`, `inventory`)
- `company_name`, `phone`, `country`, `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### 2. `products`
The master catalog for both Raw Materials (`RM-`) and Finished Assembly Goods (`FG-`).
- `id` (UUID, PK)
- `sku` (VARCHAR 100, UNIQUE, e.g., `FG-WDT-001`, `RM-WL-001`)
- `name` (VARCHAR 200), `category` (VARCHAR 100), `unit_of_measure` (VARCHAR 50)
- `product_type` (ENUM: `raw_material`, `finished_good`)
- `procurement_type` (ENUM: `purchase`, `manufacture`)
- `procurement_strategy` (ENUM: `mts` [Make to Stock], `mto` [Make to Order])
- `sales_price` (DECIMAL 12,2), `cost_price` (DECIMAL 12,2)
- `on_hand_quantity` (DECIMAL 12,2) — Physical units in warehouse
- `reserved_quantity` (DECIMAL 12,2) — Units committed to confirmed Sales Orders
- `min_stock_level` (DECIMAL 12,2) — Safety stock threshold
- `reorder_quantity` (DECIMAL 12,2) — Recommended procurement replenishment batch size

#### 3. `boms` & `bom_items`
Bill of Materials specifying the engineering recipe for finished products.
- `boms`: `id` (UUID), `product_id` (FK $\to$ `products`), `name`, `quantity` (Output yield, e.g., 1 pcs), `is_active` (BOOLEAN).
- `bom_items`: `id` (UUID), `bom_id` (FK $\to$ `boms`), `component_id` (FK $\to$ `products`), `quantity` (Component units required per BOM output yield), `unit_of_measure`.

#### 4. `sales_orders` & `sales_order_items`
Customer demand lifecycle tracking.
- `sales_orders`: `id` (UUID), `order_number` (UNIQUE, e.g., `SO-2026-0001`), `customer_name`, `customer_email`, `status` (ENUM: `draft`, `confirmed`, `shortage_detected`, `ready`, `delivered`, `cancelled`), `order_date`, `expected_delivery`, `total_amount` (DECIMAL 14,2), `notes` (TEXT — includes parsed JSON shortage analysis).
- `sales_order_items`: `id` (UUID), `sales_order_id` (FK), `productId` (FK), `quantity_ordered`, `quantity_delivered`, `unit_price`.

#### 5. `purchase_orders` & `purchase_order_items`
Inbound supplier replenishment lifecycle.
- `purchase_orders`: `id` (UUID), `order_number` (UNIQUE, e.g., `PO-2026-0001`), `vendor_name`, `vendor_email`, `status` (ENUM: `draft`, `confirmed`, `partially_received`, `received`, `cancelled`), `total_amount`, `triggered_by_so_id` (FK $\to$ `sales_orders`, optional).
- `purchase_order_items`: `id` (UUID), `purchase_order_id` (FK), `product_id` (FK), `quantity_ordered`, `quantity_received`, `unit_cost`.

#### 6. `vendor_quotations` & `invoices`
Supplier procurement bidding and accounting records.
- `vendor_quotations`: `id`, `purchase_order_id` (FK), `vendor_name`, `total_amount`, `delivery_days`, `rating` (DECIMAL 3,2), `status` (`pending`, `selected`, `rejected`).
- `invoices`: `id`, `invoice_number` (UNIQUE, e.g., `INV-2026-784129`), `purchase_order_id` (FK), `vendor_name`, `amount`, `status` (`pending`, `verified`, `paid`).

#### 7. `manufacturing_orders`
Shop floor work orders.
- `id` (UUID), `order_number` (UNIQUE, e.g., `MO-2026-0001`), `product_id` (FK), `bom_id` (FK), `quantity_to_produce`, `quantity_produced`, `status` (ENUM: `draft`, `confirmed`, `in_progress`, `completed`, `cancelled`), `triggered_by_so_id` (FK $\to$ `sales_orders`), `actual_start`, `actual_end`, `notes`.

#### 8. `inventory_movements`
The immutable double-entry inventory ledger.
- `id` (UUID), `product_id` (FK), `movement_type` (ENUM: `purchase_receipt`, `sales_delivery`, `manufacturing_consume`, `manufacturing_produce`, `stock_adjustment`, `stock_reservation`, `reservation_release`, `stock_release`).
- `quantity` (DECIMAL), `direction` (+1 or -1)
- `quantity_before`, `quantity_after`, `reserved_before`, `reserved_after`
- `reference_so_id`, `reference_po_id`, `reference_mo_id`, `notes`, `created_by`.

#### 9. `audit_logs`
Enterprise compliance and tamper-evident event timeline.
- `id` (UUID), `user_id`, `user_name`, `user_role`, `action` (ENUM: `sales_order_confirmed`, `manufacturing_order_started`, etc.), `entity_type`, `entity_id`, `entity_name`, `old_values` (JSONB), `new_values` (JSONB), `created_at`.

---

### 3.3 Enumerations & System Constants

| Enum Name | Defined Values | Meaning & Usage |
|---|---|---|
| `UserRole` | `admin`, `product_manager`, `sales`, `purchase`, `inventory` | Core RBAC permission levels. |
| `ProductType` | `raw_material`, `finished_good` | Item classification in catalog. |
| `ProcurementType` | `purchase`, `manufacture` | Determines if item is bought via PO or built via MO. |
| `ProcurementStrategy` | `mts`, `mto` | Make-To-Stock vs Make-To-Order production trigger. |
| `SalesOrderStatus` | `draft`, `confirmed`, `shortage_detected`, `ready`, `delivered`, `cancelled` | Full sales pipeline state machine. |
| `PurchaseOrderStatus`| `draft`, `confirmed`, `partially_received`, `received`, `cancelled` | Procurement and receiving cycle. |
| `ManufacturingOrderStatus`| `draft`, `confirmed`, `in_progress`, `completed`, `cancelled` | Shop floor operational run state. |
| `MovementType` | `purchase_receipt`, `sales_delivery`, `manufacturing_consume`, `manufacturing_produce`, `stock_adjustment`, `stock_reservation`, `reservation_release`, `stock_release` | Inventory ledger transaction classification. |
| `AuditAction` | 26 Distinct Event Types | Granular activity tracking across all modules. |

---

### 3.4 The Inventory Ledger & Stock Mathematics

Every physical movement in ChainIQ must satisfy strict mathematical invariants. The platform never mutates inventory through unlogged direct table writes.

$$\text{Free Stock} = \max(0, \text{On-Hand Quantity} - \text{Reserved Quantity})$$

$$\text{New On-Hand} = \text{Old On-Hand} + (\text{Direction} \times \text{Quantity})$$

#### Ledger Invariants:
1. **Safety Floor**: $\text{On-Hand Quantity} \ge \text{Reserved Quantity} \ge 0$. Stock adjustments that would drop physical stock below current customer reservations are blocked with HTTP 400.
2. **Double-Entry Snapshots**: Every row in `inventory_movements` records `quantity_before`, `quantity_after`, `reserved_before`, and `reserved_after`, enabling exact historical reconstruction of warehouse balances at any timestamp.

---

## 4. Role-Based Access Control (RBAC) & Governance

### 4.1 Role Matrix & Workspace Permissions

| Workspace / API Category | Super Admin (`admin`) | Sales Executive (`sales`) | Product Manager (`product_manager`) | Procurement Mgr (`purchase`) | Inventory Manager (`inventory`) |
|---|:---:|:---:|:---:|:---:|:---:|
| **Dashboard & Action Center** | Full Access | Full Access | Full Access | Full Access | Full Access |
| **Products Catalog** | View / Create / Edit | View Only | View / Create / Edit | View Only | View Only |
| **Bill of Materials (BOM)** | View / Create / Edit | View Only | View / Create / Edit | No Access | No Access |
| **Sales Orders** | View / Create / Deliver | Full Access | View Only | View Only | View Only |
| **Manufacturing Orders** | Full Access | Trigger from SO | Approve / Start / Complete | View Only | View Only |
| **Procurement & RFQs** | Full Access | View Only | View Only | Full Access (RFQ / Confirm) | View Receipts |
| **Cargo Receipt Verification**| Full Access | No Access | No Access | No Access | Approve / Reject |
| **Inventory Movements Ledger** | Full Adjust / View | View Only | View Only | View Only | Full Adjust / View |
| **Audit Logs & System Users** | Full Access | No Access | No Access | No Access | No Access |
| **Onchain Supply Chain Intel**| Full Access | View Only | Scenarios & Blast-Radius | Full Access & Switching | Disruptions & Shipments |

---

### 4.2 Authentication Flow & Cookie Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant API as /api/auth/login
    participant Svc as AuthService
    participant DB as PostgreSQL
    participant Cookie as Cookie Jar

    User->>API: POST { email, password }
    API->>Svc: login(dto)
    Svc->>DB: findUnique(email)
    DB-->>Svc: User Record + password_hash
    Svc->>Svc: bcrypt.compare(password, hash)
    Svc->>Svc: Sign JWT Access Token (15m) + Refresh Token (7d)
    Svc-->>API: { user, accessToken, refreshToken }
    API->>Cookie: Set-Cookie: chainiq_token (HttpOnly, Secure, SameSite=Lax)
    API->>Cookie: Set-Cookie: chainiq_refresh_token (HttpOnly)
    API-->>User: HTTP 200 { success: true, user }
```

When an access token expires, the client calls `POST /api/auth/refresh`. The server validates the refresh token in the cookie, issues a fresh access token, and updates the cookie without requiring the user to re-type credentials.

---

### 4.3 In-Flight Role Switcher (Dev Sandbox)

To enable effortless verification of cross-role handoffs during development and demonstration, ChainIQ includes an in-flight **Role Sandbox Switcher** in the top navigation bar.
- Switching to `sales` updates the client session and triggers instant role re-rendering.
- All seeded demo users share the default password: `Admin@123`.

| Role | Seeded Default Email | Primary Responsibility |
|---|---|---|
| Super Admin | `admin@shivfurniture.com` | Enterprise oversight, audit logs, system users. |
| Sales Executive | `priya@shivfurniture.com` | Order taking, customer quotes, delivery dispatches. |
| Product Manager | `ravi@shivfurniture.com` | BOM recipes, manufacturing scheduling, line execution. |
| Procurement Manager | `amit@shivfurniture.com` | Supplier RFQ bidding, PO issuance, cost optimization. |
| Inventory Manager | `neha@shivfurniture.com` | Warehouse receipts, quality checks, stock adjustments. |

---

## 5. Core ERP Operational Workflows (Deep-Dive)

### 5.1 Flow 1: Sales Order Lifecycle, Stock Check & BOM Explosion

```mermaid
flowchart TD
    Start([Sales Rep Creates SO]) --> Draft[Status: 'draft']
    Draft --> ClickConfirm[Click 'Confirm Order']
    ClickConfirm --> CheckStock{Free Stock >= Ordered Qty?}
    
    CheckStock -- Yes --> ReserveFull[Reserve Full Qty in Products Table]
    ReserveFull --> LogResMv[Log Movement: 'stock_reservation']
    ReserveFull --> Ready[Status: 'ready']
    Ready --> Deliverable([Ready for Customer Dispatch])
    
    CheckStock -- No --> ReservePartial[Reserve Available Free Stock]
    ReservePartial --> ExplodeBOM[Explode Active BOM for Missing Qty]
    ExplodeBOM --> CalcShortage[Calculate Missing Components & Stock Gap]
    CalcShortage --> EmbedNotes[Inject JSON Shortage Analysis into SO Notes]
    CalcShortage --> ShortageStatus[Status: 'shortage_detected']
    ShortageStatus --> NotifyMO([Notify Product Manager for MO Trigger])
```

#### Detailed Execution Mechanics:
1. **Creation**: Sales Executive enters customer details and product lines. Status defaults to `draft`.
2. **Confirmation**: When `POST /api/sales/[id]/confirm` is called:
   - For each item, the server calculates: $\text{Free Qty} = \text{onHandQuantity} - \text{reservedQuantity}$.
   - **Case A: Zero Shortage**: The server reserves the ordered quantity, logs `stock_reservation` movements, and transitions status to `ready`.
   - **Case B: Shortage Detected**:
     - The server reserves whatever free quantity exists.
     - Calls `bomsService.explode(productId, shortageQty)`.
     - Multiplies component requirement ratios by the shortage quantity.
     - Compares component requirements against raw material stock.
     - Injects a structured `[Shortage Analysis]` JSON report directly into the Sales Order `notes` column.
     - Sets order status to `shortage_detected`.

---

### 5.2 Flow 2: Manufacturing Order Orchestration & Floor Execution

```mermaid
stateDiagram-v2
    [*] --> Draft : Created from SO Shortage
    Draft --> Confirmed : Product Manager Approves
    
    state Confirmed {
        [*] --> CheckingMaterials
        CheckingMaterials --> WAITING_FOR_PROCUREMENT : Missing Raw Materials
        CheckingMaterials --> READY_TO_START : All Components Available
    }

    WAITING_FOR_PROCUREMENT --> READY_TO_START : PO Received at Warehouse
    
    READY_TO_START --> InProgress : PM Starts MO (Assign Machine Line)
    note right of InProgress : Raw materials deducted from stock\nLog 'manufacturing_consume'
    
    InProgress --> Completed : PM Completes MO
    note right of Completed : Finished goods added to stock\nLog 'manufacturing_produce'\nAuto-reserve for linked SO
    
    Completed --> [*]
```

#### Detailed Execution Mechanics:
1. **Triggering**: In the Sales Order view, when an order is in `shortage_detected`, clicking **"Raise Manufacturing Request"** calls `POST /api/manufacturing` with `{ salesOrderId }`.
2. **Guardrails**: The server ensures no active MO already exists for this SO (`409 Conflict` prevention).
3. **Approval**: Product Manager reviews the order and clicks **"Approve"** (`POST /api/manufacturing/[id]/approve`). Status becomes `confirmed`.
4. **Dynamic Material Availability Mapping**:
   ```typescript
   // manufacturing.service.ts
   if (mo.status === 'confirmed') {
     const bomExplosion = await bomsService.explode(mo.productId, mo.quantityToProduce);
     const hasShortages = bomExplosion.materials.some((mat) => mat.shortage > 0);
     mo.status = hasShortages ? 'WAITING_FOR_PROCUREMENT' : 'READY_TO_START';
   }
   ```
5. **Start Production**: PM assigns machine line (e.g., `Assembly Line A`). Server:
   - Validates physical presence of components.
   - Deducts components from `products.onHandQuantity`.
   - Records `manufacturing_consume` movements in `inventory_movements`.
   - Updates status to `in_progress`.
6. **Completion**: PM clicks **"Complete"**. Server:
   - Increments finished goods `onHandQuantity`.
   - Logs `manufacturing_produce` movement.
   - **Auto-Reservation**: Immediately reserves the newly produced finished goods for the originating Sales Order (`stock_reservation`).
   - **Auto-Readiness**: Checks if all other linked MOs or POs for this SO are satisfied. If yes, automatically flips Sales Order status to `ready`!

---

### 5.3 Flow 3: Closed-Loop Procurement (RFQ, Bids, PO & Receipts)

```mermaid
sequenceDiagram
    autonumber
    actor PM as Procurement Manager
    actor IM as Inventory Manager
    participant PO as Purchase Service
    participant DB as PostgreSQL
    participant WH as Warehouse Stock

    PM->>PO: POST /api/purchase/[id]/rfq (Select Vendors)
    PO->>DB: Create Vendor Quotations (Pending Bids)
    PO-->>PM: RFQs Dispatched
    
    PM->>PO: POST /api/purchase/[id]/quotation (Select Winner)
    PO->>DB: Mark Quotation 'selected', other 'rejected'
    
    PM->>PO: POST /api/purchase/[id]/confirm
    PO->>DB: Generate Unique Invoice (INV-2026-XXXX)
    PO->>DB: Status: 'confirmed' (In-Transit)
    PO-->>IM: Alert: Inbound Shipment En Route
    
    IM->>PO: POST /api/purchase/[id]/receive { checkResult: 'approve' }
    PO->>WH: Increment Raw Material onHandQuantity
    PO->>DB: Log 'purchase_receipt' movement
    PO->>DB: Status: 'received', Invoice: 'verified'
    PO->>DB: Check Linked MOs -> Update to 'READY_TO_START'
```

#### Detailed Execution Mechanics:
1. **RFQ Bidding**: PM selects vendors (e.g., `Global Timber Ltd`, `Apex Fasteners Corp`). The system generates deterministic quotations with lead times and costs.
2. **Quotation Selection**: PM evaluates price vs delivery days and selects the optimal bid.
3. **PO Confirmation**: PM confirms the order. The system generates an official pending `Invoice` and dispatches notification CC to the Inventory Manager.
4. **Cargo Arrival & Quality Verification**:
   - The Inventory Manager inspects incoming packages.
   - **If Approved**: Raw material inventory is incremented, an immutable `purchase_receipt` ledger record is created, invoice is marked `verified`, and any waiting MOs are evaluated and updated to `READY_TO_START`.
   - **If Rejected**: PO is marked `cancelled`, reason is recorded in the notes and audit log, and Procurement is alerted.

---

### 5.4 Flow 4: Inventory Movements Ledger & Stock Adjustments

```mermaid
graph TD
    A[Inventory Action] --> B{Action Type}
    B -->|Manual Physical Count| C[POST /api/inventory/adjust]
    B -->|Manual Reservation| D[POST /api/inventory/reserve]
    B -->|Release Reservation| E[POST /api/inventory/release]
    
    C --> F{New On-Hand < Reserved?}
    F -->|Yes| G[Reject 400: Cannot breach active reservations]
    F -->|No| H[Update onHandQuantity + Log 'stock_adjustment']
    
    D --> I{Qty > Free Stock?}
    I -->|Yes| J[Reject 400: Insufficient free stock]
    I -->|No| K[Increment reservedQuantity + Log 'stock_reservation']
    
    E --> L{Qty > Reserved?}
    L -->|Yes| M[Reject 400: Cannot release unreserved stock]
    L -->|No| N[Decrement reservedQuantity + Log 'reservation_release']
```

Every ledger transaction maintains the immutable history required for audit certification, tax reporting, and operational traceability.

---

### 5.5 Flow 5: Order Dispatch & Delivery Fulfillment

When a Sales Order is `ready`:
1. Sales Executive reviews shipping manifest and clicks **"Deliver Order"** (`POST /api/sales/[id]/deliver`).
2. Server verifies that physical on-hand stock meets ordered requirements.
3. Physical stock is deducted: $\text{onHandQuantity} \leftarrow \text{onHandQuantity} - \text{quantityOrdered}$.
4. Reserved stock is cleared: $\text{reservedQuantity} \leftarrow \text{reservedQuantity} - \text{quantityOrdered}$.
5. Records `sales_delivery` in `inventory_movements` with `direction = -1`.
6. Sales Order status transitions to `delivered` with timestamp and actor tracking.

---

### 5.6 Flow 6: Cross-Entity Timeline Tracking & Immutable Audit Logs

The unified **Timeline Engine** (`/timeline`) reconstructs the chronological history of any business transaction across foreign keys:

$$\text{Timeline} = \text{AuditLogs} \cup \text{SalesOrder} \cup \text{ManufacturingOrders} \cup \text{PurchaseOrders} \cup \text{InventoryMovements}$$

Each event is classified into visual milestones:
- **Order Placed**: SO creation and item list.
- **Stock Evaluation & Shortage**: BOM explosion and shortage report.
- **Production Triggered**: MO draft and approval.
- **Procurement & RFQ**: PO issuance and vendor bidding.
- **Cargo Verified**: Inbound warehouse inspection.
- **Production Run**: Machine line start and completion.
- **Dispatch**: Final customer fulfillment.

---

## 6. AI Copilot & Operations Intelligence Engine

### 6.1 LangGraph Multi-Node State Machine

ChainIQ integrates a Python FastAPI service (`fastapi/`) running a stateful **LangGraph** execution pipeline:

```mermaid
flowchart LR
    Start([User Query]) --> RV[role_validator]
    RV --> TS[tool_selector]
    TS --> TE[tool_executor]
    TE --> RG[response_generator]
    RG --> End([Markdown Response])
```

1. **`role_validator`**: Clears previous validation errors and enforces role context.
2. **`tool_selector`**: Exposes *only* tools authorized for the user's role to the LLM (Groq Llama-3.3-70b-versatile). If a non-admin requests audit logs, returns `"UNAUTHORIZED"`.
3. **`tool_executor`**: Executes the approved SQL introspection tool against PostgreSQL.
4. **`response_generator`**: Synthesizes the database tool output into an operational recommendation.

---

### 6.2 Role-Aware SQL Tool Selection & Guardrails

| Tool Name | Scope & Function | Authorized Roles |
|---|---|---|
| `get_low_stock_products` | Queries items where `on_hand_quantity < min_stock_level`. | All Roles |
| `get_today_revenue` | Aggregates sum of delivered Sales Orders for today. | All Roles |
| `get_delayed_orders` | Identifies orders where `expected_delivery < CURRENT_DATE`. | All Roles |
| `get_pending_manufacturing` | Fetches active runs in `draft`, `confirmed`, `in_progress`. | All Roles |
| `get_pending_purchase_orders` | Queries POs awaiting supplier quotes or delivery. | All Roles |
| `business_health_score` | Computes live operational score (0–100) based on delays/shortages. | All Roles |
| `recommend_actions` | Ranks today's top operational priorities across departments. | All Roles |
| `get_audit_logs` | Queries recent tamper-evident transaction logs. | **Admin Only** |

---

### 6.3 Dynamic Operational Health Score Engine

The Operational Health Score (0–100) dynamically evaluates enterprise stability:

$$\text{Health Score} = 100 - \left(\frac{\text{Delayed SOs}}{\text{Total SOs}} \times 50\right) - (\text{Low Stock Shortages} \times 2)$$

Departmental sub-scores:
- **Inventory Score**: Weighted against safety stock breach ratios.
- **Manufacturing Score**: Deducts 12 points per delayed work order.
- **Procurement Score**: Deducts 15 points per delayed raw material PO.
- **Sales Score**: Deducts 10 points per delayed customer delivery SLA.

---

### 6.4 Next.js In-Memory Caching & Local Fallback Strategy

To ensure zero downtime when the Python microservice is restarting or unreachable:
1. **5-Minute In-Memory Cache**: AI insights are cached per role for 300 seconds.
2. **FastAPI Timeout Guard (600ms)**: If FastAPI does not respond within 600ms, the request aborts gracefully.
3. **60-Second Cooldown**: Prevents hammering an offline service.
4. **Deterministic Local Fallback Engine**: Next.js automatically executes rule-based inventory calculations and returns fully populated health score breakdowns, critical risks, and procurement suggestions.

---

## 7. The Onchain Insights Subsystem (Supply Chain Intelligence)

### 7.1 Architectural Overview & Zero ERP Regression Principle

The **Onchain Insights** module extends ChainIQ ERP with 12 specialized intelligence workspaces:
1. **Zero ERP Regression**: Core ERP tables, routes, and services remain completely untouched.
2. **Deterministic Transparency**: In mock mode, all metrics, radar dimensions, BFS blast-radius calculations, and cost-benefit trade-offs use deterministic rule-based algorithms. No false "AI/ML guaranteed savings" claims are made.
3. **Currency Standard**: All monetary values are strictly formatted in Indian Rupee (`₹` via `.toLocaleString('en-IN')`).
4. **Adapter Provider Architecture**: UI components consume `services/onchain-insights.api.ts` and `hooks/useOnchainInsights.ts`, completely decoupled from whether data comes from local synthetic models or live enterprise bridges.

---

### 7.2 The Adapter Provider Pattern (`mock` vs `api`)

```typescript
// frontend/services/onchain-insights.api.ts
const DATA_MODE = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_ONCHAIN_DATA_MODE || 'mock')
  : 'mock';

export const onchainInsightsApi = {
  getDashboard: async (filters: OnchainDashboardFilters) => {
    if (DATA_MODE === 'api') {
      // Connect to external microservice or live database
      const res = await api.get('/v1/enterprise/intelligence/dashboard', { params: filters });
      return res.data;
    }
    // Default: Next.js API route serving deterministic synthetic dataset
    const res = await api.get('/onchain-insights/dashboard', { params: filters });
    return res.data.data;
  },
};
```

---

### 7.3 Deep Dive: All 12 Workspaces & Workflows

#### Task 1: Executive Intelligence Command Center
- **Route**: `/onchain-insights`
- **Capabilities**: Top KPI strip (Active Disruptions, At-Risk Suppliers, Affected Orders, Avg Risk Score, Pending Approvals), Recharts Supplier Risk Distribution donut, 90-day Shipment Risk Trend area chart, affected materials list, and ranked recommended recovery actions.

#### Task 2: Supplier Qualification & 6D Radar Capability Scorecard
- **Routes**: `/onchain-insights/suppliers` and `/onchain-insights/suppliers/[id]`
- **Capabilities**: Filterable supplier directory with risk tiers, multi-supplier comparison drawer, and transparent 6-factor radar scorecard:
  - Delivery Reliability (25% weight)
  - Quality Rating (25% weight)
  - Lead Time Score (15% weight)
  - Capacity Score (15% weight)
  - Financial Stability (10% weight)
  - Compliance Score (10% weight)

#### Task 3: Multi-Step Supplier Onboarding & Document Verification
- **Routes**: `/onchain-insights/suppliers/onboard` and `/onchain-insights/suppliers/[id]/review`
- **Capabilities**: 4-step supplier registration wizard, document verification checklist (Tax, Quality, Environmental, Compliance), status transition history, and formal approval/rejection queue.

#### Task 4: Supplier Switching Simulator (Retain vs Split vs Full Switch)
- **Route**: `/onchain-insights/supplier-switch`
- **Capabilities**: Dynamic scenario simulator comparing three strategic paths:
  1. **Retain Current**: Baseline costs and lead times.
  2. **Dual-Source Split (e.g., 60/40)**: Balances transition overhead with risk mitigation.
  3. **Full Switch**: Maximum risk reduction with one-time switching costs.
  Features real-time recalculation upon slider adjustments.

#### Task 5: SKU Transition Planning & 12-Week Crossover Modeling
- **Route**: `/onchain-insights/sku-transition`
- **Capabilities**: Models product phase-in / phase-out decisions across 12 weeks:
  - Visual crossover curves showing old-SKU inventory depletion vs new-SKU ramp-up.
  - Three distinct strategies: **Aggressive** (rapid phase-out, higher stockout risk), **Balanced** (optimal service level), and **Conservative** (zero stockout risk, slight scrap carrying cost).

#### Task 6: Real-time Disruption Signals & Freight Shipment Tracker
- **Routes**: `/onchain-insights/disruptions` and `/onchain-insights/disruptions/[id]`
- **Capabilities**: 16 categorized disruption events (Weather, Port Congestion, Supplier Incident, Geopolitical) with state machine transitions (`Detected` $\to$ `Assessing` $\to$ `Mitigation Proposed` $\to$ `Executed` $\to$ `Resolved`), plus multimodal freight tracking (Maritime, Road, Rail, Air) with live milestone checkpoints.

#### Task 7: Explainable 5-Factor Risk Prioritization & Weight Sensitivity
- **Route**: `/onchain-insights/risk-assessment`
- **Capabilities**: Prioritizes suppliers using a deterministic 5-factor scoring model:
  - Delivery History (30%)
  - Active Disruption Exposure (25%)
  - Geographic Risk (20%)
  - Financial Stability (15%)
  - Compliance Audit (10%)
  Includes an interactive weight-tuning drawer with instant sensitivity recalculations and plain-language root-cause narratives.

#### Task 8: Multi-Tier Dependency Explorer & BFS Blast-Radius Graph
- **Route**: `/onchain-insights/dependencies`
- **Capabilities**: Full-canvas interactive node-edge graph built with `@xyflow/react` (React Flow).
  - Node types: Tier-2 Sub-suppliers $\to$ Tier-1 Suppliers $\to$ Raw Materials $\to$ Manufacturing Plants $\to$ Finished SKUs $\to$ Customer Sales Orders.
  - **Breadth-First Search (BFS) Blast-Radius**: Clicking any disrupted node traces downstream dependency paths, highlighting all affected materials, plants, products, and calculating exact ₹ revenue exposed.

#### Task 9: Mitigation Scenario Lab & Trade-Off Matrix
- **Route**: `/onchain-insights/mitigation`
- **Capabilities**: Evaluates recovery options for active disruptions across 5 strategies:
  - Alternate Sourcing
  - Expedited Freight
  - Inventory Rebalance (Inter-hub transfer)
  - Safety Stock Drawdown
  - Split Procurement
  Includes cost-vs-recovery time trade-off scatter matrix and inline assumption adjusters.

#### Task 10: Human Approval Governance & Action Audit Trail
- **Routes**: `/onchain-insights/approvals` and `/onchain-insights/approvals/[id]`
- **Capabilities**: Two-party governance queue for high-consequence operational decisions (mitigation plans, supplier switches, buffer overrides). Features complete decision review, simulated execution checklists, and tamper-evident audit history.

#### Task 11: Stakeholder Alerts & Notification Center
- **Route**: `/onchain-insights/notifications`
- **Capabilities**: Centralized notification inbox linked to topbar bell badge with unread counters, category filtering (Risk Spike, Transit Delay, Approval Request, Recommendation, SKU Crossover), and deep links directly to relevant records.

#### Task 12: Outcome Analytics, SLA Recovery & 5-Whys Post-Mortem Lab
- **Route**: `/onchain-insights/analytics`
- **Capabilities**: Analyzes historical disruptions, recovery days vs target SLAs, and net benefit ROI. Includes a structured **5-Whys Root Cause Post-Mortem** submission form and recurring risk cluster identification.

---

## 8. End-to-End Walkthrough Scenario: "The Teak Dining Table Journey"

To see all pieces functioning together, follow this realistic walkthrough:

```
[Customer Orders 50 Tables]
           │
           ▼
[Sales Order Confirmed: SO-2026-0042]
           │
           ▼
[Stock Check: 10 on-hand, 40 Shortage]
           │
           ▼
[BOM Exploded: Missing 160 Teak Legs, 640 Screws]
           │
           ▼
[MO-2026-0019 Created: Status WAITING_FOR_PROCUREMENT]
           │
           ▼
[PO-2026-0081 Created: RFQ Sent to 3 Suppliers]
           │
           ▼
[Global Timber Quote Selected @ ₹3,20,000]
           │
           ▼
[PO Confirmed -> Inbound Cargo Arrives]
           │
           ▼
[Inventory Inspection Approved -> Stock Updated]
           │
           ▼
[MO-2026-0019 Flips to READY_TO_START]
           │
           ▼
[Production Started on Line B -> Raw Materials Consumed]
           │
           ▼
[Production Completed -> 40 Tables Produced & Auto-Reserved]
           │
           ▼
[Sales Order SO-2026-0042 Automatically Flips to READY]
           │
           ▼
[Sales Rep Dispatches Delivery -> Physical Stock Deducted]
           │
           ▼
[Audit Log Recorded & Health Radar Score Updates to 98%]
```

1. **Order Intake**: Priya (Sales) enters an order for 50 Teak Dining Tables (`FG-WDT-001`) @ ₹18,500 each. Total: ₹9,25,000.
2. **Stock Check & Shortage**: Warehouse has 10 free units. The server reserves 10 units. Shortage of 40 units is detected.
3. **BOM Explosion**: Active recipe specifies 4 legs and 16 screws per table. Shortage: 160 Teak Legs (`RM-WL-001`) and 640 Screws (`RM-SC-001`). Analysis report is injected into SO notes; status becomes `shortage_detected`.
4. **Production Scheduling**: Priya raises a manufacturing request. MO `MO-2026-0019` is created in `draft`. Ravi (Product Manager) approves it. Because raw materials are missing, status maps dynamically to `WAITING_FOR_PROCUREMENT`.
5. **Procurement Bidding**: Amit (Procurement) views draft PO `PO-2026-0081` and sends RFQs. Quotes arrive from 3 suppliers. Amit selects `Global Timber Ltd` (₹3,20,000, 4 days delivery). PO is confirmed; invoice `INV-2026-5821` is generated.
6. **Receipt Verification**: 4 days later, cargo arrives. Neha (Inventory) inspects and approves the receipt. Raw materials increment in inventory. MO `MO-2026-0019` updates automatically to `READY_TO_START`.
7. **Shop Floor Execution**: Ravi starts MO on `Assembly Line B`. Raw materials are consumed. Upon completion, 40 finished tables increment in stock and are **immediately reserved** for `SO-2026-0042`.
8. **Automated SO Readiness**: With all 50 tables now reserved, `SO-2026-0042` transitions automatically to `ready`.
9. **Dispatch**: Priya clicks "Deliver". 50 tables are dispatched. Reservations clear. Immutable audit log records completion. Enterprise Health Score radar updates to 98%.

---

## 9. Development, Environment & Production Readiness Guide

### Environment Configuration (.env)

```bash
# PostgreSQL Database (Supabase)
DATABASE_URL="postgresql://postgres.[ref]:[pwd]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[pwd]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Authentication
JWT_SECRET="super-secret-jwt-key-min-32-chars-for-chainiq-erp"
JWT_REFRESH_SECRET="super-secret-jwt-refresh-key-min-32-chars-for-chainiq-erp"

# AI Copilot & FastAPI Service
FASTAPI_URL="http://localhost:8000"
GROQ_API_KEY="gsk_..."

# Supply Chain Intelligence Mode (mock or api)
NEXT_PUBLIC_ONCHAIN_DATA_MODE="mock"
```

### Starting the Local Development Stack

1. **Database Setup**:
   ```bash
   cd frontend
   npm install
   npx prisma db push
   npx prisma db seed # (or execute database/seed.sql in Supabase SQL editor)
   ```
2. **Start Next.js Client & Backend**:
   ```bash
   cd frontend
   npm run dev # Launches on http://localhost:3000
   ```
3. **Start FastAPI Copilot Engine (Optional for AI queries)**:
   ```bash
   cd fastapi
   pip install -r requirements.txt
   python main.py # Launches on http://localhost:8000
   ```

### Enterprise Production Checklist
- **Database Connection Pooling**: Ensure `pgbouncer=true` is enabled in `DATABASE_URL` with transaction pooling mode to support thousands of concurrent serverless route handler requests.
- **Strict HTTPS**: Ensure `NODE_ENV=production` so auth cookies enforce `Secure: true`.
- **Database Backups**: Enable continuous Point-in-Time Recovery (PITR) on PostgreSQL.
- **Monitoring**: Inspect `/api/health` and FastAPI `/health` using uptime monitoring services.
