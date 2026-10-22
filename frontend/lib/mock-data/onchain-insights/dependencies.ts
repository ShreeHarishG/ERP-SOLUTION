// =============================================================================
// Onchain Insights — Multi-Tier Dependency & Impact Explorer Mock Store
// Realistic 6-tier network DAG graph (Sub-tier → Supplier → Material → Facility → SKU → Sales Order)
// =============================================================================

import type {
  DependencyGraphNode,
  DependencyGraphEdge,
  DependencyGraphResponse,
  DownstreamImpactSummary,
} from '@/types/onchain-insights';

// --- Static Graph Layout & Node Registry ---
export const MOCK_GRAPH_NODES: DependencyGraphNode[] = [
  // ---------------------------------------------------------------------------
  // TIER -2: SUB-TIER RAW EXTRACTORS & SMELTERS (x: 60)
  // ---------------------------------------------------------------------------
  {
    id: 'sub-01',
    position: { x: 60, y: 120 },
    data: {
      label: 'Myanmar Forestry Concession',
      sublabel: 'Teak Logging Blocks 4 & 7',
      type: 'sub_tier',
      entityId: 'sub-01',
      status: 'disrupted',
      riskScore: 88,
      disruptionTitle: 'Cyclone Warning — Bay of Bengal',
      location: 'Bago Region, Myanmar',
      erpLink: '/onchain-insights/disruptions',
    },
  },
  {
    id: 'sub-02',
    position: { x: 60, y: 320 },
    data: {
      label: 'Baoan Steel Wire Smelter',
      sublabel: 'Carbon Bearing Steel Rods',
      type: 'sub_tier',
      entityId: 'sub-02',
      status: 'at_risk',
      riskScore: 68,
      disruptionTitle: 'JNPT Port Congestion Dwell Time',
      location: 'Shenzhen, China',
      erpLink: '/onchain-insights/disruptions',
    },
  },
  {
    id: 'sub-03',
    position: { x: 60, y: 520 },
    data: {
      label: 'Tatanagar Coking Coal Siding',
      sublabel: 'Raw Blast Furnace Feedstock',
      type: 'sub_tier',
      entityId: 'sub-03',
      status: 'disrupted',
      riskScore: 78,
      disruptionTitle: 'Blast Furnace 2 Maintenance Halt',
      location: 'Jamshedpur, Jharkhand',
      erpLink: '/onchain-insights/disruptions',
    },
  },
  {
    id: 'sub-04',
    position: { x: 60, y: 720 },
    data: {
      label: 'Dahej Petrochem Polyol Hub',
      sublabel: 'Polyurethane Chemical Stocks',
      type: 'sub_tier',
      entityId: 'sub-04',
      status: 'operational',
      riskScore: 24,
      location: 'Dahej, Gujarat',
    },
  },

  // ---------------------------------------------------------------------------
  // TIER -1: DIRECT TIER-1 SUPPLIERS (x: 360)
  // ---------------------------------------------------------------------------
  {
    id: 'sup-001',
    position: { x: 360, y: 120 },
    data: {
      label: 'Global Timber Exports',
      sublabel: 'Teak & Hardwood Planks',
      type: 'supplier',
      entityId: 'sup-001',
      status: 'disrupted',
      riskScore: 87,
      disruptionTitle: 'Cyclone Warning — Bay of Bengal',
      location: 'Yangon, Myanmar',
      leadTimeDays: 21,
      erpLink: '/onchain-insights/suppliers/sup-001',
    },
  },
  {
    id: 'sup-007',
    position: { x: 360, y: 320 },
    data: {
      label: 'Precision Fixings Corp.',
      sublabel: 'Mechanisms & Bearings',
      type: 'supplier',
      entityId: 'sup-007',
      status: 'at_risk',
      riskScore: 72,
      disruptionTitle: 'Port Congestion — JNPT Mumbai',
      location: 'Shenzhen, China',
      leadTimeDays: 18,
      erpLink: '/onchain-insights/suppliers/sup-007',
    },
  },
  {
    id: 'sup-004',
    position: { x: 360, y: 520 },
    data: {
      label: 'SteelCraft India Pvt.',
      sublabel: 'Structural Frames & Brackets',
      type: 'supplier',
      entityId: 'sup-004',
      status: 'disrupted',
      riskScore: 68,
      disruptionTitle: 'Supplier Production Halt — Furnace 2',
      location: 'Jamshedpur, India',
      leadTimeDays: 14,
      erpLink: '/onchain-insights/suppliers/sup-004',
    },
  },
  {
    id: 'sup-006',
    position: { x: 360, y: 720 },
    data: {
      label: 'FoamComfort Industries',
      sublabel: 'High-Density Poly Foam',
      type: 'supplier',
      entityId: 'sup-006',
      status: 'operational',
      riskScore: 12,
      location: 'Chakan, Pune',
      leadTimeDays: 4,
      erpLink: '/onchain-insights/suppliers/sup-006',
    },
  },
  {
    id: 'sup-003',
    position: { x: 360, y: 920 },
    data: {
      label: 'Rajshree Fabrics Ltd.',
      sublabel: 'Jacquard Upholstery',
      type: 'supplier',
      entityId: 'sup-003',
      status: 'operational',
      riskScore: 18,
      location: 'Surat, Gujarat',
      leadTimeDays: 5,
      erpLink: '/onchain-insights/suppliers/sup-003',
    },
  },

  // ---------------------------------------------------------------------------
  // TIER 0: RAW MATERIALS & COMPONENTS (x: 680)
  // ---------------------------------------------------------------------------
  {
    id: 'mat-01',
    position: { x: 680, y: 120 },
    data: {
      label: 'Teak Wood Planks (A-Grade)',
      sublabel: 'RM-TEAK-001',
      type: 'material',
      entityId: 'mat-01',
      status: 'disrupted',
      riskScore: 85,
      disruptionTitle: 'Cyclone Route Delays (10d)',
      sku: 'RM-TEAK-001',
      stockUnits: 620,
      erpLink: '/inventory',
    },
  },
  {
    id: 'mat-02',
    position: { x: 680, y: 320 },
    data: {
      label: 'Precision Bearings 6204',
      sublabel: 'RM-BEAR-003',
      type: 'material',
      entityId: 'mat-02',
      status: 'at_risk',
      riskScore: 70,
      disruptionTitle: 'Held in JNPT Customs CFS',
      sku: 'RM-BEAR-003',
      stockUnits: 1400,
      erpLink: '/inventory',
    },
  },
  {
    id: 'mat-03',
    position: { x: 680, y: 520 },
    data: {
      label: 'Heavy Steel Frames',
      sublabel: 'RM-STEEL-002',
      type: 'material',
      entityId: 'mat-03',
      status: 'disrupted',
      riskScore: 68,
      disruptionTitle: 'Furnace Re-lining Backlog',
      sku: 'RM-STEEL-002',
      stockUnits: 180,
      erpLink: '/inventory',
    },
  },
  {
    id: 'mat-04',
    position: { x: 680, y: 720 },
    data: {
      label: 'High-Density Cushion Foam',
      sublabel: 'RM-FOAM-005',
      type: 'material',
      entityId: 'mat-04',
      status: 'operational',
      riskScore: 15,
      sku: 'RM-FOAM-005',
      stockUnits: 2200,
      erpLink: '/inventory',
    },
  },
  {
    id: 'mat-05',
    position: { x: 680, y: 920 },
    data: {
      label: 'Jacquard Upholstery Fabric',
      sublabel: 'RM-FAB-001',
      type: 'material',
      entityId: 'mat-05',
      status: 'operational',
      riskScore: 12,
      sku: 'RM-FAB-001',
      stockUnits: 1850,
      erpLink: '/inventory',
    },
  },

  // ---------------------------------------------------------------------------
  // TIER 1: PRODUCTION FACILITIES & ASSEMBLY HUBS (x: 1000)
  // ---------------------------------------------------------------------------
  {
    id: 'fac-01',
    position: { x: 1000, y: 220 },
    data: {
      label: 'Chakan Assembly Line 1',
      sublabel: 'Primary Seating & Frames',
      type: 'facility',
      entityId: 'fac-01',
      status: 'at_risk',
      riskScore: 65,
      location: 'Chakan MIDC, Pune',
      erpLink: '/manufacturing',
    },
  },
  {
    id: 'fac-02',
    position: { x: 1000, y: 620 },
    data: {
      label: 'Pune Central Distribution Hub',
      sublabel: 'Staging, Upholstery & QC',
      type: 'facility',
      entityId: 'fac-02',
      status: 'operational',
      riskScore: 22,
      location: 'Pune Central, Maharashtra',
      erpLink: '/inventory',
    },
  },

  // ---------------------------------------------------------------------------
  // TIER 2: FINISHED PRODUCTS / CATALOG SKUs (x: 1320)
  // ---------------------------------------------------------------------------
  {
    id: 'prd-01',
    position: { x: 1320, y: 150 },
    data: {
      label: 'Classic Teak 3-Seater Sofa',
      sublabel: 'FG-SOFA-CLASSIC-01',
      type: 'product',
      entityId: 'prd-01',
      status: 'disrupted',
      riskScore: 82,
      disruptionTitle: 'Material Blocked: Teak Wood',
      sku: 'FG-SOFA-CLASSIC-01',
      valueINR: 48000,
      erpLink: '/products',
    },
  },
  {
    id: 'prd-02',
    position: { x: 1320, y: 400 },
    data: {
      label: 'Ergonomic Executive Swivel Chair',
      sublabel: 'FG-CHAIR-ERGO-02',
      type: 'product',
      entityId: 'prd-02',
      status: 'at_risk',
      riskScore: 74,
      disruptionTitle: 'Bearings & Steel Delay',
      sku: 'FG-CHAIR-ERGO-02',
      valueINR: 22500,
      erpLink: '/products',
    },
  },
  {
    id: 'prd-03',
    position: { x: 1320, y: 700 },
    data: {
      label: 'Modular Reclining Sectional',
      sublabel: 'FG-SECT-MOD-03',
      type: 'product',
      entityId: 'prd-03',
      status: 'operational',
      riskScore: 25,
      sku: 'FG-SECT-MOD-03',
      valueINR: 65000,
      erpLink: '/products',
    },
  },

  // ---------------------------------------------------------------------------
  // TIER 3: DOWNSTREAM CUSTOMER SALES ORDERS (x: 1640)
  // ---------------------------------------------------------------------------
  {
    id: 'ord-01',
    position: { x: 1640, y: 100 },
    data: {
      label: 'SO-2026-0112',
      sublabel: 'Oberoi Luxury Suites',
      type: 'order',
      entityId: 'ord-01',
      status: 'disrupted',
      riskScore: 88,
      disruptionTitle: 'Delivery past SLA window',
      valueINR: 3450000,
      location: 'Mumbai Project Site',
      erpLink: '/sales',
    },
  },
  {
    id: 'ord-02',
    position: { x: 1640, y: 280 },
    data: {
      label: 'SO-2026-0115',
      sublabel: 'Taj Vivanta Interior Fitouts',
      type: 'order',
      entityId: 'ord-02',
      status: 'disrupted',
      riskScore: 84,
      disruptionTitle: 'Teak Frame Shortage',
      valueINR: 2800000,
      location: 'Goa Coastal Resort',
      erpLink: '/sales',
    },
  },
  {
    id: 'ord-03',
    position: { x: 1640, y: 460 },
    data: {
      label: 'SO-2026-0108',
      sublabel: 'Godrej Ergonomic Systems',
      type: 'order',
      entityId: 'ord-03',
      status: 'delayed',
      riskScore: 72,
      disruptionTitle: 'Swivel Mechanism Clearance Hold',
      valueINR: 1650000,
      location: 'Pune IT Park',
      erpLink: '/sales',
    },
  },
  {
    id: 'ord-04',
    position: { x: 1640, y: 640 },
    data: {
      label: 'SO-2026-0110',
      sublabel: 'DLF CyberCity Fitments',
      type: 'order',
      entityId: 'ord-04',
      status: 'at_risk',
      riskScore: 68,
      disruptionTitle: 'Steel Frame Batch Lag',
      valueINR: 2400000,
      location: 'Gurugram Tower 3',
      erpLink: '/sales',
    },
  },
  {
    id: 'ord-05',
    position: { x: 1640, y: 820 },
    data: {
      label: 'SO-2026-0114',
      sublabel: 'Prestige Living Showroom',
      type: 'order',
      entityId: 'ord-05',
      status: 'operational',
      riskScore: 20,
      valueINR: 890000,
      location: 'Bengaluru Flagship',
      erpLink: '/sales',
    },
  },
];

// --- Directed Graph Connections (Edges) ---
export const MOCK_GRAPH_EDGES: DependencyGraphEdge[] = [
  // Sub-tier to Tier-1 Suppliers
  { id: 'e-sub1-sup1', source: 'sub-01', target: 'sup-001', label: 'Logs Supply' },
  { id: 'e-sub2-sup7', source: 'sub-02', target: 'sup-007', label: 'Wire Ingot' },
  { id: 'e-sub3-sup4', source: 'sub-03', target: 'sup-004', label: 'Coke / Ore' },
  { id: 'e-sub4-sup6', source: 'sub-04', target: 'sup-006', label: 'Polymer Base' },

  // Tier-1 Suppliers to Raw Materials
  { id: 'e-sup1-mat1', source: 'sup-001', target: 'mat-01', label: 'Milled Planks' },
  { id: 'e-sup7-mat2', source: 'sup-007', target: 'mat-02', label: 'Bearings' },
  { id: 'e-sup4-mat3', source: 'sup-004', target: 'mat-03', label: 'Weldments' },
  { id: 'e-sup6-mat4', source: 'sup-006', target: 'mat-04', label: 'BOM Foam' },
  { id: 'e-sup3-mat5', source: 'sup-003', target: 'mat-05', label: 'Bales' },

  // Raw Materials to Facilities
  { id: 'e-mat1-fac1', source: 'mat-01', target: 'fac-01', label: 'Timber Routing' },
  { id: 'e-mat2-fac1', source: 'mat-02', target: 'fac-01', label: 'Mechanism Inward' },
  { id: 'e-mat3-fac1', source: 'mat-03', target: 'fac-01', label: 'Frame Assembly' },
  { id: 'e-mat4-fac2', source: 'mat-04', target: 'fac-02', label: 'Cushion Prep' },
  { id: 'e-mat5-fac2', source: 'mat-05', target: 'fac-02', label: 'Upholstery Line' },

  // Facilities to Products
  { id: 'e-fac1-prd1', source: 'fac-01', target: 'prd-01', label: 'Woodwork BOM' },
  { id: 'e-fac2-prd1', source: 'fac-02', target: 'prd-01', label: 'Cushioning Finish' },

  { id: 'e-fac1-prd2', source: 'fac-01', target: 'prd-02', label: 'Chassis Assembly' },
  { id: 'e-fac2-prd2', source: 'fac-02', target: 'prd-02', label: 'Padded Fit' },

  { id: 'e-fac1-prd3', source: 'fac-01', target: 'prd-03', label: 'Metal Bracket Core' },
  { id: 'e-fac2-prd3', source: 'fac-02', target: 'prd-03', label: 'Sectional Upholstery' },

  // Products to Sales Orders
  { id: 'e-prd1-ord1', source: 'prd-01', target: 'ord-01', label: 'Line Item 1 (60 units)' },
  { id: 'e-prd1-ord2', source: 'prd-01', target: 'ord-02', label: 'Line Item 1 (45 units)' },
  { id: 'e-prd2-ord3', source: 'prd-02', target: 'ord-03', label: 'Office Chairs (120 units)' },
  { id: 'e-prd2-ord4', source: 'prd-02', target: 'ord-04', label: 'Workstations (80 units)' },
  { id: 'e-prd3-ord5', source: 'prd-03', target: 'ord-05', label: 'Living Fitout (15 sets)' },
];

/**
 * Traverses downstream from a given node using BFS
 * Identifies all reachable entities, affected orders, and calculates total revenue at risk.
 */
export function traceDownstreamImpact(nodeId: string): DownstreamImpactSummary {
  const selectedNode = MOCK_GRAPH_NODES.find(n => n.id === nodeId) || MOCK_GRAPH_NODES[0];

  const visitedNodes = new Set<string>();
  const visitedEdges = new Set<string>();
  const queue: string[] = [selectedNode.id];
  visitedNodes.add(selectedNode.id);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    // Find all outgoing edges
    const outgoing = MOCK_GRAPH_EDGES.filter(e => e.source === currentId);
    for (const edge of outgoing) {
      visitedEdges.add(edge.id);
      if (!visitedNodes.has(edge.target)) {
        visitedNodes.add(edge.target);
        queue.push(edge.target);
      }
    }
  }

  const reachableNodes = MOCK_GRAPH_NODES.filter(n => visitedNodes.has(n.id));

  const impactedSuppliers = reachableNodes.filter(n => n.data.type === 'supplier');
  const impactedMaterials = reachableNodes.filter(n => n.data.type === 'material');
  const impactedProducts = reachableNodes.filter(n => n.data.type === 'product');
  const impactedOrders = reachableNodes.filter(n => n.data.type === 'order');

  const totalRevenueAtRisk = impactedOrders.reduce((sum, n) => sum + (n.data.valueINR || 0), 0);

  let highestSeverity: 'critical' | 'high' | 'medium' | 'low' = 'low';
  if (reachableNodes.some(n => n.data.status === 'disrupted' || n.data.riskScore >= 70)) {
    highestSeverity = 'critical';
  } else if (reachableNodes.some(n => n.data.status === 'delayed' || n.data.riskScore >= 50)) {
    highestSeverity = 'high';
  } else if (reachableNodes.some(n => n.data.status === 'at_risk')) {
    highestSeverity = 'medium';
  }

  return {
    selectedNodeId: selectedNode.id,
    selectedNodeName: selectedNode.data.label,
    selectedNodeType: selectedNode.data.type,
    impactedSuppliersCount: impactedSuppliers.length,
    impactedMaterialsCount: impactedMaterials.length,
    impactedProductsCount: impactedProducts.length,
    impactedOrdersCount: impactedOrders.length,
    totalRevenueAtRiskINR: totalRevenueAtRisk,
    highestSeverity,
    pathNodeIds: Array.from(visitedNodes),
    pathEdgeIds: Array.from(visitedEdges),
  };
}

/**
 * Returns full dependency graph with summary metrics
 */
export function getMockDependencyGraph(): DependencyGraphResponse {
  const disruptedCount = MOCK_GRAPH_NODES.filter(
    n => n.data.status === 'disrupted' || n.data.status === 'delayed'
  ).length;

  const orderNodes = MOCK_GRAPH_NODES.filter(n => n.data.type === 'order');
  const totalRevenue = orderNodes.reduce((sum, n) => sum + (n.data.valueINR || 0), 0);

  return {
    nodes: MOCK_GRAPH_NODES,
    edges: MOCK_GRAPH_EDGES,
    summary: {
      totalNodes: MOCK_GRAPH_NODES.length,
      totalEdges: MOCK_GRAPH_EDGES.length,
      disruptedNodesCount: disruptedCount,
      totalRevenueExposedINR: totalRevenue,
    },
  };
}
