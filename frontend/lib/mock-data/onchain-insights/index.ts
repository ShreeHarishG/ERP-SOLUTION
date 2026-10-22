// =============================================================================
// Onchain Insights — Mock Data
// Centralized mock data for the entire Onchain Insights module.
// All entity IDs are stable across features to maintain referential consistency.
// =============================================================================

import type {
  OnchainDashboardData,
  OnchainDashboardKpis,
  DisruptionSignal,
  SupplierSummary,
  SupplierRiskDistribution,
  ShipmentRiskDataPoint,
  AffectedMaterial,
  RecommendedAction,
  OnchainDashboardFilters,
} from '@/types/onchain-insights';

// --- Stable Supplier IDs ---
const SUPPLIER_IDS = {
  globalTimber:    'sup-001',
  apexHardware:    'sup-002',
  rajshreeFabrics: 'sup-003',
  steelcraftIndia: 'sup-004',
  varnishWorks:    'sup-005',
  foamComfort:     'sup-006',
  precisionFix:    'sup-007',
  ecoPanels:       'sup-008',
};

// --- Suppliers ---
export const MOCK_SUPPLIERS: SupplierSummary[] = [
  {
    id: SUPPLIER_IDS.globalTimber,
    name: 'Global Timber Exports',
    riskTier: 'critical',
    riskScore: 87,
    location: 'Myanmar',
    materialsSupplied: ['Teak Wood Planks', 'Hardwood Boards', 'Plywood Sheets'],
    lastAssessmentDate: '2026-09-28',
  },
  {
    id: SUPPLIER_IDS.apexHardware,
    name: 'Apex Hardware Co.',
    riskTier: 'medium',
    riskScore: 45,
    location: 'Gujarat, India',
    materialsSupplied: ['Steel Screws', 'Drawer Slides', 'Cabinet Hinges'],
    lastAssessmentDate: '2026-10-05',
  },
  {
    id: SUPPLIER_IDS.rajshreeFabrics,
    name: 'Rajshree Fabrics Ltd.',
    riskTier: 'low',
    riskScore: 18,
    location: 'Surat, India',
    materialsSupplied: ['Upholstery Fabric', 'Cushion Covers'],
    lastAssessmentDate: '2026-10-10',
  },
  {
    id: SUPPLIER_IDS.steelcraftIndia,
    name: 'SteelCraft India Pvt.',
    riskTier: 'high',
    riskScore: 68,
    location: 'Jamshedpur, India',
    materialsSupplied: ['Steel Frames', 'Metal Brackets', 'Table Legs (Metal)'],
    lastAssessmentDate: '2026-10-01',
  },
  {
    id: SUPPLIER_IDS.varnishWorks,
    name: 'Varnish Works International',
    riskTier: 'medium',
    riskScore: 42,
    location: 'Chennai, India',
    materialsSupplied: ['Wood Varnish', 'Polish Compounds', 'Sealants'],
    lastAssessmentDate: '2026-10-08',
  },
  {
    id: SUPPLIER_IDS.foamComfort,
    name: 'FoamComfort Industries',
    riskTier: 'low',
    riskScore: 12,
    location: 'Pune, India',
    materialsSupplied: ['High-Density Foam', 'Cushion Padding'],
    lastAssessmentDate: '2026-10-09',
  },
  {
    id: SUPPLIER_IDS.precisionFix,
    name: 'Precision Fixings Corp.',
    riskTier: 'high',
    riskScore: 72,
    location: 'Shenzhen, China',
    materialsSupplied: ['Precision Bearings', 'Swivel Mechanisms', 'Caster Wheels'],
    lastAssessmentDate: '2026-09-30',
  },
  {
    id: SUPPLIER_IDS.ecoPanels,
    name: 'EcoPanels Green Materials',
    riskTier: 'medium',
    riskScore: 38,
    location: 'Bengaluru, India',
    materialsSupplied: ['MDF Boards', 'Particle Board', 'Laminate Sheets'],
    lastAssessmentDate: '2026-10-06',
  },
];

// --- Disruption Signals ---
export const MOCK_DISRUPTIONS: DisruptionSignal[] = [
  {
    id: 'dis-001',
    title: 'Cyclone Warning — Bay of Bengal Shipping Routes',
    description: 'Tropical cyclone forming near Andaman Sea. Expected to impact Chennai-Myanmar shipping lanes within 72 hours. Port authorities may impose vessel restrictions.',
    category: 'weather',
    severity: 'critical',
    status: 'active',
    source: 'weather_service',
    affectedSuppliers: [SUPPLIER_IDS.globalTimber],
    affectedShipments: ['SHP-2026-0847', 'SHP-2026-0851'],
    affectedMaterials: ['Teak Wood Planks', 'Hardwood Boards'],
    affectedOrders: ['SO-2026-0112', 'SO-2026-0115'],
    detectedAt: '2026-10-11T14:30:00Z',
    updatedAt: '2026-10-12T02:15:00Z',
    estimatedImpact: '7–12 day delay on 2 active shipments',
    region: 'Bay of Bengal',
  },
  {
    id: 'dis-002',
    title: 'Port Congestion — JNPT Mumbai',
    description: 'Container backlog at Jawaharlal Nehru Port Trust exceeding 48-hour dwell times. Customs processing delays affecting inbound raw material shipments.',
    category: 'port_congestion',
    severity: 'high',
    status: 'active',
    source: 'port_authority',
    affectedSuppliers: [SUPPLIER_IDS.precisionFix, SUPPLIER_IDS.steelcraftIndia],
    affectedShipments: ['SHP-2026-0842', 'SHP-2026-0845'],
    affectedMaterials: ['Precision Bearings', 'Steel Frames'],
    affectedOrders: ['SO-2026-0108', 'SO-2026-0110'],
    detectedAt: '2026-10-10T08:00:00Z',
    updatedAt: '2026-10-11T22:00:00Z',
    estimatedImpact: '3–5 day clearance delay',
    region: 'Mumbai, India',
  },
  {
    id: 'dis-003',
    title: 'Supplier Production Halt — SteelCraft India',
    description: 'SteelCraft India reports temporary production shutdown due to furnace maintenance. Expected to resume in 5 business days. Current orders will be delayed.',
    category: 'supplier_incident',
    severity: 'high',
    status: 'acknowledged',
    source: 'supplier_report',
    affectedSuppliers: [SUPPLIER_IDS.steelcraftIndia],
    affectedShipments: ['SHP-2026-0849'],
    affectedMaterials: ['Steel Frames', 'Metal Brackets', 'Table Legs (Metal)'],
    affectedOrders: ['SO-2026-0110', 'SO-2026-0113'],
    detectedAt: '2026-10-09T11:20:00Z',
    updatedAt: '2026-10-11T16:30:00Z',
    estimatedImpact: '5 business day production delay',
    region: 'Jamshedpur, India',
  },
  {
    id: 'dis-004',
    title: 'Quality Deviation — Varnish Batch VW-2026-Q3',
    description: 'Quality control inspection flagged color consistency deviation in latest varnish shipment. Batch VW-2026-Q3 may require re-processing or replacement.',
    category: 'quality',
    severity: 'medium',
    status: 'monitoring',
    source: 'internal',
    affectedSuppliers: [SUPPLIER_IDS.varnishWorks],
    affectedShipments: ['SHP-2026-0850'],
    affectedMaterials: ['Wood Varnish'],
    affectedOrders: ['SO-2026-0114'],
    detectedAt: '2026-10-11T09:45:00Z',
    updatedAt: '2026-10-11T18:00:00Z',
    estimatedImpact: '2–3 day re-inspection delay',
    region: 'Chennai, India',
  },
  {
    id: 'dis-005',
    title: 'Export Restrictions — Myanmar Timber Regulations',
    description: 'Myanmar government announced new timber export quotas effective November 2026. Long-term supply of teak and hardwood may be affected.',
    category: 'geopolitical',
    severity: 'medium',
    status: 'monitoring',
    source: 'news',
    affectedSuppliers: [SUPPLIER_IDS.globalTimber],
    affectedShipments: [],
    affectedMaterials: ['Teak Wood Planks', 'Hardwood Boards'],
    affectedOrders: [],
    detectedAt: '2026-10-08T06:00:00Z',
    updatedAt: '2026-10-10T12:00:00Z',
    estimatedImpact: 'Potential 30% supply reduction from Q1 2027',
    region: 'Myanmar',
  },
  {
    id: 'dis-006',
    title: 'Logistics Partner Strike — Regional Trucking',
    description: 'Regional trucking union in Maharashtra announced a 3-day strike starting October 14. Last-mile delivery of materials from JNPT and Pune warehouses may be disrupted.',
    category: 'logistics',
    severity: 'medium',
    status: 'active',
    source: 'news',
    affectedSuppliers: [SUPPLIER_IDS.foamComfort, SUPPLIER_IDS.varnishWorks],
    affectedShipments: ['SHP-2026-0852', 'SHP-2026-0853'],
    affectedMaterials: ['High-Density Foam', 'Wood Varnish', 'Polish Compounds'],
    affectedOrders: ['SO-2026-0114', 'SO-2026-0116'],
    detectedAt: '2026-10-11T16:00:00Z',
    updatedAt: '2026-10-12T01:00:00Z',
    estimatedImpact: '3-day delivery disruption in Maharashtra',
    region: 'Maharashtra, India',
  },
];

// --- Shipment Risk Trend (last 90 days) ---
function generateShipmentRiskTrend(): ShipmentRiskDataPoint[] {
  const data: ShipmentRiskDataPoint[] = [];
  const now = new Date('2026-10-12');
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    // Create a realistic wave pattern with increasing trend
    const base = 28 + Math.sin(i / 12) * 10 + (90 - i) * 0.15;
    const noise = (Math.sin(i * 3.7) * 5) + (Math.cos(i * 1.3) * 3);
    const riskScore = Math.round(Math.min(95, Math.max(10, base + noise)));
    data.push({
      date: d.toISOString().slice(0, 10),
      riskScore,
      activeDisruptions: Math.max(0, Math.round(riskScore / 20 + Math.sin(i) * 1.5)),
      delayedShipments: Math.max(0, Math.round(riskScore / 25 + Math.cos(i * 0.8))),
    });
  }
  return data;
}

export const MOCK_SHIPMENT_RISK_TREND = generateShipmentRiskTrend();

// --- Supplier Risk Distribution ---
export function computeSupplierRiskDistribution(suppliers: SupplierSummary[]): SupplierRiskDistribution[] {
  const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  suppliers.forEach(s => counts[s.riskTier]++);
  const total = suppliers.length;
  return [
    { tier: 'critical', count: counts.critical, percentage: Math.round((counts.critical / total) * 100) },
    { tier: 'high', count: counts.high, percentage: Math.round((counts.high / total) * 100) },
    { tier: 'medium', count: counts.medium, percentage: Math.round((counts.medium / total) * 100) },
    { tier: 'low', count: counts.low, percentage: Math.round((counts.low / total) * 100) },
  ];
}

// --- Affected Materials ---
export const MOCK_AFFECTED_MATERIALS: AffectedMaterial[] = [
  {
    id: 'mat-001',
    materialName: 'Teak Wood Planks',
    sku: 'RM-TEAK-001',
    supplierName: 'Global Timber Exports',
    disruptionTitle: 'Cyclone Warning — Bay of Bengal',
    severity: 'critical',
    affectedOrderCount: 2,
    estimatedDelayDays: 10,
  },
  {
    id: 'mat-002',
    materialName: 'Steel Frames',
    sku: 'RM-STEEL-002',
    supplierName: 'SteelCraft India Pvt.',
    disruptionTitle: 'Supplier Production Halt',
    severity: 'high',
    affectedOrderCount: 2,
    estimatedDelayDays: 5,
  },
  {
    id: 'mat-003',
    materialName: 'Precision Bearings',
    sku: 'RM-BEAR-003',
    supplierName: 'Precision Fixings Corp.',
    disruptionTitle: 'Port Congestion — JNPT Mumbai',
    severity: 'high',
    affectedOrderCount: 1,
    estimatedDelayDays: 4,
  },
  {
    id: 'mat-004',
    materialName: 'Wood Varnish',
    sku: 'RM-VARN-004',
    supplierName: 'Varnish Works International',
    disruptionTitle: 'Quality Deviation — Batch VW-2026-Q3',
    severity: 'medium',
    affectedOrderCount: 1,
    estimatedDelayDays: 3,
  },
  {
    id: 'mat-005',
    materialName: 'High-Density Foam',
    sku: 'RM-FOAM-005',
    supplierName: 'FoamComfort Industries',
    disruptionTitle: 'Logistics Partner Strike',
    severity: 'medium',
    affectedOrderCount: 1,
    estimatedDelayDays: 3,
  },
];

// --- Recommended Actions ---
export const MOCK_RECOMMENDED_ACTIONS: RecommendedAction[] = [
  {
    id: 'act-001',
    title: 'Activate alternate timber source from Kerala',
    description: 'Contact Kerala Wood Traders as backup for teak planks while Myanmar supply is disrupted by the cyclone. Lead time: 4 days vs. expected 10-day delay.',
    actionType: 'switch_supplier',
    urgency: 'immediate',
    estimatedBenefit: '6-day lead time reduction',
    estimatedCost: '₹12,000 additional per order',
    relatedDisruptionId: 'dis-001',
    relatedSupplier: 'Global Timber Exports',
    affectedOrders: 2,
  },
  {
    id: 'act-002',
    title: 'Expedite steel frames from SteelCraft backup line',
    description: 'SteelCraft\'s Kolkata facility has capacity. Request priority production at 15% premium to avoid 5-day delay on pending MOs.',
    actionType: 'expedite_shipment',
    urgency: 'urgent',
    estimatedBenefit: '3-day recovery',
    estimatedCost: '₹8,500 premium charge',
    relatedDisruptionId: 'dis-003',
    relatedSupplier: 'SteelCraft India Pvt.',
    affectedOrders: 2,
  },
  {
    id: 'act-003',
    title: 'Increase safety stock for precision bearings',
    description: 'Port congestion at JNPT is recurring. Raise safety stock from 50 to 100 units to buffer against future delays.',
    actionType: 'increase_safety_stock',
    urgency: 'standard',
    estimatedBenefit: 'Prevent 2 future stockouts',
    estimatedCost: '₹22,000 carrying cost increase',
    relatedDisruptionId: 'dis-002',
    relatedSupplier: 'Precision Fixings Corp.',
    affectedOrders: 1,
  },
  {
    id: 'act-004',
    title: 'Split varnish sourcing between two suppliers',
    description: 'Dual-source wood varnish between Varnish Works and a qualified domestic alternative to reduce quality-event dependency.',
    actionType: 'split_sourcing',
    urgency: 'standard',
    estimatedBenefit: 'Reduce single-supplier dependency',
    estimatedCost: '₹5,200 per month',
    relatedDisruptionId: 'dis-004',
    relatedSupplier: 'Varnish Works International',
    affectedOrders: 1,
  },
  {
    id: 'act-005',
    title: 'Pre-position foam inventory before trucking strike',
    description: 'Move 3 days of foam inventory from Pune warehouse to local facility before October 14 strike begins.',
    actionType: 'inventory_transfer',
    urgency: 'urgent',
    estimatedBenefit: 'Avoid 3-day production halt',
    estimatedCost: '₹4,800 transport cost',
    relatedDisruptionId: 'dis-006',
    relatedSupplier: 'FoamComfort Industries',
    affectedOrders: 1,
  },
];

// --- Dashboard Data Assembler ---

export function getMockDashboardData(filters: OnchainDashboardFilters): OnchainDashboardData {
  // Apply filters
  let disruptions = [...MOCK_DISRUPTIONS];
  let suppliers = [...MOCK_SUPPLIERS];

  if (filters.riskLevel !== 'all') {
    suppliers = suppliers.filter(s => s.riskTier === filters.riskLevel);
    // Also filter disruptions to those affecting filtered suppliers
    const filteredSupplierIds = new Set(suppliers.map(s => s.id));
    disruptions = disruptions.filter(d =>
      d.affectedSuppliers.some(sid => filteredSupplierIds.has(sid))
    );
  }

  if (filters.supplierId !== 'all') {
    disruptions = disruptions.filter(d =>
      d.affectedSuppliers.includes(filters.supplierId)
    );
  }

  // Date range filter on shipment risk trend
  const daysMap = { '7d': 7, '30d': 30, '60d': 60, '90d': 90 };
  const days = daysMap[filters.dateRange];
  const trendData = MOCK_SHIPMENT_RISK_TREND.slice(-days);

  // Compute KPIs from current data
  const activeDisruptions = MOCK_DISRUPTIONS.filter(d => d.status === 'active' || d.status === 'acknowledged').length;
  const atRiskSuppliers = MOCK_SUPPLIERS.filter(s => s.riskTier === 'critical' || s.riskTier === 'high').length;
  const affectedOrderIds = new Set(MOCK_DISRUPTIONS.flatMap(d => d.affectedOrders));
  const kpis: OnchainDashboardKpis = {
    activeDisruptions,
    atRiskSuppliers,
    affectedOrders: affectedOrderIds.size,
    avgRiskScore: Math.round(MOCK_SUPPLIERS.reduce((sum, s) => sum + s.riskScore, 0) / MOCK_SUPPLIERS.length),
    pendingApprovals: 3,
    recommendedActions: MOCK_RECOMMENDED_ACTIONS.length,
  };

  return {
    kpis,
    disruptions: disruptions.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }),
    supplierRiskDistribution: computeSupplierRiskDistribution(MOCK_SUPPLIERS),
    shipmentRiskTrend: trendData,
    affectedMaterials: MOCK_AFFECTED_MATERIALS,
    recommendedActions: MOCK_RECOMMENDED_ACTIONS,
    suppliers: suppliers,
    dataMode: 'mock',
    lastUpdated: new Date().toISOString(),
  };
}

export * from './suppliers';
export * from './switching';
export * from './onboarding';
export * from './sku-transition';
export * from './disruptions';
export * from '@/lib/server/modules/onchain-insights/risk-scoring';
export * from './dependencies';


