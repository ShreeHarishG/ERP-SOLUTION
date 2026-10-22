// =============================================================================
// Onchain Insights — Supplier Qualification Mock Data
// Realistic multi-tier supplier profiles with transparent qualification scoring.
// =============================================================================

import type {
  SupplierDetail,
  SupplierQualificationScore,
  SupplierFilterParams,
  RiskTier,
} from '@/types/onchain-insights';

// Transparent qualification scoring weights
export const QUALIFICATION_WEIGHTS = {
  delivery: 0.25,   // 25% On-Time Delivery Reliability
  quality: 0.25,    // 25% Quality & Low Defect Rate
  leadTime: 0.15,   // 15% Lead Time Performance
  capacity: 0.15,   // 15% Capacity & Scalability
  financial: 0.10,  // 10% Financial Stability
  compliance: 0.10, // 10% ESG & Verified Certifications
};

/**
 * Deterministic qualification score calculator.
 * Strictly rule-based — explains every component and weight in detail.
 */
export function calculateQualificationScore(data: {
  onTimeDeliveryRate: number;
  defectRatePpm: number;
  averageLeadTimeDays: number;
  capacityUtilizationRate: number;
  financialScore: number;
  verifiedCertsCount: number;
  totalCertsCount: number;
  hasUnresolvedCritical: boolean;
}): SupplierQualificationScore {
  // 1. Delivery (0–100): Direct mapping from onTimeDeliveryRate (e.g., 96% -> 96 pts)
  const deliveryReliability = Math.min(100, Math.max(0, Math.round(data.onTimeDeliveryRate)));

  // 2. Quality (0–100): Inverted defect ppm (ppm < 100 -> 98, ppm > 3000 -> 35)
  let qualityRating = 100 - Math.round(data.defectRatePpm / 40);
  qualityRating = Math.min(100, Math.max(10, qualityRating));

  // 3. Lead Time (0–100): Benchmark: 3 days = 98, 7 days = 85, 14 days = 70, 30 days = 40
  let leadTimeScore = 105 - Math.round(data.averageLeadTimeDays * 2.2);
  leadTimeScore = Math.min(100, Math.max(15, leadTimeScore));

  // 4. Capacity (0–100): Optimal utilization is 60–80%. Above 90% is constrained risk.
  let capacityScore = 85;
  if (data.capacityUtilizationRate <= 75) {
    capacityScore = 95;
  } else if (data.capacityUtilizationRate <= 85) {
    capacityScore = 82;
  } else if (data.capacityUtilizationRate <= 92) {
    capacityScore = 65;
  } else {
    capacityScore = 40; // High bottleneck risk
  }

  // 5. Financial Stability (0–100)
  const financialStability = Math.min(100, Math.max(0, Math.round(data.financialScore)));

  // 6. Compliance & ESG (0–100): Ratio of verified certifications
  let complianceScore = 50;
  if (data.totalCertsCount > 0) {
    const verifiedRatio = data.verifiedCertsCount / data.totalCertsCount;
    complianceScore = Math.round(verifiedRatio * 85 + (data.totalCertsCount >= 3 ? 15 : 0));
  }
  if (data.hasUnresolvedCritical) {
    complianceScore = Math.max(10, complianceScore - 30);
  }

  // Weighted calculation
  const weightedSum =
    deliveryReliability * QUALIFICATION_WEIGHTS.delivery +
    qualityRating * QUALIFICATION_WEIGHTS.quality +
    leadTimeScore * QUALIFICATION_WEIGHTS.leadTime +
    capacityScore * QUALIFICATION_WEIGHTS.capacity +
    financialStability * QUALIFICATION_WEIGHTS.financial +
    complianceScore * QUALIFICATION_WEIGHTS.compliance;

  const overall = Math.round(weightedSum);

  const explanation =
    `Score calculated using transparent weights: Delivery (25% × ${deliveryReliability}) + ` +
    `Quality (25% × ${qualityRating}) + Lead Time (15% × ${leadTimeScore}) + ` +
    `Capacity (15% × ${capacityScore}) + Financial (10% × ${financialStability}) + ` +
    `Compliance (10% × ${complianceScore}) = ${overall}/100.`;

  return {
    overall,
    deliveryReliability,
    qualityRating,
    leadTimeScore,
    capacityScore,
    financialStability,
    complianceScore,
    weights: QUALIFICATION_WEIGHTS,
    explanation,
  };
}

// 12 Comprehensive Mock Suppliers
export const MOCK_DETAILED_SUPPLIERS: SupplierDetail[] = [
  {
    id: 'sup-001',
    name: 'Global Timber Exports',
    legalName: 'Global Timber Exports Myanmar Co. Ltd.',
    code: 'VND-GTE-001',
    riskTier: 'critical',
    riskScore: 87,
    qualificationStatus: 'conditional',
    location: 'Yangon, Myanmar',
    country: 'Myanmar',
    materialsSupplied: ['Teak Wood Planks', 'Hardwood Boards', 'Plywood Sheets'],
    lastAssessmentDate: '2026-09-28',
    primaryContact: {
      name: 'Kyaw Zin Win',
      title: 'Head of International Sales',
      email: 'kyaw.win@globaltimber.mm',
      phone: '+95 1 234 5678',
    },
    averageLeadTimeDays: 21,
    onTimeDeliveryRate: 72,
    defectRatePpm: 1450,
    monthlyCapacityUnits: 45000,
    capacityUtilizationRate: 94,
    paymentTerms: 'LC at Sight',
    currency: 'USD',
    lastAuditDate: '2026-03-15',
    nextAuditDueDate: '2026-11-15',
    notes: 'Major hardwood supplier. Currently flagged due to monsoon cyclone disruption and Myanmar timber export quota risks. Alternative domestic sources actively being evaluated.',
    missingDataWarnings: [
      'Missing 2026 Annual Forestry Sustainability Audit report',
      'Unverified FSC Chain of Custody renewal certificate',
    ],
    certifications: [
      {
        id: 'cert-001',
        name: 'ISO 9001:2015 Quality Management',
        issuer: 'Bureau Veritas',
        issuedDate: '2023-04-10',
        expiryDate: '2026-04-09',
        status: 'verified',
        verificationNotes: 'Audited and verified in Q2 2025',
      },
      {
        id: 'cert-002',
        name: 'FSC-STD-40-004 Chain of Custody',
        issuer: 'Forest Stewardship Council',
        issuedDate: '2022-08-01',
        expiryDate: '2026-08-01',
        status: 'expired',
        verificationNotes: 'Expired 2 months ago. Pending renewal documentation.',
      },
      {
        id: 'cert-003',
        name: 'Myanmar Timber Legality Assurance (MTLAS)',
        issuer: 'Forest Department of Myanmar',
        issuedDate: '2024-01-15',
        expiryDate: '2027-01-14',
        status: 'unverified',
        verificationNotes: 'Pending independent third-party customs validation',
      },
    ],
    unresolvedIssues: [
      {
        id: 'iss-001',
        title: 'Active Cyclone Route Interruption',
        severity: 'high',
        description: 'Bay of Bengal tropical cyclone expected to delay shipments SHP-2026-0847 & SHP-2026-0851 by 7-12 days.',
        reportedDate: '2026-10-11',
      },
      {
        id: 'iss-002',
        title: 'Unresolved FSC Certification Renewal',
        severity: 'medium',
        description: 'Supplier has not submitted audited FSC renewal paperwork.',
        reportedDate: '2026-08-15',
      },
    ],
    qualificationScore: calculateQualificationScore({
      onTimeDeliveryRate: 72,
      defectRatePpm: 1450,
      averageLeadTimeDays: 21,
      capacityUtilizationRate: 94,
      financialScore: 58,
      verifiedCertsCount: 1,
      totalCertsCount: 3,
      hasUnresolvedCritical: true,
    }),
  },
  {
    id: 'sup-002',
    name: 'Apex Hardware Co.',
    legalName: 'Apex Hardware Manufacturing Pvt. Ltd.',
    code: 'VND-AHC-002',
    riskTier: 'medium',
    riskScore: 45,
    qualificationStatus: 'qualified',
    location: 'Rajkot, Gujarat, India',
    country: 'India',
    materialsSupplied: ['Steel Screws', 'Drawer Slides', 'Cabinet Hinges'],
    lastAssessmentDate: '2026-10-05',
    primaryContact: {
      name: 'Bhavin Patel',
      title: 'Director of Business Development',
      email: 'bhavin@apexhardware.in',
      phone: '+91 98250 12345',
    },
    averageLeadTimeDays: 6,
    onTimeDeliveryRate: 94,
    defectRatePpm: 320,
    monthlyCapacityUnits: 250000,
    capacityUtilizationRate: 76,
    paymentTerms: 'Net 30 Days',
    currency: 'INR',
    lastAuditDate: '2026-06-20',
    nextAuditDueDate: '2027-06-20',
    notes: 'Reliable Tier-1 hardware vendor with solid automated pressing facility. High local responsiveness.',
    missingDataWarnings: [],
    certifications: [
      {
        id: 'cert-004',
        name: 'ISO 9001:2015',
        issuer: 'TUV SUD India',
        issuedDate: '2024-05-12',
        expiryDate: '2027-05-11',
        status: 'verified',
        verificationNotes: 'Certified valid through 2027',
      },
      {
        id: 'cert-005',
        name: 'RoHS 3 Compliance (2015/863/EU)',
        issuer: 'SGS India',
        issuedDate: '2025-01-10',
        expiryDate: '2027-01-09',
        status: 'verified',
      },
    ],
    unresolvedIssues: [],
    qualificationScore: calculateQualificationScore({
      onTimeDeliveryRate: 94,
      defectRatePpm: 320,
      averageLeadTimeDays: 6,
      capacityUtilizationRate: 76,
      financialScore: 82,
      verifiedCertsCount: 2,
      totalCertsCount: 2,
      hasUnresolvedCritical: false,
    }),
  },
  {
    id: 'sup-003',
    name: 'Rajshree Fabrics Ltd.',
    legalName: 'Rajshree Textile & Fabrics Industries Ltd.',
    code: 'VND-RFL-003',
    riskTier: 'low',
    riskScore: 18,
    qualificationStatus: 'qualified',
    location: 'Surat, Gujarat, India',
    country: 'India',
    materialsSupplied: ['Upholstery Fabric', 'Cushion Covers'],
    lastAssessmentDate: '2026-10-10',
    primaryContact: {
      name: 'Ananya Deshmukh',
      title: 'Key Account Manager',
      email: 'ananya.d@rajshreefabrics.com',
      phone: '+91 94261 88990',
    },
    averageLeadTimeDays: 5,
    onTimeDeliveryRate: 98,
    defectRatePpm: 120,
    monthlyCapacityUnits: 120000,
    capacityUtilizationRate: 68,
    paymentTerms: 'Net 45 Days',
    currency: 'INR',
    lastAuditDate: '2026-08-05',
    nextAuditDueDate: '2027-08-05',
    notes: 'Premium fabric manufacturer. Zero delivery deviations over past 6 quarters. High ESG compliance score.',
    missingDataWarnings: [],
    certifications: [
      {
        id: 'cert-006',
        name: 'OEKO-TEX Standard 100',
        issuer: 'Hohenstein Institute',
        issuedDate: '2025-03-01',
        expiryDate: '2027-03-01',
        status: 'verified',
      },
      {
        id: 'cert-007',
        name: 'ISO 14001:2015 Environmental',
        issuer: 'DNV GL India',
        issuedDate: '2024-09-18',
        expiryDate: '2027-09-17',
        status: 'verified',
      },
      {
        id: 'cert-008',
        name: 'ISO 9001:2015',
        issuer: 'TUV Rheinland',
        issuedDate: '2023-11-04',
        expiryDate: '2026-11-03',
        status: 'verified',
      },
    ],
    unresolvedIssues: [],
    qualificationScore: calculateQualificationScore({
      onTimeDeliveryRate: 98,
      defectRatePpm: 120,
      averageLeadTimeDays: 5,
      capacityUtilizationRate: 68,
      financialScore: 92,
      verifiedCertsCount: 3,
      totalCertsCount: 3,
      hasUnresolvedCritical: false,
    }),
  },
  {
    id: 'sup-004',
    name: 'SteelCraft India Pvt.',
    legalName: 'SteelCraft Precision Fabricators Pvt. Ltd.',
    code: 'VND-SCI-004',
    riskTier: 'high',
    riskScore: 68,
    qualificationStatus: 'conditional',
    location: 'Jamshedpur, Jharkhand, India',
    country: 'India',
    materialsSupplied: ['Steel Frames', 'Metal Brackets', 'Table Legs (Metal)'],
    lastAssessmentDate: '2026-10-01',
    primaryContact: {
      name: 'Rameshwar Singh',
      title: 'Plant Operations Head',
      email: 'r.singh@steelcraftindia.in',
      phone: '+91 97714 55432',
    },
    averageLeadTimeDays: 14,
    onTimeDeliveryRate: 78,
    defectRatePpm: 890,
    monthlyCapacityUnits: 35000,
    capacityUtilizationRate: 88,
    paymentTerms: 'Net 30 Days',
    currency: 'INR',
    lastAuditDate: '2026-02-18',
    nextAuditDueDate: '2026-10-30',
    notes: 'Blast furnace maintenance ongoing resulting in current 5-day manufacturing stoppage. Backup facility in Kolkata operating at partial capacity.',
    missingDataWarnings: [
      'Upcoming annual site audit due in 18 days',
      'Pending structural welding calibration certificate',
    ],
    certifications: [
      {
        id: 'cert-009',
        name: 'ISO 9001:2015',
        issuer: 'BSI Group India',
        issuedDate: '2023-05-15',
        expiryDate: '2026-05-14',
        status: 'verified',
      },
      {
        id: 'cert-010',
        name: 'ISO 45001 Occupational Health & Safety',
        issuer: 'BSI Group India',
        issuedDate: '2024-02-20',
        expiryDate: '2027-02-19',
        status: 'unverified',
        verificationNotes: 'Pending review of latest workplace safety audit findings',
      },
    ],
    unresolvedIssues: [
      {
        id: 'iss-003',
        title: 'Furnace Maintenance Production Halt',
        severity: 'high',
        description: 'Jamshedpur line shut down for planned re-lining. Scheduled to resume production in 5 business days.',
        reportedDate: '2026-10-09',
      },
    ],
    qualificationScore: calculateQualificationScore({
      onTimeDeliveryRate: 78,
      defectRatePpm: 890,
      averageLeadTimeDays: 14,
      capacityUtilizationRate: 88,
      financialScore: 68,
      verifiedCertsCount: 1,
      totalCertsCount: 2,
      hasUnresolvedCritical: true,
    }),
  },
  {
    id: 'sup-005',
    name: 'Varnish Works International',
    legalName: 'Varnish Works Coatings & Chemicals Ltd.',
    code: 'VND-VWI-005',
    riskTier: 'medium',
    riskScore: 42,
    qualificationStatus: 'qualified',
    location: 'Chennai, Tamil Nadu, India',
    country: 'India',
    materialsSupplied: ['Wood Varnish', 'Polish Compounds', 'Sealants'],
    lastAssessmentDate: '2026-10-08',
    primaryContact: {
      name: 'K. S. Ramanathan',
      title: 'Technical Sales Specialist',
      email: 'ramanathan@varnishworks.com',
      phone: '+91 94440 67123',
    },
    averageLeadTimeDays: 8,
    onTimeDeliveryRate: 91,
    defectRatePpm: 480,
    monthlyCapacityUnits: 60000,
    capacityUtilizationRate: 72,
    paymentTerms: 'Net 30 Days',
    currency: 'INR',
    lastAuditDate: '2026-05-10',
    nextAuditDueDate: '2027-05-10',
    notes: 'Batch VW-2026-Q3 flagged for slight tint variation. Replacement batch currently in staging. Strong formulation chemistry.',
    missingDataWarnings: [],
    certifications: [
      {
        id: 'cert-011',
        name: 'ISO 9001:2015',
        issuer: 'Intertek India',
        issuedDate: '2024-07-01',
        expiryDate: '2027-06-30',
        status: 'verified',
      },
      {
        id: 'cert-012',
        name: 'GreenPro Eco-Label',
        issuer: 'Confederation of Indian Industry (CII)',
        issuedDate: '2025-02-14',
        expiryDate: '2027-02-13',
        status: 'verified',
      },
    ],
    unresolvedIssues: [
      {
        id: 'iss-004',
        title: 'QC Tint Variation on Batch VW-2026-Q3',
        severity: 'medium',
        description: 'Internal QC detected 4% color spectrum variance. Sample sent for spectrophotometer analysis.',
        reportedDate: '2026-10-11',
      },
    ],
    qualificationScore: calculateQualificationScore({
      onTimeDeliveryRate: 91,
      defectRatePpm: 480,
      averageLeadTimeDays: 8,
      capacityUtilizationRate: 72,
      financialScore: 78,
      verifiedCertsCount: 2,
      totalCertsCount: 2,
      hasUnresolvedCritical: false,
    }),
  },
  {
    id: 'sup-006',
    name: 'FoamComfort Industries',
    legalName: 'FoamComfort Polyurethane Products Pvt. Ltd.',
    code: 'VND-FCI-006',
    riskTier: 'low',
    riskScore: 12,
    qualificationStatus: 'qualified',
    location: 'Chakan, Pune, India',
    country: 'India',
    materialsSupplied: ['High-Density Foam', 'Cushion Padding'],
    lastAssessmentDate: '2026-10-09',
    primaryContact: {
      name: 'Vikas Kadam',
      title: 'Supply Chain Coordinator',
      email: 'vikas.kadam@foamcomfort.co.in',
      phone: '+91 98811 23901',
    },
    averageLeadTimeDays: 4,
    onTimeDeliveryRate: 99,
    defectRatePpm: 85,
    monthlyCapacityUnits: 80000,
    capacityUtilizationRate: 62,
    paymentTerms: 'Net 30 Days',
    currency: 'INR',
    lastAuditDate: '2026-07-12',
    nextAuditDueDate: '2027-07-12',
    notes: 'Exemplary delivery record. Close geographical proximity to assembly plants minimizes logistics exposure.',
    missingDataWarnings: [],
    certifications: [
      {
        id: 'cert-013',
        name: 'ISO 9001:2015',
        issuer: 'TUV Austria',
        issuedDate: '2024-04-18',
        expiryDate: '2027-04-17',
        status: 'verified',
      },
      {
        id: 'cert-014',
        name: 'CertiPUR-US Foam Safety',
        issuer: 'Alliance for Flexible Polyurethane Foam',
        issuedDate: '2025-06-01',
        expiryDate: '2027-05-31',
        status: 'verified',
      },
    ],
    unresolvedIssues: [
      {
        id: 'iss-005',
        title: 'Regional Logistics Union Strike Notice',
        severity: 'low',
        description: '3-day Maharashtra transport strike starting Oct 14. Vendor pre-allocating buffer inventory to local hub.',
        reportedDate: '2026-10-11',
      },
    ],
    qualificationScore: calculateQualificationScore({
      onTimeDeliveryRate: 99,
      defectRatePpm: 85,
      averageLeadTimeDays: 4,
      capacityUtilizationRate: 62,
      financialScore: 94,
      verifiedCertsCount: 2,
      totalCertsCount: 2,
      hasUnresolvedCritical: false,
    }),
  },
  {
    id: 'sup-007',
    name: 'Precision Fixings Corp.',
    legalName: 'Shenzhen Precision Hardware & Fixings Co. Ltd.',
    code: 'VND-PFC-007',
    riskTier: 'high',
    riskScore: 72,
    qualificationStatus: 'conditional',
    location: 'Baoan, Shenzhen, China',
    country: 'China',
    materialsSupplied: ['Precision Bearings', 'Swivel Mechanisms', 'Caster Wheels'],
    lastAssessmentDate: '2026-09-30',
    primaryContact: {
      name: 'Linda Chen',
      title: 'Overseas Commercial Manager',
      email: 'linda.chen@szprecisionfix.com',
      phone: '+86 755 8899 1122',
    },
    averageLeadTimeDays: 18,
    onTimeDeliveryRate: 80,
    defectRatePpm: 620,
    monthlyCapacityUnits: 500000,
    capacityUtilizationRate: 91,
    paymentTerms: 'TT 30% advance, 70% against BL',
    currency: 'USD',
    lastAuditDate: '2025-11-20',
    nextAuditDueDate: '2026-11-20',
    notes: 'High-volume overseas mechanism supplier. Subject to seaport demurrage delays at JNPT Mumbai.',
    missingDataWarnings: [
      'Annual On-Site Social Compliance Audit due next month',
      'Unresolved port delay penalty reconciliation',
    ],
    certifications: [
      {
        id: 'cert-015',
        name: 'ISO 9001:2015',
        issuer: 'SGS China',
        issuedDate: '2023-10-10',
        expiryDate: '2026-10-09',
        status: 'expired',
        verificationNotes: 'Expired yesterday. Renewal audit conducted, certificate awaiting release.',
      },
      {
        id: 'cert-016',
        name: 'IATF 16949 Automotive Quality',
        issuer: 'DNV Business Assurance',
        issuedDate: '2024-03-22',
        expiryDate: '2027-03-21',
        status: 'verified',
      },
    ],
    unresolvedIssues: [
      {
        id: 'iss-006',
        title: 'JNPT Port Congestion Dwell Time',
        severity: 'high',
        description: 'Container backlog at JNPT Mumbai causing 3–5 day delays in customs clearance.',
        reportedDate: '2026-10-10',
      },
    ],
    qualificationScore: calculateQualificationScore({
      onTimeDeliveryRate: 80,
      defectRatePpm: 620,
      averageLeadTimeDays: 18,
      capacityUtilizationRate: 91,
      financialScore: 74,
      verifiedCertsCount: 1,
      totalCertsCount: 2,
      hasUnresolvedCritical: true,
    }),
  },
  {
    id: 'sup-008',
    name: 'EcoPanels Green Materials',
    legalName: 'EcoPanels Bio-Composite Materials Pvt. Ltd.',
    code: 'VND-EPG-008',
    riskTier: 'medium',
    riskScore: 38,
    qualificationStatus: 'qualified',
    location: 'Peenya, Bengaluru, India',
    country: 'India',
    materialsSupplied: ['MDF Boards', 'Particle Board', 'Laminate Sheets'],
    lastAssessmentDate: '2026-10-06',
    primaryContact: {
      name: 'Naveen Swaminathan',
      title: 'Co-Founder & VP Sales',
      email: 'naveen@ecopanels.in',
      phone: '+91 99000 45678',
    },
    averageLeadTimeDays: 7,
    onTimeDeliveryRate: 93,
    defectRatePpm: 290,
    monthlyCapacityUnits: 75000,
    capacityUtilizationRate: 70,
    paymentTerms: 'Net 30 Days',
    currency: 'INR',
    lastAuditDate: '2026-04-14',
    nextAuditDueDate: '2027-04-14',
    notes: 'Sustainable agro-waste board manufacturer. Low carbon footprint, growing order volumes.',
    missingDataWarnings: [],
    certifications: [
      {
        id: 'cert-017',
        name: 'ISO 14001:2015 Environmental',
        issuer: 'TUV Nord',
        issuedDate: '2024-08-01',
        expiryDate: '2027-07-31',
        status: 'verified',
      },
      {
        id: 'cert-018',
        name: 'FSC 100% Recycled',
        issuer: 'SCS Global Services',
        issuedDate: '2025-05-10',
        expiryDate: '2028-05-09',
        status: 'verified',
      },
    ],
    unresolvedIssues: [],
    qualificationScore: calculateQualificationScore({
      onTimeDeliveryRate: 93,
      defectRatePpm: 290,
      averageLeadTimeDays: 7,
      capacityUtilizationRate: 70,
      financialScore: 84,
      verifiedCertsCount: 2,
      totalCertsCount: 2,
      hasUnresolvedCritical: false,
    }),
  },
  {
    id: 'sup-009',
    name: 'Kerala Wood Traders',
    legalName: 'Kerala Wood Traders & Timber Millers LLP',
    code: 'VND-KWT-009',
    riskTier: 'low',
    riskScore: 24,
    qualificationStatus: 'qualified',
    location: 'Kochi, Kerala, India',
    country: 'India',
    materialsSupplied: ['Teak Wood Planks', 'Rosewood Veneer', 'Rubberwood Panels'],
    lastAssessmentDate: '2026-10-02',
    primaryContact: {
      name: 'Mathew Thomas',
      title: 'Partner — Commercial Operations',
      email: 'm.thomas@keralawoodtraders.com',
      phone: '+91 98470 33211',
    },
    averageLeadTimeDays: 5,
    onTimeDeliveryRate: 96,
    defectRatePpm: 210,
    monthlyCapacityUnits: 30000,
    capacityUtilizationRate: 64,
    paymentTerms: 'Net 30 Days',
    currency: 'INR',
    lastAuditDate: '2026-06-18',
    nextAuditDueDate: '2027-06-18',
    notes: 'Primary domestic alternative for teak wood planks. Can buffer against Myanmar supply interruptions within 4 days lead time.',
    missingDataWarnings: [],
    certifications: [
      {
        id: 'cert-019',
        name: 'ISO 9001:2015',
        issuer: 'Bureau Veritas India',
        issuedDate: '2024-11-12',
        expiryDate: '2027-11-11',
        status: 'verified',
      },
      {
        id: 'cert-020',
        name: 'Indian Forest Certification Scheme (IFCS)',
        issuer: 'NCCF India',
        issuedDate: '2025-04-05',
        expiryDate: '2028-04-04',
        status: 'verified',
      },
    ],
    unresolvedIssues: [],
    qualificationScore: calculateQualificationScore({
      onTimeDeliveryRate: 96,
      defectRatePpm: 210,
      averageLeadTimeDays: 5,
      capacityUtilizationRate: 64,
      financialScore: 88,
      verifiedCertsCount: 2,
      totalCertsCount: 2,
      hasUnresolvedCritical: false,
    }),
  },
  {
    id: 'sup-010',
    name: 'Tata Bearings & Fasteners',
    legalName: 'Tata Steel Bearings Division',
    code: 'VND-TBF-010',
    riskTier: 'low',
    riskScore: 16,
    qualificationStatus: 'qualified',
    location: 'Kharagpur, West Bengal, India',
    country: 'India',
    materialsSupplied: ['Precision Bearings', 'Swivel Mechanisms', 'High-Tensile Bolts'],
    lastAssessmentDate: '2026-10-07',
    primaryContact: {
      name: 'Subhashish Roy',
      title: 'Institutional Sales Lead',
      email: 's.roy@tatabearings.com',
      phone: '+91 94340 78654',
    },
    averageLeadTimeDays: 6,
    onTimeDeliveryRate: 97,
    defectRatePpm: 95,
    monthlyCapacityUnits: 650000,
    capacityUtilizationRate: 74,
    paymentTerms: 'Net 45 Days',
    currency: 'INR',
    lastAuditDate: '2026-09-02',
    nextAuditDueDate: '2027-09-02',
    notes: 'Domestic high-precision mechanism benchmark. High financial stability and rigorous quality control.',
    missingDataWarnings: [],
    certifications: [
      {
        id: 'cert-021',
        name: 'ISO 9001:2015',
        issuer: 'TUV Rheinland',
        issuedDate: '2024-02-10',
        expiryDate: '2027-02-09',
        status: 'verified',
      },
      {
        id: 'cert-022',
        name: 'IATF 16949 Automotive Standard',
        issuer: 'BSI Assurance',
        issuedDate: '2023-12-01',
        expiryDate: '2026-11-30',
        status: 'verified',
      },
      {
        id: 'cert-023',
        name: 'ISO 45001 Health & Safety',
        issuer: 'TUV Rheinland',
        issuedDate: '2025-01-20',
        expiryDate: '2028-01-19',
        status: 'verified',
      },
    ],
    unresolvedIssues: [],
    qualificationScore: calculateQualificationScore({
      onTimeDeliveryRate: 97,
      defectRatePpm: 95,
      averageLeadTimeDays: 6,
      capacityUtilizationRate: 74,
      financialScore: 98,
      verifiedCertsCount: 3,
      totalCertsCount: 3,
      hasUnresolvedCritical: false,
    }),
  },
  {
    id: 'sup-011',
    name: 'Deccan Polymers & Adhesives',
    legalName: 'Deccan Industrial Resins & Adhesives Ltd.',
    code: 'VND-DPA-011',
    riskTier: 'medium',
    riskScore: 50,
    qualificationStatus: 'under_review',
    location: 'Hyderabad, Telangana, India',
    country: 'India',
    materialsSupplied: ['Polyurethane Adhesive', 'Wood Glue', 'Sealants'],
    lastAssessmentDate: '2026-09-15',
    primaryContact: {
      name: 'Prasad Rao',
      title: 'Technical Director',
      email: 'prasad.rao@deccanpolymers.com',
      phone: '+91 98490 89123',
    },
    averageLeadTimeDays: 9,
    onTimeDeliveryRate: 88,
    defectRatePpm: 560,
    monthlyCapacityUnits: 40000,
    capacityUtilizationRate: 83,
    paymentTerms: 'Net 30 Days',
    currency: 'INR',
    lastAuditDate: '2025-10-10',
    nextAuditDueDate: '2026-10-25',
    notes: 'Candidate vendor under qualification audit. Chemical safety and VOC compliance testing currently ongoing.',
    missingDataWarnings: [
      'VOC Emissions Compliance Certificate pending laboratory test results',
      'On-site environmental audit scheduled for next week',
    ],
    certifications: [
      {
        id: 'cert-024',
        name: 'ISO 9001:2015',
        issuer: 'DNV GL India',
        issuedDate: '2024-06-25',
        expiryDate: '2027-06-24',
        status: 'verified',
      },
      {
        id: 'cert-025',
        name: 'Low-VOC Emission Certification',
        issuer: 'Shriram Institute for Industrial Research',
        issuedDate: '2026-09-01',
        expiryDate: '2027-09-01',
        status: 'pending_audit',
        verificationNotes: 'Sample results awaited from Delhi laboratory',
      },
    ],
    unresolvedIssues: [
      {
        id: 'iss-007',
        title: 'Pending VOC Emission Laboratory Report',
        severity: 'medium',
        description: 'Batch certification sample in testing queue.',
        reportedDate: '2026-09-20',
      },
    ],
    qualificationScore: calculateQualificationScore({
      onTimeDeliveryRate: 88,
      defectRatePpm: 560,
      averageLeadTimeDays: 9,
      capacityUtilizationRate: 83,
      financialScore: 70,
      verifiedCertsCount: 1,
      totalCertsCount: 2,
      hasUnresolvedCritical: false,
    }),
  },
  {
    id: 'sup-012',
    name: 'Sundaram Springs & Hardware',
    legalName: 'Sundaram Precision Springs Pvt. Ltd.',
    code: 'VND-SSH-012',
    riskTier: 'low',
    riskScore: 20,
    qualificationStatus: 'qualified',
    location: 'Coimbatore, Tamil Nadu, India',
    country: 'India',
    materialsSupplied: ['Recliner Springs', 'Cabinet Hinges', 'Metal Brackets'],
    lastAssessmentDate: '2026-10-04',
    primaryContact: {
      name: 'V. Sundararajan',
      title: 'Managing Director',
      email: 'sundar@sundaramsprings.in',
      phone: '+91 94433 12456',
    },
    averageLeadTimeDays: 5,
    onTimeDeliveryRate: 97,
    defectRatePpm: 150,
    monthlyCapacityUnits: 180000,
    capacityUtilizationRate: 67,
    paymentTerms: 'Net 30 Days',
    currency: 'INR',
    lastAuditDate: '2026-05-30',
    nextAuditDueDate: '2027-05-30',
    notes: 'Established hardware and spring maker. Excellent dimensional stability and low rejection rate.',
    missingDataWarnings: [],
    certifications: [
      {
        id: 'cert-026',
        name: 'ISO 9001:2015',
        issuer: 'TUV India',
        issuedDate: '2024-03-10',
        expiryDate: '2027-03-09',
        status: 'verified',
      },
      {
        id: 'cert-027',
        name: 'IATF 16949',
        issuer: 'TUV India',
        issuedDate: '2024-09-15',
        expiryDate: '2027-09-14',
        status: 'verified',
      },
    ],
    unresolvedIssues: [],
    qualificationScore: calculateQualificationScore({
      onTimeDeliveryRate: 97,
      defectRatePpm: 150,
      averageLeadTimeDays: 5,
      capacityUtilizationRate: 67,
      financialScore: 90,
      verifiedCertsCount: 2,
      totalCertsCount: 2,
      hasUnresolvedCritical: false,
    }),
  },
];

/**
 * Filter and sort mock suppliers
 */
export function getMockSuppliers(params?: SupplierFilterParams): SupplierDetail[] {
  let list = [...MOCK_DETAILED_SUPPLIERS];

  if (!params) return list;

  // Search filter (name, material, code, contact)
  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      s.materialsSupplied.some(m => m.toLowerCase().includes(q)) ||
      s.primaryContact.name.toLowerCase().includes(q)
    );
  }

  // Risk tier filter
  if (params.riskTier && params.riskTier !== 'all') {
    list = list.filter(s => s.riskTier === params.riskTier);
  }

  // Qualification status filter
  if (params.qualificationStatus && params.qualificationStatus !== 'all') {
    list = list.filter(s => s.qualificationStatus === params.qualificationStatus);
  }

  // Country filter
  if (params.country && params.country !== 'all') {
    list = list.filter(s => s.country.toLowerCase() === params.country!.toLowerCase());
  }

  // Material filter
  if (params.material && params.material !== 'all') {
    const mTarget = params.material.toLowerCase();
    list = list.filter(s => s.materialsSupplied.some(m => m.toLowerCase().includes(mTarget)));
  }

  // Sorting
  const sortBy = params.sortBy || 'overallScore';
  const sortOrder = params.sortOrder || 'desc';

  list.sort((a, b) => {
    let aVal: any = 0;
    let bVal: any = 0;

    switch (sortBy) {
      case 'name':
        aVal = a.name;
        bVal = b.name;
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      case 'overallScore':
        aVal = a.qualificationScore.overall;
        bVal = b.qualificationScore.overall;
        break;
      case 'riskScore':
        aVal = a.riskScore;
        bVal = b.riskScore;
        break;
      case 'delivery':
        aVal = a.onTimeDeliveryRate;
        bVal = b.onTimeDeliveryRate;
        break;
      case 'leadTime':
        aVal = a.averageLeadTimeDays;
        bVal = b.averageLeadTimeDays;
        // For lead time, lower is typically better
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      default:
        aVal = a.qualificationScore.overall;
        bVal = b.qualificationScore.overall;
    }

    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  return list;
}

/**
 * Fetch a single supplier by ID
 */
export function getMockSupplierById(id: string): SupplierDetail | null {
  return MOCK_DETAILED_SUPPLIERS.find(s => s.id === id) || null;
}

/**
 * Compare 2 to 3 suppliers side-by-side
 */
export function getSuppliersForComparison(ids: string[]): SupplierDetail[] {
  return MOCK_DETAILED_SUPPLIERS.filter(s => ids.includes(s.id));
}
