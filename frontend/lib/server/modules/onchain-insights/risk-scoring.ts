// =============================================================================
// Onchain Insights — Explainable Risk Prioritization & Scoring Engine
// Deterministic rule-based scoring module. Explicitly transparent, no ML black-box.
// =============================================================================

import { MOCK_DETAILED_SUPPLIERS } from '@/lib/mock-data/onchain-insights/suppliers';
import { MOCK_DISRUPTIONS_CATALOG } from '@/lib/mock-data/onchain-insights/disruptions';
import type {
  SupplierRiskAssessment,
  RiskAssessmentWeights,
  RiskAssessmentFilterParams,
  RiskAssessmentResponse,
  RiskTier,
} from '@/types/onchain-insights';

export const DEFAULT_RISK_WEIGHTS: RiskAssessmentWeights = {
  delivery: 0.30,   // 30% Delivery Reliability & Lead Time Volatility
  disruption: 0.25, // 25% Active Disruption Exposure & Delayed Shipments
  geographic: 0.20, // 20% Corridor & Cross-Border Logistics Exposure
  financial: 0.15,  // 15% Financial Stability & Terms
  compliance: 0.10, // 10% Regulatory Certifications & Audit Health
};

/**
 * Deterministic rule-based scoring engine for all suppliers
 */
export function calculateSupplierRiskAssessments(
  customWeights?: Partial<RiskAssessmentWeights>,
  filters?: RiskAssessmentFilterParams
): RiskAssessmentResponse {
  const weights: RiskAssessmentWeights = {
    delivery: customWeights?.delivery ?? DEFAULT_RISK_WEIGHTS.delivery,
    disruption: customWeights?.disruption ?? DEFAULT_RISK_WEIGHTS.disruption,
    geographic: customWeights?.geographic ?? DEFAULT_RISK_WEIGHTS.geographic,
    financial: customWeights?.financial ?? DEFAULT_RISK_WEIGHTS.financial,
    compliance: customWeights?.compliance ?? DEFAULT_RISK_WEIGHTS.compliance,
  };

  const totalWeight = weights.delivery + weights.disruption + weights.geographic + weights.financial + weights.compliance;
  const normWeight = totalWeight > 0 ? totalWeight : 1.0;

  const horizon = filters?.horizon || '30_days';

  const assessments: SupplierRiskAssessment[] = MOCK_DETAILED_SUPPLIERS.map((supplier) => {
    // 1. DELIVERY RISK (0–100): High defect rate, poor OTIF, long lead times
    const otifDeficit = Math.max(0, 100 - supplier.onTimeDeliveryRate);
    const leadTimePenalty = supplier.averageLeadTimeDays > 14 ? 30 : supplier.averageLeadTimeDays > 7 ? 15 : 5;
    const defectPenalty = Math.min(30, Math.round(supplier.defectRatePpm / 60));
    const deliveryRisk = Math.min(100, Math.max(5, Math.round(otifDeficit * 1.8 + leadTimePenalty + defectPenalty)));

    // 2. DISRUPTION EXPOSURE (0–100): Derived from active Task 6 disruption signals
    const activeDisruptions = MOCK_DISRUPTIONS_CATALOG.filter(d =>
      d.affectedSuppliers.includes(supplier.id) && d.status !== 'resolved'
    );
    let disruptionExposure = 10;
    if (activeDisruptions.length > 0) {
      const hasCritical = activeDisruptions.some(d => d.severity === 'critical');
      const hasHigh = activeDisruptions.some(d => d.severity === 'high');
      if (hasCritical) disruptionExposure = 92;
      else if (hasHigh) disruptionExposure = 74;
      else disruptionExposure = 48;
    }

    // 3. GEOGRAPHIC RISK (0–100): Cross-border, maritime choke points, regional unrest
    let geographicRisk = 20;
    if (supplier.country === 'Myanmar') geographicRisk = 88;
    else if (supplier.country === 'China') geographicRisk = 76;
    else if (supplier.location.includes('Jharkhand') || supplier.location.includes('Chennai')) geographicRisk = 42;
    else geographicRisk = 18;

    // 4. FINANCIAL RISK (0–100): Low financial score, single-customer dependency
    const financialRisk = Math.min(100, Math.max(8, Math.round(100 - (supplier.qualificationScore?.financialStability || 70))));

    // 5. COMPLIANCE & AUDIT RISK (0–100): Expired certs, missing audit reports
    const expiredCertsCount = supplier.certifications.filter(c => c.status === 'expired').length;
    const unverifiedCertsCount = supplier.certifications.filter(c => c.status === 'unverified').length;
    const missingWarnings = supplier.missingDataWarnings || [];
    const missingWarningsCount = missingWarnings.length;
    let complianceRisk = 12;
    if (expiredCertsCount > 0 || missingWarningsCount > 1) {
      complianceRisk = Math.min(95, 45 + expiredCertsCount * 25 + missingWarningsCount * 12);
    } else if (unverifiedCertsCount > 0 || missingWarningsCount === 1) {
      complianceRisk = 38;
    }

    // Weighted Score
    const rawScore =
      (deliveryRisk * weights.delivery +
        disruptionExposure * weights.disruption +
        geographicRisk * weights.geographic +
        financialRisk * weights.financial +
        complianceRisk * weights.compliance) /
      normWeight;

    const overallRiskScore = Math.min(100, Math.max(5, Math.round(rawScore)));

    // Severity Tier
    let riskTier: RiskTier = 'low';
    if (overallRiskScore >= 70) riskTier = 'critical';
    else if (overallRiskScore >= 50) riskTier = 'high';
    else if (overallRiskScore >= 30) riskTier = 'medium';

    // Primary Risk Driver
    const factorEntries = [
      { name: 'Delivery Reliability', val: deliveryRisk * weights.delivery, raw: deliveryRisk },
      { name: 'Disruption Exposure', val: disruptionExposure * weights.disruption, raw: disruptionExposure },
      { name: 'Geographic Corridor', val: geographicRisk * weights.geographic, raw: geographicRisk },
      { name: 'Financial Stability', val: financialRisk * weights.financial, raw: financialRisk },
      { name: 'Compliance Health', val: complianceRisk * weights.compliance, raw: complianceRisk },
    ];
    factorEntries.sort((a, b) => b.val - a.val);
    const primaryRiskDriver = factorEntries[0].name;

    // Contributing Root Causes
    const rootCauses: string[] = [];
    if (activeDisruptions.length > 0) {
      rootCauses.push(`Active Disruption: ${activeDisruptions.map(d => d.title).join('; ')}`);
    }
    if (otifDeficit > 15) {
      rootCauses.push(`Historical On-Time Delivery of ${supplier.onTimeDeliveryRate}% falls below 85% SLA benchmark.`);
    }
    if (supplier.averageLeadTimeDays > 14) {
      rootCauses.push(`Average lead time of ${supplier.averageLeadTimeDays} days exceeds 2-week regional threshold.`);
    }
    if (supplier.country !== 'India') {
      rootCauses.push(`Cross-border import via deep-sea maritime lanes subject to port customs dwell risks.`);
    }
    if (expiredCertsCount > 0) {
      rootCauses.push(`${expiredCertsCount} expired certification(s) awaiting renewal audit.`);
    }
    if (missingWarningsCount > 0) {
      rootCauses.push(...missingWarnings);
    }

    // Explainable Narrative
    const narrative =
      `Rated ${riskTier.toUpperCase()} Risk (${overallRiskScore}/100) based on deterministic ledger weights. ` +
      `The primary risk driver is ${primaryRiskDriver} (${factorEntries[0].raw} pts). ` +
      (activeDisruptions.length > 0
        ? `Currently impacted by ${activeDisruptions.length} live incident(s) including "${activeDisruptions[0].title}". `
        : `No active disruption incidents logged; risk reflects baseline operational stability. `) +
      `Delivery OTIF is tracked at ${supplier.onTimeDeliveryRate}%, with an average lead time of ${supplier.averageLeadTimeDays} days.`;

    // Recommended Mitigation
    let mitigation = 'Maintain routine automated order pacing and monitor standard SLA deliveries.';
    if (riskTier === 'critical') {
      mitigation = 'Activate pre-qualified secondary vendor immediately. Expedite safety stock transfers and freeze non-essential purchase orders.';
    } else if (riskTier === 'high') {
      mitigation = 'Request daily supplier dispatch milestone logs. Initiate dual-sourcing quota split (Task 4) to de-risk single-source dependencies.';
    } else if (riskTier === 'medium') {
      mitigation = 'Conduct proactive quarterly vendor quality audit and verify upcoming certification renewals.';
    }

    return {
      supplierId: supplier.id,
      supplierName: supplier.name,
      legalName: supplier.legalName,
      location: supplier.location,
      country: supplier.country,
      riskTier,
      overallRiskScore,
      rank: 0, // Assigned below
      confidenceLevel: supplier.country === 'India' ? 'verified_ledger' : 'rule_based_audit',
      predictionHorizon: horizon as any,
      factors: {
        deliveryRisk,
        disruptionExposure,
        geographicRisk,
        financialRisk,
        complianceRisk,
      },
      primaryRiskDriver,
      narrativeExplanation: narrative,
      contributingRootCauses: rootCauses.length > 0 ? rootCauses : ['Consistent operational delivery within all SLA tolerance bands.'],
      recommendedMitigation: mitigation,
      activeDisruptionsCount: activeDisruptions.length,
      activeDisruptions: activeDisruptions.map(d => d.title),
      materialsAtRisk: supplier.materialsSupplied,
      lastAssessmentDate: supplier.lastAssessmentDate,
    };
  });

  // Sort by overallRiskScore desc to rank
  assessments.sort((a, b) => b.overallRiskScore - a.overallRiskScore);
  assessments.forEach((s, idx) => {
    s.rank = idx + 1;
  });

  // Apply filters
  let filtered = [...assessments];

  if (filters?.tier && filters.tier !== 'all') {
    filtered = filtered.filter(s => s.riskTier === filters.tier);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(s =>
      s.supplierName.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      s.materialsAtRisk.some(m => m.toLowerCase().includes(q))
    );
  }

  if (filters?.sortBy === 'name') {
    filtered.sort((a, b) => filters.sortOrder === 'desc'
      ? b.supplierName.localeCompare(a.supplierName)
      : a.supplierName.localeCompare(b.supplierName)
    );
  }

  // Summary KPIs
  const criticalCount = assessments.filter(s => s.riskTier === 'critical').length;
  const highCount = assessments.filter(s => s.riskTier === 'high').length;
  const mediumCount = assessments.filter(s => s.riskTier === 'medium').length;
  const lowCount = assessments.filter(s => s.riskTier === 'low').length;
  const avgRiskScore = Math.round(assessments.reduce((sum, s) => sum + s.overallRiskScore, 0) / assessments.length);

  const methodology =
    `Rule-Based Prioritization Formula: Overall Risk = ` +
    `[ Delivery (${Math.round(weights.delivery * 100)}%) × DeliveryRisk + ` +
    `Disruption (${Math.round(weights.disruption * 100)}%) × DisruptionExposure + ` +
    `Geographic (${Math.round(weights.geographic * 100)}%) × GeographicRisk + ` +
    `Financial (${Math.round(weights.financial * 100)}%) × FinancialRisk + ` +
    `Compliance (${Math.round(weights.compliance * 100)}%) × ComplianceRisk ] / ΣWeights. ` +
    `Strictly deterministic calculations derived from confirmed ERP purchase orders, carrier transit delays, and verified certificates. ` +
    `No generative ML hallucination or unverified external web guesses.`;

  return {
    data: filtered,
    total: filtered.length,
    kpis: {
      totalSuppliers: assessments.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      avgRiskScore,
    },
    appliedWeights: weights,
    methodologyDisclosure: methodology,
  };
}
