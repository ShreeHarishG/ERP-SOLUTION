// =============================================================================
// Autonomous Supply Chain Control Tower — 14 Agents Registry & Mock Data
// Complete implementation of Version 1.0 Specification (October 21, 2026)
// =============================================================================

import { AgentDefinition, CommonIncidentEvent } from '@/types/control-tower-agents';

export const INITIAL_COMMON_EVENT: CommonIncidentEvent = {
  event_id: 'EVT-1001',
  timestamp: '2026-10-21T15:30:00Z',
  supplier_id: 'SUP-031',
  product_id: 'PROD-1001',
  material_id: 'MAT-101',
  location: 'Shanghai',
  risk_type: 'SUPPLIER_DISRUPTION',
  risk_score: 87,
  severity: 'CRITICAL',
  probability: 0.87,
  prediction_window: '2-4 weeks',
  affected_quantity: 15000,
  inventory_days: 4,
  revenue_at_risk: 1250000,
  recommended_actions: ['BUY_FROM_ALTERNATE_SUPPLIER', 'EXPEDITE_SHIPMENT'],
  status: 'OPEN',
  confidence: 0.91,
};

export const CONTROL_TOWER_AGENTS: AgentDefinition[] = [
  {
    id: 1,
    key: 'supplier_mapping',
    name: 'Multi-Tier Supplier Mapping',
    type: 'Knowledge Graph',
    investorPitch: 'Uncovers hidden sub-tier vulnerabilities before raw material bottlenecks strike your tier-1 assembly line.',
    purpose: 'Discover the complete supplier dependency graph from PO/BOM/master data down to tier-3 raw material extractors.',
    inputsDescription: 'Supplier master, purchase orders, bill of materials, material master, product master, contracts, manufacturing locations.',
    outputsDescription: 'Graph representation of multi-tier supplier dependency chains and critical single-point-of-failure paths.',
    upstream: [],
    downstream: [3, 5, 6, 7, 10, 12],
    latencyMs: 142,
    accuracyConfidence: 0.94,
    sampleInput: {
      product_id: 'PROD-1001',
      bom: [
        { component_id: 'COMP-101', quantity: 2, supplier_id: 'SUP-001' }
      ]
    },
    sampleOutput: {
      product_id: 'PROD-1001',
      supplier_network: [
        { supplier_id: 'SUP-001', supplier_name: 'Supplier A', tier: 1, component: 'COMP-101' },
        { supplier_id: 'SUP-020', supplier_name: 'Supplier B', tier: 2, component: 'Steel' },
        { supplier_id: 'SUP-031', supplier_name: 'Supplier C', tier: 3, component: 'Iron Ore' }
      ],
      dependency_paths: ['SUP-001 → SUP-020 → SUP-031']
    }
  },
  {
    id: 2,
    key: 'shipment_tracking',
    name: 'Logistics & Shipment Tracking',
    type: 'Telematics / IoT',
    investorPitch: 'Replaces passive tracking numbers with predictive ETA deviation alerts calculated directly from maritime AIS telemetry.',
    purpose: 'Track in-transit shipments globally, evaluate transshipment delays, and detect logistics bottlenecks.',
    inputsDescription: 'Shipment ID, PO ID, carrier telemetry, origin/destination ports, container numbers, expected arrival schedules.',
    outputsDescription: 'Real-time delay detection, updated dynamic ETA, root-cause categorization, and logistics risk level.',
    upstream: [8],
    downstream: [3, 5, 6, 7, 9, 11, 12, 13],
    latencyMs: 88,
    accuracyConfidence: 0.96,
    sampleInput: {
      shipment_id: 'SHIP-1001',
      supplier_id: 'SUP-001',
      carrier: 'Maersk Line',
      tracking_number: 'MSK-99214',
      origin: 'Shanghai',
      destination: 'Los Angeles',
      original_eta: '2026-11-01'
    },
    sampleOutput: {
      shipment_id: 'SHIP-1001',
      supplier_id: 'SUP-001',
      status: 'DELAYED',
      origin: 'Shanghai',
      destination: 'Los Angeles',
      original_eta: '2026-11-01',
      current_eta: '2026-11-07',
      delay_days: 6,
      delay_reason: 'Port congestion',
      risk_level: 'HIGH'
    }
  },
  {
    id: 3,
    key: 'external_risk',
    name: 'External Risk Signal',
    type: 'OSINT / Feeds',
    investorPitch: 'Monitors geopolitical conflicts, extreme weather, and labor strikes to foresee disruptions days before suppliers report them.',
    purpose: 'Continuously ingest global telemetry feeds to identify events outside the enterprise that threaten supply continuity.',
    inputsDescription: 'Global ports, geographic shipping lanes, supplier coordinates, meteorological feeds, trade restriction alerts.',
    outputsDescription: 'Synthesized risk incidents with severity scores, geographic blast radius, and affected supplier lists.',
    upstream: [1, 2],
    downstream: [5, 6, 7, 10, 12, 13],
    latencyMs: 120,
    accuracyConfidence: 0.91,
    sampleInput: {
      location: 'Shanghai',
      corridor: 'East China Sea',
      risk_category: 'PORT_CONGESTION',
      threshold_severity: 7
    },
    sampleOutput: {
      event_id: 'RISK-1001',
      risk_type: 'PORT_CONGESTION',
      location: 'Shanghai',
      severity: 8,
      start_date: '2026-10-21',
      expected_duration_days: 10,
      affected_suppliers: ['SUP-020', 'SUP-031'],
      affected_routes: ['Shanghai → Los Angeles'],
      confidence: 0.91
    }
  },
  {
    id: 4,
    key: 'financial_health',
    name: 'Supplier Financial Health',
    type: 'Financial ML',
    investorPitch: 'Predicts vendor insolvency and credit crunches using non-linear balance sheet deterioration signals.',
    purpose: 'Audit financial stability, leverage metrics, and late-payment trends to flag high-default vendors.',
    inputsDescription: 'Vendor tax IDs, balance sheet metrics (debt, liquidity, cash flow), payment history, trade credit scores.',
    outputsDescription: 'Financial health index (0-100), risk stratification, specific vulnerability factors, and confidence rating.',
    upstream: [1],
    downstream: [5, 6, 7, 10, 12],
    latencyMs: 165,
    accuracyConfidence: 0.88,
    sampleInput: {
      supplier_id: 'SUP-031',
      annual_revenue: 12500000,
      total_debt: 10125000,
      cash_reserves: 925000,
      late_payments_last_90d: 5
    },
    sampleOutput: {
      supplier_id: 'SUP-031',
      financial_health_score: 32,
      risk_level: 'HIGH',
      indicators: { debt_ratio: 0.81, liquidity_ratio: 0.74, revenue_growth: -0.18 },
      risk_factors: ['High debt', 'Declining revenue', 'Low liquidity'],
      confidence: 0.88
    }
  },
  {
    id: 5,
    key: 'disruption_prediction',
    name: 'Disruption Prediction (ML Core)',
    type: 'Predictive ML Core',
    investorPitch: 'The brain of the Control Tower — fuses logistics, weather, and vendor finances into an accurate probability of factory shutdown.',
    purpose: 'Calculate the probability, timing window, and severity of potential operational disruptions.',
    inputsDescription: 'Multi-agent feature vector combining shipment delay, financial health score, external risk, and inventory days.',
    outputsDescription: 'Disruption probability (0.0 - 1.0), risk tier, estimated occurrence window, and primary causal factors.',
    upstream: [1, 2, 3, 4, 14],
    downstream: [6, 7, 10, 12, 13],
    latencyMs: 210,
    accuracyConfidence: 0.91,
    sampleInput: {
      supplier_id: 'SUP-031',
      shipment_delay_days: 6,
      financial_health_score: 32,
      external_risk_score: 78,
      country_risk: 60,
      inventory_days: 4,
      historical_disruptions: 3
    },
    sampleOutput: {
      supplier_id: 'SUP-031',
      disruption_probability: 0.87,
      risk_level: 'CRITICAL',
      prediction_window: '2-4 weeks',
      confidence: 0.91,
      top_risk_factors: ['Shipment delay', 'Financial instability', 'Low inventory coverage']
    }
  },
  {
    id: 6,
    key: 'impact_assessment',
    name: 'Impact Assessment',
    type: 'Deterministic Impact',
    investorPitch: 'Directly converts technical vendor failures into hard corporate dollars and unfulfilled customer commitments.',
    purpose: 'Answer the executive question: "If this supplier halts shipments tomorrow, what is the exact financial and production damage?"',
    inputsDescription: 'BOM recipe explosion, active manufacturing schedules, customer sales orders, open POs, and buffer inventory.',
    outputsDescription: 'Revenue at risk, halted assembly lines, delayed customer orders, and buffer exhaustion countdown.',
    upstream: [1, 2, 3, 4, 5],
    downstream: [7, 8, 9, 12, 13],
    latencyMs: 95,
    accuracyConfidence: 0.95,
    sampleInput: {
      supplier_id: 'SUP-031',
      disruption_probability: 0.87,
      impact_window_days: 28,
      active_finished_goods: ['PROD-1001', 'PROD-1007']
    },
    sampleOutput: {
      supplier_id: 'SUP-031',
      impact_level: 'CRITICAL',
      affected_products: ['PROD-1001', 'PROD-1007'],
      production_impact: { units_at_risk: 25000, production_delay_days: 8 },
      customer_impact: { orders_at_risk: 4200, revenue_at_risk: 1250000 },
      inventory_coverage_days: 4,
      estimated_revenue_impact: 1250000
    }
  },
  {
    id: 7,
    key: 'mitigation',
    name: 'Mitigation Recommendation',
    type: 'Optimization Solver',
    investorPitch: 'Synthesizes complex trade-offs between air freight speed, secondary supplier premiums, and stockout costs in seconds.',
    purpose: 'Generate an optimal Pareto-efficient list of mitigation actions with cost-benefit analysis and risk reduction estimates.',
    inputsDescription: 'Disruption probability, impact assessment, qualified backup supplier directory, expedite rates, and SLA priorities.',
    outputsDescription: 'Ranked mitigation options with projected cost, days saved, risk reduction ratio, and recommended top strategy.',
    upstream: [1, 2, 3, 4, 5, 6],
    downstream: [8, 9, 13],
    latencyMs: 180,
    accuracyConfidence: 0.89,
    sampleInput: {
      incident_id: 'INC-1001',
      disrupted_supplier: 'SUP-031',
      required_units: 15000,
      revenue_at_risk: 1250000,
      acceptable_lead_time_days: 5
    },
    sampleOutput: {
      incident_id: 'INC-1001',
      recommendations: [
        {
          action: 'BUY_FROM_ALTERNATE_SUPPLIER',
          supplier: 'SUP-045',
          quantity: 15000,
          lead_time_days: 3,
          cost: 180000,
          risk_reduction: 0.72
        },
        {
          action: 'EXPEDITE_SHIPMENT',
          shipment_id: 'SHIP-1001',
          additional_cost: 25000,
          days_saved: 4
        },
        {
          action: 'INCREASE_SAFETY_STOCK',
          quantity: 5000
        }
      ],
      recommended_action: 'BUY_FROM_ALTERNATE_SUPPLIER',
      reason: 'Lowest expected business impact'
    }
  },
  {
    id: 8,
    key: 'procurement_trigger',
    name: 'Auto Procurement Trigger',
    type: 'Orchestrator',
    investorPitch: 'Ensures full compliance and corporate governance by drafting ready-to-execute POs requiring explicit human authorization.',
    purpose: 'Translate approved mitigation plans directly into ERP purchase orders while strictly enforcing human-in-the-loop authorization.',
    inputsDescription: 'Approved mitigation decision, selected supplier profile, target component SKU, volume, agreed unit price.',
    outputsDescription: 'Pending PO draft with verification checks, transitioning to finalized ERP record upon human signature.',
    upstream: [6, 7],
    downstream: [2, 9, 13],
    latencyMs: 75,
    accuracyConfidence: 0.99,
    sampleInput: {
      action: 'BUY_FROM_ALTERNATE_SUPPLIER',
      supplier_id: 'SUP-045',
      material_id: 'MAT-101',
      quantity: 15000,
      unit_price: 12.50,
      required_date: '2026-10-30'
    },
    sampleOutput: {
      action: 'CREATE_PURCHASE_ORDER',
      status: 'PENDING_APPROVAL',
      supplier_id: 'SUP-045',
      material_id: 'MAT-101',
      quantity: 15000,
      unit_price: 12.50,
      required_date: '2026-10-30',
      authorized_po_preview: {
        po_id: 'PO-2026-9981',
        status: 'CREATED',
        supplier: 'SUP-045',
        quantity: 15000
      }
    }
  },
  {
    id: 9,
    key: 'demand_supply',
    name: 'Demand-Supply Balancing',
    type: 'Linear Programming',
    investorPitch: 'Dynamically rebalances regional warehouse inventory allocations to maintain 96%+ order fulfillment during supply shocks.',
    purpose: 'Reallocate on-hand stocks and in-transit replenishment across multi-regional distribution centers following disruptions.',
    inputsDescription: 'Warehouse inventory balances, open order lines, freight transit times between nodes, customer delivery tiers.',
    outputsDescription: 'Optimal inventory re-allocation plan, expected service level probability, and remaining stockout risk.',
    upstream: [2, 6, 7, 8],
    downstream: [12, 13],
    latencyMs: 130,
    accuracyConfidence: 0.93,
    sampleInput: {
      product_id: 'PROD-1001',
      supply_deficit: 15000,
      warehouses: ['WH-01', 'WH-02']
    },
    sampleOutput: {
      allocation_plan: [
        { warehouse: 'WH-01', product: 'PROD-1001', current_inventory: 5000, allocated_quantity: 3000 },
        { warehouse: 'WH-02', product: 'PROD-1001', current_inventory: 3200, allocated_quantity: 1000 }
      ],
      expected_service_level: 0.96,
      stockout_risk: 0.08
    }
  },
  {
    id: 10,
    key: 'supplier_scorecard',
    name: 'Supplier Scorecard',
    type: 'Composite Scoring',
    investorPitch: 'Holistic dynamic supplier rating across delivery, quality, financial health, and ESG — not just static quarterly reviews.',
    purpose: 'Continuously calculate dynamic ratings for every registered supplier across 6 multidimensional axes.',
    inputsDescription: 'On-time delivery telemetry, incoming inspection reject rates, quote competitiveness, financial health, ESG disclosures.',
    outputsDescription: 'Normalized score (0-100), dimensional breakdown, multi-month trend direction, and operational recommendation.',
    upstream: [1, 2, 3, 4, 5, 11],
    downstream: [12, 13, 14],
    latencyMs: 90,
    accuracyConfidence: 0.92,
    sampleInput: {
      supplier_id: 'SUP-001',
      rolling_window_months: 6
    },
    sampleOutput: {
      supplier_id: 'SUP-001',
      score: 78,
      dimensions: { delivery: 82, quality: 91, cost: 73, financial: 65, risk: 70, esg: 84 },
      overall_rating: 'MEDIUM',
      trend: 'DECLINING',
      recommendation: 'Increase monitoring'
    }
  },
  {
    id: 11,
    key: 'carbon_sustainability',
    name: 'Carbon & Sustainability',
    type: 'GHG Engine',
    investorPitch: 'Empowers carbon-conscious operations by calculating Scope 3 freight footprint differences between sea, air, and rail alternatives.',
    purpose: 'Compute CO2 equivalent footprint per shipment and recommend emissions-reducing freight modal shifts.',
    inputsDescription: 'Shipment cargo weight, origin/destination coordinates, modal split (maritime/road/air/rail), vessel fuel characteristics.',
    outputsDescription: 'Total emissions in kg CO2e, per-unit carbon intensity, multimodal breakdown, and sustainability rating (A to F).',
    upstream: [2],
    downstream: [10, 12, 13],
    latencyMs: 65,
    accuracyConfidence: 0.97,
    sampleInput: {
      shipment_id: 'SHIP-1001',
      weight_kg: 12000,
      distance_km: 8900,
      transport_mode: 'SEA'
    },
    sampleOutput: {
      shipment_id: 'SHIP-1001',
      carbon_footprint: { co2e_kg: 1840, co2e_per_kg_product: 0.153 },
      transport_breakdown: { sea: 1700, truck: 140 },
      sustainability_rating: 'B'
    }
  },
  {
    id: 12,
    key: 'dashboard',
    name: 'Control Tower Dashboard',
    type: 'Aggregation Layer',
    investorPitch: 'Executive single-pane-of-glass giving C-suite visibility over all operational disruption risks and mitigation ROI in real time.',
    purpose: 'Unify real-time signals from all 13 specialized agents into an actionable executive operational command canvas.',
    inputsDescription: 'Aggregated output streams from Supplier Mapping, Logistics, External Feeds, Disruption ML, and Mitigation Solver.',
    outputsDescription: 'Executive operational health score, critical supplier counts, revenue-at-risk, and top recommended actions.',
    upstream: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11],
    downstream: [],
    latencyMs: 45,
    accuracyConfidence: 0.98,
    sampleInput: {
      include_active_incidents: true,
      timeframe: 'realtime'
    },
    sampleOutput: {
      overall_supply_chain_health: 72,
      critical_suppliers: 8,
      high_risk_shipments: 14,
      active_disruptions: 5,
      revenue_at_risk: 4200000,
      inventory_at_risk: 180000,
      recommended_actions: 12
    }
  },
  {
    id: 13,
    key: 'stakeholder_alert',
    name: 'Stakeholder Alert',
    type: 'Rules & Dispatch',
    investorPitch: 'Eliminates alert fatigue by routing tailored, role-specific intelligence to Procurement, Operations, and Executives.',
    purpose: 'Dispatch context-aware notifications through multi-channel pipelines (Slack, Teams, Email, SMS, Dashboard) to the right stakeholders.',
    inputsDescription: 'Risk event severity, affected supplier, financial exposure, recommended mitigation, user RBAC role definitions.',
    outputsDescription: 'Tailored message payloads for each role, urgency flags, and delivery acknowledgment records.',
    upstream: [2, 3, 5, 6, 7, 8, 9, 10, 11],
    downstream: [],
    latencyMs: 50,
    accuracyConfidence: 0.99,
    sampleInput: {
      incident_id: 'INC-1001',
      supplier_name: 'Supplier C',
      disruption_probability: 0.87,
      revenue_at_risk: 1250000
    },
    sampleOutput: {
      recipient_role: 'PROCUREMENT',
      severity: 'HIGH',
      message: 'Supplier C disruption probability reached 87%. Alternate supplier recommended.',
      action_required: true,
      executive_alert: {
        recipient_role: 'EXECUTIVE',
        severity: 'CRITICAL',
        message: '$1.25M revenue is potentially at risk due to Supplier C disruption.',
        action_required: true
      },
      dispatched_channels: ['Email', 'Slack', 'Teams', 'SMS', 'Dashboard', 'Mobile notification']
    }
  },
  {
    id: 14,
    key: 'post_mortem',
    name: 'Post-Mortem & Learning',
    type: 'RL / Feedback Loop',
    investorPitch: 'Turns disruptions into algorithmic compounding advantage by evaluating actual outcomes against predictions to retrain ML weights.',
    purpose: 'Conduct automated retrospective analysis after an incident resolves, recording lessons learned and calibrating prediction models.',
    inputsDescription: 'Original model prediction timestamps, actual delay days experienced, realized mitigation costs, and recovered revenue.',
    outputsDescription: 'Prediction accuracy audit, net revenue saved vs cost, synthesized institutional lessons, and model fine-tuning feedback.',
    upstream: [10],
    downstream: [5],
    latencyMs: 110,
    accuracyConfidence: 0.93,
    sampleInput: {
      incident_id: 'INC-1001',
      predicted_probability: 0.87,
      predicted_window: '2-4 weeks',
      actual_delay_days: 9,
      mitigation_cost: 180000
    },
    sampleOutput: {
      incident_id: 'INC-1001',
      prediction: { predicted_probability: 0.87, predicted_window: '2-4 weeks' },
      actual: { disruption_occurred: true, actual_delay_days: 9 },
      mitigation: { action: 'Alternate supplier', cost: 180000 },
      outcome: { revenue_loss: 250000, revenue_saved: 1000000 },
      lessons: [
        'Supplier financial deterioration preceded shipment delays',
        '4 days of inventory was insufficient',
        'Alternate supplier reduced recovery time'
      ],
      model_feedback: {
        prediction_quality: 'GOOD',
        recommended_model_update: true
      }
    }
  }
];

// Complete Section 6: End-to-End Autonomous Scenario Demo Steps
export interface ScenarioStep {
  step: number;
  agentId: number;
  agentName: string;
  badge: string;
  title: string;
  description: string;
  highlightKey: string;
  highlightValue: string;
  payload: Record<string, any>;
}

export const END_TO_END_SCENARIO_STEPS: ScenarioStep[] = [
  {
    step: 1,
    agentId: 1,
    agentName: 'Multi-Tier Supplier Mapping',
    badge: 'Tier 3 Discovery',
    title: 'Supplier C Monitored in Supply Chain Graph',
    description: 'Supplier C (Tier 3, Iron Ore supplier located in Shanghai) identified as critical single-source dependency behind Supplier A and B.',
    highlightKey: 'Dependency Chain',
    highlightValue: 'SUP-001 (Tier 1) → SUP-020 (Tier 2) → SUP-031 (Tier 3)',
    payload: { supplier_id: 'SUP-031', tier: 3, component: 'Iron Ore', product: 'PROD-1001' }
  },
  {
    step: 2,
    agentId: 4,
    agentName: 'Supplier Financial Health',
    badge: 'Insolvency Risk',
    title: 'Financial Health Deteriorates to Score 32',
    description: 'Financial ML signals sharp balance sheet distress: high leverage (debt ratio 0.81), negative revenue growth (-18%), and low liquidity.',
    highlightKey: 'Health Score',
    highlightValue: '32 / 100 (HIGH RISK)',
    payload: { supplier_id: 'SUP-031', health_score: 32, debt_ratio: 0.81, revenue_growth: '-18%' }
  },
  {
    step: 3,
    agentId: 3,
    agentName: 'External Risk Signal',
    badge: 'Port Congestion',
    title: 'Shanghai Port Congestion Detected (Severity 8/10)',
    description: 'OSINT satellite and customs telemetry register a major backlog outside Shanghai terminal with expected 10-day delay duration.',
    highlightKey: 'Port Severity',
    highlightValue: 'Severity 8 · Shanghai Corridor',
    payload: { event_id: 'RISK-1001', location: 'Shanghai', severity: 8, duration_days: 10 }
  },
  {
    step: 4,
    agentId: 2,
    agentName: 'Logistics & Shipment Tracking',
    badge: 'Transit Delay',
    title: 'Shipment #SHIP-1001 Delayed 6 Days',
    description: 'Automated AIS maritime tracking updates current ETA from Nov 01 to Nov 07 due to Shanghai container bottleneck.',
    highlightKey: 'ETA Slippage',
    highlightValue: '+6 Days (Critical Transshipment Delay)',
    payload: { shipment_id: 'SHIP-1001', origin: 'Shanghai', original_eta: '2026-11-01', current_eta: '2026-11-07' }
  },
  {
    step: 5,
    agentId: 5,
    agentName: 'Disruption Prediction (ML Core)',
    badge: '87% Probability',
    title: 'Disruption ML Predicts Factory Stockout in 2-4 Weeks',
    description: 'Fusing the 6-day transit delay, 32 financial score, and external risk yields an 87% probability of complete component stockout.',
    highlightKey: 'Disruption Probability',
    highlightValue: '87% (CRITICAL RISK)',
    payload: { disruption_probability: 0.87, window: '2-4 weeks', confidence: 0.91 }
  },
  {
    step: 6,
    agentId: 6,
    agentName: 'Impact Assessment',
    badge: '$1.25M at Risk',
    title: 'Business Impact: $1.25M Revenue & 4 Days Inventory Cover',
    description: 'BOM explosion reveals factory has only 4 days of safety stock left. 25,000 units and $1.25M customer sales revenue at risk.',
    highlightKey: 'Revenue at Risk',
    highlightValue: '$1,250,000 across 4,200 orders',
    payload: { affected_products: ['PROD-1001', 'PROD-1007'], units_at_risk: 25000, revenue_at_risk: 1250000, buffer_days: 4 }
  },
  {
    step: 7,
    agentId: 7,
    agentName: 'Mitigation Recommendation',
    badge: 'Optimal Mitigation',
    title: 'Mitigation Solver Recommends Backup Supplier SUP-045',
    description: 'Pareto solver ranks BUY_FROM_ALTERNATE_SUPPLIER (15k units from SUP-045 at $180k cost) as lowest-risk, highest-margin decision.',
    highlightKey: 'Recommendation',
    highlightValue: 'Procure 15k units from SUP-045 (3 days lead time)',
    payload: { action: 'BUY_FROM_ALTERNATE_SUPPLIER', backup_supplier: 'SUP-045', lead_time_days: 3, risk_reduction: '72%' }
  },
  {
    step: 8,
    agentId: 8,
    agentName: 'Auto Procurement Trigger',
    badge: 'Human-in-the-Loop',
    title: 'Draft Purchase Order Created in PENDING_APPROVAL',
    description: 'Control Tower creates draft PO for 15,000 units @ $12.50. Governance gate holds execution until human authorization.',
    highlightKey: 'Procurement Status',
    highlightValue: 'PENDING_APPROVAL (Gate Active)',
    payload: { action: 'CREATE_PURCHASE_ORDER', supplier_id: 'SUP-045', material_id: 'MAT-101', quantity: 15000, unit_price: 12.50 }
  },
  {
    step: 9,
    agentId: 8,
    agentName: 'Human Authorization Gate',
    badge: 'Authorized PO',
    title: 'Procurement Manager Approves PO-2026-9981',
    description: 'Authorized by Human Lead. PO-2026-9981 committed to ERP ledger with expedited 3-day supplier commitment.',
    highlightKey: 'Created Order',
    highlightValue: 'PO-2026-9981 Confirmed & Dispatched',
    payload: { po_id: 'PO-2026-9981', status: 'CREATED', approved_by: 'Procurement Manager', supplier: 'SUP-045' }
  },
  {
    step: 10,
    agentId: 9,
    agentName: 'Demand-Supply Balancing',
    badge: 'Stock Reallocation',
    title: 'Inventory Reallocated Across Warehouses WH-01 & WH-02',
    description: 'Reallocation optimizer redirects 3,000 units from WH-01 and 1,000 from WH-02, preserving 96% customer service levels.',
    highlightKey: 'Expected SLA',
    highlightValue: '96% Service Level · 8% Stockout Risk',
    payload: { wh_01_allocation: 3000, wh_02_allocation: 1000, expected_service_level: 0.96 }
  },
  {
    step: 11,
    agentId: 13,
    agentName: 'Stakeholder Alert',
    badge: 'Multi-Role Alerts',
    title: 'Targeted Intelligence Pushed to Procurement & C-Suite',
    description: 'Procurement notified of alternate PO dispatch; Executive leadership briefed on $1.25M risk neutralization.',
    highlightKey: 'Delivery Channels',
    highlightValue: 'Slack, Teams, Email, Dashboard Broadcasted',
    payload: { procurement_alert: 'HIGH', executive_alert: 'CRITICAL', dispatched: true }
  },
  {
    step: 12,
    agentId: 12,
    agentName: 'Control Tower Dashboard',
    badge: 'Live Operations View',
    title: 'Executive Radar Updated in Real Time',
    description: 'Health index stabilizes at 72, active disruption flagged, and mitigation ROI captured in the executive command center.',
    highlightKey: 'Control Tower State',
    highlightValue: 'Health 72 · Active Incidents 5 · Mitigation Logged',
    payload: { health: 72, critical_suppliers: 8, delayed_shipments: 14 }
  },
  {
    step: 13,
    agentId: 14,
    agentName: 'Post-Mortem & Learning',
    badge: 'Model Retrained',
    title: 'Retrospective Logged: $1,000,000 in Revenue Protected',
    description: 'Automated post-mortem logs 9-day actual delay, $180k mitigation spend, and $1.0M saved revenue. Weights updated in Disruption ML.',
    highlightKey: 'Financial Impact',
    highlightValue: 'Net $1.0M Protected · Model Quality GOOD',
    payload: { revenue_saved: 1000000, mitigation_cost: 180000, model_update: true }
  }
];
