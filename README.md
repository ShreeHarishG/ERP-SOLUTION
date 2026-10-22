# ChainIQ ERP: Enterprise Operations Control System

### _Operational Intelligence & Decoupled Decision Orchestration for Modern Manufacturers_

ChainIQ ERP is an enterprise-grade Operations Control System (OCS) designed specifically for custom and batch-assembly manufacturers. It replaces disjointed spreadsheets, paper logs, and manual coordination with a unified, real-time transaction and decision-intelligence network. By automatically syncing customer sales velocity with shop floor scheduling, bill-of-materials explosion, raw material shortages detection, and procurement RFQ workflows, ChainIQ ensures maximum margin protection and zero material stockouts.

---

## Vision & Industry Context

### Why ChainIQ Exists

Traditional ERP solutions—like legacy SAP, Oracle are notoriously complex data graveyards. They are retrospectively input-heavy, recording transaction history _after_ delays or stockouts have already disrupted the floor. For medium-sized manufacturers (such as furniture works, machinery fabricators, and assembly plants), a single missing screw, panel, or varnish coat can stall a machine line, freeze work-in-progress (WIP) capital, and lead to missed delivery SLAs.

ChainIQ ERP introduces the concept of **active business routing**. Instead of waiting for weekly audits, the platform executes real-time transactional checks at every step of the order lifecycle:

1. **Predictive Dependency Allocation**: Prevents double-allocating free inventory.
2. **Immediate BOM Material Explosion**: Determines material shortages at the exact second a Sales Order is confirmed.
3. **Closed-Loop Procurement**: Bridges shortages directly to automated, competitive supplier RFQs and receipts quality verification.

### Business Value Metrics

- **Lead-Time Reduction**: Shrinks the sales-to-manufacturing release cycle from weeks to minutes.
- **WIP Cost Control**: Minimizes holding costs by procuring raw components on a Make-to-Order (MTO) or strict safety stock replenishment schedule.
- **Margin Safeguards**: Side-by-side vendor quotation evaluations lock in the lowest cost materials.
- **Regulatory Compliance**: Retains a non-repudiable audit trail of every record creation, status change, and inventory adjustment.

---

## System Architecture

ChainIQ ERP uses a **decoupled transaction and intelligence architecture**. Crucial database mutations and ledger adjustments are processed in a highly secure, transaction-safe Next.js server environment. Meanwhile, operational intelligence analysis, NLP chat interactions, and predictive reorder calculations are offloaded to a FastAPI service running a LangGraph-state reasoning pipeline.

```
+-----------------------------------------------------------------------------------+
|                               NEXT.JS WEB CLIENT
+────────────────────────────────────────┬──────────────────────────────────────────+
                                         │
                        (Secured JSON REST / Cookie Auth)
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                              NEXT.JS ROUTE HANDLERS                               |
|  - Location: /app/api/...                                                         |
|  - RBAC API guards (requireRole)                                                  |
|  - Business Logic Services Layer (/lib/server/modules)                            |
|  - ORM Layer: Prisma Client                                                       |
+────────────────────────────────────────┬──────────────────────────────────────────+
                                         │
                         (ACID Transaction Commits & Reads)
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                        POSTGRESQL DATABASE (SUPABASE)                             |
|  - 11 tables, custom database constraints, composite performance indices           |
+────────────────────────────────────────▲──────────────────────────────────────────+
                                         │
                       (Direct SQLAlchemy Query Execution)
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                            FASTAPI INTELLIGENCE ENGINE                            |
|  - LangGraph Stateful Agent Workflow                                              |
|  - LLM: Groq Llama-3.3-70b-versatile                                              |
|  - Structured JSON Dashboard Insights Gateway                                     |
+-----------------------------------------------------------------------------------+
```

### Core Architecture Flow

1. **UI Layer**: React Server and Client Components render responsive dashboard panels. Client-side caching and mutations are managed by **TanStack Query**, reducing duplicate API calls.
2. **Security & Session Layer**: Verification middleware validates stateless HTTP-only JWT cookies before requests reach API route handlers.
3. **Prisma ORM Layer**: Interacts with PostgreSQL using connection-pooled transaction pipelines. Multi-table inserts (e.g. Sales Order & Sales Order Items) are wrapped in atomic transactions.
4. **FastAPI Agent Gateway**: The Next.js API layer compiles a live context JSON string representing KPIs, active runs, and shortages. It POSTs this context to FastAPI's `/api/insights` endpoint. This design eliminates direct database exposure by the AI engine, ensuring data security.
5. **LangGraph Agent Workflow**: The FastAPI agent processes natural language user queries, selects authorized SQL tools, validates user permissions based on user role variables, and returns markdown-formatted answers.

---

## Technology Stack

| Technology                  | Layer                | Reason for Selection                                                                                                                                        |
| :-------------------------- | :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js 15 (App Router)** | Client & Backend API | Provides server-side rendering (SSR) for fast initial loads, a unified App Router structure, and serverless API endpoints that secure database credentials. |
| **FastAPI (Python 3.11)**   | Intelligence Engine  | Lightweight, highly performant async framework. Python is the industry standard for AI orchestration libraries like LangChain and LangGraph.                |
| **Prisma ORM**              | Data Mapper          | Type-safe schema definitions, automated migrations, and an intuitive API for executing transactions.                                                        |
| **PostgreSQL (Supabase)**   | Relational Storage   | Supports strict foreign key constraints, JSONB column types for flexible audit logs, and composite index optimization.                                      |
| **TanStack Query v5**       | State Management     | Minimizes state synchronization code by handling API cache invalidation, loading states, error boundaries, and background updates.                          |
| **LangGraph / LangChain**   | AI Agent Routing     | Enables stateful multi-agent pipelines with role validation, tool selection, and LLM retry logic.                                                           |
| **Groq (Llama-3.3-70b)**    | Large Language Model | Provides low-latency inference, ensuring the AI Assistant responds within sub-second thresholds.                                                            |
| **Tailwind CSS**            | Styling System       | Speeds up UI layout construction using utility classes while remaining compatible with standard Vanilla CSS variables.                                      |

---

## Module Breakdown

### 1. Dashboard & Action Center

- **Purpose**: Consolidated enterprise command center.
- **Responsibilities**: Displays real-time operational metrics, alerts for low stock levels, pending purchase and manufacturing orders, and AI-driven business health ratings. Includes the **Action Center**, providing quick shortcuts to create sales orders, adjust stock levels, or toggle user roles.
- **Target Users**: Admins, Executives, Department Leads.
- **Inputs**: Query results from sales, inventory, and production tables.
- **Outputs**: KPI counts, inventory value aggregates, health score radar points, activities feed.
- **Business Impact**: Delivers immediate visibility into critical issues (e.g. "3 sales orders delayed, 2 raw materials below safety limits").

### 2. Products Catalog

- **Purpose**: Stores finished goods and raw materials master records.
- **Responsibilities**: Manages inventory targets (`minStockLevel`, `reorderQuantity`), cost prices, sales prices, and procurement parameters (`procurementType`, `procurementStrategy`).
- **Target Users**: Product Manager, Procurement Mgr, Inventory Manager, Sales Executive.
- **Inputs**: SKU details, description, standard costing inputs.
- **Outputs**: Inventory balance snapshots (On-hand, Reserved, Free).
- **Database Tables**: [`products`](file:///c:/ChainIQ-ERP/frontend/prisma/schema.prisma#L132-L167)
- **APIs**: `GET /api/products`, `POST /api/products`
- **Business Impact**: Forms the core data records for costing, production recipes, and sales lines.

### 3. Bill of Materials (BOM)

- **Purpose**: Stores recipes and components list for assembly items.
- **Responsibilities**: Scales material quantities based on finished product quantities, checks component availability, and explodes recipes to detail shortages.
- **Target Users**: Product Manager, Admin.
- **Inputs**: Component IDs, component standard quantities, unit of measure, notes.
- **Outputs**: Component requirement checklist, shortage analysis reports.
- **Database Tables**: [`boms`](file:///c:/ChainIQ-ERP/frontend/prisma/schema.prisma#L169-L187), [`bom_items`](file:///c:/ChainIQ-ERP/frontend/prisma/schema.prisma#L189-L205)
- **APIs**: `GET /api/boms`, `POST /api/boms`, `POST /api/boms/[id]/explode`
- **Business Impact**: Prevents production scheduling when raw material quantities are incorrect.

### 4. Sales Orders

- **Purpose**: Sales pipeline and order execution management.
- **Responsibilities**: Calculates order prices, reserves ready finished goods, initiates shortage reports, and dispatches production requests when products are missing.
- **Target Users**: Sales Executive, Admin.
- **Inputs**: Customer contact info, order lines (product, quantity, unit price), delivery dates.
- **Outputs**: Sales Order tracking records, stock reservation events.
- **Database Tables**: [`sales_orders`](file:///c:/ChainIQ-ERP/frontend/prisma/schema.prisma#L207-L238), [`sales_order_items`](file:///c:/ChainIQ-ERP/frontend/prisma/schema.prisma#L240-L255)
- **APIs**: `GET /api/sales`, `POST /api/sales`, `POST /api/sales/[id]/confirm`, `POST /api/sales/[id]/deliver`, `POST /api/sales/[id]/cancel`
- **Business Impact**: Secures inventory reservation at the point of sale, preventing double-selling.

### 5. Manufacturing Orders (MO)

- **Purpose**: Factory floor scheduling and component consumption control.
- **Responsibilities**: Tracks work orders, monitors component availability, consumes raw materials from stock, and creates finished goods.
- **Target Users**: Product Manager, Admin.
- **Inputs**: Target product ID, quantity to produce, machine line assignment.
- **Outputs**: Work orders (draft, confirmed, in-progress, completed), consumed raw materials movements, produced finished goods.
- **Database Tables**: [`manufacturing_orders`](file:///c:/ChainIQ-ERP/frontend/prisma/schema.prisma#L309-L337)
- **APIs**: `GET /api/manufacturing`, `POST /api/manufacturing/create-from-so`, `POST /api/manufacturing/[id]/approve`, `POST /api/manufacturing/[id]/start`, `POST /api/manufacturing/[id]/complete`
- **Business Impact**: Coordinates floor schedules, logs machine runs, and records component yields.

### 6. Procurement & Receipts

- **Purpose**: Raw material vendor management, RFQ bidding, and invoice auditing.
- **Responsibilities**: Raises purchase requests, sends RFQs, stores vendor quotations, compares pricing and lead times, creates pending vendor invoices, and records receipts.
- **Target Users**: Procurement Mgr, Inventory Mgr, Admin.
- **Inputs**: Required components, selected vendor bids, cargo check approvals.
- **Outputs**: Purchase Orders, Quotations list, verified incoming components, verified Invoices.
- **Database Tables**: [`purchase_orders`](file:///c:/ChainIQ-ERP/frontend/prisma/schema.prisma#L257-L290), [`purchase_order_items`](file:///c:/ChainIQ-ERP/frontend/prisma/schema.prisma#L292-L307), [`vendor_quotations`](file:///c:/ChainIQ-ERP/frontend/prisma/schema.prisma#L405-L421), [`invoices`](file:///c:/ChainIQ-ERP/frontend/prisma/schema.prisma#L423-L436)
- **APIs**: `GET /api/purchase`, `POST /api/purchase/create`, `POST /api/purchase/[id]/rfq`, `POST /api/purchase/[id]/select-quotation`, `POST /api/purchase/[id]/confirm`, `POST /api/purchase/[id]/receive`
- **Business Impact**: Lowers raw component acquisition costs and prevents manufacturing delays.

### 7. Inventory Movements & Ledger

- **Purpose**: Central ledger tracking stock levels.
- **Responsibilities**: Records all stock transactions, manages manual adjustments, and details reserved quantities.
- **Target Users**: Inventory Manager, Admin.
- **Inputs**: Manual adjust values, transactional receive/produce/consume counts.
- **Outputs**: Real-time stock counts, stock ledger logs.
- **Database Tables**: [`inventory_movements`](file:///c:/ChainIQ-ERP/frontend/prisma/schema.prisma#L339-L368)
- **APIs**: `GET /api/inventory`, `POST /api/inventory/adjust`
- **Business Impact**: Ensures accurate warehouse records, traces component usage, and simplifies stock audits.

### 8. Audit Logs

- **Purpose**: Immutable activity logging for security and compliance.
- **Responsibilities**: Records system events with snapshots of modified values.
- **Target Users**: Super Admin.
- **Inputs**: Log events, user context payloads.
- **Outputs**: Read-only timeline audits.
- **Database Tables**: [`audit_logs`](file:///c:/ChainIQ-ERP/frontend/prisma/schema.prisma#L370-L392)
- **APIs**: `GET /api/audit`
- **Business Impact**: Prevents operator fraud and logs system state history.

---

## User Roles & Access Control

ChainIQ ERP implements Role-Based Access Control (RBAC). Both the API route handlers and UI routes enforce these permissions based on the active JWT role payload.

| User Role             | Workspace Permissions | Scope of Responsibility                                                                                                   | Seeded Default User       |
| :-------------------- | :-------------------- | :------------------------------------------------------------------------------------------------------------------------ | :------------------------ |
| **Super Admin**       | `admin`               | Full system access: users creation, system parameters, audit log viewing, database resets.                                | `admin@shivfurniture.com` |
| **Sales Executive**   | `sales`               | `/sales`, `/products`, `/timeline`, `/action-center`                                                                      | `priya@shivfurniture.com` |
| **Product Manager**   | `product_manager`     | `/bom`, `/manufacturing`, `/products`, `/timeline`, `/action-center`                                                      | `ravi@shivfurniture.com`  |
| **Procurement Mgr**   | `purchase`            | `/procurement`, `/vendors`, `/products`, `/timeline`, `/action-center`                                                    | `amit@shivfurniture.com`  |
| **Inventory Manager** | `inventory`           | `/inventory`, `/inventory/ledger`, `/procurement` (receipt verification only), `/products`, `/timeline`, `/action-center` | `neha@shivfurniture.com`  |

---

## End-to-End Business Workflow

The central business workflow tracks an order through sales, product planning, procurement, inventory receipt, manufacturing, and delivery:

```
[Customer Request] ──► [Sales: Draft SO] ──► [Confirm & Check Stock]
                                                     │
                                                     ├─► (Ready) ───────────┐
                                                     │                      │
                                                     └─► (Shortage)         │
                                                             │              │
                                                             ▼              ▼
[Complete Delivery] ◄── [Complete MO] ◄── [Approve MO] ◄── [Confirm Receipt] ◄── [RFQ/PO confirmed]
```

### 1. Customer Request to Sales Order Check

- **Role**: Sales Executive (`priya@shivfurniture.com`).
- **Workflow**: Enters a customer order. The system checks standard warehouse stock:
  $$\text{Free Quantity} = \text{On-Hand Quantity} - \text{Reserved Quantity}$$
- **Stock Check Options**:
  - _All Available_: Order updates to `ready`, allocating stock.
  - _Shortage Detected_: Reserves available stock, updates status to `shortage_detected`, explodes the BOM to evaluate missing components, and logs details in order notes.

### 2. Production Demand Analysis

- **Role**: Product Manager (`ravi@shivfurniture.com`).
- **Workflow**: Creates a manufacturing order for the shortage. If raw materials are missing (e.g. table legs or timber boards), the system flags the MO as `WAITING_FOR_PROCUREMENT` and creates a draft PO.

### 3. Procurement & Quotations Evaluation

- **Role**: Procurement Manager (`amit@shivfurniture.com`).
- **Workflow**: Verifies the draft PO and clicks "Send RFQ" to vendors. The system generates bids with delivery estimates. Amit compares quotes, selects a vendor, and confirms the PO, creating a pending vendor Invoice.

### 4. Quality Inspection & Stocking

- **Role**: Inventory Manager (`neha@shivfurniture.com`).
- **Workflow**: Receives the supplier cargo. Checks the package counts and details. Approves the receipt, increasing raw material stock and updating the linked MO status to `READY_TO_START`.

### 5. Shop Floor Production Run

- **Role**: Product Manager (`ravi@shivfurniture.com`).
- **Workflow**: Launches the MO on an active machine line. Raw material quantities are deducted, and once assembly is complete, Ravi clicks "Complete". Finished goods stock increases and is reserved for the sales order, which automatically updates to `ready`.

### 6. Delivery Dispatch

- **Role**: Sales Executive (`priya@shivfurniture.com`).
- **Workflow**: Priya sees the sales order status is `ready` and clicks "Deliver". Finished goods are dispatched to the customer, and reservations are cleared.

---

## Data Flow Architecture

This model outlines the system's database write actions, showing the flow from user action to UI update:

```
User Action on UI  ──►  TanStack Mutation  ──►  API Route Guard  ──►  Service Layer
                                                                          │
                                                                          ▼
UI Re-renders  ◄──  Cache Invalidation  ◄──  Success Response  ◄──  DB Transaction
```

1. **User Action**: The user submits a form (e.g., procurement receipt verification).
2. **TanStack Mutation**: React triggers a TanStack query mutation hook, converting state to a JSON payload.
3. **API Route Guard**: Verification middleware validates the JWT token cookie and ensures the user role has write permissions.
4. **Service Layer**: The request is routed to the service layer, which wraps database mutations in a Prisma `$transaction` block to guarantee transaction safety.
5. **Database Transaction**: PostgreSQL writes the changes, updating records and log lines.
6. **Success Response**: The service layer triggers an audit log entry and returns the updated database objects.
7. **Cache Invalidation**: TanStack Query invalidates cache keys, prompting background queries to fetch fresh database state.
8. **UI Re-render**: Responsive dashboard widgets re-render with updated values, reflecting the changes.

---

## Smart Intelligence Features

### 1. Bill of Materials Explosion

- **Input**: Product ID, required production quantity.
- **Processing**: Fetches the active BOM. Multiplies component quantities by the production quantity, checks current stock levels, and calculates the exact shortage for each component.
- **Output**: A shortage report showing needed, available, and missing component values.
- **Business Value**: Prevents releasing work orders when components are missing, avoiding factory floor bottlenecks.

### 2. Safety Stock Replenishment Predictions

- **Input**: Product SKU, current free quantity.
- **Processing**: Estimates replenishment urgency using average consumption rates.
- **Output**: Urgent reorder recommendations.
- **Business Value**: Recommends replenishment quantities before stock levels breach safety thresholds.

### 3. Business Timeline tracking

- **Input**: Sales Order ID, linked manufacturing, procurement, and inventory records.
- **Processing**: Links operations records to build a chronological timeline.
- **Output**: A step-by-step visual tracker highlighting bottlenecks.
- **Business Value**: Identifies delayed operations and department accountability.

---

## Security Architecture

```
[Secure HTTP-Only Cookies]  ──►  [JWT Verification Middleware]  ──►  [API Route Guards]
                                                                             │
                                                                             ▼
[PostgreSQL Database]  ◄──  [ACID Transactions (Prisma)]  ◄──  [Audit Logging Hook]
```

- **Authentication**: Users log in via `/api/auth/login`. Sessions are managed using stateless JWTs stored in secure, HTTP-only cookies to prevent cross-site scripting (XSS) attacks.
- **API Guards**: API routes restrict access using middleware role validation:
  ```typescript
  const result = await requireRole("admin", "purchase");
  if (result instanceof Response) return result; // Blocks unauthorized access
  ```
- **Database Transactions**: Prisma transactions verify stock levels before database mutations, preventing double-selling or incorrect adjustments.
- **Access Control Sandbox**: Includes a test role switcher in development mode, allowing developers to switch roles instantly and test user journeys with the password `Admin@123`.

---

## Audit & Compliance Log System

ChainIQ records database mutations in the `audit_logs` table.

### What is Recorded

Each entry captures:

- **User Context**: `userId`, `userName`, `userRole`.
- **Action Type**: Event classification (e.g., `sales_order_confirmed`, `stock_adjusted`).
- **Target Entity**: Entity category (`entityType`, `entityId`, `entityName`).
- **Value Snapshot**: Pre-change (`oldValues`) and post-change (`newValues`) states stored in JSONB format.

### Why it Matters

- **Operator Traceability**: Tracks inventory write actions to specific users, reducing mistakes and human error.
- **System Traceability**: Logs automatic updates, showing when shortages were resolved or BOMs exploded.
- **Regulatory Compliance**: Retains historical record changes, simplifying security audits.

---

## Dashboard Analytics & KPIs

```
  ┌──────────────────────────────────────────────────────────┐
  │                   EXECUTIVE DASHBOARD                    │
  ├──────────────────────────────────────────────────────────┤
  │   Total Inventory Value          Operational Health      │
  │   [ ₹8,45,200.00 ]               [ 91% radar score ]     │
  ├──────────────────────────────────────────────────────────┤
  │   Procurement Risks              Manufacturing Runs      │
  │   [ 2 low stock alerts ]         [ 3 runs in-progress ]  │
  └──────────────────────────────────────────────────────────┘
```

The unified Executive Dashboard displays:

- **Operational Health Score**: Dynamically evaluates business health, showing performance indexes for Sales, Manufacturing, Procurement, and Inventory.
- **Total Inventory Valuation**: Calculates total stock value:
  $$\text{Total Valuation} = \sum (\text{On-Hand Quantity} \times \text{Standard Cost Price})$$
- **Recent Activity Feed**: Lists latest system transactions from the audit log.
- **Replenishment Recommendations**: Displays AI-driven vendor suggestions, estimated lead times, and recommended order quantities.

---

## Scalability & Enterprise Readiness

ChainIQ ERP is structured to scale:

- **Connection Pooling**: Uses connection poolers (e.g. pgBouncer) to handle database connections.
- **Database Indexing**: Performance indexes are placed on frequently queried columns (`sku`, `role`, `status`, `referenceSoId`), keeping query execution times low under heavy load.
- **Query Caching**: TanStack Query manages client-side caching, minimizing duplicate database queries.
- **Stateless Operations**: Next.js serverless functions and FastAPI are stateless, allowing them to be scaled horizontally across container networks (e.g., Kubernetes).

---

## Development Architecture & Codebase Design

The codebase uses a clean, service-oriented structure:

```
frontend/
├── app/
│   ├── (auth)/             # Authentication pages
│   ├── (dashboard)/        # Main business pages
│   └── api/                # REST API route handlers
├── components/             # Reusable UI components
├── hooks/                  # TanStack Query query/mutation hooks
├── lib/server/
│   ├── modules/            # Service layers (CRUD & business logic)
│   └── utils/              # Helper utilities
├── prisma/                 # Database schema & seed configurations
└── services/               # API clients
```

### Key Design Patterns

- **Service Layer Pattern**: Database logic is isolated inside class files (e.g., [`SalesService`](file:///c:/ChainIQ-ERP/frontend/lib/server/modules/sales/sales.service.ts)), separating business rules from API route endpoints.
- **Transactional Safety**: Prisma transactions protect write actions, rolling back mutations if an error occurs.
- **API clients separation**: Next.js pages interact with APIs via dedicated services, keeping page code clean and testable.

---

## Future Roadmap

1. **Active IoT Sensor Tracking**: Integrate with machine sensors to log equipment efficiency (OEE) and track wear on the factory floor.
2. **Automated Supplier Integrations**: Link with third-party logistics (3PL) and vendor APIs to sync shipping status and tracking numbers.
3. **Advanced Forecast Engines**: Use machine learning models to analyze sales history and predict material demand.
4. **Multi-Tenant Architecture**: Scale the platform into a multi-tenant software-as-a-service (SaaS) product.

---

## Competitive Advantages

1. **Active Decision Network**: Automates the sales, planning, and procurement chain, reducing manual steps.
2. **Built-in Intelligent Assistance**: Decoupled FastAPI and LangGraph pipelines calculate health ratings and offer operational recommendations.
3. **End-to-End Operational Traceability**: Connects inventory movements, sales orders, and manufacturing steps in a single timeline.
4. **Optimized User Experience**: Premium design features slide-up animations and a built-in sandbox switcher to test user workflows easily.

---

## Conclusion

ChainIQ ERP changes how manufacturers manage operations. Rather than acting as a static database of past events, the platform integrates sales, planning, procurement, and assembly in an automated, closed-loop workflow. Leveraging Next.js transaction safety, PostgreSQL relatiability, and LangGraph intelligence, ChainIQ ERP acts as a real-time decision engine, helping manufacturers protect margins, optimize resources, and deliver on time.
