# ChainIQ ERP — Complete API Specification (`API.md`)

> **Comprehensive RESTful Route & Microservice Endpoint Reference**
> 
> *Covers all Next.js Serverless Route Handlers, FastAPI Copilot Microservices, Role Guards, Request/Response Payloads, Business Logic Side-Effects, and Error Codes.*

---

## Table of Contents

1. [API Architecture & Global Standards](#1-api-architecture--global-standards)
   - [1.1 Base URLs & Protocol Topology](#11-base-urls--protocol-topology)
   - [1.2 Authentication & Security Headers](#12-authentication--security-headers)
   - [1.3 Standard Response Formats](#13-standard-response-formats)
   - [1.4 Error Handling & HTTP Status Matrix](#14-error-handling--http-status-matrix)
2. [Authentication & Session Endpoints (`/api/auth`)](#2-authentication--session-endpoints-apiauth)
3. [Products Catalog Endpoints (`/api/products`)](#3-products-catalog-endpoints-apiproducts)
4. [Bill of Materials (BOM) & Explosion Endpoints (`/api/boms`)](#4-bill-of-materials-bom--explosion-endpoints-apiboms)
5. [Sales Orders Lifecycle Endpoints (`/api/sales`)](#5-sales-orders-lifecycle-endpoints-apisales)
6. [Manufacturing Orders Endpoints (`/api/manufacturing`)](#6-manufacturing-orders-endpoints-apimanufacturing)
7. [Procurement, RFQ & Receipts Endpoints (`/api/purchase` & `/api/vendors`)](#7-procurement-rfq--receipts-endpoints-apipurchase--apivendors)
8. [Inventory Movements & Ledger Endpoints (`/api/inventory`)](#8-inventory-movements--ledger-endpoints-apiinventory)
9. [Dashboard & Analytics Endpoints (`/api/dashboard` & `/api/health`)](#9-dashboard--analytics-endpoints-apidashboard--apihealth)
10. [Audit Trail & Compliance Endpoints (`/api/audit`)](#10-audit-trail--compliance-endpoints-apiaudit)
11. [User Management Endpoints (`/api/users`)](#11-user-management-endpoints-apiusers)
12. [AI Engine & Copilot Endpoints (Next.js & FastAPI)](#12-ai-engine--copilot-endpoints-nextjs--fastapi)
13. [Onchain Insights Intelligence Subsystem (All 12 Modules)](#13-onchain-insights-intelligence-subsystem-all-12-modules)
    - [13.1 Executive Intelligence Dashboard (`/dashboard`)](#131-executive-intelligence-dashboard-dashboard)
    - [13.2 Supplier Directory & Scorecards (`/suppliers`)](#132-supplier-directory--scorecards-suppliers)
    - [13.3 Supplier Onboarding & Review (`/suppliers/onboard` & `/review`)](#133-supplier-onboarding--review-suppliersonboard--review)
    - [13.4 Supplier Switching Simulator (`/supplier-switch`)](#134-supplier-switching-simulator-supplier-switch)
    - [13.5 SKU Transition Planning (`/sku-transition`)](#135-sku-transition-planning-sku-transition)
    - [13.6 Disruption Signals & Freight Tracking (`/disruptions` & `/shipments`)](#136-disruption-signals--freight-tracking-disruptions--shipments)
    - [13.7 Explainable Risk Prioritization (`/risk-assessment`)](#137-explainable-risk-prioritization-risk-assessment)
    - [13.8 Multi-Tier Dependency Graph (`/dependencies`)](#138-multi-tier-dependency-graph-dependencies)
    - [13.9 Mitigation Scenario Lab (`/mitigation`)](#139-mitigation-scenario-lab-mitigation)
    - [13.10 Human Approval Governance Queue (`/approvals`)](#1310-human-approval-governance-queue-approvals)
    - [13.11 Stakeholder Notification Center (`/notifications`)](#1311-stakeholder-notification-center-notifications)
    - [13.12 Outcome Analytics & Post-Mortem Lab (`/analytics`)](#1312-outcome-analytics--post-mortem-lab-analytics)

---

## 1. API Architecture & Global Standards

### 1.1 Base URLs & Protocol Topology

| Service | Environment | Base URL | Protocol |
|---|---|---|---|
| **Next.js Core ERP Gateway** | Local Development | `http://localhost:3000/api` | HTTP/1.1 REST (JSON) |
| **Next.js Core ERP Gateway** | Production | `https://your-domain.com/api` | HTTPS REST (JSON) |
| **FastAPI Copilot Engine** | Local Development | `http://localhost:8000` | HTTP/1.1 REST (JSON) |
| **FastAPI Copilot Engine** | Production | `https://ai.your-domain.com` | HTTPS REST (JSON) |

---

### 1.2 Authentication & Security Headers

Every request to a protected endpoint must include valid authentication credentials. The primary mechanism is stateless HTTP-Only Cookies issued during login:

- `chainiq_token`: Short-lived JSON Web Token (15-minute validity).
- `chainiq_refresh_token`: Long-lived rotation token (7-day validity).

Alternatively, machine-to-machine integrations or external API clients may send a standard Bearer Authorization header:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
Content-Type: application/json
```

#### Standard Context Extraction (`requireAuth` / `requireRole`)
Protected endpoints automatically extract the authenticated caller's identity:
```typescript
{
  sub: string;       // User UUID in `users` table
  role: UserRole;    // 'admin' | 'product_manager' | 'sales' | 'purchase' | 'inventory'
  email: string;     // User email address
  name: string;      // User full name
}
```

---

### 1.3 Standard Response Formats

All API endpoints follow a unified response envelope:

#### Successful Response Envelope (`2xx`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource fetched or updated successfully",
  "data": { ... }
}
```

#### Paginated Response Envelope
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Items fetched successfully",
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 142,
      "totalPages": 8
    }
  }
}
```

#### Error Response Envelope (`4xx` / `5xx`)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed or business invariant breached",
  "errors": {
    "quantityOrdered": ["Quantity must be greater than zero"],
    "productId": ["Product does not exist"]
  }
}
```

---

### 1.4 Error Handling & HTTP Status Matrix

| Status Code | Description | Typical Trigger In ChainIQ |
|---|---|---|
| `200 OK` | Request succeeded | Standard read or non-creation mutation completed. |
| `201 Created` | Resource created | Order created, BOM saved, new product added. |
| `400 Bad Request` | Validation or invariant failed | Negative stock adjustment, invalid transition state. |
| `401 Unauthorized` | Unauthenticated | Missing or expired JWT cookie / token. |
| `403 Forbidden` | Role unauthorized | Non-admin attempting to reset database or view audit logs. |
| `404 Not Found` | Entity not found | Invalid product ID, order number, or BOM ID. |
| `409 Conflict` | Duplicate state | Raising duplicate MO for an SO that already has an active run. |
| `500 Server Error`| Internal failure | Database connection dropped or unexpected runtime error. |

---

## 2. Authentication & Session Endpoints (`/api/auth`)

### `POST /api/auth/register`
Creates a new tenant user account.

- **Access Guard**: Public
- **Request Body**:
  ```json
  {
    "name": "Arjun Verma",
    "email": "arjun@shivfurniture.com",
    "password": "SecurePassword@123",
    "role": "sales",
    "companyName": "Shiv Furniture Works",
    "phone": "+91 98765 43210",
    "country": "India"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "e9b1d283-3e11-4f12-9c10-098765432101",
        "name": "Arjun Verma",
        "email": "arjun@shivfurniture.com",
        "role": "sales",
        "companyName": "Shiv Furniture Works"
      }
    }
  }
  ```

---

### `POST /api/auth/login`
Authenticates user credentials and sets HTTP-Only JWT session cookies.

- **Access Guard**: Public
- **Request Body**:
  ```json
  {
    "email": "priya@shivfurniture.com",
    "password": "Admin@123",
    "rememberMe": true
  }
  ```
- **Response (`200 OK`)**:
  - **Headers**:
    - `Set-Cookie: chainiq_token=<JWT>; Path=/; HttpOnly; SameSite=Lax; Max-Age=900`
    - `Set-Cookie: chainiq_refresh_token=<JWT>; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "2d1b09b0-4c7b-4d40-8488-8ff394140002",
        "name": "Priya Sharma",
        "email": "priya@shivfurniture.com",
        "role": "sales"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

---

### `GET /api/auth/me`
Retrieves currently authenticated user profile and permissions from session cookie.

- **Access Guard**: Any Authenticated User
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "id": "2d1b09b0-4c7b-4d40-8488-8ff394140002",
      "name": "Priya Sharma",
      "email": "priya@shivfurniture.com",
      "role": "sales",
      "companyName": "Shiv Furniture Works"
    }
  }
  ```

---

### `POST /api/auth/refresh`
Rotates access token using HTTP-Only refresh cookie.

- **Access Guard**: Valid Refresh Cookie
- **Response (`200 OK`)**: Issues fresh `chainiq_token` cookie and returns `{ accessToken }`.

---

### `POST /api/auth/logout`
Clears session cookies and terminates the active session.

- **Access Guard**: Public
- **Response (`200 OK`)**: Clears `chainiq_token` and `chainiq_refresh_token` cookies.

---

## 3. Products Catalog Endpoints (`/api/products`)

### `GET /api/products`
Lists catalog products with filtering, search, and inventory level snapshots.

- **Access Guard**: Any Authenticated User
- **Query Parameters**:
  - `search` (string, optional) — Filter SKU or Product Name.
  - `category` (string, optional) — Filter by product category (e.g., `Furniture`, `Hardware`, `Finishing`).
  - `procurementType` (`purchase` | `manufacture`, optional).
  - `page` (number, default: `1`).
  - `limit` (number, default: `20`).
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "products": [
        {
          "id": "0df8374a-25c2-4a0b-9d10-82719280001",
          "name": "Teak Wood Dining Table",
          "sku": "FG-WDT-001",
          "category": "Furniture",
          "unitOfMeasure": "pcs",
          "salesPrice": "18500.00",
          "costPrice": "9200.00",
          "onHandQuantity": "10.00",
          "reservedQuantity": "6.00",
          "freeQuantity": "4.00",
          "minStockLevel": "5.00",
          "reorderQuantity": "10.00",
          "procurementType": "manufacture",
          "procurementStrategy": "mts",
          "productType": "finished_good",
          "isActive": true
        }
      ],
      "total": 35
    }
  }
  ```

---

### `POST /api/products`
Creates a new product record in the catalog.

- **Access Guard**: `admin`, `product_manager`
- **Request Body**:
  ```json
  {
    "name": "Oak Study Desk",
    "sku": "FG-OSD-002",
    "category": "Furniture",
    "unitOfMeasure": "pcs",
    "salesPrice": 14500.00,
    "costPrice": 7800.00,
    "onHandQuantity": 0,
    "minStockLevel": 4,
    "reorderQuantity": 8,
    "procurementType": "manufacture",
    "procurementStrategy": "mts",
    "productType": "finished_good"
  }
  ```
- **Response (`201 Created`)**: Returns created product entity and logs `product_created` in audit trail.

---

### `GET /api/products/:id`
Retrieves product details including stock counts and active BOM summary.

- **Access Guard**: Any Authenticated User
- **Response (`200 OK`)**: Returns product object.

---

### `PUT /api/products/:id`
Updates product pricing, inventory thresholds, or procurement strategy.

- **Access Guard**: `admin`, `product_manager`
- **Response (`200 OK`)**: Returns updated product entity.

---

### `DELETE /api/products/:id`
Soft-deletes or deactivates a product.

- **Access Guard**: `admin`
- **Response (`200 OK`)**: Returns deleted status confirmation.

---

## 4. Bill of Materials (BOM) & Explosion Endpoints (`/api/boms`)

### `GET /api/boms`
Lists all active and historical Bills of Materials with nested component items.

- **Access Guard**: Any Authenticated User
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "b1a2c3d4-0001-4000-8000-000000000001",
        "productId": "0df8374a-25c2-4a0b-9d10-82719280001",
        "name": "Standard Teak Dining Table Assembly Recipe",
        "quantity": "1.00",
        "isActive": true,
        "product": { "name": "Teak Wood Dining Table", "sku": "FG-WDT-001" },
        "items": [
          {
            "id": "item-001",
            "componentId": "c1a2-leg",
            "quantity": "4.00",
            "unitOfMeasure": "pcs",
            "component": { "name": "Teak Wood Table Leg", "sku": "RM-WL-001", "onHandQuantity": "120.00" }
          },
          {
            "id": "item-002",
            "componentId": "c2a3-screw",
            "quantity": "16.00",
            "unitOfMeasure": "pcs",
            "component": { "name": "M8 Steel Screws", "sku": "RM-SC-001", "onHandQuantity": "500.00" }
          }
        ]
      }
    ]
  }
  ```

---

### `POST /api/boms`
Creates a new BOM recipe for a finished good item.

- **Access Guard**: `admin`, `product_manager`
- **Request Body**:
  ```json
  {
    "productId": "0df8374a-25c2-4a0b-9d10-82719280001",
    "name": "V2 Optimized Dining Table Recipe",
    "quantity": 1,
    "isActive": true,
    "notes": "Reduces fastener count by 2 screws",
    "items": [
      { "componentId": "c1a2-leg", "quantity": 4, "unitOfMeasure": "pcs" },
      { "componentId": "c2a3-screw", "quantity": 14, "unitOfMeasure": "pcs" }
    ]
  }
  ```
- **Response (`201 Created`)**: Returns created BOM and deactivates prior active BOMs for the same product.

---

### `GET /api/boms/explode`
Explodes the active BOM for a product against a required production quantity, calculating exact component shortages based on live warehouse inventory.

- **Access Guard**: Any Authenticated User
- **Query Parameters**:
  - `productId` (UUID, required)
  - `quantity` (number, required)
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "hasBom": true,
      "bomName": "Standard Teak Dining Table Assembly Recipe",
      "materials": [
        {
          "componentId": "c1a2-leg",
          "sku": "RM-WL-001",
          "product": "Teak Wood Table Leg",
          "required": 160.0,
          "available": 80.0,
          "shortage": 80.0,
          "unitOfMeasure": "pcs"
        },
        {
          "componentId": "c2a3-screw",
          "sku": "RM-SC-001",
          "product": "M8 Steel Screws",
          "required": 640.0,
          "available": 700.0,
          "shortage": 0.0,
          "unitOfMeasure": "pcs"
        }
      ]
    }
  }
  ```

---

## 5. Sales Orders Lifecycle Endpoints (`/api/sales`)

### `GET /api/sales`
Lists all sales orders with customer names, totals, and statuses.

- **Access Guard**: Any Authenticated User
- **Response (`200 OK`)**: Returns array of sales order records.

---

### `POST /api/sales`
Creates a customer Sales Order in `draft` status.

- **Access Guard**: `admin`, `sales`
- **Request Body**:
  ```json
  {
    "customerName": "Prestige Interiors Pvt Ltd",
    "customerEmail": "procurement@prestige.in",
    "customerPhone": "+91 99000 11222",
    "notes": "Requires delivery to Bengaluru site before month end",
    "items": [
      {
        "productId": "0df8374a-25c2-4a0b-9d10-82719280001",
        "quantityOrdered": 40,
        "unitPrice": 18500.00
      }
    ]
  }
  ```
- **Response (`201 Created`)**: Generates unique `SO-2026-XXXX`, calculates `totalAmount: 740000.00`, status `draft`.

---

### `POST /api/sales/:id/confirm`
Triggers real-time stock allocation, reservation, and automated BOM explosion.

- **Access Guard**: `admin`, `sales`
- **Business Logic Side-Effects**:
  - Evaluates $\text{Free Qty} = \text{onHandQuantity} - \text{reservedQuantity}$.
  - **If Free Qty $\ge$ Ordered**: Reserves full quantity in `products`, creates `stock_reservation` inventory movements, transitions status to `ready`.
  - **If Free Qty $<$ Ordered**: Reserves available free stock, explodes BOM for the missing shortage, embeds structured `[Shortage Analysis]` JSON in `notes`, transitions status to `shortage_detected`.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Sales order status updated successfully",
    "data": {
      "id": "so-0042",
      "orderNumber": "SO-2026-0042",
      "status": "shortage_detected",
      "totalAmount": "740000.00",
      "confirmedAt": "2026-10-12T14:30:00.000Z"
    }
  }
  ```

---

### `POST /api/sales/:id/deliver`
Dispatches completed finished goods to the customer.

- **Access Guard**: `admin`, `sales`
- **Pre-condition**: Sales Order must be in `ready` status.
- **Side-Effects**:
  - Physical `onHandQuantity` is deducted.
  - `reservedQuantity` is released.
  - Logs `sales_delivery` in `inventory_movements` with `direction = -1`.
  - Transitions status to `delivered`.
- **Response (`200 OK`)**: Returns delivered sales order entity.

---

### `POST /api/sales/:id/cancel`
Cancels an unfulfilled Sales Order and releases any committed stock reservations.

- **Access Guard**: `admin`, `sales`
- **Pre-condition**: Cannot cancel `delivered` orders.
- **Side-Effects**: Restores `reservedQuantity` to zero, logs `stock_release` movement, sets status to `cancelled`.
- **Response (`200 OK`)**: Returns cancelled sales order.

---

## 6. Manufacturing Orders Endpoints (`/api/manufacturing`)

### `GET /api/manufacturing`
Lists all factory floor work orders with dynamic material readiness mapping (`WAITING_FOR_PROCUREMENT` vs `READY_TO_START`).

- **Access Guard**: `admin`, `product_manager`, `sales`
- **Response (`200 OK`)**: Returns array of work orders.

---

### `POST /api/manufacturing`
Raises a work order directly from a Sales Order's detected material shortage.

- **Access Guard**: `admin`, `sales`
- **Request Body**:
  ```json
  {
    "salesOrderId": "so-0042"
  }
  ```
- **Side-Effects**:
  - Guards against duplicate MO creation (`409 Conflict` if active MO exists).
  - Determines shortage = Ordered Qty - Already Reserved Qty.
  - Identifies active BOM for the product.
  - Generates `MO-2026-XXXX` in `draft` status linked to `salesOrderId`.
- **Response (`201 Created`)**: Returns array of created MOs.

---

### `POST /api/manufacturing/:id/approve`
Product Manager reviews and approves a draft work order.

- **Access Guard**: `admin`, `product_manager`
- **Response (`200 OK`)**: Status transitions to `confirmed`.

---

### `POST /api/manufacturing/:id/reject`
Rejects a draft work order with reason tracking.

- **Access Guard**: `admin`, `product_manager`
- **Request Body**:
  ```json
  {
    "reason": "Machine line maintenance scheduled this week"
  }
  ```
- **Side-Effects**: MO cancelled, notes updated on linked SO, audit log recorded.
- **Response (`200 OK`)**: Returns cancelled MO.

---

### `POST /api/manufacturing/:id/start`
Starts production on an assigned factory line, consuming raw materials.

- **Access Guard**: `admin`, `product_manager`
- **Request Body**:
  ```json
  {
    "machine": "Assembly Line B"
  }
  ```
- **Side-Effects**:
  - Verifies raw material components are physically present in stock.
  - Deducts required raw materials from `products.onHandQuantity`.
  - Logs `manufacturing_consume` records in `inventory_movements`.
  - Transitions MO status to `in_progress` with `actualStart` timestamp.
- **Response (`200 OK`)**: Returns started MO.

---

### `POST /api/manufacturing/:id/complete`
Completes assembly, increments finished goods stock, and auto-reserves them for the linked Sales Order.

- **Access Guard**: `admin`, `product_manager`
- **Side-Effects**:
  - Finished product `onHandQuantity` increments by produced quantity.
  - Logs `manufacturing_produce` movement.
  - **Auto-Reservation**: Immediately reserves produced quantity for originating Sales Order (`stock_reservation`).
  - **Auto-Readiness**: If no other pending MOs/POs exist for this SO, automatically transitions Sales Order to `ready`!
  - MO status transitions to `completed` with `actualEnd` timestamp.
- **Response (`200 OK`)**: Returns completed MO.

---

## 7. Procurement, RFQ & Receipts Endpoints (`/api/purchase` & `/api/vendors`)

### `GET /api/purchase`
Lists purchase orders with linked invoices, quotations, and receiving status.

- **Access Guard**: Any Authenticated User
- **Response (`200 OK`)**: Returns PO list.

---

### `POST /api/purchase`
Manually raises a draft Purchase Order for raw material replenishment.

- **Access Guard**: `admin`, `purchase`
- **Request Body**:
  ```json
  {
    "productId": "c1a2-leg",
    "quantity": 160
  }
  ```
- **Response (`201 Created`)**: Creates draft PO with `orderNumber: PO-2026-XXXX`.

---

### `POST /api/purchase/:id/rfq`
Dispatches competitive RFQ requests to selected suppliers.

- **Access Guard**: `admin`, `purchase`
- **Request Body**:
  ```json
  {
    "vendorNames": [
      "Global Timber Ltd",
      "Apex Fasteners Corp",
      "Woodland Supplies"
    ]
  }
  ```
- **Side-Effects**: Creates `vendor_quotations` records with deterministic pricing, lead times, and ratings. Updates PO notes.
- **Response (`200 OK`)**: Returns updated PO with quotations array.

---

### `POST /api/purchase/:id/quotation`
Selects the winning supplier quote.

- **Access Guard**: `admin`, `purchase`
- **Request Body**:
  ```json
  {
    "vendorName": "Global Timber Ltd",
    "vendorEmail": "sales@globaltimber.com",
    "vendorPhone": "+91 88888 77777",
    "totalAmount": 320000.00
  }
  ```
- **Side-Effects**: Marks winning quote `selected`, marks others `rejected`, updates PO vendor and total amount.
- **Response (`200 OK`)**: Returns updated PO.

---

### `POST /api/purchase/:id/confirm`
Confirms the PO, triggers dispatch to the vendor, and generates a pending Invoice.

- **Access Guard**: `admin`, `purchase`
- **Side-Effects**:
  - Generates unique invoice: `INV-2026-XXXX`.
  - Sets PO status to `confirmed` (in-transit).
  - Logs notification CC'd to Inventory Manager.
- **Response (`200 OK`)**: Returns confirmed PO with invoice record.

---

### `POST /api/purchase/:id/receive`
Inventory inspection endpoint for verifying inbound supplier cargo.

- **Access Guard**: `admin`, `inventory`
- **Request Body (Approve)**:
  ```json
  {
    "checkResult": "approve"
  }
  ```
- **Side-Effects (Approve)**:
  - Increments raw materials `onHandQuantity`.
  - Logs `purchase_receipt` in `inventory_movements`.
  - Marks linked Invoice as `verified`.
  - Sets PO status to `received`.
  - **Checks Linked MOs**: If shortages are resolved, updates waiting MOs to `READY_TO_START`!
- **Request Body (Reject)**:
  ```json
  {
    "checkResult": "reject",
    "reason": "Timber moisture content exceeded tolerance limits"
  }
  ```
- **Side-Effects (Reject)**: Sets PO status to `cancelled`, records rejection reason, alerts procurement.
- **Response (`200 OK`)**: Returns receipt resolution.

---

### `GET /api/vendors` & `POST /api/vendors` & `DELETE /api/vendors`
Standard directory CRUD for registered raw material suppliers.

- **`GET /api/vendors`**: Returns list of all vendors.
- **`POST /api/vendors`**: `{ name, email, phone }` — creates vendor (`admin`, `purchase`).
- **`DELETE /api/vendors?id=...`**: Deletes vendor if no active purchase orders exist (`admin`, `purchase`).

---

## 8. Inventory Movements & Ledger Endpoints (`/api/inventory`)

### `GET /api/inventory`
Retrieves live stock levels across all catalog items (On-Hand, Reserved, Free).

- **Access Guard**: Any Authenticated User
- **Response (`200 OK`)**: Returns product stock balance list.

---

### `GET /api/inventory/movements`
Retrieves the double-entry historical inventory transaction ledger.

- **Access Guard**: Any Authenticated User
- **Query Parameters**: `productId` (UUID, optional).
- **Response (`200 OK`)**: Returns array of ledger movements with `quantityBefore`, `quantityAfter`, `reservedBefore`, `reservedAfter`.

---

### `POST /api/inventory/adjust`
Executes an audit-logged manual stock adjustment.

- **Access Guard**: `admin`, `inventory`
- **Request Body**:
  ```json
  {
    "productId": "c1a2-leg",
    "quantity": 20,
    "notes": "Physical cycle count discrepancy adjustment"
  }
  ```
- **Business Rule**: `newOnHand < reservedQuantity` is blocked with HTTP 400.
- **Response (`200 OK`)**: Returns updated product and logged `stock_adjustment` movement.

---

### `POST /api/inventory/reserve`
Manually reserves physical stock.

- **Access Guard**: `admin`, `inventory`
- **Request Body**: `{ "productId": "...", "quantity": 10, "notes": "..." }`
- **Business Rule**: Quantity cannot exceed available free stock.

---

### `POST /api/inventory/release`
Manually releases an active reservation back to free stock.

- **Access Guard**: `admin`, `inventory`
- **Request Body**: `{ "productId": "...", "quantity": 5, "notes": "..." }`
- **Business Rule**: Quantity cannot exceed currently reserved stock.

---

## 9. Dashboard & Analytics Endpoints (`/api/dashboard` & `/api/health`)

### `GET /api/dashboard/stats`
Consolidates executive enterprise KPIs, valuation, and recent operational activity.

- **Access Guard**: Any Authenticated User
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "kpis": {
        "totalProducts": 35,
        "totalSalesOrders": 48,
        "pendingSalesOrders": 12,
        "shortageOrders": 3,
        "lowStockCount": 4,
        "totalInventoryValue": 845200.00,
        "runningManufacturingRuns": 3,
        "pendingManufacturingApprovals": 2,
        "procurementRiskScore": "Low (24%)",
        "manufacturingEfficiency": "96%"
      },
      "inventoryHealth": {
        "healthy": 28,
        "lowStock": 4,
        "critical": 3,
        "total": 35
      },
      "lowStockProducts": [ ... ],
      "recentActivity": [ ... ],
      "recentSalesOrders": [ ... ],
      "smartProcurementRecommendations": [ ... ],
      "productionBottlenecks": [ ... ],
      "aiInsights": { ... }
    }
  }
  ```

---

### `GET /api/health`
Next.js health check verifying database and application connectivity.

- **Access Guard**: Public
- **Response (`200 OK`)**: `{ "status": "ok", "timestamp": "..." }`

---

## 10. Audit Trail & Compliance Endpoints (`/api/audit`)

### `GET /api/audit`
Retrieves chronological, tamper-evident audit log records with pre/post JSON snapshots.

- **Access Guard**: `admin`
- **Query Parameters**:
  - `action` (string, optional) — Filter by `AuditAction`.
  - `entityType` (string, optional) — Filter by entity (e.g., `sales_order`, `product`).
  - `page`, `limit` (pagination).
- **Response (`200 OK`)**: Returns audit entries with `oldValues` and `newValues`.

---

### `GET /api/audit/actions`
Returns all distinct action types registered in the system.

- **Access Guard**: `admin`
- **Response (`200 OK`)**: Returns string array of actions.

---

## 11. User Management Endpoints (`/api/users`)

### `GET /api/users` & `POST /api/users` & `PUT /api/users/:id` & `DELETE /api/users/:id`
Administrative user account management.

- **Access Guard**: `admin` (Strict)
- **Functions**: Create operators, update active roles (`sales`, `purchase`, `product_manager`, `inventory`, `admin`), deactivate accounts.

---

## 12. AI Engine & Copilot Endpoints (Next.js & FastAPI)

### Next.js Internal AI Proxy Routes

#### `GET /api/ai/dashboard`
Fetches structured operational insights and radar scores for the active user role.

- **Access Guard**: Any Authenticated User
- **Query Parameters**: `refresh=true` (bypasses 5-minute memory cache).
- **Response (`200 OK`)**: Returns operational health score (0–100), critical risks, and departmental breakdown.

#### `GET /api/ai/action-center`
Returns role-filtered urgent priorities and risks.

- **Access Guard**: Any Authenticated User
- **Response (`200 OK`)**: Returns `{ criticalRisks, recommendations }`.

#### `GET /api/ai/executive-summary`
Returns high-level business health summary text and radar scores.

#### `GET /api/ai/procurement`
Returns predictive vendor reorder quantities and consumption projections.

---

### FastAPI Microservice Endpoints (Port 8000)

#### `POST /api/chat`
Natural language conversational Copilot powered by LangGraph and Groq Llama-3.3-70b.

- **Request Body**:
  ```json
  {
    "question": "What raw materials are below safety stock today?",
    "role": "purchase"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "answer": "Currently, 2 raw materials are below safety limits:\n1. **Teak Wood Table Leg (RM-WL-001)**: 80 units on hand vs 100 safety minimum.\n2. **M8 Fasteners (RM-SC-001)**: 200 units on hand vs 500 safety minimum.\n\n**Recommendation**: Dispatch RFQ to *Global Timber Ltd* to prevent assembly bottlenecks."
  }
  ```

#### `POST /api/insights`
Generates structured JSON decision recommendations from live Postgres context.

- **Request Body**:
  ```json
  {
    "context": { "inventory": { ... }, "sales": { ... }, "manufacturing": { ... } },
    "role": "admin"
  }
  ```
- **Response (`200 OK`)**: Returns structured JSON matching the operational schema.

#### `GET /health`
FastAPI uptime status check. Returns `{ "status": "ok", "message": "ChainIQ ERP FastAPI Copilot is running." }`.

---

## 13. Onchain Insights Intelligence Subsystem (All 12 Modules)

All endpoints below support both `mock` (deterministic synthetic dataset) and `api` (enterprise microservice bridge) modes via `services/onchain-insights.api.ts`. All monetary fields are formatted in Indian Rupee (`₹`).

### 13.1 Executive Intelligence Dashboard (`/dashboard`)
- **`GET /api/onchain-insights/dashboard`**
  - **Access Guard**: Any Authenticated User
  - **Query Parameters**: `dateRange` (`7d` | `30d` | `60d` | `90d`), `riskLevel` (`critical` | `high` | `medium` | `low` | `all`), `supplierId`.
  - **Response (`200 OK`)**: Returns KPI strip, active disruptions feed, supplier risk distribution donut data, 90-day shipment risk trend, and recommended recovery actions.

---

### 13.2 Supplier Directory & Scorecards (`/suppliers`)
- **`GET /api/onchain-insights/suppliers`**
  - **Query Parameters**: `search`, `riskTier`, `qualificationStatus`, `country`, `material`, `sortBy`, `sortOrder`.
  - **Response (`200 OK`)**: Returns filterable list of qualified and at-risk suppliers.
- **`GET /api/onchain-insights/suppliers/:id`**
  - **Response (`200 OK`)**: Returns 6D radar capability scorecard (Delivery, Quality, Lead Time, Capacity, Financial, Compliance), certifications list, and active PO exposure.

---

### 13.3 Supplier Onboarding & Review (`/suppliers/onboard` & `/review`)
- **`GET /api/onchain-insights/suppliers/onboard`**
  - **Query Parameters**: `stage` (`pending_review` | `under_audit` | `changes_requested` | `approved` | `rejected`).
  - **Response (`200 OK`)**: Lists suppliers currently in the qualification queue.
- **`POST /api/onchain-insights/suppliers/onboard`**
  - **Request Body**: Supplier multi-step registration payload (legal name, contact, operational capacity, tax ID, uploaded document IDs).
  - **Response (`201 Created`)**: Submits supplier for compliance triage.
- **`GET /api/onchain-insights/suppliers/:id/review`**
  - **Response (`200 OK`)**: Fetches verification checklist and audit history for reviewer evaluation.
- **`POST /api/onchain-insights/suppliers/:id/review`**
  - **Request Body**: `{ decision: "approve" | "reject" | "request_changes", comments: "...", reviewerName: "..." }`.
  - **Response (`200 OK`)**: Updates onboarding stage and records status history.

---

### 13.4 Supplier Switching Simulator (`/supplier-switch`)
- **`GET /api/onchain-insights/supplier-switch`**
  - **Query Parameters**: `current`, `alternative`, `material`, `volume`, `currentCost`, `altCost`, `split`, `switchingCost`, `transitionWeeks`.
  - **Response (`200 OK`)**: Returns dynamic scenario calculation comparing:
    1. **Retain Current**: Baseline annual cost and risk.
    2. **Dual-Source Split (e.g. 60/40)**: Blended cost, blended lead time, and mitigated risk.
    3. **Full Switch**: Total first-year cost with one-time switching expense and maximum risk reduction.

---

### 13.5 SKU Transition Planning (`/sku-transition`)
- **`GET /api/onchain-insights/sku-transition`**
  - **Query Parameters**: `oldSku`, `newSku`, `productName`, `currentOldInventory`, `weeklyDemandRate`, `newSkuLeadTimeWeeks`, `unitCostOld`, `unitCostNew`, `holdingCostPerUnitYear`, `salvageScrapValuePercent`.
  - **Response (`200 OK`)**: Returns 12-week crossover inventory trajectory for **Aggressive**, **Balanced**, and **Conservative** phase-out strategies.

---

### 13.6 Disruption Signals & Freight Tracking (`/disruptions` & `/shipments`)
- **`GET /api/onchain-insights/disruptions`**
  - **Query Parameters**: `severity`, `category`, `status`, `supplierId`, `search`.
  - **Response (`200 OK`)**: Returns 16 synthetic disruption signals with affected SKUs and orders.
- **`GET /api/onchain-insights/disruptions/:id`**
  - **Response (`200 OK`)**: Returns signal detail with affected sales orders and milestone timeline.
- **`PATCH /api/onchain-insights/disruptions/:id`**
  - **Request Body**: `{ status: "investigating" | "resolved", notes: "...", actor: "..." }`.
  - **Response (`200 OK`)**: Transitions disruption event state.
- **`GET /api/onchain-insights/shipments`**
  - **Query Parameters**: `status`, `riskSeverity`, `supplierId`, `search`.
  - **Response (`200 OK`)**: Lists active freight consignments (maritime, road, rail, air) with live delay indicators.

---

### 13.7 Explainable Risk Prioritization (`/risk-assessment`)
- **`GET /api/onchain-insights/risk-assessment`**
  - **Query Parameters**: `tier`, `horizon` (`30_days` | `60_days` | `90_days`), `w_delivery`, `w_disruption`, `w_geographic`, `w_financial`, `w_compliance`.
  - **Response (`200 OK`)**: Returns prioritized supplier rankings based on custom or default weights, plain-language root-cause narratives, and methodology disclosures.

---

### 13.8 Multi-Tier Dependency Graph (`/dependencies`)
- **`GET /api/onchain-insights/dependencies`**
  - **Query Parameters**: `selectedNode` (node ID).
  - **Response (`200 OK`)**:
    - `nodes`: Array of graph nodes with position coordinates, entity type, and risk status.
    - `edges`: Array of connection lines.
    - `impact`: BFS downstream blast-radius summary tracing affected materials, manufacturing plants, finished SKUs, customer sales orders, and total revenue at risk in ₹.

---

### 13.9 Mitigation Scenario Lab (`/mitigation`)
- **`GET /api/onchain-insights/mitigation`**
  - **Query Parameters**: `disruptionId`, `w_cost`, `w_speed`, `w_feas`, `w_ease`.
  - **Response (`200 OK`)**: Returns ranked recovery scenarios (Alternate Sourcing, Expedited Freight, Inventory Rebalance, Safety Stock Drawdown, Split Procurement) with cost vs time trade-offs.
- **`POST /api/onchain-insights/mitigation`**
  - **Request Body**: `{ optionId: "...", disruptionId: "...", modifiedAssumptions: { ... }, comments: "..." }`.
  - **Response (`200 OK`)**: Submits recovery scenario to the Human Approval Governance queue.

---

### 13.10 Human Approval Governance Queue (`/approvals`)
- **`GET /api/onchain-insights/approvals`**
  - **Query Parameters**: `status` (`pending_review` | `approved` | `rejected`), `decisionType`, `urgency`, `search`.
  - **Response (`200 OK`)**: Lists pending decisions requiring governance sign-off.
- **`GET /api/onchain-insights/approvals/:id`**
  - **Response (`200 OK`)**: Returns full decision context, simulated checklist steps, and chronological audit trail.
- **`PATCH /api/onchain-insights/approvals/:id`**
  - **Request Body**: `{ action: "approve" | "reject" | "request_changes", comments: "...", reviewerName: "..." }`.
  - **Response (`200 OK`)**: Records sign-off in audit trail and updates decision status.

---

### 13.11 Stakeholder Notification Center (`/notifications`)
- **`GET /api/onchain-insights/notifications`**
  - **Query Parameters**: `category`, `severity`, `unreadOnly=true`, `search`.
  - **Response (`200 OK`)**: Returns alerts feed with unread counters and deep links to relevant ERP records.
- **`PATCH /api/onchain-insights/notifications`**
  - **Request Body**: `{ action: "mark_as_read" | "mark_all_read", notificationIds: [ ... ] }`.
  - **Response (`200 OK`)**: Updates read states and returns updated unread count.

---

### 13.12 Outcome Analytics & Post-Mortem Lab (`/analytics`)
- **`GET /api/onchain-insights/analytics`**
  - **Query Parameters**: `dateRange`, `category`, `finalStatus`, `search`.
  - **Response (`200 OK`)**:
    - Disruption outcome history records.
    - Recovery days vs target SLA compliance curves.
    - Net benefit avoidance ROI in ₹.
    - Recurring systemic risk patterns.
    - Supplier resilience indices.
- **`POST /api/onchain-insights/analytics`**
  - **Request Body**:
    ```json
    {
      "outcomeId": "OUT-2026-001",
      "facilitator": "Amit Patel",
      "participants": ["Amit Patel", "Ravi Kumar", "Neha Singh"],
      "rootCauseCategory": "single_source_failure",
      "rootCauseSummary": "Sole supplier for M8 screws experienced factory fire",
      "fiveWhys": {
        "why1": "Assembly stalled due to missing fasteners",
        "why2": "Primary supplier shipment did not arrive",
        "why3": "Supplier facility was offline",
        "why4": "No dual-source contract was active",
        "why5": "Procurement policy allowed single-sourcing for C-class components"
      },
      "whatWentWell": ["Expedited air freight prevented SLA cancellation"],
      "whatWentWrong": ["Buffer stock was depleted in 3 days"],
      "actionItems": [
        { "action": "Establish secondary local fastener vendor", "owner": "Amit Patel", "dueDate": "2026-11-15", "status": "in_progress", "impactArea": "Procurement" }
      ],
      "preventivePolicy": "All structural hardware must maintain dual-source allocation."
    }
    ```
  - **Response (`201 Created`)**: Records formal post-mortem entry.
