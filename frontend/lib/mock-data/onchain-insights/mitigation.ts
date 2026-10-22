import {
  MitigationDisruptionContext,
  MitigationLabResponse,
  MitigationLabWeights,
  MitigationOption,
} from '@/types/onchain-insights';

export const DEFAULT_MITIGATION_WEIGHTS: MitigationLabWeights = {
  costEfficiency: 0.35,
  recoverySpeed: 0.35,
  feasibility: 0.20,
  operationalEase: 0.10,
};

export const MOCK_MITIGATION_DISRUPTIONS: MitigationDisruptionContext[] = [
  {
    id: 'DIS-2026-001',
    title: 'Nhava Sheva (JNPT) Container Terminal Congestion',
    category: 'port_congestion',
    severity: 'critical',
    affectedSupplier: 'Apex Fasteners India Ltd',
    affectedSupplierId: 'SUP-001',
    affectedMaterial: 'High-Tensile Steel Fasteners',
    sku: 'SKU-STL-002',
    currentDelayDays: 18,
    totalOrdersAtRisk: 42,
    totalRevenueAtRiskINR: 2850000,
    options: [
      {
        id: 'OPT-001-A',
        disruptionId: 'DIS-2026-001',
        title: 'Priority Air Freight Dispatch via Blue Dart Aviation',
        strategyType: 'expedited_freight',
        rank: 1,
        isRecommended: true,
        score: 88,
        summary: 'Bypass port bottlenecks by chartering priority air cargo from Mumbai Chhatrapati Shivaji Int’l directly to Bangalore Logistics Hub.',
        estimatedCostINR: 165000,
        recoveryTimeDays: 3,
        ordersProtectedCount: 40,
        ordersAtRiskRemaining: 2,
        netRevenueProtectedINR: 2720000,
        feasibilityPercent: 94,
        residualRisk: 'low',
        sourceEntity: 'Apex Fasteners Navi Mumbai Works',
        targetEntity: 'Bangalore Plant Central Assembly Hub',
        logisticsCarrierOrRoute: 'Blue Dart Cargo B737F / BOM-BLR Priority Slot',
        executionSteps: [
          'Authorize ₹1,65,000 emergency freight uplift with Blue Dart logistics partner.',
          'Customs green-channel expedited clearance at CSIA Mumbai air cargo terminal.',
          'Direct cross-dock transit to Bangalore plant dock #4 within 72 hours.',
          'Notify production planning to resume line 2 assembly without line stoppage.',
        ],
        scoringRationale: {
          costEfficiencyScore: 84,
          recoverySpeedScore: 92,
          feasibilityScore: 94,
          operationalEaseScore: 86,
          explanation: 'Recovers 15 transit days at an estimated cost of ₹1,65,000 (<6% of revenue at risk). Protects 95.2% of scheduled deliveries with minimal operational disruption.',
        },
        assumptions: [
          {
            id: 'air_freight_rate',
            name: 'Air Cargo Rate per kg',
            value: 220,
            unit: '₹/kg',
            min: 150,
            max: 400,
            step: 10,
            description: 'Emergency priority air freight quote per kilogram.',
          },
          {
            id: 'batch_weight_kg',
            name: 'Emergency Batch Volume',
            value: 750,
            unit: 'kg',
            min: 250,
            max: 2000,
            step: 50,
            description: 'Weight of fasteners required to prevent assembly line starvation.',
          },
          {
            id: 'customs_speed_hours',
            name: 'Customs Clearance Window',
            value: 24,
            unit: 'hours',
            min: 6,
            max: 48,
            step: 6,
            description: 'Estimated fast-track customs green channel turn-around time.',
          },
        ],
      },
      {
        id: 'OPT-001-B',
        disruptionId: 'DIS-2026-001',
        title: 'Secondary Sourcing Reallocation to Bharat Precision',
        strategyType: 'alternate_supplier',
        rank: 2,
        isRecommended: false,
        score: 81,
        summary: 'Reallocate 80% of open purchase order volume to pre-qualified secondary vendor Bharat Precision Tools in Pune.',
        estimatedCostINR: 95000,
        recoveryTimeDays: 6,
        ordersProtectedCount: 38,
        ordersAtRiskRemaining: 4,
        netRevenueProtectedINR: 2580000,
        feasibilityPercent: 86,
        residualRisk: 'medium',
        sourceEntity: 'Bharat Precision Tools Ltd (Pune Plant)',
        targetEntity: 'Bangalore Plant Central Assembly Hub',
        logisticsCarrierOrRoute: 'Direct Dedicated Trucking via NH48 Golden Quadrilateral (Pune → BLR)',
        executionSteps: [
          'Activate Secondary Supply SLA with Bharat Precision Tools (Pune).',
          'Release Purchase Amendment #PO-2026-8891 for 2,400 units at agreed +8% rate.',
          'Verify tooling calibration certificate and test batch metallurgy report.',
          'Direct road dispatch via express dedicated container carrier.',
        ],
        scoringRationale: {
          costEfficiencyScore: 91,
          recoverySpeedScore: 75,
          feasibilityScore: 86,
          operationalEaseScore: 78,
          explanation: 'Lower incremental cost (₹95,000) than air cargo, but requires 6 days due to tooling calibration and Pune-to-Bangalore interstate road transit.',
        },
        assumptions: [
          {
            id: 'tooling_recal_cost',
            name: 'Tooling Recalibration Fee',
            value: 45000,
            unit: '₹',
            min: 20000,
            max: 90000,
            step: 5000,
            description: 'One-off tooling alignment and metallurgical testing charge.',
          },
          {
            id: 'unit_price_premium_pct',
            name: 'Emergency Surcharge',
            value: 8,
            unit: '%',
            min: 0,
            max: 25,
            step: 1,
            description: 'Premium charged by secondary supplier for priority line slot.',
          },
          {
            id: 'road_transit_days',
            name: 'Dedicated Road Transit',
            value: 3,
            unit: 'days',
            min: 2,
            max: 6,
            step: 1,
            description: 'Estimated express container truck transit duration.',
          },
        ],
      },
      {
        id: 'OPT-001-C',
        disruptionId: 'DIS-2026-001',
        title: 'Inter-Facility Inventory Transfer from Chennai Plant-B',
        strategyType: 'inventory_rebalance',
        rank: 3,
        isRecommended: false,
        score: 75,
        summary: 'Transfer 1,200 units of safety buffer stock from Chennai Plant-B to Bangalore via hotshot dedicated container.',
        estimatedCostINR: 42000,
        recoveryTimeDays: 2,
        ordersProtectedCount: 34,
        ordersAtRiskRemaining: 8,
        netRevenueProtectedINR: 2290000,
        feasibilityPercent: 80,
        residualRisk: 'high',
        sourceEntity: 'Chennai Plant-B Central Warehouse',
        targetEntity: 'Bangalore Plant Central Assembly Hub',
        logisticsCarrierOrRoute: 'Express Interstate Hotshot Carrier (Chennai → Bangalore, 350 km)',
        executionSteps: [
          'Generate Material Transfer Note MTN-2026-049 in ERP inventory module.',
          'Authorize safety buffer drawdown of 1,200 units from Chennai buffer stock.',
          'Schedule overnight dedicated hotshot vehicle for pickup at 18:00 hrs.',
          'Replenish Chennai buffer automatically upon arrival of next maritime vessel.',
        ],
        scoringRationale: {
          costEfficiencyScore: 96,
          recoverySpeedScore: 95,
          feasibilityScore: 80,
          operationalEaseScore: 68,
          explanation: 'Extremely fast (2 days) and lowest financial cost (₹42,000), but draws Chennai plant buffer down to critical 18%, elevating secondary regional risk.',
        },
        assumptions: [
          {
            id: 'transfer_freight_cost',
            name: 'Hotshot Transport Cost',
            value: 42000,
            unit: '₹',
            min: 25000,
            max: 80000,
            step: 2000,
            description: 'Dedicated overnight vehicle freight and toll expenses.',
          },
          {
            id: 'chennai_buffer_depletion',
            name: 'Chennai Buffer Drawdown',
            value: 60,
            unit: '%',
            min: 20,
            max: 85,
            step: 5,
            description: 'Percentage of Chennai sister-plant buffer allocated to Bangalore.',
          },
        ],
      },
      {
        id: 'OPT-001-D',
        disruptionId: 'DIS-2026-001',
        title: 'Split Procurement Allocation (60% Apex / 40% Southern Steel)',
        strategyType: 'split_procurement',
        rank: 4,
        isRecommended: false,
        score: 71,
        summary: 'Keep 60% of volume on maritime shipment while contracting 40% immediate batch from Southern Steel Fasteners.',
        estimatedCostINR: 78000,
        recoveryTimeDays: 8,
        ordersProtectedCount: 31,
        ordersAtRiskRemaining: 11,
        netRevenueProtectedINR: 2120000,
        feasibilityPercent: 88,
        residualRisk: 'medium',
        sourceEntity: 'Southern Steel Fasteners & Apex Fasteners',
        targetEntity: 'Bangalore Plant Central Assembly Hub',
        logisticsCarrierOrRoute: 'Dual Route: Rail Freight + Regional Road Delivery',
        executionSteps: [
          'Issue expedited PO amendment splitting allocation 60:40 across both vendors.',
          'Release emergency advance payment for 40% quick-dispatch quantity.',
          'Track maritime consignment for remaining 60% standard volume.',
        ],
        scoringRationale: {
          costEfficiencyScore: 88,
          recoverySpeedScore: 65,
          feasibilityScore: 88,
          operationalEaseScore: 74,
          explanation: 'Balanced allocation hedges financial risk, but leaves 11 non-critical orders slightly delayed until the primary shipment clears JNPT.',
        },
        assumptions: [
          {
            id: 'split_ratio_primary',
            name: 'Primary Sourcing Share',
            value: 60,
            unit: '%',
            min: 30,
            max: 80,
            step: 5,
            description: 'Percentage of volume retained with incumbent maritime supplier.',
          },
          {
            id: 'split_setup_fee',
            name: 'Administrative Splitting Surcharge',
            value: 25000,
            unit: '₹',
            min: 10000,
            max: 50000,
            step: 5000,
            description: 'Documentation, dual QC inspection, and receiving overheads.',
          },
        ],
      },
    ],
  },
  {
    id: 'DIS-2026-002',
    title: 'Sub-Tier Foundry Power Outage & Grid Failure in Rajkot Corridor',
    category: 'supplier_incident',
    severity: 'critical',
    affectedSupplier: 'Western Foundries Ltd',
    affectedSupplierId: 'SUP-002',
    affectedMaterial: 'Cast Iron Motor Housings',
    sku: 'SKU-CAS-001',
    currentDelayDays: 24,
    totalOrdersAtRisk: 28,
    totalRevenueAtRiskINR: 4680000,
    options: [
      {
        id: 'OPT-002-A',
        disruptionId: 'DIS-2026-002',
        title: 'Emergency Production Run at Coimbatore Precision Foundry',
        strategyType: 'alternate_supplier',
        rank: 1,
        isRecommended: true,
        score: 86,
        summary: 'Contract secondary tier-1 supplier Coimbatore Precision for a high-priority 450-unit casting batch with expedited courier testing.',
        estimatedCostINR: 210000,
        recoveryTimeDays: 7,
        ordersProtectedCount: 26,
        ordersAtRiskRemaining: 2,
        netRevenueProtectedINR: 4350000,
        feasibilityPercent: 91,
        residualRisk: 'low',
        sourceEntity: 'Coimbatore Precision Castings Ltd',
        targetEntity: 'Pune Sub-Assembly Facility',
        logisticsCarrierOrRoute: 'Dedicated Heavy Transport via NH544',
        executionSteps: [
          'Authorize pattern equipment transfer and rapid tooling fitment check.',
          'Commission 450 units casting run on furnace line 3 at Coimbatore.',
          'Execute ultrasonic and tensile test batch sign-off on site.',
          'Express logistics convoy to Pune sub-assembly facility.',
        ],
        scoringRationale: {
          costEfficiencyScore: 82,
          recoverySpeedScore: 88,
          feasibilityScore: 91,
          operationalEaseScore: 84,
          explanation: 'Restores motor housing production in 7 days (vs 24-day baseline outage). Protects ₹43.5L of high-value industrial motor orders at a 4.5% cost ratio.',
        },
        assumptions: [
          {
            id: 'pattern_adaptation_fee',
            name: 'Pattern Adaptation & Setup',
            value: 85000,
            unit: '₹',
            min: 40000,
            max: 150000,
            step: 5000,
            description: 'Tooling recalibration and mould trial expense.',
          },
          {
            id: 'unit_casting_surcharge',
            name: 'Emergency Heat Premium',
            value: 275,
            unit: '₹/unit',
            min: 100,
            max: 500,
            step: 25,
            description: 'Premium per casting unit for off-cycle furnace run.',
          },
        ],
      },
      {
        id: 'OPT-002-B',
        disruptionId: 'DIS-2026-002',
        title: 'Western Foundries Surat Secondary Unit Line Reroute',
        strategyType: 'alternate_supplier',
        rank: 2,
        isRecommended: false,
        score: 79,
        summary: 'Transfer ongoing casting moulds to Western Foundries Surat facility which has generator backup capability.',
        estimatedCostINR: 140000,
        recoveryTimeDays: 11,
        ordersProtectedCount: 22,
        ordersAtRiskRemaining: 6,
        netRevenueProtectedINR: 3690000,
        feasibilityPercent: 83,
        residualRisk: 'medium',
        sourceEntity: 'Western Foundries Surat Auxiliary Unit',
        targetEntity: 'Pune Sub-Assembly Facility',
        logisticsCarrierOrRoute: 'Interstate Freight Gujarat → Maharashtra Corridor',
        executionSteps: [
          'Dispatch tooling technician team from Rajkot to Surat auxiliary plant.',
          'Re-schedule generator-backed shift for weekend night operation.',
          'Dispatch batch #1 via Surat container depot to Pune.',
        ],
        scoringRationale: {
          costEfficiencyScore: 89,
          recoverySpeedScore: 72,
          feasibilityScore: 83,
          operationalEaseScore: 76,
          explanation: 'Preserves relationship with Western Foundries and incurs lower surcharge, but takes 11 days due to auxiliary unit ramp-up limitations.',
        },
        assumptions: [
          {
            id: 'generator_fuel_surcharge',
            name: 'Diesel Generator Fuel Surcharge',
            value: 65000,
            unit: '₹',
            min: 30000,
            max: 120000,
            step: 5000,
            description: 'Generator operating power fuel subsidy during grid outage.',
          },
          {
            id: 'mould_transfer_time',
            name: 'Tooling Relocation Window',
            value: 3,
            unit: 'days',
            min: 1,
            max: 5,
            step: 1,
            description: 'Days required to relocate casting dies from Rajkot to Surat.',
          },
        ],
      },
      {
        id: 'OPT-002-C',
        disruptionId: 'DIS-2026-002',
        title: 'Staggered Customer Delivery Rescheduling with Commercial Concessions',
        strategyType: 'safety_stock_drawdown',
        rank: 3,
        isRecommended: false,
        score: 66,
        summary: 'Defer lower-priority B-tier customer orders by 10 days with SLA penalty concessions while concentrating existing plant buffer on Tier-A orders.',
        estimatedCostINR: 120000,
        recoveryTimeDays: 14,
        ordersProtectedCount: 18,
        ordersAtRiskRemaining: 10,
        netRevenueProtectedINR: 3010000,
        feasibilityPercent: 95,
        residualRisk: 'high',
        sourceEntity: 'Existing Plant Assembly Inventory',
        targetEntity: 'Tier-A Key Account Assembly Lines',
        logisticsCarrierOrRoute: 'Internal Buffer Reprioritization',
        executionSteps: [
          'Sales team contacts 10 commercial clients to negotiate revised dispatch dates.',
          'Apply 2% commercial discount concession (₹1,20,000 total exposure).',
          'Allocate 100% of remaining stock to OEM contract commitments.',
        ],
        scoringRationale: {
          costEfficiencyScore: 78,
          recoverySpeedScore: 58,
          feasibilityScore: 95,
          operationalEaseScore: 60,
          explanation: 'Avoids external supply modifications but incurs customer satisfaction penalties and leaves 10 orders delayed past contract dates.',
        },
        assumptions: [
          {
            id: 'commercial_discount_pct',
            name: 'Delay Concession Discount',
            value: 2,
            unit: '%',
            min: 1,
            max: 5,
            step: 0.5,
            description: 'Commercial concession granted to clients accepting deferred delivery.',
          },
        ],
      },
    ],
  },
  {
    id: 'DIS-2026-003',
    title: 'Chennai Coastal Storm & Port Gate Operations Suspension',
    category: 'weather',
    severity: 'high',
    affectedSupplier: 'Coastal Petrochemicals Chennai Ltd',
    affectedSupplierId: 'SUP-003',
    affectedMaterial: 'Industrial Grade Lubricant ISO-VG-46',
    sku: 'SKU-LUB-003',
    currentDelayDays: 14,
    totalOrdersAtRisk: 36,
    totalRevenueAtRiskINR: 1940000,
    options: [
      {
        id: 'OPT-003-A',
        disruptionId: 'DIS-2026-003',
        title: 'Direct Road Tanker Dispatch from Kochi Refinery Terminal',
        strategyType: 'alternate_supplier',
        rank: 1,
        isRecommended: true,
        score: 89,
        summary: 'Procure 8,000 litres of ISO-VG-46 certified lubricant directly from Kochi depot terminal via specialized road tankers.',
        estimatedCostINR: 65000,
        recoveryTimeDays: 3,
        ordersProtectedCount: 35,
        ordersAtRiskRemaining: 1,
        netRevenueProtectedINR: 1890000,
        feasibilityPercent: 95,
        residualRisk: 'low',
        sourceEntity: 'Kochi Petroleum Regional Depot',
        targetEntity: 'Coimbatore & Bangalore Machining Centers',
        logisticsCarrierOrRoute: 'Dedicated Tanker Transporters (Kochi → Coimbatore/BLR)',
        executionSteps: [
          'Submit instant PO to Kochi Regional Depot under standard emergency framework.',
          'Dispatch 2x certified insulated tank trucks with GPS temperature telemetry.',
          'Direct delivery into storage vats at Coimbatore and Bangalore machining lines.',
        ],
        scoringRationale: {
          costEfficiencyScore: 92,
          recoverySpeedScore: 91,
          feasibilityScore: 95,
          operationalEaseScore: 88,
          explanation: 'Fastest and cleanest resolution with minimal cost overhead (₹65,000). Kochi refinery has ready stock unaffected by Chennai coastal weather.',
        },
        assumptions: [
          {
            id: 'tanker_freight_rate',
            name: 'Specialized Tanker Transport',
            value: 65000,
            unit: '₹',
            min: 40000,
            max: 100000,
            step: 5000,
            description: 'Direct hazchem road tanker hire and toll costs.',
          },
          {
            id: 'viscosity_batch_check_hours',
            name: 'Lab Viscosity Testing',
            value: 8,
            unit: 'hours',
            min: 4,
            max: 24,
            step: 2,
            description: 'Sampling and quality verification turnaround before vat loading.',
          },
        ],
      },
      {
        id: 'OPT-003-B',
        disruptionId: 'DIS-2026-003',
        title: 'Emergency Drum Package Procurement from Local Bangalore Distributors',
        strategyType: 'alternate_supplier',
        rank: 2,
        isRecommended: false,
        score: 78,
        summary: 'Purchase packaged 200L drums from local industrial distributors in Peenya Industrial Area to bridge the 14-day gap.',
        estimatedCostINR: 92000,
        recoveryTimeDays: 2,
        ordersProtectedCount: 33,
        ordersAtRiskRemaining: 3,
        netRevenueProtectedINR: 1770000,
        feasibilityPercent: 82,
        residualRisk: 'medium',
        sourceEntity: 'Peenya Industrial Consumables Hub',
        targetEntity: 'Bangalore Machining Line',
        logisticsCarrierOrRoute: 'Intra-city LCV Express Dispatch',
        executionSteps: [
          'Contact authorized BPCL/IOCL distributors in Peenya Industrial Area.',
          'Purchase 40x 200L barrels at local distribution premium (+14%).',
          'Same-day delivery via light commercial vehicles.',
        ],
        scoringRationale: {
          costEfficiencyScore: 76,
          recoverySpeedScore: 96,
          feasibilityScore: 82,
          operationalEaseScore: 72,
          explanation: 'Immediate 2-day delivery, but packaging surcharge (+14%) and drum handling overhead make it less cost-effective than bulk tanker supply.',
        },
        assumptions: [
          {
            id: 'drum_packaging_premium',
            name: 'Packaged Drum Premium',
            value: 14,
            unit: '%',
            min: 5,
            max: 25,
            step: 1,
            description: 'Price markup for 200L drum packaged units over bulk liquid.',
          },
        ],
      },
      {
        id: 'OPT-003-C',
        disruptionId: 'DIS-2026-003',
        title: 'Rail Freight Rerouting via Salem Inland Container Depot (ICD)',
        strategyType: 'expedited_freight',
        rank: 3,
        isRecommended: false,
        score: 74,
        summary: 'Reroute incoming container rail wagons away from coastal trackage through inland junction at Salem.',
        estimatedCostINR: 38000,
        recoveryTimeDays: 6,
        ordersProtectedCount: 30,
        ordersAtRiskRemaining: 6,
        netRevenueProtectedINR: 1640000,
        feasibilityPercent: 86,
        residualRisk: 'medium',
        sourceEntity: 'Southern Railway Inland Freight Corridor',
        targetEntity: 'Bangalore Container Terminal (Whitefield)',
        logisticsCarrierOrRoute: 'CONCOR Inland Rail Corridor via Salem Junction',
        executionSteps: [
          'File container wagon diversion requisition with CONCOR freight controller.',
          'Reroute rake through Salem bypass line avoiding waterlogged coastal stretch.',
          'Unload at Whitefield ICD and transfer via local trailer.',
        ],
        scoringRationale: {
          costEfficiencyScore: 94,
          recoverySpeedScore: 70,
          feasibilityScore: 86,
          operationalEaseScore: 70,
          explanation: 'Low cost (₹38,000) diversion, but rail scheduling bureaucracy adds 3 days compared to direct road tanker dispatch.',
        },
        assumptions: [
          {
            id: 'rail_diversion_fee',
            name: 'Rail Rake Diversion Charge',
            value: 38000,
            unit: '₹',
            min: 20000,
            max: 60000,
            step: 2000,
            description: 'Administrative and railway shunting surcharge for rake diversion.',
          },
        ],
      },
    ],
  },
];

/**
 * Deterministic Baseline Algorithm to rank mitigation options based on transparent mathematical criteria.
 * Formula:
 * Overall Score = (Cost Efficiency * w_cost) + (Recovery Speed * w_speed) + (Feasibility * w_feas) + (Operational Ease * w_ease)
 */
export function recalculateMitigationOptionScore(
  option: MitigationOption,
  disruption: MitigationDisruptionContext,
  weights: MitigationLabWeights = DEFAULT_MITIGATION_WEIGHTS
): MitigationOption {
  // 1. Cost Efficiency (0–100):
  // Measures the proportion of revenue protected relative to cost spent.
  // Higher is better.
  const costRatio = disruption.totalRevenueAtRiskINR > 0
    ? (option.estimatedCostINR / disruption.totalRevenueAtRiskINR) * 100
    : 10;
  const costEfficiencyScore = Math.min(100, Math.max(10, Math.round(100 - costRatio * 2.5)));

  // 2. Recovery Speed (0–100):
  // Measures how many days of delay are saved compared to unmitigated delay.
  const daysSaved = Math.max(0, disruption.currentDelayDays - option.recoveryTimeDays);
  const speedRatio = disruption.currentDelayDays > 0
    ? (daysSaved / disruption.currentDelayDays) * 100
    : 50;
  const recoverySpeedScore = Math.min(100, Math.max(15, Math.round(speedRatio)));

  // 3. Feasibility (0–100):
  const feasibilityScore = option.feasibilityPercent;

  // 4. Operational Ease (0–100):
  let operationalEaseScore = 80;
  if (option.residualRisk === 'low') operationalEaseScore = 90;
  else if (option.residualRisk === 'medium') operationalEaseScore = 75;
  else operationalEaseScore = 60;
  operationalEaseScore = Math.max(40, operationalEaseScore - option.executionSteps.length * 2);

  // Deterministic weighted formula
  const weightedTotal =
    costEfficiencyScore * weights.costEfficiency +
    recoverySpeedScore * weights.recoverySpeed +
    feasibilityScore * weights.feasibility +
    operationalEaseScore * weights.operationalEase;

  const finalScore = Math.round(weightedTotal);

  return {
    ...option,
    score: finalScore,
    scoringRationale: {
      ...option.scoringRationale,
      costEfficiencyScore,
      recoverySpeedScore,
      feasibilityScore,
      operationalEaseScore,
      explanation: `Deterministic baseline score calculated from: Cost Efficiency (${costEfficiencyScore}/100 × ${Math.round(weights.costEfficiency * 100)}%), Recovery Speed (${recoverySpeedScore}/100 × ${Math.round(weights.recoverySpeed * 100)}%), Feasibility (${feasibilityScore}/100 × ${Math.round(weights.feasibility * 100)}%), and Operational Ease (${operationalEaseScore}/100 × ${Math.round(weights.operationalEase * 100)}%).`,
    },
  };
}

/**
 * Returns all disruptions with ranked mitigation options based on baseline algorithm.
 */
export function getMitigationLabData(
  selectedDisruptionId?: string,
  weights: MitigationLabWeights = DEFAULT_MITIGATION_WEIGHTS
): MitigationLabResponse {
  const processedDisruptions = MOCK_MITIGATION_DISRUPTIONS.map((disruption) => {
    // Recalculate each option and rank them descending by score
    const evaluatedOptions = disruption.options
      .map((opt) => recalculateMitigationOptionScore(opt, disruption, weights))
      .sort((a, b) => b.score - a.score)
      .map((opt, index) => ({
        ...opt,
        rank: index + 1,
        isRecommended: index === 0,
      }));

    return {
      ...disruption,
      options: evaluatedOptions,
    };
  });

  const activeId = selectedDisruptionId || processedDisruptions[0]?.id || '';

  return {
    disruptions: processedDisruptions,
    selectedDisruptionId: activeId,
    methodologyNote:
      'Deterministic Baseline Algorithm evaluates trade-offs across four transparent dimensions: Cost Efficiency (35%), Recovery Speed (35%), Feasibility (20%), and Operational Ease (10%). This is not labeled as globally optimal; procurement teams must verify operational specifics before final decision approval.',
    appliedWeights: weights,
  };
}
