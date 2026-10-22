# Onchain Insights — 12-Task Implementation Plan

> **Module purpose:** Add supply-chain intelligence, disruption monitoring, supplier qualification, and recovery-planning capabilities to the existing ChainIQ ERP.
>
> **Guiding principle:** Extend — do not rebuild. Every task reuses the existing Next.js 15 App Router, Tailwind design system, TanStack Query hooks, Prisma ORM, Zustand auth store, and `lucide-react` icons. No existing functionality is changed unless strictly required for integration.

---

## Architecture Summary (Existing ERP)

| Layer | Technology | Key Files |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | `frontend/app/` |
| **Styling** | Tailwind CSS 3.4 + custom design tokens | `tailwind.config.ts`, `globals.css` |
| **State** | TanStack Query v5 + Zustand (auth) | `hooks/`, `store/auth.store.ts` |
| **API Client** | Axios via `lib/api.ts` | `services/*.api.ts` |
| **Server** | Next.js Route Handlers + service layer | `app/api/`, `lib/server/modules/` |
| **ORM / DB** | Prisma + PostgreSQL (Supabase) | `prisma/schema.prisma` |
| **Auth** | JWT (HTTP-only cookies) + RBAC | `lib/server/auth.ts` |
| **Icons** | `lucide-react` | Already installed |
| **Charts** | SVG hand-drawn (no chart library installed) | `components/charts/` (empty files) |
| **AI Engine** | FastAPI + LangGraph (separate process) | `fastapi/` |

## Integration Plan

### Where Onchain Insights lives

| Aspect | Location |
|---|---|
| **Sidebar entry** | New section `"Supply Chain Intelligence"` in `Sidebar.tsx` SECTIONS array, between "Supply Chain Operations" and "Decision Intelligence" |
| **Route group** | `app/(dashboard)/onchain-insights/` (sub-pages for each feature) |
| **API routes** | `app/api/onchain-insights/` |
| **Service layer** | `lib/server/modules/onchain-insights/` |
| **Frontend services** | `services/onchain-insights.api.ts` |
| **TanStack hooks** | `hooks/useOnchainInsights.ts` |
| **Mock data** | `lib/mock-data/onchain-insights/` |
| **Types** | `types/onchain-insights.ts` |
| **Data mode config** | `NEXT_PUBLIC_ONCHAIN_DATA_MODE=mock|api` in `.env` |

### Chart & Visualization Library Selection

| Library | Purpose | Rationale |
|---|---|---|
| **Recharts** (`recharts`) | Dashboard KPIs, bar/line/area/pie charts | Composable React-native charts, lightweight, excellent for dashboard-style visualizations. The ERP currently uses hand-drawn SVGs — Recharts provides interactive tooltips, responsive containers, and legends with minimal bundle cost. |
| **React Flow** (`@xyflow/react`) | Multi-tier dependency graph (Task 8) | Purpose-built for interactive node-edge diagrams with zoom/pan/selection. Only needed for the dependency explorer. |

> No other chart library is needed. Recharts covers all standard chart types across Tasks 1–7, 9, 11, 12. React Flow is introduced only when Task 8 is implemented.

### Data Mode Architecture

```
services/onchain-insights.api.ts
├── provider selector (reads NEXT_PUBLIC_ONCHAIN_DATA_MODE)
├── mock provider (lib/mock-data/onchain-insights/)
└── api provider (future — calls real endpoints)
```

Each provider implements the same TypeScript interface. The UI layer never knows which provider is active.

---

## Progress Summary

| Status | Count |
|---|---|
| ✅ DONE | 12 |
| 🔄 IN PROGRESS | 0 |
| 🚫 BLOCKED | 0 |
| 📋 BACKLOG | 0 |

---

## Task 1: Onchain Insights Integration & Executive Dashboard

| Field | Detail |
|---|---|
| **Status** | ✅ DONE |
| **Business Purpose** | Give executives a single-screen overview of supply-chain health: active disruptions, supplier risk distribution, shipment-risk trends, affected materials/orders, and recommended actions. This is the entry point for the entire Onchain Insights module. |
| **Dependencies** | None (first task) |

### Features to Implement

1. Add "Onchain Insights" navigation entry in sidebar (new section or under "Decision Intelligence").
2. Create the module landing page at `/onchain-insights` with a polished executive dashboard.
3. Install `recharts` as the chart library.
4. Create the data-mode provider architecture (`mock` / `api` selector).
5. Build connected mock data covering suppliers, disruptions, shipments, and KPIs.

### Screens & UI

- **KPI strip** — 5–6 stat cards: Active Disruptions, At-Risk Suppliers, Affected Orders, Avg Risk Score, Pending Approvals, Recommended Actions.
- **Disruption alerts panel** — Live feed of active disruption signals with severity badges and timestamps.
- **Supplier risk distribution** — Recharts pie/donut chart showing suppliers grouped by risk tier (critical / high / medium / low).
- **Shipment risk trend** — Recharts area chart showing risk score trend over 30/60/90 days.
- **Affected materials & orders** — Mini table linking disruptions → affected SKUs → sales orders.
- **Recommended actions** — Ranked cards with action type, urgency, and drill-down navigation.
- **Filters** — Date range picker, risk level filter, supplier filter.

### Backend / API Changes

- `app/api/onchain-insights/dashboard/route.ts` — aggregates mock data.
- `lib/server/modules/onchain-insights/` — service skeleton + data-mode config.
- No Prisma schema changes required.

### Mock Data Behavior

All data returned by the mock provider with realistic supplier names, disruption events, shipment IDs, and risk scores. All mock data clearly labeled in the UI with a "Demo Data" indicator.

### Files Likely to Change

- `components/layout/Sidebar.tsx` (add nav entry)
- `app/(dashboard)/layout.tsx` (authorize onchain-insights routes)
- `app/(dashboard)/onchain-insights/page.tsx` (new)
- `app/api/onchain-insights/dashboard/route.ts` (new)
- `services/onchain-insights.api.ts` (new)
- `hooks/useOnchainInsights.ts` (new)
- `types/onchain-insights.ts` (new)
- `lib/mock-data/onchain-insights/` (new directory)
- `package.json` (add `recharts`)
- `.env` (add `NEXT_PUBLIC_ONCHAIN_DATA_MODE`)

### Acceptance Criteria

- [x] "Onchain Insights" appears in the sidebar for admin and purchase roles.
- [x] Clicking navigates to `/onchain-insights` which renders inside the existing ERP shell.
- [x] Dashboard shows ≥5 KPI cards with mock data.
- [x] At least 2 Recharts visualizations render with interactive tooltips.
- [x] Disruption alerts panel lists ≥3 mock events with severity and timestamps.
- [x] Date range and risk filters change the displayed data.
- [x] "Demo Data" indicator is visible when `NEXT_PUBLIC_ONCHAIN_DATA_MODE=mock`.
- [x] Responsive layout works at 1024px, 1280px, and 1440px widths.
- [x] Loading skeleton, error state, and empty state are handled.
- [x] Existing ERP pages are unaffected.

### Testing

- Manual verification of all states (loading, data, empty, error).
- Confirm sidebar navigation does not break existing routes.
- Confirm authorization check works (non-authorized roles see access-denied).

---

## Task 2: Supplier Qualification Workspace

| Field | Detail |
|---|---|
| **Status** | ✅ DONE |
| **Business Purpose** | Enable procurement teams to discover, compare, and evaluate suppliers using structured criteria. Transparent scoring prevents hidden assumptions about supplier quality. |
| **Dependencies** | Task 1 (navigation, data architecture, types) |

### Features to Implement

1. Supplier discovery table with search, filters, and sorting.
2. Supplier detail drawer/page showing profile, certifications, delivery reliability, quality, capacity, lead time, financial risk, and compliance.
3. Multi-supplier comparison workspace (side-by-side cards).
4. Transparent qualification score calculator with breakdown.
5. Unresolved verification indicators for missing data.

### Screens & UI

- **Supplier list page** — `/onchain-insights/suppliers` — filterable data table with risk badges.
- **Supplier detail view** — `/onchain-insights/suppliers/[id]` — full profile with score breakdown radar chart (Recharts).
- **Comparison mode** — Select 2–3 suppliers, overlay comparison cards.
- **Missing info indicators** — Yellow banners for unverified certifications.

### Backend / API Changes

- `app/api/onchain-insights/suppliers/route.ts` — list/search endpoint.
- `app/api/onchain-insights/suppliers/[id]/route.ts` — detail endpoint.
- Mock supplier profiles with realistic attributes.

### Mock Data Behavior

8–12 mock suppliers with varied risk profiles, some with missing certifications or incomplete data. Qualification scores calculated deterministically from available attributes.

### Files Likely to Change

- `app/(dashboard)/onchain-insights/suppliers/page.tsx` (new)
- `app/(dashboard)/onchain-insights/suppliers/[id]/page.tsx` (new)
- `app/api/onchain-insights/suppliers/` (new)
- `lib/mock-data/onchain-insights/suppliers.ts` (new)
- `types/onchain-insights.ts` (extend)
- `services/onchain-insights.api.ts` (extend)
- `hooks/useOnchainInsights.ts` (extend)

### Acceptance Criteria

- [x] Supplier table loads with ≥8 mock records.
- [x] Search by name/material and filter by risk tier work.
- [x] Supplier detail page shows structured profile and score breakdown.
- [x] Score calculation is explained in-UI (weighting breakdown visible).
- [x] Missing/unverified data is flagged, not hidden.
- [x] Comparison mode works for 2–3 selected suppliers.
- [x] Responsive at target widths.

### Testing

- Verify score transparency: changing a mock input visibly changes the score.
- Empty search results show appropriate state.

---

## Task 3: Supplier Onboarding & Profile Management

| Field | Detail |
|---|---|
| **Status** | ✅ DONE |
| **Business Purpose** | Provide a structured workflow for qualifying new suppliers: collect information, track documentation, manage review status, and record approval decisions. |
| **Dependencies** | Task 2 (supplier data model) |

### Features to Implement

1. New-supplier onboarding form with step-by-step sections.
2. Document checklist with required/optional items and status tracking.
3. Qualification review screen with approve/reject/request-changes controls.
4. Supplier status history timeline.
5. Profile editing for existing suppliers.

### Screens & UI

- **Onboarding wizard** — `/onchain-insights/suppliers/onboard` — multi-step form.
- **Review queue** — Filter suppliers by onboarding status.
- **Document checklist** — Card-based checklist with file metadata (no actual uploads in mock mode).
- **Status history** — Timeline component showing qualification state changes.

### Backend / API Changes

- `app/api/onchain-insights/suppliers/onboard/route.ts` (new)
- `app/api/onchain-insights/suppliers/[id]/review/route.ts` (new)
- Mock document metadata and status transitions.

### Mock Data Behavior

Pre-populated suppliers in various onboarding stages (pending, under-review, approved, rejected). Document metadata simulated without actual file storage.

### Files Likely to Change

- `app/(dashboard)/onchain-insights/suppliers/onboard/page.tsx` (new)
- Additional components for wizard/checklist.
- `types/onchain-insights.ts` (extend)

### Acceptance Criteria

- [x] Onboarding form captures supplier details across ≥3 steps.
- [x] Document checklist shows required items with missing/complete indicators.
- [x] Review screen allows approve/reject/request-changes with comments.
- [x] Status history displays chronological state changes.
- [x] No mock data pretends external verification occurred.

### Testing

- Complete full onboarding flow with mock data.
- Verify status transitions work end-to-end.

---

## Task 4: Supplier Switching Simulator

| Field | Detail |
|---|---|
| **Status** | ✅ DONE |
| **Business Purpose** | Help procurement managers evaluate the impact of switching suppliers by comparing scenarios: keep current, dual-source, or fully switch. Quantify trade-offs in cost, lead time, capacity, and risk. |
| **Dependencies** | Task 2 (supplier profiles) |

### Features to Implement

1. Scenario builder: select current supplier + alternative(s).
2. Adjustable assumptions (volume split, transition timeline, etc.).
3. Side-by-side scenario comparison table.
4. Visual impact charts (cost delta, lead time comparison, risk change).
5. Clear labeling of estimated vs. verified data.

### Screens & UI

- **Simulator page** — `/onchain-insights/supplier-switch` — scenario workspace.
- **Comparison cards** — Three columns: Retain / Split / Switch.
- **Impact charts** — Recharts bar charts for cost, lead time, capacity.
- **Assumptions panel** — Editable inputs that recalculate on change.

### Backend / API Changes

- `app/api/onchain-insights/supplier-switch/route.ts` — scenario calculation.
- Deterministic calculation logic, not an ML model.

### Mock Data Behavior

Pre-configured supplier pairs with realistic cost/lead-time data. Calculations use transparent formulas displayed in the UI.

### Files Likely to Change

- `app/(dashboard)/onchain-insights/supplier-switch/page.tsx` (new)
- Supporting components for scenario builder.
- `types/onchain-insights.ts` (extend)

### Acceptance Criteria

- [x] User can select current supplier and ≥1 alternative.
- [x] Three scenarios are compared with cost/lead-time/risk metrics.
- [x] Changing assumptions recalculates results in real-time.
- [x] "Estimated" vs. "Verified" labels clearly distinguish data confidence.
- [x] At least one Recharts visualization for impact comparison.

### Testing

- Verify calculation correctness with known inputs.
- Test edge cases (same supplier, missing data).

---

## Task 5: SKU Transition Planning Assistant

| Field | Detail |
|---|---|
| **Status** | ✅ DONE |
| **Business Purpose** | Support product replacements, pack-size changes, and phase-in/phase-out decisions by projecting inventory rundown, new-SKU ramp-up, and service-level impact. |
| **Dependencies** | Task 1 (data architecture), Task 2 (supplier data) |

### Features to Implement

1. Old-SKU / New-SKU selection with transition date picker.
2. Inventory-by-location display (mock locations).
3. Demand forecast with transparent baseline calculation.
4. Transition plan comparison (aggressive / balanced / conservative).
5. Projected old-SKU leftover, new-SKU shortage risk, and cost impact.

### Screens & UI

- **SKU Transition page** — `/onchain-insights/sku-transition` — planning workspace.
- **Timeline view** — Recharts area chart showing old/new SKU inventory over time.
- **Plan comparison table** — Side-by-side transition strategies.
- **Risk indicators** — Shortage probability and leftover cost.

### Backend / API Changes

- `app/api/onchain-insights/sku-transition/route.ts`
- Deterministic baseline projection logic.

### Mock Data Behavior

Mock SKU pairs from existing products table. Simulated demand and location-level inventory.

### Files Likely to Change

- `app/(dashboard)/onchain-insights/sku-transition/page.tsx` (new)
- `types/onchain-insights.ts` (extend)

### Acceptance Criteria

- [x] User can select old/new SKU pair and transition dates.
- [x] Inventory projection chart shows crossover timeline.
- [x] ≥2 transition plans compared with trade-off metrics.
- [x] Baseline calculation assumptions are visible and documented.

### Testing

- Verify projections are mathematically consistent.
- Test with various transition date ranges.

---

## Task 6: Disruption Signal & Shipment Monitoring

| Field | Detail |
|---|---|
| **Status** | ✅ DONE |
| **Business Purpose** | Provide a monitoring workspace for supplier incidents, shipment delays, port congestion, weather risks, and geopolitical events. Enable teams to track, filter, and respond to disruption signals. |
| **Dependencies** | Task 1 (data architecture, disruption types) |

### Features to Implement

1. Disruption signal feed with severity, source, timestamps, and affected entities.
2. Shipment tracking table with delay indicators.
3. Signal detail panel with status updates and business relevance.
4. Filters by severity, type, supplier, date range.
5. Status update workflow (acknowledge, investigate, resolve).

### Screens & UI

- **Monitoring page** — `/onchain-insights/disruptions` — signal feed + shipment grid.
- **Signal detail drawer** — Expandable panel with timeline and affected entities.
- **Shipment map placeholder** — Grid layout showing shipment status by route.

### Backend / API Changes

- `app/api/onchain-insights/disruptions/route.ts`
- `app/api/onchain-insights/disruptions/[id]/route.ts`

### Mock Data Behavior

15–20 mock disruption events across different categories (weather, port, supplier, geopolitical). All labeled as demo data.

### Files Likely to Change

- `app/(dashboard)/onchain-insights/disruptions/page.tsx` (new)
- `lib/mock-data/onchain-insights/disruptions.ts` (new)
- `types/onchain-insights.ts` (extend)

### Acceptance Criteria

- [x] Disruption feed shows ≥10 events with severity badges.
- [x] Filter/search reduces results correctly.
- [x] Signal detail shows affected suppliers, shipments, and business impact.
- [x] Status workflow (acknowledge → investigate → resolve) is functional.
- [x] "Demo Data" label is visible.

### Testing

- Verify all severity levels render with correct visual treatment.
- Test status transition flow.

---

## Task 7: Disruption Prediction & Explainable Risk Prioritization

| Field | Detail |
|---|---|
| **Status** | ✅ DONE |
| **Business Purpose** | Assess and prioritize supplier and disruption risks using transparent scoring. Provide understandable risk levels, contributing factors, and explanations. |
| **Dependencies** | Task 2 (supplier data), Task 6 (disruption signals) |

### Features to Implement

1. Risk assessment workspace showing all suppliers with risk scores.
2. Contributing factor breakdown (delivery, financial, geographic, compliance).
3. Prediction horizon (when supported by a model).
4. Confidence indicators where applicable.
5. Deterministic baseline scoring with documented formula.

### Screens & UI

- **Risk assessment page** — `/onchain-insights/risk-assessment` — prioritized supplier list with risk heatmap.
- **Factor breakdown** — Recharts radar chart per supplier.
- **Risk explanation panel** — Plain-language explanations.
- **Scoring methodology disclosure** — Collapsible section explaining the formula.

### Backend / API Changes

- `app/api/onchain-insights/risk-assessment/route.ts`
- Transparent rule-based scoring service.

### Mock Data Behavior

Risk scores calculated deterministically from mock supplier attributes. UI explicitly labels scores as "Rule-Based Score" not "AI Prediction."

### Files Likely to Change

- `app/(dashboard)/onchain-insights/risk-assessment/page.tsx` (new)
- `lib/server/modules/onchain-insights/risk-scoring.ts` (new)
- `types/onchain-insights.ts` (extend)

### Acceptance Criteria

- [x] All suppliers shown with risk scores and severity tiers.
- [x] Factor breakdown chart is interactive (tooltips).
- [x] Scoring methodology is disclosed in-UI.
- [x] UI does NOT claim ML prediction — labels it "Rule-Based Assessment."
- [x] Score changes when mock inputs change.

### Testing

- Verify score formula produces expected outputs with known inputs.
- Verify visual treatment matches severity thresholds.

---

## Task 8: Multi-Tier Dependency & Impact Explorer

| Field | Detail |
|---|---|
| **Status** | ✅ DONE |
| **Business Purpose** | Visualize the supply chain network: suppliers → materials → products → orders. Allow users to select a disrupted supplier and trace downstream impact. |
| **Dependencies** | Task 2 (suppliers), Task 6 (disruptions), Task 1 (navigation) |

### Features to Implement

1. Interactive node-edge graph visualization.
2. Node types: suppliers, sub-tier suppliers, materials, facilities, SKUs, shipments, orders.
3. Select a supplier → highlight downstream impact path.
4. Zoom, pan, filter by entity type.
5. Impact summary panel for selected node.
6. Navigation to related ERP records (products, sales orders, POs).

### Screens & UI

- **Dependency explorer** — `/onchain-insights/dependencies` — full-width graph canvas.
- **Node detail sidebar** — Information panel for selected node.
- **Impact summary** — Affected orders count, estimated revenue at risk.

### Backend / API Changes

- `app/api/onchain-insights/dependencies/route.ts` — graph data endpoint.
- Mock relationship data connecting to existing ERP entity IDs where possible.

### Chart Library Addition

- **`@xyflow/react` (React Flow)** — installed for this task only. Purpose-built for interactive node-edge diagrams.

### Mock Data Behavior

Mock supply chain graph with 15–25 nodes and 20–35 edges representing realistic relationships.

### Files Likely to Change

- `app/(dashboard)/onchain-insights/dependencies/page.tsx` (new)
- `package.json` (add `@xyflow/react`)
- `lib/mock-data/onchain-insights/dependencies.ts` (new)

### Acceptance Criteria

- [x] Graph renders with ≥15 nodes and visible edges.
- [x] Selecting a supplier highlights downstream path.
- [x] Zoom and pan work smoothly.
- [x] Node detail sidebar shows entity info.
- [x] Links to existing ERP pages work (products, orders).
- [x] Filter by entity type reduces visible nodes.

### Testing

- Verify graph performance with mock dataset.
- Test node selection and impact highlight.

---

## Task 9: Mitigation Recommendation & Scenario Lab

| Field | Detail |
|---|---|
| **Status** | ✅ DONE |
| **Business Purpose** | Compare recovery options (alternate sourcing, expedited shipping, inventory transfer, safety-stock adjustment) with transparent trade-offs so procurement teams can make informed decisions. |
| **Dependencies** | Task 6 (disruptions), Task 7 (risk scores), Task 2 (suppliers) |

### Features to Implement

1. Recovery option cards with estimated benefit, cost, time, and feasibility.
2. Scenario comparison table.
3. Ranking with explainable rationale.
4. Adjustable assumptions per option.
5. Residual risk and affected-order summary.

### Screens & UI

- **Scenario Lab** — `/onchain-insights/mitigation` — workspace with ranked options.
- **Comparison grid** — Side-by-side option cards.
- **Trade-off chart** — Recharts scatter or bar chart (cost vs. recovery time).
- **Assumptions editor** — Inline editable fields.

### Backend / API Changes

- `app/api/onchain-insights/mitigation/route.ts`
- Deterministic baseline recommendation algorithm.

### Mock Data Behavior

3–5 pre-built mitigation scenarios per active disruption. UI labels recommendations as "Baseline Algorithm" not "Optimal."

### Files Likely to Change

- `app/(dashboard)/onchain-insights/mitigation/page.tsx` (new)
- `types/onchain-insights.ts` (extend)

### Acceptance Criteria

- [x] ≥3 mitigation options displayed per disruption.
- [x] Options ranked with visible scoring rationale.
- [x] Changing assumptions updates estimates.
- [x] UI does NOT claim "globally optimal."
- [x] Affected orders and residual risks shown.

### Testing

- Verify recommendation ranking changes with input variations.
- Test with no available alternatives (edge case).

---

## Task 10: Human Approval & Action Audit Trail

| Field | Detail |
|---|---|
| **Status** | ✅ DONE |
| **Business Purpose** | Create a governance layer for consequential supplier and recovery decisions. Ensure all decisions are reviewed, approved, and recorded before any action is taken. |
| **Dependencies** | Task 9 (mitigation options), Task 3 (supplier management) |

### Features to Implement

1. Approval queue with pending/approved/rejected filters.
2. Review screen showing recommendation, explanation, and impact.
3. Approve/reject/request-changes with comments.
4. Status history for each decision.
5. Audit trail recording all simulated decisions.

### Screens & UI

- **Approval queue** — `/onchain-insights/approvals` — filtered table.
- **Decision review page** — `/onchain-insights/approvals/[id]` — full context.
- **Audit trail** — Timeline of decisions with user, timestamp, and outcome.

### Backend / API Changes

- `app/api/onchain-insights/approvals/route.ts`
- `app/api/onchain-insights/approvals/[id]/route.ts`
- Mock persistence in memory/localStorage for demo.

### Mock Data Behavior

Pre-seeded approval queue with decisions in various states. No real procurement actions triggered.

### Files Likely to Change

- `app/(dashboard)/onchain-insights/approvals/` (new directory)
- `types/onchain-insights.ts` (extend)

### Acceptance Criteria

- [x] Approval queue shows pending decisions with urgency indicators.
- [x] Review screen displays full recommendation context.
- [x] Approve/reject flow updates status and records to audit trail.
- [x] No real POs or supplier changes are created.
- [x] Audit timeline shows chronological decision history.

### Testing

- Complete full approve and reject flows.
- Verify audit entries are created correctly.

---

## Task 11: Stakeholder Alerts & Notification Center

| Field | Detail |
|---|---|
| **Status** | ✅ DONE |
| **Business Purpose** | Keep stakeholders informed of supplier risks, shipment delays, pending approvals, and new recommendations through a centralized notification center. |
| **Dependencies** | Task 6 (disruptions), Task 10 (approvals) |

### Features to Implement

1. Notification center accessible from topbar bell icon.
2. Notification categories: risk alerts, shipment delays, approval requests, recommendations, SKU transitions.
3. Read/unread state, severity badges, timestamps.
4. Filtering by category and severity.
5. Click-through navigation to relevant records.

### Screens & UI

- **Notification panel** — Slide-out panel or dedicated page at `/onchain-insights/notifications`.
- **Notification cards** — Severity color coding, actionable links.
- **Filter bar** — Category and severity toggles.

### Backend / API Changes

- `app/api/onchain-insights/notifications/route.ts`
- Mock notifications generated from existing mock data.

### Mock Data Behavior

20–30 mock notifications across all categories with varied read/unread states and severity levels.

### Files Likely to Change

- `components/layout/Topbar.tsx` (enhance bell icon to link to notification center)
- `app/(dashboard)/onchain-insights/notifications/page.tsx` (new)
- `types/onchain-insights.ts` (extend)

### Acceptance Criteria

- [x] Notification center shows categorized, timestamped alerts.
- [x] Read/unread toggle works.
- [x] Filters reduce visible notifications correctly.
- [x] Clicking a notification navigates to the relevant page.
- [x] Unread count badge in topbar reflects state.

### Testing

- Verify read/unread state persistence.
- Test filter combinations.

---

## Task 12: Outcome Analytics, Post-Mortem & Quality Verification

| Field | Detail |
|---|---|
| **Status** | ✅ DONE |
| **Business Purpose** | Analyze historical disruptions, mitigation decisions, recovery times, and service impact. Enable post-mortem reviews and continuous improvement. Final integration testing and documentation. |
| **Dependencies** | All previous tasks |

### Features to Implement

1. Outcome analytics dashboard with charts for disruption history, recovery time, cost impact.
2. Post-mortem workflow: what happened → what was decided → what was the outcome.
3. Supplier performance trends.
4. Recurring risk pattern identification.
5. Integration testing across all 12 tasks.
6. Responsive layout verification and error-state fixes.
7. API integration documentation.

### Screens & UI

- **Analytics page** — `/onchain-insights/analytics` — charts and tables.
- **Post-mortem form** — Structured capture of incident details and lessons learned.
- **Trend charts** — Recharts line/bar charts for performance over time.
- **Outcome table** — Disruption → decision → result mapping.

### Backend / API Changes

- `app/api/onchain-insights/analytics/route.ts`
- Aggregation logic over mock historical data.

### Mock Data Behavior

Simulated historical outcomes clearly labeled. No invented real-world savings or improvements.

### Files Likely to Change

- `app/(dashboard)/onchain-insights/analytics/page.tsx` (new)
- `types/onchain-insights.ts` (extend)
- `.env.example` (create/update with all Onchain Insights config)
- Documentation updates.

### Acceptance Criteria

- [x] Analytics dashboard shows ≥3 outcome visualizations.
- [x] Post-mortem form captures structured data.
- [x] Simulated outcomes are clearly labeled.
- [x] No false claims of real savings or ML accuracy.
- [x] All 12 task pages are accessible and functional.
- [x] Responsive layouts verified at 1024px, 1280px, 1440px.
- [x] Error states handled across all pages.
- [x] `.env.example` documents all configuration.
- [x] API integration guide documents the adapter pattern.

### Testing

- End-to-end flow through all module pages.
- Responsive layout audit.
- Error state and empty state verification.

---

## Dependency Map

```
Task 1 (Dashboard + Architecture)
├── Task 2 (Supplier Qualification)
│   ├── Task 3 (Supplier Onboarding)
│   ├── Task 4 (Supplier Switching Simulator)
│   └── Task 7 (Risk Prioritization) ← also depends on Task 6
├── Task 5 (SKU Transition) ← also depends on Task 2
├── Task 6 (Disruption Monitoring)
│   ├── Task 7 (Risk Prioritization) ← also depends on Task 2
│   ├── Task 8 (Dependency Explorer) ← also depends on Task 2
│   └── Task 9 (Mitigation Lab) ← also depends on Task 7, Task 2
│       └── Task 10 (Approvals) ← also depends on Task 3
│           └── Task 11 (Notifications) ← also depends on Task 6
└── Task 12 (Analytics & Post-Mortem) ← depends on all
```

## Proposed Implementation Order

1. **Task 1** → Foundation: navigation, data architecture, dashboard
2. **Task 2** → Supplier data model and qualification workspace
3. **Task 6** → Disruption monitoring (independent of Tasks 3–5)
4. **Task 3** → Supplier onboarding (builds on Task 2)
5. **Task 7** → Risk scoring (builds on Tasks 2 + 6)
6. **Task 4** → Supplier switching (builds on Task 2)
7. **Task 5** → SKU transition (builds on Tasks 1 + 2)
8. **Task 8** → Dependency explorer (builds on Tasks 2 + 6)
9. **Task 9** → Mitigation lab (builds on Tasks 6 + 7)
10. **Task 10** → Approvals (builds on Tasks 9 + 3)
11. **Task 11** → Notifications (builds on Tasks 6 + 10)
12. **Task 12** → Analytics, post-mortem, final integration

## Integration Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Sidebar SECTIONS array change could affect existing navigation styling | Low | Only add a new section object; do not modify existing entries |
| Authorization in `layout.tsx` needs to allow `/onchain-insights` routes | Low | Add `pathname.startsWith('/onchain-insights')` check with appropriate role list |
| Recharts bundle size impact on initial load | Medium | Use dynamic imports with `next/dynamic` to code-split chart components |
| React Flow bundle size (Task 8) | Medium | Lazy-load only when dependency explorer page is visited |
| Mock data consistency across 12 tasks | Medium | Centralize all mock data in `lib/mock-data/onchain-insights/` with shared entity IDs |
| `.env` already has duplicate entries | Low | Clean up duplicates and add new variables at the end |
| No existing chart library to reuse | Low | Chart component files exist but are empty; Recharts fills this gap cleanly |

## Important Assumptions

1. **Onchain Insights is accessible to `admin` and `purchase` roles** by default. Other roles can be added per your guidance.
2. **No Prisma schema changes** in early tasks — mock data lives in TypeScript files. Schema extensions can be added later if persistence is needed.
3. **Recharts** is chosen over hand-drawn SVGs because the existing chart component files are empty, and Recharts provides interactive, responsive charts with minimal overhead.
4. **React Flow** is deferred to Task 8 to minimize upfront dependencies.
5. **FastAPI engine is not modified** — Onchain Insights operates through Next.js API routes. AI engine integration can be added via the adapter pattern when appropriate.
6. **All monetary values use INR (₹)** consistent with the existing ERP.
