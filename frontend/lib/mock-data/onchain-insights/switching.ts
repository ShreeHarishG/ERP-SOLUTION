// =============================================================================
// Onchain Insights — Supplier Switching Simulator Calculation Engine
// Deterministic multi-scenario simulation with transparent mathematical models.
// =============================================================================

import { getMockSupplierById, MOCK_DETAILED_SUPPLIERS } from './suppliers';
import type {
  SwitchSimulatorParams,
  SwitchSimulationResult,
  ScenarioImpactMetrics,
  RiskTier,
} from '@/types/onchain-insights';

function deriveRiskTier(score: number): RiskTier {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

/**
 * Pre-configured realistic default supplier pairings for simulation
 */
export const DEFAULT_SWITCH_PAIRS = [
  {
    materialName: 'Teak Wood Planks',
    currentSupplierId: 'sup-001', // Global Timber (Myanmar, Critical risk 87)
    alternativeSupplierId: 'sup-009', // Kerala Wood Traders (India, Low risk 24)
    annualVolume: 5000,
    currentUnitCost: 1800,
    alternativeUnitCost: 1950,
    splitRatioCurrent: 60,
    switchingCostOneTime: 45000,
    transitionWeeks: 4,
  },
  {
    materialName: 'Precision Bearings',
    currentSupplierId: 'sup-007', // Precision Fixings (China, High risk 72)
    alternativeSupplierId: 'sup-010', // Tata Bearings (India, Low risk 16)
    annualVolume: 12000,
    currentUnitCost: 240,
    alternativeUnitCost: 265,
    splitRatioCurrent: 50,
    switchingCostOneTime: 65000,
    transitionWeeks: 6,
  },
  {
    materialName: 'Steel Frames',
    currentSupplierId: 'sup-004', // SteelCraft India (Jamshedpur, High risk 68)
    alternativeSupplierId: 'sup-002', // Apex Hardware (Gujarat, Medium risk 45)
    annualVolume: 3500,
    currentUnitCost: 1200,
    alternativeUnitCost: 1280,
    splitRatioCurrent: 70,
    switchingCostOneTime: 30000,
    transitionWeeks: 3,
  },
];

/**
 * Calculate switching simulation results deterministically
 */
export function calculateSwitchSimulation(params: SwitchSimulatorParams): SwitchSimulationResult {
  const currentSupplier = getMockSupplierById(params.currentSupplierId) || MOCK_DETAILED_SUPPLIERS[0];
  const alternativeSupplier = getMockSupplierById(params.alternativeSupplierId) || MOCK_DETAILED_SUPPLIERS[8];

  const vol = params.annualVolume;
  const curCost = params.currentUnitCost;
  const altCost = params.alternativeUnitCost;
  const splitCur = params.splitRatioCurrent / 100;
  const splitAlt = 1 - splitCur;

  // 1. SCENARIO A: RETAIN CURRENT
  const retainMaterialCost = Math.round(vol * curCost);
  const retainTotalCost = retainMaterialCost;
  const retainLeadTime = currentSupplier.averageLeadTimeDays;
  const retainOTD = currentSupplier.onTimeDeliveryRate;
  const retainRisk = currentSupplier.riskScore;

  const retainScenario: ScenarioImpactMetrics = {
    scenarioName: 'retain',
    scenarioTitle: `Retain ${currentSupplier.name} (100%)`,
    description: `Continue single-sourcing exclusively from ${currentSupplier.name}. Zero transition overhead, but preserves high exposure to active disruptions.`,
    annualMaterialCost: retainMaterialCost,
    oneTimeTransitionCost: 0,
    totalFirstYearCost: retainTotalCost,
    costDeltaVsBaseline: 0,
    blendedLeadTimeDays: retainLeadTime,
    leadTimeDeltaDays: 0,
    blendedOnTimeDeliveryRate: retainOTD,
    blendedRiskScore: retainRisk,
    riskTier: currentSupplier.riskTier,
    riskReductionScore: 0,
    dependencyConcentration: '100% Single Sourced (High Fragility)',
    confidenceLevel: 'verified',
    confidenceNotes: 'Calculated using audited purchase history and ERP vendor master records.',
    feasibleInWeeks: 0,
  };

  // 2. SCENARIO B: DUAL-SOURCE SPLIT
  const splitCurVol = Math.round(vol * splitCur);
  const splitAltVol = Math.round(vol * splitAlt);
  const splitMaterialCost = Math.round((splitCurVol * curCost) + (splitAltVol * altCost));
  const splitOneTime = Math.round(params.switchingCostOneTime * 0.65); // Partial qualification
  const splitTotalCost = splitMaterialCost + splitOneTime;
  const splitLeadTime = Math.round(splitCur * currentSupplier.averageLeadTimeDays + splitAlt * alternativeSupplier.averageLeadTimeDays);
  const splitOTD = Math.round(splitCur * currentSupplier.onTimeDeliveryRate + splitAlt * alternativeSupplier.onTimeDeliveryRate);
  
  // Dual-sourcing provides resilience bonus (risk reduced by 18% over weighted average)
  const weightedRisk = splitCur * currentSupplier.riskScore + splitAlt * alternativeSupplier.riskScore;
  const splitRisk = Math.max(10, Math.round(weightedRisk * 0.82));

  const splitScenario: ScenarioImpactMetrics = {
    scenarioName: 'split',
    scenarioTitle: `Dual-Source (${Math.round(splitCur * 100)}% / ${Math.round(splitAlt * 100)}%)`,
    description: `Split allocation: ${Math.round(splitCur * 100)}% to ${currentSupplier.name} and ${Math.round(splitAlt * 100)}% to ${alternativeSupplier.name}. Mitigates single-point-of-failure risk.`,
    annualMaterialCost: splitMaterialCost,
    oneTimeTransitionCost: splitOneTime,
    totalFirstYearCost: splitTotalCost,
    costDeltaVsBaseline: splitTotalCost - retainTotalCost,
    blendedLeadTimeDays: splitLeadTime,
    leadTimeDeltaDays: splitLeadTime - retainLeadTime,
    blendedOnTimeDeliveryRate: splitOTD,
    blendedRiskScore: splitRisk,
    riskTier: deriveRiskTier(splitRisk),
    riskReductionScore: Math.max(0, retainRisk - splitRisk),
    dependencyConcentration: `Dual Sourced (${Math.round(splitCur * 100)}% Primary / ${Math.round(splitAlt * 100)}% Backup)`,
    confidenceLevel: 'partially_estimated',
    confidenceNotes: 'Primary volume verified via ERP; secondary volume estimated from vendor formal quote.',
    feasibleInWeeks: Math.max(2, Math.round(params.transitionWeeks * 0.7)),
  };

  // 3. SCENARIO C: FULL SWITCH
  const switchMaterialCost = Math.round(vol * altCost);
  const switchOneTime = Math.round(params.switchingCostOneTime);
  const switchTotalCost = switchMaterialCost + switchOneTime;
  const switchLeadTime = alternativeSupplier.averageLeadTimeDays;
  const switchOTD = alternativeSupplier.onTimeDeliveryRate;
  const switchRisk = alternativeSupplier.riskScore;

  const switchScenario: ScenarioImpactMetrics = {
    scenarioName: 'switch',
    scenarioTitle: `Full Switch to ${alternativeSupplier.name} (100%)`,
    description: `Complete transition to ${alternativeSupplier.name}. Eliminates overseas and severe regional disruption exposure at the cost of one-time onboarding.`,
    annualMaterialCost: switchMaterialCost,
    oneTimeTransitionCost: switchOneTime,
    totalFirstYearCost: switchTotalCost,
    costDeltaVsBaseline: switchTotalCost - retainTotalCost,
    blendedLeadTimeDays: switchLeadTime,
    leadTimeDeltaDays: switchLeadTime - retainLeadTime,
    blendedOnTimeDeliveryRate: switchOTD,
    blendedRiskScore: switchRisk,
    riskTier: alternativeSupplier.riskTier,
    riskReductionScore: Math.max(0, retainRisk - switchRisk),
    dependencyConcentration: `100% Single Sourced (${alternativeSupplier.country})`,
    confidenceLevel: 'estimated',
    confidenceNotes: 'Alternative pricing based on preliminary RFQ; lead times estimated pending trial PO execution.',
    feasibleInWeeks: params.transitionWeeks,
  };

  // Trade-off recommendation
  let recommendedScenario: 'retain' | 'split' | 'switch' = 'split';
  let rationale = '';
  const keyTradeOffs: string[] = [];

  if (currentSupplier.riskTier === 'critical') {
    recommendedScenario = 'split';
    rationale = `Due to ${currentSupplier.name}'s critical risk score (${currentSupplier.riskScore}/100) and active disruption warnings, retaining 100% single-source is dangerous. A dual-source allocation (${Math.round(splitCur * 100)}% / ${Math.round(splitAlt * 100)}%) cuts risk score from ${retainRisk} to ${splitRisk} while moderating cost increase to ₹${Math.abs(splitScenario.costDeltaVsBaseline).toLocaleString()}.`;
    keyTradeOffs.push(`Lead time improves by ${Math.abs(splitScenario.leadTimeDeltaDays)} days under dual-sourcing.`);
    keyTradeOffs.push(`On-time delivery increases from ${retainOTD}% to ${splitOTD}%.`);
    keyTradeOffs.push(`First-year premium of ₹${splitScenario.costDeltaVsBaseline.toLocaleString()} buys continuity protection against cyclone and port delays.`);
  } else if (currentSupplier.riskTier === 'high') {
    recommendedScenario = 'split';
    rationale = `Dual-sourcing is recommended to build resiliency without incurring full re-tooling disruption.`;
    keyTradeOffs.push(`Reduces dependency concentration while validating ${alternativeSupplier.name}'s manufacturing performance.`);
    keyTradeOffs.push(`Lead time changes by ${splitScenario.leadTimeDeltaDays > 0 ? '+' : ''}${splitScenario.leadTimeDeltaDays} days.`);
  } else {
    recommendedScenario = 'retain';
    rationale = `${currentSupplier.name} already maintains low operational risk (${currentSupplier.riskScore}/100) and high delivery reliability (${retainOTD}%). Switching is not economically justified unless cost savings exceed ₹100,000.`;
    keyTradeOffs.push(`Retaining current vendor avoids ₹${params.switchingCostOneTime.toLocaleString()} in switching overhead.`);
  }

  const riskMitigatedDisruptions = currentSupplier.unresolvedIssues.map(i => i.title);

  return {
    params,
    currentSupplier,
    alternativeSupplier,
    scenarios: {
      retain: retainScenario,
      split: splitScenario,
      switch: switchScenario,
    },
    tradeOffSummary: {
      recommendedScenario,
      rationale,
      keyTradeOffs,
      riskMitigatedDisruptions,
    },
  };
}
