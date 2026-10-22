import {
  ApprovalDecisionItem,
  ApprovalFilterParams,
  ApprovalActionPayload,
  ApprovalsListResponse,
  ApprovalDecisionStatus,
  ApprovalAuditEntry,
} from '@/types/onchain-insights';

let MOCK_APPROVAL_DECISIONS: ApprovalDecisionItem[] = [
  {
    id: 'APR-2026-001',
    title: 'Emergency Blue Dart Air Freight BOM-BLR for High-Tensile Steel Fasteners',
    decisionType: 'mitigation_plan',
    status: 'pending_review',
    urgency: 'immediate',
    financialImpactINR: 165000,
    revenueProtectedINR: 2720000,
    submittedAt: '2026-10-12T08:15:00Z',
    submittedBy: {
      name: 'Rajesh Varma',
      role: 'Lead Logistics Analyst',
      email: 'rajesh.varma@chainiq.internal',
    },
    assignedApprover: {
      name: 'Vikram Mehta',
      role: 'VP Global Supply Chain',
    },
    relatedDisruptionId: 'DIS-2026-001',
    relatedDisruptionTitle: 'Nhava Sheva (JNPT) Container Terminal Congestion',
    relatedSupplierId: 'SUP-001',
    relatedSupplierName: 'Apex Fasteners India Ltd',
    affectedMaterial: 'High-Tensile Steel Fasteners',
    sku: 'SKU-STL-002',
    summary:
      'Authorize emergency air freight dispatch of 750 kg critical fasteners via Blue Dart Boeing 737F charter slot from Mumbai CSIA to Bangalore Logistics Hub, bypassing the 18-day port congestion backlog at JNPT.',
    rationale:
      'Deterministic baseline recommendation scores this option at 88/100. Saves 15 transit days at an incremental logistics cost of ₹1,65,000 (<6% of at-risk order revenue). Preserves on-time delivery across 40 customer sales orders.',
    operationalTradeOffs: {
      costINR: 165000,
      timeDeltaDays: 3,
      residualRisk: 'low',
      ordersImpacted: 40,
    },
    executionChecklist: [
      {
        step: 'Issue Purchase Order Amendment PO-2026-8891-EXP with air freight surcharge.',
        responsibleParty: 'Rajesh Varma (Logistics)',
        isSimulated: true,
      },
      {
        step: 'Green-channel fast-track customs exit clearance at CSIA Mumbai terminal.',
        responsibleParty: 'Apex Customs Broker',
        isSimulated: true,
      },
      {
        step: 'Direct airside tarmac transfer to Blue Dart Cargo flight B737F-442.',
        responsibleParty: 'Blue Dart Aviation Operations',
        isSimulated: true,
      },
      {
        step: 'Priority dock receiving and assembly line replenishment at Bangalore Plant #1.',
        responsibleParty: 'Bangalore Plant Operations',
        isSimulated: true,
      },
    ],
    auditTrail: [
      {
        id: 'AUD-001-A',
        timestamp: '2026-10-12T08:15:00Z',
        actorName: 'Rajesh Varma',
        actorRole: 'Lead Logistics Analyst',
        action: 'submitted',
        comment: 'Generated from Mitigation Scenario Lab (Rank #1 Recommended option). Urgency flagged as Immediate.',
        newStatus: 'pending_review',
      },
      {
        id: 'AUD-001-B',
        timestamp: '2026-10-12T08:45:00Z',
        actorName: 'Sunita Rao',
        actorRole: 'Procurement Compliance Lead',
        action: 'reviewed',
        comment: 'Verified Blue Dart rate contract quote (₹220/kg). Financial exposure is within emergency delegate threshold.',
        previousStatus: 'pending_review',
        newStatus: 'pending_review',
      },
    ],
  },
  {
    id: 'APR-2026-002',
    title: 'Dual-Source Sourcing Allocation Switch: 60/40 Split to Bharat Precision',
    decisionType: 'supplier_switch',
    status: 'pending_review',
    urgency: 'urgent',
    financialImpactINR: 95000,
    revenueProtectedINR: 2580000,
    submittedAt: '2026-10-12T07:30:00Z',
    submittedBy: {
      name: 'Ananya Sen',
      role: 'Senior Procurement Specialist',
      email: 'ananya.sen@chainiq.internal',
    },
    assignedApprover: {
      name: 'Priya Iyer',
      role: 'Director of Strategic Sourcing',
    },
    relatedDisruptionId: 'DIS-2026-001',
    relatedDisruptionTitle: 'Nhava Sheva (JNPT) Container Terminal Congestion',
    relatedSupplierId: 'SUP-002',
    relatedSupplierName: 'Bharat Precision Tools Ltd',
    affectedMaterial: 'High-Tensile Steel Fasteners',
    sku: 'SKU-STL-002',
    summary:
      'Activate secondary supply framework with Bharat Precision Tools (Pune) for 40% immediate order volume to mitigate dependency on maritime shipments.',
    rationale:
      'Provides structural supply hedge. Tooling recalibration fee is ₹45,000 with unit price delta +8%. Protects 38 orders with 6-day recovery lead time.',
    operationalTradeOffs: {
      costINR: 95000,
      timeDeltaDays: 6,
      residualRisk: 'medium',
      ordersImpacted: 38,
    },
    executionChecklist: [
      {
        step: 'Execute secondary purchase contract addendum with Bharat Precision Tools.',
        responsibleParty: 'Ananya Sen (Sourcing)',
        isSimulated: true,
      },
      {
        step: 'Dispatch tooling dies and metallurgical test samples to Pune plant.',
        responsibleParty: 'Quality Control Lead',
        isSimulated: true,
      },
      {
        step: 'Track initial 1,000-unit dispatch via NH48 dedicated road container.',
        responsibleParty: 'Pune Dispatch Coordinator',
        isSimulated: true,
      },
    ],
    auditTrail: [
      {
        id: 'AUD-002-A',
        timestamp: '2026-10-12T07:30:00Z',
        actorName: 'Ananya Sen',
        actorRole: 'Senior Procurement Specialist',
        action: 'submitted',
        comment: 'Initiated from Supplier Switching Simulator based on dual-sourcing scenario simulation.',
        newStatus: 'pending_review',
      },
    ],
  },
  {
    id: 'APR-2026-003',
    title: 'Direct Road Tanker Sourcing from Kochi Petroleum Depot',
    decisionType: 'mitigation_plan',
    status: 'approved',
    urgency: 'standard',
    financialImpactINR: 65000,
    revenueProtectedINR: 1890000,
    submittedAt: '2026-10-11T14:20:00Z',
    resolutionDate: '2026-10-11T16:45:00Z',
    resolutionComments:
      'Approved without reservation. Tanker GPS telemetry verified, and Kochi refinery terminal has ready certified bulk supply.',
    submittedBy: {
      name: 'Karthik Ram',
      role: 'Operations Coordinator',
      email: 'karthik.ram@chainiq.internal',
    },
    assignedApprover: {
      name: 'Vikram Mehta',
      role: 'VP Global Supply Chain',
    },
    relatedDisruptionId: 'DIS-2026-003',
    relatedDisruptionTitle: 'Chennai Storm Gate Suspension',
    relatedSupplierId: 'SUP-003',
    relatedSupplierName: 'Coastal Petrochemicals Chennai Ltd',
    affectedMaterial: 'Industrial Grade Lubricant ISO-VG-46',
    sku: 'SKU-LUB-003',
    summary:
      'Procure 8,000 litres of ISO-VG-46 lubricant directly from Kochi terminal via specialized insulated tank trucks, avoiding waterlogged Chennai port gates.',
    rationale:
      'Rapid 3-day resolution with minimal incremental cost (₹65,000). Protects ₹18,90,000 across 35 manufacturing work orders.',
    operationalTradeOffs: {
      costINR: 65000,
      timeDeltaDays: 3,
      residualRisk: 'low',
      ordersImpacted: 35,
    },
    executionChecklist: [
      {
        step: 'Release emergency PO to Kochi Petroleum Depot.',
        responsibleParty: 'Karthik Ram (Operations)',
        isSimulated: true,
      },
      {
        step: 'Dispatch 2x certified hazchem insulated road tankers with GPS logging.',
        responsibleParty: 'Regional Logistics Partner',
        isSimulated: true,
      },
      {
        step: 'Unload into central storage vats at Coimbatore and Bangalore machining centers.',
        responsibleParty: 'Plant Maintenance Supervisor',
        isSimulated: true,
      },
    ],
    auditTrail: [
      {
        id: 'AUD-003-A',
        timestamp: '2026-10-11T14:20:00Z',
        actorName: 'Karthik Ram',
        actorRole: 'Operations Coordinator',
        action: 'submitted',
        comment: 'Submitted following Chennai Cyclone alert trigger.',
        newStatus: 'pending_review',
      },
      {
        id: 'AUD-003-B',
        timestamp: '2026-10-11T16:45:00Z',
        actorName: 'Vikram Mehta',
        actorRole: 'VP Global Supply Chain',
        action: 'approved',
        comment: 'Approved without reservation. Tanker GPS telemetry verified, and Kochi refinery terminal has ready certified bulk supply.',
        previousStatus: 'pending_review',
        newStatus: 'approved',
      },
    ],
  },
  {
    id: 'APR-2026-004',
    title: 'Chennai Plant-B Safety Buffer Drawdown (60% depletion)',
    decisionType: 'safety_stock_override',
    status: 'changes_requested',
    urgency: 'urgent',
    financialImpactINR: 42000,
    revenueProtectedINR: 2290000,
    submittedAt: '2026-10-11T10:00:00Z',
    resolutionDate: '2026-10-11T13:10:00Z',
    resolutionComments:
      '60% buffer depletion leaves Chennai plant at a precarious 18% reserve during cyclonic weather season. Re-simulate with maximum 35% drawdown cap and evaluate dual-sourcing.',
    submittedBy: {
      name: 'Rohan Deshmukh',
      role: 'Material Planner',
      email: 'rohan.deshmukh@chainiq.internal',
    },
    assignedApprover: {
      name: 'Priya Iyer',
      role: 'Director of Strategic Sourcing',
    },
    relatedDisruptionId: 'DIS-2026-001',
    relatedDisruptionTitle: 'Nhava Sheva (JNPT) Container Terminal Congestion',
    relatedSupplierId: 'SUP-001',
    relatedSupplierName: 'Apex Fasteners India Ltd',
    affectedMaterial: 'High-Tensile Steel Fasteners',
    sku: 'SKU-STL-002',
    summary:
      'Transfer 1,200 units of safety buffer stock from Chennai Plant-B to Bangalore via dedicated hotshot vehicle.',
    rationale:
      'Fast 2-day delivery with lowest logistics expenditure (₹42,000), but depresses Chennai plant inventory buffer.',
    operationalTradeOffs: {
      costINR: 42000,
      timeDeltaDays: 2,
      residualRisk: 'high',
      ordersImpacted: 34,
    },
    executionChecklist: [
      {
        step: 'Generate Material Transfer Note MTN-2026-049 in ERP inventory module.',
        responsibleParty: 'Chennai Warehouse Lead',
        isSimulated: true,
      },
      {
        step: 'Overnight hotshot truck pickup at 18:00 hrs.',
        responsibleParty: 'Dedicated Interstate Freight',
        isSimulated: true,
      },
    ],
    auditTrail: [
      {
        id: 'AUD-004-A',
        timestamp: '2026-10-11T10:00:00Z',
        actorName: 'Rohan Deshmukh',
        actorRole: 'Material Planner',
        action: 'submitted',
        comment: 'Submitted as Option 3 from Mitigation Scenario Lab.',
        newStatus: 'pending_review',
      },
      {
        id: 'AUD-004-B',
        timestamp: '2026-10-11T13:10:00Z',
        actorName: 'Priya Iyer',
        actorRole: 'Director of Strategic Sourcing',
        action: 'requested_changes',
        comment: '60% buffer depletion leaves Chennai plant at a precarious 18% reserve during cyclonic weather season. Re-simulate with maximum 35% drawdown cap and evaluate dual-sourcing.',
        previousStatus: 'pending_review',
        newStatus: 'changes_requested',
      },
    ],
  },
  {
    id: 'APR-2026-005',
    title: 'Commercial Deferral Concessions for Tier-B OEM Accounts',
    decisionType: 'mitigation_plan',
    status: 'rejected',
    urgency: 'planned',
    financialImpactINR: 120000,
    revenueProtectedINR: 3010000,
    submittedAt: '2026-10-10T11:15:00Z',
    resolutionDate: '2026-10-10T15:30:00Z',
    resolutionComments:
      'Rejected. Brand reputation and client SLA breach penalties outweigh the cost of secondary foundry tooling. Contract secondary foundry in Coimbatore instead.',
    submittedBy: {
      name: 'Aditya Birla',
      role: 'Commercial Operations Lead',
      email: 'aditya.birla@chainiq.internal',
    },
    assignedApprover: {
      name: 'Vikram Mehta',
      role: 'VP Global Supply Chain',
    },
    relatedDisruptionId: 'DIS-2026-002',
    relatedDisruptionTitle: 'Sub-Tier Foundry Power Outage in Rajkot Corridor',
    relatedSupplierId: 'SUP-002',
    relatedSupplierName: 'Western Foundries Ltd',
    affectedMaterial: 'Cast Iron Motor Housings',
    sku: 'SKU-CAS-001',
    summary:
      'Negotiate 10-day customer delivery deferral with 2% commercial discount concession (₹1,20,000 total exposure) to absorb Rajkot power outage delay.',
    rationale:
      'Avoids external expedited supplier premiums, but compromises delivery contractual milestones across 10 customer accounts.',
    operationalTradeOffs: {
      costINR: 120000,
      timeDeltaDays: 14,
      residualRisk: 'high',
      ordersImpacted: 18,
    },
    executionChecklist: [
      {
        step: 'Commercial sales client outreach for contract delivery extension.',
        responsibleParty: 'Key Account Sales Team',
        isSimulated: true,
      },
    ],
    auditTrail: [
      {
        id: 'AUD-005-A',
        timestamp: '2026-10-10T11:15:00Z',
        actorName: 'Aditya Birla',
        actorRole: 'Commercial Operations Lead',
        action: 'submitted',
        comment: 'Submitted for evaluation.',
        newStatus: 'pending_review',
      },
      {
        id: 'AUD-005-B',
        timestamp: '2026-10-10T15:30:00Z',
        actorName: 'Vikram Mehta',
        actorRole: 'VP Global Supply Chain',
        action: 'rejected',
        comment: 'Rejected. Brand reputation and client SLA breach penalties outweigh the cost of secondary foundry tooling. Contract secondary foundry in Coimbatore instead.',
        previousStatus: 'pending_review',
        newStatus: 'rejected',
      },
    ],
  },
  {
    id: 'APR-2026-006',
    title: 'Fast-Track Qualification Gate for Coimbatore Precision Castings',
    decisionType: 'supplier_qualification',
    status: 'approved',
    urgency: 'standard',
    financialImpactINR: 85000,
    submittedAt: '2026-10-09T09:00:00Z',
    resolutionDate: '2026-10-09T17:00:00Z',
    resolutionComments:
      'Approved for emergency casting production. ISO-9001 and IATF-16949 audit records verified on distributed ledger.',
    submittedBy: {
      name: 'Sunita Rao',
      role: 'Procurement Compliance Lead',
      email: 'sunita.rao@chainiq.internal',
    },
    assignedApprover: {
      name: 'Priya Iyer',
      role: 'Director of Strategic Sourcing',
    },
    relatedSupplierId: 'SUP-004',
    relatedSupplierName: 'Coimbatore Precision Castings Ltd',
    summary:
      'Authorize expedited qualification status for Coimbatore Precision Castings to serve as qualified secondary casting supplier during Rajkot industrial power disruptions.',
    rationale:
      'Overall qualification score is 86/100. Delivery reliability (88%) and metallurgical defect rate (140 PPM) exceed Tier-1 ERP standards.',
    operationalTradeOffs: {
      costINR: 85000,
      timeDeltaDays: 5,
      residualRisk: 'low',
      ordersImpacted: 26,
    },
    executionChecklist: [
      {
        step: 'Verify uploaded ISO & metallurgical test certificates in ERP vault.',
        responsibleParty: 'Quality Assurance Lead',
        isSimulated: true,
      },
      {
        step: 'Update vendor qualification status in ERP ledger to Qualified.',
        responsibleParty: 'ERP Master Data Admin',
        isSimulated: true,
      },
    ],
    auditTrail: [
      {
        id: 'AUD-006-A',
        timestamp: '2026-10-09T09:00:00Z',
        actorName: 'Sunita Rao',
        actorRole: 'Procurement Compliance Lead',
        action: 'submitted',
        comment: 'Submitted following metallurgical test audit.',
        newStatus: 'pending_review',
      },
      {
        id: 'AUD-006-B',
        timestamp: '2026-10-09T17:00:00Z',
        actorName: 'Priya Iyer',
        actorRole: 'Director of Strategic Sourcing',
        action: 'approved',
        comment: 'Approved for emergency casting production. ISO-9001 and IATF-16949 audit records verified on distributed ledger.',
        previousStatus: 'pending_review',
        newStatus: 'approved',
      },
    ],
  },
];

/**
 * Filter and query approval decisions.
 */
export function getApprovalDecisions(filters?: ApprovalFilterParams): ApprovalsListResponse {
  let list = [...MOCK_APPROVAL_DECISIONS];

  if (filters?.status && filters.status !== 'all') {
    list = list.filter((item) => item.status === filters.status);
  }

  if (filters?.decisionType && filters.decisionType !== 'all') {
    list = list.filter((item) => item.decisionType === filters.decisionType);
  }

  if (filters?.urgency && filters.urgency !== 'all') {
    list = list.filter((item) => item.urgency === filters.urgency);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.submittedBy.name.toLowerCase().includes(q) ||
        (item.relatedSupplierName && item.relatedSupplierName.toLowerCase().includes(q)) ||
        (item.affectedMaterial && item.affectedMaterial.toLowerCase().includes(q))
    );
  }

  // Sort
  if (filters?.sortBy === 'financialImpact') {
    list.sort((a, b) =>
      filters.sortOrder === 'asc'
        ? a.financialImpactINR - b.financialImpactINR
        : b.financialImpactINR - a.financialImpactINR
    );
  } else if (filters?.sortBy === 'urgency') {
    const urgencyOrder = { immediate: 4, urgent: 3, standard: 2, planned: 1 };
    list.sort((a, b) =>
      filters.sortOrder === 'asc'
        ? urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
        : urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
    );
  } else {
    // Default newest first
    list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  const pendingCount = MOCK_APPROVAL_DECISIONS.filter((d) => d.status === 'pending_review').length;
  const approvedCount = MOCK_APPROVAL_DECISIONS.filter((d) => d.status === 'approved').length;
  const rejectedCount = MOCK_APPROVAL_DECISIONS.filter((d) => d.status === 'rejected').length;
  const changesRequestedCount = MOCK_APPROVAL_DECISIONS.filter((d) => d.status === 'changes_requested').length;
  const totalExposureINR = MOCK_APPROVAL_DECISIONS.reduce((acc, d) => acc + d.financialImpactINR, 0);

  return {
    data: list,
    total: list.length,
    kpis: {
      pendingCount,
      approvedCount,
      rejectedCount,
      changesRequestedCount,
      totalExposureINR,
    },
  };
}

/**
 * Get a single approval decision by ID.
 */
export function getApprovalDecisionById(id: string): ApprovalDecisionItem | undefined {
  return MOCK_APPROVAL_DECISIONS.find((item) => item.id.toUpperCase() === id.toUpperCase());
}

/**
 * Execute an approve, reject, or request-changes governance decision.
 */
export function updateApprovalDecision(
  id: string,
  payload: ApprovalActionPayload
): ApprovalDecisionItem {
  const index = MOCK_APPROVAL_DECISIONS.findIndex((item) => item.id.toUpperCase() === id.toUpperCase());
  if (index === -1) {
    throw new Error(`Decision record ${id} not found.`);
  }

  const current = MOCK_APPROVAL_DECISIONS[index];
  const newStatus: ApprovalDecisionStatus =
    payload.action === 'approve'
      ? 'approved'
      : payload.action === 'reject'
      ? 'rejected'
      : 'changes_requested';

  const actionVerb =
    payload.action === 'approve'
      ? 'approved'
      : payload.action === 'reject'
      ? 'rejected'
      : 'requested_changes';

  const newAuditEntry: ApprovalAuditEntry = {
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorName: payload.reviewerName || 'Vikram Mehta',
    actorRole: payload.reviewerRole || 'VP Global Supply Chain (Executive Approver)',
    action: actionVerb,
    comment: payload.comments || `Decision marked as ${newStatus} via governance portal.`,
    previousStatus: current.status,
    newStatus,
  };

  const updatedItem: ApprovalDecisionItem = {
    ...current,
    status: newStatus,
    resolutionDate: new Date().toISOString(),
    resolutionComments: payload.comments,
    auditTrail: [newAuditEntry, ...current.auditTrail],
  };

  MOCK_APPROVAL_DECISIONS[index] = updatedItem;
  return updatedItem;
}
