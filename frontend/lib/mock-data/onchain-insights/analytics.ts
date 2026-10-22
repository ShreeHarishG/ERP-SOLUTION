// =============================================================================
// Onchain Insights — Outcome Analytics & Post-Mortem Mock Data Store
// Deterministic historical benchmarks for incident recovery, decision results,
// financial mitigation ROI, and systemic vulnerability patterns.
// =============================================================================

import type {
  DisruptionOutcomeRecord,
  PostMortemRecord,
  RecurringRiskPattern,
  OutcomeMonthlyTrendPoint,
  SupplierResilienceMetric,
  OutcomeAnalyticsKpis,
  OutcomeAnalyticsFilterParams,
  OutcomeAnalyticsResponse,
  PostMortemSubmissionPayload,
} from '@/types/onchain-insights';

// -----------------------------------------------------------------------------
// 1. Historical Disruption Outcomes (14 Completed Incidents over past 12 months)
// -----------------------------------------------------------------------------

export const INITIAL_HISTORICAL_OUTCOMES: DisruptionOutcomeRecord[] = [
  {
    id: 'OUT-2026-01',
    incidentCode: 'DIS-2026-01',
    title: 'Teak Timber Myanmar Export Border Closure',
    category: 'geopolitical',
    severity: 'critical',
    incidentDate: '2026-08-10',
    resolutionDate: '2026-08-16',
    recoveryDurationDays: 6,
    targetSlaDays: 7,
    affectedMaterial: 'Teak Wood Planks',
    primarySupplierId: 'sup-001',
    primarySupplierName: 'Global Timber Exports',
    decisionTaken: 'Rerouted 45% allocation to certified domestic plantation partner; air-freighted critical sample batches',
    decisionType: 'dual_source_split',
    decisionApprovedBy: 'Rajesh Sharma (VP SCM)',
    mitigationCostINR: 420000,
    budgetAllocatedINR: 500000,
    penaltiesAvoidedINR: 1450000,
    netBenefitINR: 1030000,
    finalStatus: 'resolved_ontime',
    slaAdherence: true,
    postMortemConducted: true,
    postMortemId: 'PM-2026-01',
    summaryNotes: 'Secondary supplier in Kerala absorbed 45% volume within 96 hours. Assembly plant downtime avoided.',
  },
  {
    id: 'OUT-2026-02',
    incidentCode: 'DIS-2026-04',
    title: 'Monsoon Heavy Waterlogging at Nhava Sheva JNPT Port',
    category: 'natural_disaster',
    severity: 'high',
    incidentDate: '2026-07-18',
    resolutionDate: '2026-07-26',
    recoveryDurationDays: 8,
    targetSlaDays: 6,
    affectedMaterial: 'Drawer Slides & Heavy Fittings',
    primarySupplierId: 'sup-002',
    primarySupplierName: 'Apex Hardware Co.',
    decisionTaken: 'Diverted maritime container consignments through Mundra Port with bonded trucking corridor',
    decisionType: 'reroute_logistics',
    decisionApprovedBy: 'Priya Iyer (Head Procurement)',
    mitigationCostINR: 280000,
    budgetAllocatedINR: 250000,
    penaltiesAvoidedINR: 850000,
    netBenefitINR: 570000,
    finalStatus: 'resolved_delayed',
    slaAdherence: false,
    postMortemConducted: true,
    postMortemId: 'PM-2026-02',
    summaryNotes: '2-day delay past target SLA due to interstate highway toll checkpoint queues during cloudburst.',
  },
  {
    id: 'OUT-2026-03',
    incidentCode: 'DIS-2026-07',
    title: 'Cold-Rolled Sheet Metal Heat-Treatment Furnace Outage',
    category: 'supplier_failure',
    severity: 'critical',
    incidentDate: '2026-06-04',
    resolutionDate: '2026-06-11',
    recoveryDurationDays: 7,
    targetSlaDays: 8,
    affectedMaterial: 'Cold-Rolled Steel Coils',
    primarySupplierId: 'sup-004',
    primarySupplierName: 'Steelcraft India',
    decisionTaken: 'Switched 60% purchase order to pre-qualified secondary mill in Jamshedpur with expedited freight',
    decisionType: 'supplier_switch',
    decisionApprovedBy: 'Rajesh Sharma (VP SCM)',
    mitigationCostINR: 650000,
    budgetAllocatedINR: 700000,
    penaltiesAvoidedINR: 2200000,
    netBenefitINR: 1550000,
    finalStatus: 'resolved_ontime',
    slaAdherence: true,
    postMortemConducted: true,
    postMortemId: 'PM-2026-03',
    summaryNotes: 'Pre-existing audit qualification reduced PO issuance from 2 weeks down to 18 hours.',
  },
  {
    id: 'OUT-2026-04',
    incidentCode: 'DIS-2026-09',
    title: 'Polyurethane Chemical Intermediate Factory Fire',
    category: 'force_majeure',
    severity: 'critical',
    incidentDate: '2026-05-12',
    resolutionDate: '2026-05-24',
    recoveryDurationDays: 12,
    targetSlaDays: 10,
    affectedMaterial: 'High-Density Cushioning Foam',
    primarySupplierId: 'sup-006',
    primarySupplierName: 'FoamComfort Ltd.',
    decisionTaken: 'Approved alternate grade substitution (HD-38) and released reserved emergency buffer from Chennai depot',
    decisionType: 'substitute_sku',
    decisionApprovedBy: 'Amitabh Sen (Director Operations)',
    mitigationCostINR: 480000,
    budgetAllocatedINR: 350000,
    penaltiesAvoidedINR: 1100000,
    netBenefitINR: 620000,
    finalStatus: 'cost_overrun',
    slaAdherence: false,
    postMortemConducted: true,
    postMortemId: 'PM-2026-04',
    summaryNotes: 'Alternate grade required rapid QA tensile testing; emergency buffer logistics incurred ₹1,30,000 premium over budget.',
  },
  {
    id: 'OUT-2026-05',
    incidentCode: 'DIS-2026-11',
    title: 'Marine Polyurethane Solvent Regulatory Audit Halt',
    category: 'regulatory',
    severity: 'high',
    incidentDate: '2026-04-02',
    resolutionDate: '2026-04-07',
    recoveryDurationDays: 5,
    targetSlaDays: 5,
    affectedMaterial: 'Polyurethane Clear Varnish',
    primarySupplierId: 'sup-005',
    primarySupplierName: 'Varnish Works',
    decisionTaken: 'Immediate temporary transition to low-VOC water-based coating variant with supplier line retooling subsidy',
    decisionType: 'substitute_sku',
    decisionApprovedBy: 'Priya Iyer (Head Procurement)',
    mitigationCostINR: 190000,
    budgetAllocatedINR: 200000,
    penaltiesAvoidedINR: 720000,
    netBenefitINR: 530000,
    finalStatus: 'resolved_ontime',
    slaAdherence: true,
    postMortemConducted: true,
    postMortemId: 'PM-2026-05',
    summaryNotes: 'Environmental safety clearance accelerated due to pre-drafted green compliance protocol.',
  },
  {
    id: 'OUT-2026-06',
    incidentCode: 'DIS-2026-13',
    title: 'Surat Textile Weaving Cluster Power Grid Trip',
    category: 'infrastructure',
    severity: 'medium',
    incidentDate: '2026-03-15',
    resolutionDate: '2026-03-18',
    recoveryDurationDays: 3,
    targetSlaDays: 4,
    affectedMaterial: 'Upholstery Velvet & Jacquard Fabric',
    primarySupplierId: 'sup-003',
    primarySupplierName: 'Rajshree Fabrics Ltd.',
    decisionTaken: 'Activated secondary generator backup shifts and split order with sister loom facility in Ahmedabad',
    decisionType: 'expedited_freight',
    decisionApprovedBy: 'Deepak Verma (Procurement Lead)',
    mitigationCostINR: 110000,
    budgetAllocatedINR: 150000,
    penaltiesAvoidedINR: 480000,
    netBenefitINR: 370000,
    finalStatus: 'resolved_ontime',
    slaAdherence: true,
    postMortemConducted: false,
    summaryNotes: 'Supplier executed weekend night-shift overtime to recover backlog within 72 hours.',
  },
  {
    id: 'OUT-2026-07',
    incidentCode: 'DIS-2026-15',
    title: 'Stainless Steel Fastener Threading Lathe Breakdown',
    category: 'supplier_failure',
    severity: 'medium',
    incidentDate: '2026-02-20',
    resolutionDate: '2026-02-23',
    recoveryDurationDays: 3,
    targetSlaDays: 3,
    affectedMaterial: 'Zinc & Stainless Steel Screws',
    primarySupplierId: 'sup-007',
    primarySupplierName: 'PrecisionFix Fasteners',
    decisionTaken: 'Authorized overnight hot-shot courier delivery from regional distributor warehouse',
    decisionType: 'expedited_freight',
    decisionApprovedBy: 'Deepak Verma (Procurement Lead)',
    mitigationCostINR: 75000,
    budgetAllocatedINR: 80000,
    penaltiesAvoidedINR: 340000,
    netBenefitINR: 265000,
    finalStatus: 'resolved_ontime',
    slaAdherence: true,
    postMortemConducted: false,
    summaryNotes: 'Local distributor stock bridged the gap until main batch machining resumed.',
  },
  {
    id: 'OUT-2026-08',
    incidentCode: 'DIS-2026-18',
    title: 'Bio-Resin Binder Raw Material Supply Curtailment',
    category: 'supplier_failure',
    severity: 'high',
    incidentDate: '2026-01-11',
    resolutionDate: '2026-01-22',
    recoveryDurationDays: 11,
    targetSlaDays: 7,
    affectedMaterial: 'Eco Composite Boards',
    primarySupplierId: 'sup-008',
    primarySupplierName: 'EcoPanels Bio-Composites',
    decisionTaken: 'Emergency procurement of standard grade MDF panels with customer waiver',
    decisionType: 'substitute_sku',
    decisionApprovedBy: 'Amitabh Sen (Director Operations)',
    mitigationCostINR: 390000,
    budgetAllocatedINR: 300000,
    penaltiesAvoidedINR: 920000,
    netBenefitINR: 530000,
    finalStatus: 'sla_breached',
    slaAdherence: false,
    postMortemConducted: false,
    summaryNotes: 'Customer contract mandated green material; waiver negotiations caused 4-day line stoppage penalty.',
  },
  {
    id: 'OUT-2025-09',
    incidentCode: 'DIS-2025-20',
    title: 'Chennai Port Cyclone Mandous Cargo Handling Freeze',
    category: 'natural_disaster',
    severity: 'high',
    incidentDate: '2025-12-05',
    resolutionDate: '2025-12-10',
    recoveryDurationDays: 5,
    targetSlaDays: 6,
    affectedMaterial: 'Imported Plywood Sheets',
    primarySupplierId: 'sup-001',
    primarySupplierName: 'Global Timber Exports',
    decisionTaken: 'Rerouted incoming feeder vessel to Krishnapatnam Port with inter-modal flatbed rail wagons',
    decisionType: 'reroute_logistics',
    decisionApprovedBy: 'Rajesh Sharma (VP SCM)',
    mitigationCostINR: 310000,
    budgetAllocatedINR: 350000,
    penaltiesAvoidedINR: 1150000,
    netBenefitINR: 840000,
    finalStatus: 'resolved_ontime',
    slaAdherence: true,
    postMortemConducted: false,
    summaryNotes: 'Rail wagon priority clearance booked 48 hours in advance based on meteorological tracking.',
  },
  {
    id: 'OUT-2025-10',
    incidentCode: 'DIS-2025-22',
    title: 'National Highway Toll Plaza Systemic Server Crash',
    category: 'logistics',
    severity: 'low',
    incidentDate: '2025-11-18',
    resolutionDate: '2025-11-20',
    recoveryDurationDays: 2,
    targetSlaDays: 2,
    affectedMaterial: 'Packaging Corrugated Boxes',
    primarySupplierId: 'sup-002',
    primarySupplierName: 'Apex Hardware Co.',
    decisionTaken: 'Pre-paid manual cash FASTag escrows dispatched to truck drivers',
    decisionType: 'expedited_freight',
    decisionApprovedBy: 'Deepak Verma (Procurement Lead)',
    mitigationCostINR: 45000,
    budgetAllocatedINR: 50000,
    penaltiesAvoidedINR: 180000,
    netBenefitINR: 135000,
    finalStatus: 'resolved_ontime',
    slaAdherence: true,
    postMortemConducted: false,
    summaryNotes: 'Cash contingency float cleared trucks through manual booth lanes.',
  },
  {
    id: 'OUT-2025-11',
    incidentCode: 'DIS-2025-25',
    title: 'Brass Drawer Handle Batch Electroplating Flaw',
    category: 'quality',
    severity: 'medium',
    incidentDate: '2025-10-24',
    resolutionDate: '2025-10-30',
    recoveryDurationDays: 6,
    targetSlaDays: 5,
    affectedMaterial: 'Antique Brass Drawer Handles',
    primarySupplierId: 'sup-002',
    primarySupplierName: 'Apex Hardware Co.',
    decisionTaken: 'Scrapped defective batch at supplier cost; expedited certified reserve lot from Pune distributor',
    decisionType: 'expedited_freight',
    decisionApprovedBy: 'Priya Iyer (Head Procurement)',
    mitigationCostINR: 95000,
    budgetAllocatedINR: 100000,
    penaltiesAvoidedINR: 410000,
    netBenefitINR: 315000,
    finalStatus: 'resolved_delayed',
    slaAdherence: false,
    postMortemConducted: false,
    summaryNotes: 'Supplier reimbursed raw material cost; freight premium absorbed by buyer to safeguard assembly line.',
  },
  {
    id: 'OUT-2025-12',
    incidentCode: 'DIS-2025-28',
    title: 'Import Duty Revision on Specialty Adhesives',
    category: 'regulatory',
    severity: 'medium',
    incidentDate: '2025-09-14',
    resolutionDate: '2025-09-19',
    recoveryDurationDays: 5,
    targetSlaDays: 6,
    affectedMaterial: 'Hot-Melt Woodworking Adhesive',
    primarySupplierId: 'sup-005',
    primarySupplierName: 'Varnish Works',
    decisionTaken: 'Bonded warehouse clearance bonded deposit placed while seeking HS-code classification clarification',
    decisionType: 'reroute_logistics',
    decisionApprovedBy: 'Rajesh Sharma (VP SCM)',
    mitigationCostINR: 150000,
    budgetAllocatedINR: 180000,
    penaltiesAvoidedINR: 650000,
    netBenefitINR: 500000,
    finalStatus: 'resolved_ontime',
    slaAdherence: true,
    postMortemConducted: false,
    summaryNotes: 'Customs legal counsel expedited provisional release without factory disruption.',
  },
  {
    id: 'OUT-2025-13',
    incidentCode: 'DIS-2025-30',
    title: 'Raw Latex Rubber Export Tariff Hike (Indonesia)',
    category: 'geopolitical',
    severity: 'high',
    incidentDate: '2025-08-01',
    resolutionDate: '2025-08-14',
    recoveryDurationDays: 13,
    targetSlaDays: 9,
    affectedMaterial: 'High-Density Cushioning Foam',
    primarySupplierId: 'sup-006',
    primarySupplierName: 'FoamComfort Ltd.',
    decisionTaken: 'Contracted domestic synthetic elastomer compounder on 3-month trial agreement',
    decisionType: 'supplier_switch',
    decisionApprovedBy: 'Amitabh Sen (Director Operations)',
    mitigationCostINR: 540000,
    budgetAllocatedINR: 400000,
    penaltiesAvoidedINR: 1300000,
    netBenefitINR: 760000,
    finalStatus: 'cost_overrun',
    slaAdherence: false,
    postMortemConducted: false,
    summaryNotes: 'First trial batch required mold temperature readjustments on production lines.',
  },
  {
    id: 'OUT-2025-14',
    incidentCode: 'DIS-2025-33',
    title: 'Kolkata Heavy Industrial Transporter Strike',
    category: 'logistics',
    severity: 'high',
    incidentDate: '2025-07-06',
    resolutionDate: '2025-07-11',
    recoveryDurationDays: 5,
    targetSlaDays: 5,
    affectedMaterial: 'Cold-Rolled Steel Coils',
    primarySupplierId: 'sup-004',
    primarySupplierName: 'Steelcraft India',
    decisionTaken: 'Mobilized dedicated container rake via Container Corporation of India (CONCOR) rail corridor',
    decisionType: 'reroute_logistics',
    decisionApprovedBy: 'Rajesh Sharma (VP SCM)',
    mitigationCostINR: 360000,
    budgetAllocatedINR: 400000,
    penaltiesAvoidedINR: 1550000,
    netBenefitINR: 1190000,
    finalStatus: 'resolved_ontime',
    slaAdherence: true,
    postMortemConducted: false,
    summaryNotes: 'Rail freight bypassed all highway pickets; delivered directly to siding adjacent to plant.',
  },
];

// -----------------------------------------------------------------------------
// 2. Pre-Populated Post-Mortem Records (5 Detailed Case Studies)
// -----------------------------------------------------------------------------

export const INITIAL_POST_MORTEMS: PostMortemRecord[] = [
  {
    id: 'PM-2026-01',
    outcomeId: 'OUT-2026-01',
    incidentCode: 'DIS-2026-01',
    incidentTitle: 'Teak Timber Myanmar Export Border Closure',
    incidentCategory: 'geopolitical',
    conductedAt: '2026-08-20',
    facilitator: 'Priya Iyer (Head Procurement)',
    participants: [
      'Rajesh Sharma (VP SCM)',
      'Amitabh Sen (Director Operations)',
      'Deepak Verma (Procurement Lead)',
      'Sunil Mehta (Quality Manager)',
    ],
    rootCauseCategory: 'single_source_failure',
    rootCauseSummary:
      'Over-reliance on a single overland trade route through Myanmar border crossings with zero bonded buffer inventory held at domestic ports.',
    fiveWhys: {
      why1: 'Finished furniture assembly lines faced stock-out of premium Teak Planks.',
      why2: 'Primary supplier shipment was frozen indefinitely at Tamu border gate.',
      why3: 'Political unrest prompted sudden unexpected border check closures.',
      why4: 'Procurement policy lacked an automated secondary supplier volume split clause for cross-border materials.',
      why5: 'Cost optimization goals in 2024 rewarded single-vendor consolidation without geopolitical risk indexing.',
    },
    whatWentWell: [
      'ERP supplier qualification workspace allowed rapid identification of FSC-certified domestic timber plantation in Kerala within 24 hours.',
      'Operations team adjusted production schedules to prioritize oak and pine lines while teak was in transit.',
      'Executive approval was granted inside 4 hours via digital approval workflow.',
    ],
    whatWentWrong: [
      'Air freight costs for emergency sample lot were 3.8x normal ocean freight.',
      'Warehouse lacked climate-controlled moisture stabilization chambers for freshly milled Kerala timber.',
      'Initial 48 hours were lost attempting to contact Myanmar consular logistics officers.',
    ],
    actionItems: [
      {
        id: 'ACT-01-A',
        action: 'Institute mandatory 70/30 dual-sourcing allocation policy for all imported hardwood categories',
        owner: 'Priya Iyer',
        dueDate: '2026-10-15',
        status: 'completed',
        impactArea: 'Procurement Governance',
      },
      {
        id: 'ACT-01-B',
        action: 'Establish minimum 21-day strategic safety stock at Bhiwandi regional hub',
        owner: 'Deepak Verma',
        dueDate: '2026-11-01',
        status: 'in_progress',
        impactArea: 'Inventory Strategy',
      },
      {
        id: 'ACT-01-C',
        action: 'Set up real-time geopolitical border signal monitors in Onchain Insights disruption tracker',
        owner: 'SCM Tech Team',
        dueDate: '2026-11-30',
        status: 'completed',
        impactArea: 'Signal Intelligence',
      },
    ],
    preventivePolicy:
      'Mandatory Dual-Sourcing Protocol (POL-SCM-2026-08): No single international supplier may provide more than 65% of monthly production run timber requirements. Secondary suppliers must undergo biannual readiness trial orders of at least 15% volume.',
    status: 'completed',
  },
  {
    id: 'PM-2026-02',
    outcomeId: 'OUT-2026-02',
    incidentCode: 'DIS-2026-04',
    incidentTitle: 'Monsoon Heavy Waterlogging at Nhava Sheva JNPT Port',
    incidentCategory: 'natural_disaster',
    conductedAt: '2026-07-30',
    facilitator: 'Rajesh Sharma (VP SCM)',
    participants: [
      'Priya Iyer (Head Procurement)',
      'Karan Joshi (Logistics Lead)',
      'Ritu Patel (Plant Manager, Pune)',
    ],
    rootCauseCategory: 'geopolitical_port',
    rootCauseSummary:
      'JNPT port container yards submerged during a 350mm cloudburst event; lack of automated alternate port routing triggers led to 48 hours of yard congestion lockup.',
    fiveWhys: {
      why1: 'Drawer slides and structural fittings were delayed by 8 days, exceeding the 6-day SLA.',
      why2: 'Container vessel was held at anchorage outside Mumbai port for 5 days without docking permission.',
      why3: 'Port access causeway was inundated by high tide combined with extreme monsoon rainfall.',
      why4: 'Logistics contract had no clause enabling diversion of maritime bills of lading to Mundra port without manual shipper re-endorsement.',
      why5: 'Freight forwarding agreements had not been updated to reflect climate resilience provisions.',
    },
    whatWentWell: [
      'Bonded trucking corridor from Mundra successfully bypassed the Konkan railway waterlogging.',
      'Assembly plant utilized buffer fasteners to prevent complete line stoppage.',
    ],
    whatWentWrong: [
      'Manual bill-of-lading re-endorsement took 3 days due to international banking holiday.',
      'Incurred demurrage penalty fees at JNPT despite force majeure declaration.',
    ],
    actionItems: [
      {
        id: 'ACT-02-A',
        action: 'Include pre-authorized alternate port diversion clauses in all annual maritime freight contracts',
        owner: 'Karan Joshi',
        dueDate: '2026-09-30',
        status: 'completed',
        impactArea: 'Contract Logistics',
      },
      {
        id: 'ACT-02-B',
        action: 'Establish June–September monsoon transit lead time buffer (+4 days) in ERP MRP run',
        owner: 'SCM Tech Team',
        dueDate: '2026-10-15',
        status: 'completed',
        impactArea: 'Planning Parameters',
      },
    ],
    preventivePolicy:
      'Monsoon Dynamic Routing Directive: From June 1 to September 15, all maritime consignments originating from Southeast Asia must file optional discharge port riders covering both JNPT and Mundra.',
    status: 'completed',
  },
  {
    id: 'PM-2026-03',
    outcomeId: 'OUT-2026-03',
    incidentCode: 'DIS-2026-07',
    incidentTitle: 'Cold-Rolled Sheet Metal Heat-Treatment Furnace Outage',
    incidentCategory: 'supplier_failure',
    conductedAt: '2026-06-18',
    facilitator: 'Deepak Verma (Procurement Lead)',
    participants: [
      'Rajesh Sharma (VP SCM)',
      'Sunil Mehta (Quality Manager)',
      'Manish Gupta (Steelcraft India Key Account)',
    ],
    rootCauseCategory: 'supplier_capacity',
    rootCauseSummary:
      'Refractory brick lining failure in primary annealing furnace of tier-1 mill halted CR coil rolling lines for 14 calendar days.',
    fiveWhys: {
      why1: 'Tier-1 steel vendor announced inability to fulfill June monthly allocation of 80 MT.',
      why2: 'Primary continuous annealing line experienced catastrophic thermal refractory failure.',
      why3: 'Vendor had deferred scheduled March preventative maintenance due to Q1 export rush.',
      why4: 'ChainIQ supplier auditing protocol did not monitor supplier equipment maintenance logs or furnace run-hours.',
      why5: 'Supplier qualification emphasized financial stability and unit price over machine maintenance metrics.',
    },
    whatWentWell: [
      'Jamshedpur secondary mill had already completed metallurgical sample approvals in Task 2 qualification workspace.',
      'Rapid switch prevented assembly shutdown, saving an estimated ₹22,00,000 in OEM customer cancellation penalties.',
    ],
    whatWentWrong: [
      'Secondary mill quoted a 6.2% price premium due to spot spot-market order placement.',
      'Logistics freight distance increased by 380 km, raising transport carbon footprint.',
    ],
    actionItems: [
      {
        id: 'ACT-03-A',
        action: 'Integrate critical equipment maintenance verification into annual tier-1 supplier audit criteria',
        owner: 'Sunil Mehta',
        dueDate: '2026-11-15',
        status: 'in_progress',
        impactArea: 'Supplier Auditing',
      },
      {
        id: 'ACT-03-B',
        action: 'Contract a standby allocation agreement with Jamshedpur mill with fixed indexing cap',
        owner: 'Priya Iyer',
        dueDate: '2026-12-01',
        status: 'pending',
        impactArea: 'Commercial Contracting',
      },
    ],
    preventivePolicy:
      'Capital Equipment Maintenance Assurance Standard: Tier-1 suppliers providing >₹1 Cr annual volume must share certified third-party preventative maintenance inspection logs semi-annually.',
    status: 'completed',
  },
  {
    id: 'PM-2026-04',
    outcomeId: 'OUT-2026-04',
    incidentCode: 'DIS-2026-09',
    incidentTitle: 'Polyurethane Chemical Intermediate Factory Fire',
    incidentCategory: 'force_majeure',
    conductedAt: '2026-06-02',
    facilitator: 'Amitabh Sen (Director Operations)',
    participants: [
      'Priya Iyer (Head Procurement)',
      'Ritu Patel (Plant Manager)',
      'Vikas Nair (EHS Officer)',
    ],
    rootCauseCategory: 'weather_force_majeure',
    rootCauseSummary:
      'Industrial solvent vapor explosion at Tier-2 petrochemical precursor plant caused supply chain shock across multiple Tier-1 foam molders.',
    fiveWhys: {
      why1: 'FoamComfort Ltd. halted deliveries of molded high-density foam cushions.',
      why2: 'Tier-2 polyol monomer supply ceased completely.',
      why3: 'Chemical industrial zone fire disabled 3 adjacent monomer synthesis plants.',
      why4: 'Supply chain visibility terminated at Tier-1 level; Tier-2 sub-contractor risks were unknown prior to Task 8 Dependency Explorer.',
      why5: 'Bill-of-materials traceability had never mapped upstream chemical intermediaries beyond direct supplier invoice.',
    },
    whatWentWell: [
      'Emergency buffer in Chennai depot prevented zero-inventory condition for 6 production days.',
      'Cross-functional team approved alternate HD-38 formulation without compromising customer warranty.',
    ],
    whatWentWrong: [
      'Budget exceeded by ₹1,30,000 due to urgent expedited shipping of buffer foam.',
      'SLA breached by 2 days due to mandatory 48-hour cure time testing on substitute foam.',
    ],
    actionItems: [
      {
        id: 'ACT-04-A',
        action: 'Mandate sub-tier chemical precursor mapping for all polymer and coating suppliers',
        owner: 'Priya Iyer',
        dueDate: '2026-10-30',
        status: 'completed',
        impactArea: 'Multi-Tier Visibility',
      },
      {
        id: 'ACT-04-B',
        action: 'Pre-qualify and pre-test secondary foam formulations annually to eliminate emergency cure testing delay',
        owner: 'Sunil Mehta',
        dueDate: '2026-11-20',
        status: 'in_progress',
        impactArea: 'R&D Quality',
      },
    ],
    preventivePolicy:
      'Tier-2 Precursor Resilience Mandate: All Tier-1 polymer suppliers must demonstrate diversified sourcing across at least two independent polyol petrochemical production complexes.',
    status: 'completed',
  },
  {
    id: 'PM-2026-05',
    outcomeId: 'OUT-2026-05',
    incidentCode: 'DIS-2026-11',
    incidentTitle: 'Marine Polyurethane Solvent Regulatory Audit Halt',
    incidentCategory: 'regulatory',
    conductedAt: '2026-04-12',
    facilitator: 'Priya Iyer (Head Procurement)',
    participants: [
      'Vikas Nair (EHS Officer)',
      'Deepak Verma (Procurement Lead)',
      'Karan Joshi (Logistics Lead)',
    ],
    rootCauseCategory: 'quality_defect',
    rootCauseSummary:
      'State Pollution Control Board issued surprise suspension notice on solvent emissions for chlorinated aromatic thinners.',
    fiveWhys: {
      why1: 'Varnish Works production lines were sealed by regulatory authorities for 5 days.',
      why2: 'Fugitive volatile organic compound (VOC) levels exceeded newly revised state pollution thresholds.',
      why3: 'Supplier had not completed thermal oxidizer scrubber upgrades announced 6 months prior.',
      why4: 'Procurement did not have an active ESG and environmental compliance tracking audit in place.',
      why5: 'Supplier compliance was only audited during initial onboarding without periodic re-certification.',
    },
    whatWentWell: [
      'Water-based low-VOC coating transition was achieved on schedule within 5 days.',
      'Zero production downtime incurred on final assembly.',
    ],
    whatWentWrong: [
      'Buyer had to provide ₹60,000 line retooling subsidy to ensure supplier expedited compliance filters.',
    ],
    actionItems: [
      {
        id: 'ACT-05-A',
        action: 'Add automatic quarterly regulatory compliance tracking in Onchain Insights supplier scorecard',
        owner: 'Vikas Nair',
        dueDate: '2026-10-15',
        status: 'completed',
        impactArea: 'Compliance',
      },
    ],
    preventivePolicy:
      'Green Chemistry Sourcing Directive: 100% of finishing finishes and varnishes must meet zero-chlorinated solvent standards by Q1 2027.',
    status: 'completed',
  },
];

// -----------------------------------------------------------------------------
// 3. Recurring Risk Pattern Clusters (4 Systemic Vulnerabilities)
// -----------------------------------------------------------------------------

export const MOCK_RECURRING_PATTERNS: RecurringRiskPattern[] = [
  {
    id: 'PAT-01',
    clusterName: 'Monsoon Coastal Port & Rail Siding Bottlenecks',
    frequencyCount: 5,
    affectedCategories: ['natural_disaster', 'logistics'],
    affectedSuppliers: ['Global Timber Exports', 'Apex Hardware Co.', 'Steelcraft India'],
    averageRecoveryDays: 6.8,
    totalExposureINR: 3850000,
    systemicVulnerability:
      'Excessive reliance on western corridor maritime gateways (JNPT & Mumbai Port) between June and September. Severe rainfall causes predictable yard inundation and customs processing halts.',
    strategicRemedy:
      'Establish pre-authorized dry-port customs clearance at Nagpur ICD and enforce dual-port bill-of-lading riders diverting cargo to Mundra or Pipavav during monsoon quarters.',
    riskLevel: 'critical',
    recurrenceTrend: 'increasing',
  },
  {
    id: 'PAT-02',
    clusterName: 'Single-Source Specialty Solvent & Polymer Dependencies',
    frequencyCount: 4,
    affectedCategories: ['regulatory', 'supplier_failure', 'force_majeure'],
    affectedSuppliers: ['Varnish Works', 'FoamComfort Ltd.'],
    averageRecoveryDays: 8.2,
    totalExposureINR: 3200000,
    systemicVulnerability:
      'Highly concentrated chemical formulations relying on single-producer petrochemical intermediates. EHS regulatory audits or precursor plant incidents trigger cascading stops.',
    strategicRemedy:
      'Standardize all finishes on low-VOC waterborne chemistry and maintain dual-qualified polymer formulations (HD-38 / HD-42) with pre-certified QA test certificates.',
    riskLevel: 'high',
    recurrenceTrend: 'stable',
  },
  {
    id: 'PAT-03',
    clusterName: 'Cold-Rolled Sheet Metal Mill Annealing Maintenance Cycles',
    frequencyCount: 3,
    affectedCategories: ['supplier_failure', 'logistics'],
    affectedSuppliers: ['Steelcraft India'],
    averageRecoveryDays: 5.5,
    totalExposureINR: 4200000,
    systemicVulnerability:
      'Domestic steel mills defer heavy furnace relining during peak fiscal quarter ends, leading to unannounced thermal outages and spot-market price spikes.',
    strategicRemedy:
      'Implement semi-annual supplier capital equipment audit clauses and maintain minimum 30-day buffer inventory of standard CR sheet coil specifications.',
    riskLevel: 'high',
    recurrenceTrend: 'decreasing',
  },
  {
    id: 'PAT-04',
    clusterName: 'Cross-Border Timber Customs & Forestry Export Restrictions',
    frequencyCount: 3,
    affectedCategories: ['geopolitical', 'regulatory'],
    affectedSuppliers: ['Global Timber Exports'],
    averageRecoveryDays: 7.4,
    totalExposureINR: 2900000,
    systemicVulnerability:
      'Sourcing premium teak and hardwood through cross-border land corridors subject to unpredictable geopolitical tariffs and forestry certification audits.',
    strategicRemedy:
      'Accelerate long-term volume transition to FSC-certified domestic South Indian plantation timbers and pre-qualify engineered composite wood alternatives.',
    riskLevel: 'medium',
    recurrenceTrend: 'stable',
  },
];

// -----------------------------------------------------------------------------
// 4. Monthly Trend Data (12-Month Performance Series)
// -----------------------------------------------------------------------------

export const MOCK_MONTHLY_TRENDS: OutcomeMonthlyTrendPoint[] = [
  { month: 'Nov 2025', incidentsResolved: 1, avgRecoveryDays: 2.0, slaMetPercent: 100, mitigationCostINR: 45000, penaltiesAvoidedINR: 180000, netBenefitINR: 135000 },
  { month: 'Dec 2025', incidentsResolved: 1, avgRecoveryDays: 5.0, slaMetPercent: 100, mitigationCostINR: 310000, penaltiesAvoidedINR: 1150000, netBenefitINR: 840000 },
  { month: 'Jan 2026', incidentsResolved: 1, avgRecoveryDays: 11.0, slaMetPercent: 0, mitigationCostINR: 390000, penaltiesAvoidedINR: 920000, netBenefitINR: 530000 },
  { month: 'Feb 2026', incidentsResolved: 1, avgRecoveryDays: 3.0, slaMetPercent: 100, mitigationCostINR: 75000, penaltiesAvoidedINR: 340000, netBenefitINR: 265000 },
  { month: 'Mar 2026', incidentsResolved: 1, avgRecoveryDays: 3.0, slaMetPercent: 100, mitigationCostINR: 110000, penaltiesAvoidedINR: 480000, netBenefitINR: 370000 },
  { month: 'Apr 2026', incidentsResolved: 1, avgRecoveryDays: 5.0, slaMetPercent: 100, mitigationCostINR: 190000, penaltiesAvoidedINR: 720000, netBenefitINR: 530000 },
  { month: 'May 2026', incidentsResolved: 1, avgRecoveryDays: 12.0, slaMetPercent: 0, mitigationCostINR: 480000, penaltiesAvoidedINR: 1100000, netBenefitINR: 620000 },
  { month: 'Jun 2026', incidentsResolved: 1, avgRecoveryDays: 7.0, slaMetPercent: 100, mitigationCostINR: 650000, penaltiesAvoidedINR: 2200000, netBenefitINR: 1550000 },
  { month: 'Jul 2026', incidentsResolved: 2, avgRecoveryDays: 6.5, slaMetPercent: 50, mitigationCostINR: 640000, penaltiesAvoidedINR: 2400000, netBenefitINR: 1760000 },
  { month: 'Aug 2026', incidentsResolved: 2, avgRecoveryDays: 9.5, slaMetPercent: 50, mitigationCostINR: 960000, penaltiesAvoidedINR: 2750000, netBenefitINR: 1790000 },
  { month: 'Sep 2026', incidentsResolved: 1, avgRecoveryDays: 5.0, slaMetPercent: 100, mitigationCostINR: 150000, penaltiesAvoidedINR: 650000, netBenefitINR: 500000 },
  { month: 'Oct 2026', incidentsResolved: 1, avgRecoveryDays: 4.0, slaMetPercent: 100, mitigationCostINR: 125000, penaltiesAvoidedINR: 580000, netBenefitINR: 455000 },
];

// -----------------------------------------------------------------------------
// 5. Supplier Historical Resilience Metric Scorecard
// -----------------------------------------------------------------------------

export const MOCK_SUPPLIER_RESILIENCE: SupplierResilienceMetric[] = [
  {
    supplierId: 'sup-001',
    supplierName: 'Global Timber Exports',
    incidentsInvolved: 3,
    resilienceScore: 68,
    avgRecoveryDays: 8.0,
    slaAdherenceRate: 66.7,
    tier: 'critical',
  },
  {
    supplierId: 'sup-002',
    supplierName: 'Apex Hardware Co.',
    incidentsInvolved: 3,
    resilienceScore: 78,
    avgRecoveryDays: 5.3,
    slaAdherenceRate: 66.7,
    tier: 'medium',
  },
  {
    supplierId: 'sup-003',
    supplierName: 'Rajshree Fabrics Ltd.',
    incidentsInvolved: 1,
    resilienceScore: 92,
    avgRecoveryDays: 3.0,
    slaAdherenceRate: 100.0,
    tier: 'low',
  },
  {
    supplierId: 'sup-004',
    supplierName: 'Steelcraft India',
    incidentsInvolved: 2,
    resilienceScore: 84,
    avgRecoveryDays: 6.0,
    slaAdherenceRate: 100.0,
    tier: 'high',
  },
  {
    supplierId: 'sup-005',
    supplierName: 'Varnish Works',
    incidentsInvolved: 2,
    resilienceScore: 75,
    avgRecoveryDays: 5.0,
    slaAdherenceRate: 100.0,
    tier: 'medium',
  },
  {
    supplierId: 'sup-006',
    supplierName: 'FoamComfort Ltd.',
    incidentsInvolved: 2,
    resilienceScore: 62,
    avgRecoveryDays: 12.5,
    slaAdherenceRate: 0.0,
    tier: 'critical',
  },
  {
    supplierId: 'sup-007',
    supplierName: 'PrecisionFix Fasteners',
    incidentsInvolved: 1,
    resilienceScore: 90,
    avgRecoveryDays: 3.0,
    slaAdherenceRate: 100.0,
    tier: 'low',
  },
  {
    supplierId: 'sup-008',
    supplierName: 'EcoPanels Bio-Composites',
    incidentsInvolved: 1,
    resilienceScore: 58,
    avgRecoveryDays: 11.0,
    slaAdherenceRate: 0.0,
    tier: 'high',
  },
];

// -----------------------------------------------------------------------------
// In-Memory Storage & Query Operations
// -----------------------------------------------------------------------------

let historicalOutcomesStore = [...INITIAL_HISTORICAL_OUTCOMES];
let postMortemsStore = [...INITIAL_POST_MORTEMS];

export function getOutcomeAnalyticsData(filters?: OutcomeAnalyticsFilterParams): OutcomeAnalyticsResponse {
  let list = [...historicalOutcomesStore];

  // Category filter
  if (filters?.category && filters.category !== 'all') {
    list = list.filter((item) => item.category === filters.category);
  }

  // Final status filter
  if (filters?.finalStatus && filters.finalStatus !== 'all') {
    list = list.filter((item) => item.finalStatus === filters.finalStatus);
  }

  // Search filter
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.incidentCode.toLowerCase().includes(q) ||
        item.primarySupplierName.toLowerCase().includes(q) ||
        item.affectedMaterial.toLowerCase().includes(q) ||
        item.decisionTaken.toLowerCase().includes(q)
    );
  }

  // Sorting
  const sortBy = filters?.sortBy || 'incidentDate';
  const sortOrder = filters?.sortOrder || 'desc';

  list.sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'incidentDate') {
      cmp = new Date(a.incidentDate).getTime() - new Date(b.incidentDate).getTime();
    } else if (sortBy === 'recoveryDurationDays') {
      cmp = a.recoveryDurationDays - b.recoveryDurationDays;
    } else if (sortBy === 'netBenefitINR') {
      cmp = a.netBenefitINR - b.netBenefitINR;
    } else if (sortBy === 'mitigationCostINR') {
      cmp = a.mitigationCostINR - b.mitigationCostINR;
    }
    return sortOrder === 'desc' ? -cmp : cmp;
  });

  // Calculate KPIs over the active dataset (or base dataset if filters are empty)
  const totalAnalyzed = list.length;
  const totalRecoveryDays = list.reduce((sum, item) => sum + item.recoveryDurationDays, 0);
  const meanRecoveryDurationDays = totalAnalyzed > 0 ? Number((totalRecoveryDays / totalAnalyzed).toFixed(1)) : 0;
  const onTimeCount = list.filter((item) => item.slaAdherence).length;
  const slaAdherenceRatePercent = totalAnalyzed > 0 ? Number(((onTimeCount / totalAnalyzed) * 100).toFixed(1)) : 0;

  const totalMitigationSpendINR = list.reduce((sum, item) => sum + item.mitigationCostINR, 0);
  const totalPenaltiesAvoidedINR = list.reduce((sum, item) => sum + item.penaltiesAvoidedINR, 0);
  const netAvoidanceValueINR = totalPenaltiesAvoidedINR - totalMitigationSpendINR;

  const postMortemConductedCount = list.filter((item) => item.postMortemConducted).length;
  const postMortemCompletionRatePercent =
    totalAnalyzed > 0 ? Number(((postMortemConductedCount / totalAnalyzed) * 100).toFixed(1)) : 0;

  const kpis: OutcomeAnalyticsKpis = {
    totalIncidentsAnalyzed: totalAnalyzed,
    meanRecoveryDurationDays,
    meanRecoveryTargetDays: 5.5,
    slaAdherenceRatePercent,
    totalMitigationSpendINR,
    totalPenaltiesAvoidedINR,
    netAvoidanceValueINR,
    postMortemCompletionRatePercent,
    recurringRiskClustersCount: MOCK_RECURRING_PATTERNS.length,
  };

  return {
    kpis,
    monthlyTrends: MOCK_MONTHLY_TRENDS,
    outcomes: list,
    recurringPatterns: MOCK_RECURRING_PATTERNS,
    supplierResilience: MOCK_SUPPLIER_RESILIENCE,
    postMortems: postMortemsStore,
    isSimulated: true,
    totalCount: list.length,
  };
}

export function addPostMortemRecord(payload: PostMortemSubmissionPayload): PostMortemRecord {
  const targetOutcome = historicalOutcomesStore.find((o) => o.id === payload.outcomeId);
  const newId = `PM-2026-${String(postMortemsStore.length + 1).padStart(2, '0')}`;
  const now = new Date().toISOString().split('T')[0];

  const actionItems = payload.actionItems.map((act, idx) => ({
    ...act,
    id: `ACT-${String(postMortemsStore.length + 1).padStart(2, '0')}-${String.fromCharCode(65 + idx)}`,
  }));

  const record: PostMortemRecord = {
    id: newId,
    outcomeId: payload.outcomeId,
    incidentCode: targetOutcome?.incidentCode || 'DIS-UNKNOWN',
    incidentTitle: targetOutcome?.title || 'Supply Disruption Event',
    incidentCategory: targetOutcome?.category || 'supplier_failure',
    conductedAt: now,
    facilitator: payload.facilitator || 'Procurement Lead',
    participants: payload.participants?.length ? payload.participants : ['Operations Team', 'Procurement Team'],
    rootCauseCategory: payload.rootCauseCategory,
    rootCauseSummary: payload.rootCauseSummary,
    fiveWhys: payload.fiveWhys,
    whatWentWell: payload.whatWentWell,
    whatWentWrong: payload.whatWentWrong,
    actionItems,
    preventivePolicy: payload.preventivePolicy,
    status: payload.status || 'completed',
  };

  postMortemsStore.unshift(record);

  // Mark the outcome as postMortemConducted = true
  historicalOutcomesStore = historicalOutcomesStore.map((o) => {
    if (o.id === payload.outcomeId) {
      return {
        ...o,
        postMortemConducted: true,
        postMortemId: newId,
      };
    }
    return o;
  });

  return record;
}
