# Onchain Insights — API Integration & Adapter Guide

## 1. Architectural Overview

The **Onchain Insights** module integrates supply chain intelligence into ChainIQ ERP without breaking or modifying existing ERP core workflows (Products, Sales Orders, Procurement, Inventory, Manufacturing).

### Core Design Principles
1. **Zero ERP Regression**: Existing tables, routes, and authentication stores remain untouched.
2. **Deterministic Transparency**: In `mock` mode, all metrics, radar dimensions, BFS blast-radius calculations, and cost-benefit trade-offs use deterministic rule-based models. No unsubstantiated "AI/ML precision" or "guaranteed real-world savings" claims are made.
3. **Currency Standard**: All monetary values are strictly formatted in Indian Rupee (`₹` via `.toLocaleString('en-IN')`).
4. **Adapter Provider Architecture**: High-level UI components consume a unified service layer (`frontend/services/onchain-insights.api.ts`) and TanStack Query hooks (`frontend/hooks/useOnchainInsights.ts`), completely decoupled from the underlying data source.

---

## 2. The Adapter Provider Pattern

The application runtime toggles between **synthetic mock stores** and **live microservice bridges** using the environment variable:

```bash
NEXT_PUBLIC_ONCHAIN_DATA_MODE=mock # or "api"
```

### Pattern Implementation

```typescript
// frontend/services/onchain-insights.api.ts
const DATA_MODE = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_ONCHAIN_DATA_MODE || 'mock')
  : 'mock';

export const onchainInsightsApi = {
  getDashboard: async (filters: OnchainDashboardFilters): Promise<OnchainDashboardData> => {
    if (DATA_MODE === 'api') {
      // Direct call to enterprise ERP microservice / live database
      const res = await api.get<OnchainDashboardData>('/v1/enterprise/intelligence/dashboard', { params: filters });
      return res.data;
    }
    // Default: Next.js API route serving deterministic synthetic dataset
    const res = await api.get<{ data: OnchainDashboardData }>(`/onchain-insights/dashboard`, { params: filters });
    return res.data.data;
  },
  // ...other module endpoints
};
```

---

## 3. Complete API Endpoint Catalog (All 12 Roadmap Tasks)

| Task | Endpoint | Methods | Description |
|---|---|---|---|
| **Task 1** | `/api/onchain-insights/dashboard` | `GET` | Executive dashboard KPIs, area disruption trends, affected materials, risk distribution |
| **Task 2** | `/api/onchain-insights/suppliers` | `GET` | Filterable supplier qualification directory with risk tiers, lead time, and compliance scores |
| **Task 2** | `/api/onchain-insights/suppliers/[id]` | `GET` | 6D radar capability scorecard, tier breakdown, certifications, and active PO exposure |
| **Task 3** | `/api/onchain-insights/suppliers/onboard` | `GET`, `POST` | Multi-step supplier registration wizard, queue state, and document submission |
| **Task 3** | `/api/onchain-insights/suppliers/[id]/review` | `GET`, `POST` | Formal qualification review queue, document verification checklists, and audit history |
| **Task 4** | `/api/onchain-insights/supplier-switch` | `POST` | Scenario simulation: Retain vs. Dual-Source Split vs. Full Switch with dynamic cost/time formulas |
| **Task 5** | `/api/onchain-insights/sku-transition` | `POST` | 12-week crossover inventory run-down modeling (Aggressive, Balanced, Conservative strategies) |
| **Task 6** | `/api/onchain-insights/disruptions` | `GET` | 16 synthetic disruption signals with filters by category, severity, status, and search |
| **Task 6** | `/api/onchain-insights/disruptions/[id]` | `PATCH` | Status state transitions: Signal Detected → Assessing → Mitigation Proposed → Executed → Resolved |
| **Task 6** | `/api/onchain-insights/shipments` | `GET` | Active freight consignment tracker across maritime, road, rail, air with live milestones |
| **Task 7** | `/api/onchain-insights/risk-assessment` | `GET` | Deterministic 5-factor risk scoring, plain-language root-cause narratives, weight sensitivities |
| **Task 8** | `/api/onchain-insights/dependencies` | `GET` | Multi-tier supply chain graph (Tier-1, Tier-2, Material, Plant) with BFS downstream impact tracing |
| **Task 9** | `/api/onchain-insights/mitigation` | `GET`, `POST` | Multi-criteria recovery scenario lab (Expedited Freight, Dual-Source, SKU Sub, Buffer Stock) |
| **Task 10** | `/api/onchain-insights/approvals` | `GET` | Action governance queue with 2-party sign-off requirements, urgency flags, and exposure in ₹ |
| **Task 10** | `/api/onchain-insights/approvals/[id]` | `GET`, `PATCH` | Detailed decision review, simulation checklists, and tamper-evident chronological audit trail |
| **Task 11** | `/api/onchain-insights/notifications` | `GET`, `PATCH` | Stakeholder notification center & topbar bell badge with deep links and category filters |
| **Task 12** | `/api/onchain-insights/analytics` | `GET`, `POST` | Outcome analytics, recovery vs. target SLA days, net benefit ROI, 5-Whys post-mortems |

---

## 4. Production Transition Guide: Connecting Live Systems

When transitioning from `mock` mode to production `api` mode:

1. **Database Persistence**:
   - The mock stores in `frontend/lib/mock-data/onchain-insights/` map 1:1 to relational tables.
   - Prisma models can be added for `DisruptionSignal`, `DisruptionOutcomeRecord`, `PostMortemRecord`, `ApprovalDecisionItem`, etc.
2. **Oracle / Telemetry Ingestion**:
   - Webhook ingress at `/api/onchain-insights/webhooks/signals` can receive live AIS vessel tracking, port congestion alerts, and meteorological feeds.
3. **AI / ML Engine Integration**:
   - The FastAPI engine (`fastapi/`) can be configured to consume graph nodes from `dependencies.ts` to run predictive failure models.

---

## 5. Role-Based Access Control (RBAC)

The navigation sections in `frontend/components/layout/Sidebar.tsx` enforce role permissions consistent with existing ChainIQ ERP policies:

- **Executive & Procurement** (`admin`, `purchase`): Full access to all 12 intelligence workspaces, approvals, switching simulators, and post-mortems.
- **Product Managers** (`product_manager`): Access to Dependency Explorer, Mitigation Scenario Lab, SKU Transition, and Outcome Analytics.
- **Inventory & Logistics** (`inventory`): Access to Disruptions & Shipments, Notification Center, and Overview.
