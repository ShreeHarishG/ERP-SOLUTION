// =============================================================================
// Onchain Insights — Type Definitions
// =============================================================================

// --- Enums & Constants ---

export type RiskTier = 'critical' | 'high' | 'medium' | 'low';
export type DisruptionSeverity = 'critical' | 'high' | 'medium' | 'low';
export type DisruptionCategory =
  | 'weather'
  | 'port_congestion'
  | 'supplier_incident'
  | 'geopolitical'
  | 'logistics'
  | 'quality'
  | 'financial'
  | 'natural_disaster'
  | 'supplier_failure'
  | 'force_majeure'
  | 'regulatory'
  | 'infrastructure';
export type DisruptionStatus = 'active' | 'monitoring' | 'resolved' | 'acknowledged' | 'investigating';
export type SignalSource = 'internal' | 'news' | 'port_authority' | 'weather_service' | 'supplier_report' | 'customs';
export type ActionUrgency = 'immediate' | 'urgent' | 'standard' | 'planned';
export type ActionType = 'switch_supplier' | 'expedite_shipment' | 'increase_safety_stock' | 'split_sourcing' | 'inventory_transfer' | 'delay_order';

export const RISK_TIER_CONFIG: Record<RiskTier, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'Critical', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  high:     { label: 'High',     color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  medium:   { label: 'Medium',   color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  low:      { label: 'Low',      color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

export const DISRUPTION_CATEGORY_LABELS: Record<DisruptionCategory, string> = {
  weather: 'Weather Event',
  port_congestion: 'Port Congestion',
  supplier_incident: 'Supplier Incident',
  geopolitical: 'Geopolitical',
  logistics: 'Logistics Delay',
  quality: 'Quality Issue',
  financial: 'Financial Risk',
  natural_disaster: 'Natural Disaster',
  supplier_failure: 'Supplier Failure',
  force_majeure: 'Force Majeure',
  regulatory: 'Regulatory Action',
  infrastructure: 'Infrastructure Outage',
};

export const DISRUPTION_CATEGORY_CONFIG: Record<
  DisruptionCategory,
  { label: string; color: string; bg: string; border: string }
> = {
  weather: { label: 'Weather Event', color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' },
  port_congestion: { label: 'Port Congestion', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  supplier_incident: { label: 'Supplier Incident', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  geopolitical: { label: 'Geopolitical', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  logistics: { label: 'Logistics Delay', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  quality: { label: 'Quality Issue', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  financial: { label: 'Financial Risk', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  natural_disaster: { label: 'Natural Disaster', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
  supplier_failure: { label: 'Supplier Failure', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  force_majeure: { label: 'Force Majeure', color: 'text-rose-800', bg: 'bg-rose-100', border: 'border-rose-300' },
  regulatory: { label: 'Regulatory Action', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  infrastructure: { label: 'Infrastructure Outage', color: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-200' },
};

// --- Dashboard KPIs ---

export interface OnchainDashboardKpis {
  activeDisruptions: number;
  atRiskSuppliers: number;
  affectedOrders: number;
  avgRiskScore: number;
  pendingApprovals: number;
  recommendedActions: number;
}

// --- Supplier (Summary) ---

export interface SupplierSummary {
  id: string;
  name: string;
  riskTier: RiskTier;
  riskScore: number; // 0–100
  location: string;
  materialsSupplied: string[];
  lastAssessmentDate: string;
}

// --- Disruption Signal ---

export interface DisruptionSignal {
  id: string;
  title: string;
  description: string;
  category: DisruptionCategory;
  severity: DisruptionSeverity;
  status: DisruptionStatus;
  source: SignalSource;
  affectedSuppliers: string[];
  affectedShipments: string[];
  affectedMaterials: string[];
  affectedOrders: string[];
  detectedAt: string;
  updatedAt: string;
  estimatedImpact: string;
  region: string;
}

// --- Shipment Risk Trend ---

export interface ShipmentRiskDataPoint {
  date: string;
  riskScore: number;
  activeDisruptions: number;
  delayedShipments: number;
}

// --- Supplier Risk Distribution ---

export interface SupplierRiskDistribution {
  tier: RiskTier;
  count: number;
  percentage: number;
}

// --- Affected Material / Order ---

export interface AffectedMaterial {
  id: string;
  materialName: string;
  sku: string;
  supplierName: string;
  disruptionTitle: string;
  severity: DisruptionSeverity;
  affectedOrderCount: number;
  estimatedDelayDays: number;
}

// --- Recommended Action ---

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  actionType: ActionType;
  urgency: ActionUrgency;
  estimatedBenefit: string;
  estimatedCost: string;
  relatedDisruptionId: string;
  relatedSupplier: string;
  affectedOrders: number;
}

// --- Full Dashboard Response ---

export interface OnchainDashboardData {
  kpis: OnchainDashboardKpis;
  disruptions: DisruptionSignal[];
  supplierRiskDistribution: SupplierRiskDistribution[];
  shipmentRiskTrend: ShipmentRiskDataPoint[];
  affectedMaterials: AffectedMaterial[];
  recommendedActions: RecommendedAction[];
  suppliers: SupplierSummary[];
  dataMode: 'mock' | 'api';
  lastUpdated: string;
}

// --- Filter State ---

export interface OnchainDashboardFilters {
  dateRange: '7d' | '30d' | '60d' | '90d';
  riskLevel: RiskTier | 'all';
  supplierId: string | 'all';
}

// =============================================================================
// Task 2: Supplier Qualification & Profiles
// =============================================================================

export type QualificationStatus = 'qualified' | 'conditional' | 'under_review' | 'disqualified';
export type CertificationStatus = 'verified' | 'unverified' | 'expired' | 'pending_audit';

export const QUALIFICATION_STATUS_CONFIG: Record<QualificationStatus, { label: string; badge: 'green' | 'amber' | 'blue' | 'red'; desc: string }> = {
  qualified:    { label: 'Qualified',    badge: 'green', desc: 'Meets or exceeds all performance and audit standards' },
  conditional:  { label: 'Conditional',  badge: 'amber', desc: 'Approved with operational limitations or monitoring' },
  under_review: { label: 'Under Review', badge: 'blue',  desc: 'Active audit or document verification pending' },
  disqualified: { label: 'Disqualified', badge: 'red',   desc: 'Fails critical quality, financial, or delivery metrics' },
};

export const CERTIFICATION_STATUS_CONFIG: Record<CertificationStatus, { label: string; color: string; bg: string; border: string }> = {
  verified:      { label: 'Verified',       color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  unverified:    { label: 'Unverified',     color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  expired:       { label: 'Expired',        color: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200' },
  pending_audit: { label: 'Pending Audit',  color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200' },
};

export interface SupplierCertification {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string;
  expiryDate: string;
  status: CertificationStatus;
  verificationNotes?: string;
  documentRef?: string;
}

export interface SupplierQualificationScore {
  overall: number; // 0–100
  deliveryReliability: number; // 0-100 (weight: 25%)
  qualityRating: number; // 0-100 (weight: 25%)
  leadTimeScore: number; // 0-100 (weight: 15%)
  capacityScore: number; // 0-100 (weight: 15%)
  financialStability: number; // 0-100 (weight: 10%)
  complianceScore: number; // 0-100 (weight: 10%)
  weights: {
    delivery: number;
    quality: number;
    leadTime: number;
    capacity: number;
    financial: number;
    compliance: number;
  };
  explanation: string;
}

export interface UnresolvedIssue {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  reportedDate: string;
}

export interface SupplierDetail extends SupplierSummary {
  legalName: string;
  code: string;
  country: string;
  qualificationStatus: QualificationStatus;
  qualificationScore: SupplierQualificationScore;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    title: string;
  };
  averageLeadTimeDays: number;
  onTimeDeliveryRate: number; // %
  defectRatePpm: number;
  monthlyCapacityUnits: number;
  capacityUtilizationRate: number; // %
  certifications: SupplierCertification[];
  unresolvedIssues: UnresolvedIssue[];
  lastAuditDate: string;
  nextAuditDueDate: string;
  paymentTerms: string;
  currency: string;
  notes: string;
  missingDataWarnings?: string[];
}

export interface SupplierFilterParams {
  search?: string;
  riskTier?: RiskTier | 'all';
  qualificationStatus?: QualificationStatus | 'all';
  country?: string | 'all';
  material?: string;
  sortBy?: 'name' | 'overallScore' | 'riskScore' | 'delivery' | 'leadTime';
  sortOrder?: 'asc' | 'desc';
}

// =============================================================================
// Task 4: Supplier Switching Simulator
// =============================================================================

export interface SwitchSimulatorParams {
  currentSupplierId: string;
  alternativeSupplierId: string;
  materialName: string;
  annualVolume: number;
  currentUnitCost: number;
  alternativeUnitCost: number;
  splitRatioCurrent: number; // 0–100
  switchingCostOneTime: number;
  transitionWeeks: number;
}

export interface ScenarioImpactMetrics {
  scenarioName: 'retain' | 'split' | 'switch';
  scenarioTitle: string;
  description: string;
  annualMaterialCost: number;
  oneTimeTransitionCost: number;
  totalFirstYearCost: number;
  costDeltaVsBaseline: number;
  blendedLeadTimeDays: number;
  leadTimeDeltaDays: number;
  blendedOnTimeDeliveryRate: number;
  blendedRiskScore: number;
  riskTier: RiskTier;
  riskReductionScore: number;
  dependencyConcentration: string;
  confidenceLevel: 'verified' | 'partially_estimated' | 'estimated';
  confidenceNotes: string;
  feasibleInWeeks: number;
}

export interface SwitchSimulationResult {
  params: SwitchSimulatorParams;
  currentSupplier: SupplierDetail;
  alternativeSupplier: SupplierDetail;
  scenarios: {
    retain: ScenarioImpactMetrics;
    split: ScenarioImpactMetrics;
    switch: ScenarioImpactMetrics;
  };
  tradeOffSummary: {
    recommendedScenario: 'retain' | 'split' | 'switch';
    rationale: string;
    keyTradeOffs: string[];
    riskMitigatedDisruptions: string[];
  };
}

// =============================================================================
// Task 3: Supplier Onboarding & Profile Management
// =============================================================================

export type OnboardingStage = 'pending_review' | 'under_audit' | 'changes_requested' | 'approved' | 'rejected';
export type DocumentVerificationStatus = 'uploaded' | 'verified' | 'rejected' | 'missing';

export const ONBOARDING_STAGE_CONFIG: Record<OnboardingStage, { label: string; badge: 'blue' | 'amber' | 'green' | 'red'; desc: string }> = {
  pending_review:    { label: 'Pending Review',    badge: 'blue',  desc: 'Application submitted, awaiting initial compliance triage' },
  under_audit:       { label: 'Under Audit',       badge: 'amber', desc: 'Document verification and quality screening in progress' },
  changes_requested: { label: 'Changes Requested', badge: 'amber', desc: 'Additional documentation or clarifications requested from vendor' },
  approved:          { label: 'Approved',          badge: 'green', desc: 'Successfully qualified and approved for purchase order issuance' },
  rejected:          { label: 'Rejected',          badge: 'red',   desc: 'Disqualified due to failed audit, compliance, or quality standards' },
};

export interface OnboardingDocument {
  id: string;
  name: string;
  category: 'legal' | 'tax' | 'quality' | 'environmental' | 'financial' | 'compliance';
  isRequired: boolean;
  status: DocumentVerificationStatus;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface SupplierStatusHistoryEntry {
  id: string;
  fromStatus: string;
  toStatus: string;
  changedBy: string;
  changedAt: string;
  reason: string;
  comments?: string;
}

export interface OnboardingSupplierRecord {
  id: string;
  name: string;
  legalName: string;
  code: string;
  country: string;
  location: string;
  taxId: string;
  materialsSupplied: string[];
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    title: string;
  };
  operationalDetails: {
    monthlyCapacityUnits: number;
    quotedLeadTimeDays: number;
    paymentTerms: string;
    currency: string;
  };
  onboardingStage: OnboardingStage;
  documents: OnboardingDocument[];
  statusHistory: SupplierStatusHistoryEntry[];
  submittedAt: string;
  updatedAt: string;
  initialQualificationScore: number;
  assignedReviewer: string;
  reviewerNotes?: string;
}

export interface OnboardingFormInput {
  name: string;
  legalName: string;
  country: string;
  location: string;
  taxId: string;
  materialsSupplied: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactTitle: string;
  monthlyCapacityUnits: number;
  quotedLeadTimeDays: number;
  paymentTerms: string;
  currency: string;
  documentIdsUploaded: string[];
  selfAssessmentRisk: RiskTier;
  initialNotes?: string;
}

export interface ReviewDecisionPayload {
  supplierId: string;
  decision: 'approve' | 'reject' | 'request_changes';
  reviewerName: string;
  comments: string;
  documentStatusUpdates?: Array<{ docId: string; status: DocumentVerificationStatus; notes?: string }>;
}

// =============================================================================
// Task 5: SKU Transition Planning Assistant
// =============================================================================

export interface SkuInventoryLocation {
  locationId: string;
  locationName: string;
  city: string;
  oldSkuStock: number;
  newSkuStock: number;
  allocatedReserved: number;
}

export interface SkuTransitionTimelinePoint {
  week: number;
  date: string;
  oldSkuInventory: number;
  newSkuInventory: number;
  totalMarketDemand: number;
  oldSkuFulfillment: number;
  newSkuFulfillment: number;
  unmetDemand: number;
}

export interface SkuTransitionStrategy {
  strategyId: 'aggressive' | 'balanced' | 'conservative';
  strategyName: string;
  tagline: string;
  description: string;
  projectedCrossoverWeek: number;
  crossoverDate: string;
  oldSkuLeftoverUnits: number;
  oldSkuLeftoverCost: number;
  newSkuShortageRiskPercent: number;
  projectedServiceLevelPercent: number;
  totalCarryingAndScrapCost: number;
  costDeltaVsBalanced: number;
  timeline: SkuTransitionTimelinePoint[];
  feasibilityRating: 'high' | 'medium' | 'conditional';
  recommendationNote: string;
}

export interface SkuTransitionParams {
  oldSku: string;
  newSku: string;
  productName: string;
  currentOldInventory: number;
  weeklyDemandRate: number;
  newSkuLeadTimeWeeks: number;
  unitCostOld: number;
  unitCostNew: number;
  holdingCostPerUnitYear: number;
  salvageScrapValuePercent: number;
}

export interface SkuTransitionResult {
  params: SkuTransitionParams;
  oldSkuDetails: {
    sku: string;
    name: string;
    currentInventory: number;
    unitCost: number;
    locations: SkuInventoryLocation[];
  };
  newSkuDetails: {
    sku: string;
    name: string;
    onOrderUnits: number;
    unitCost: number;
    leadTimeWeeks: number;
  };
  baselineCalculationNotes: string;
  strategies: {
    aggressive: SkuTransitionStrategy;
    balanced: SkuTransitionStrategy;
    conservative: SkuTransitionStrategy;
  };
}

// =============================================================================
// Task 6: Disruption Signal & Shipment Monitoring
// =============================================================================

export interface DisruptionTimelineEvent {
  id: string;
  timestamp: string;
  status: DisruptionStatus;
  actor: string;
  action: string;
  notes: string;
}

export interface DisruptionSignalDetail extends DisruptionSignal {
  timeline: DisruptionTimelineEvent[];
  recommendedMitigation?: string;
  affectedOrderDetails?: Array<{
    orderId: string;
    customerName: string;
    value: number;
    dueDate: string;
    status: string;
  }>;
  affectedShipmentDetails?: ShipmentTransitRecord[];
}

export type ShipmentStatus = 'on_schedule' | 'delayed' | 'held_customs' | 'rerouted' | 'delivered';

export interface ShipmentTransitRecord {
  id: string;
  shipmentNumber: string;
  carrier: string;
  origin: string;
  originCountry: string;
  destination: string;
  supplierId: string;
  supplierName: string;
  materialName: string;
  sku: string;
  quantityUnits: number;
  valueINR: number;
  status: ShipmentStatus;
  departureDate: string;
  expectedDeliveryDate: string;
  revisedDeliveryDate: string;
  delayDays: number;
  transitProgressPercent: number; // 0 to 100
  relatedDisruptionId?: string;
  relatedDisruptionTitle?: string;
  riskSeverity: DisruptionSeverity;
  trackingMilestones: Array<{
    location: string;
    timestamp: string;
    status: string;
    passed: boolean;
  }>;
}

export interface DisruptionFilterParams {
  severity?: string;
  category?: string;
  status?: string;
  supplierId?: string;
  search?: string;
  sortBy?: 'detectedAt' | 'severity' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ShipmentFilterParams {
  status?: string;
  supplierId?: string;
  riskSeverity?: string;
  search?: string;
}

export interface DisruptionStatusUpdatePayload {
  status: DisruptionStatus;
  notes: string;
  actor: string;
}

// =============================================================================
// Task 7: Disruption Prediction & Explainable Risk Prioritization
// =============================================================================

export interface RiskAssessmentFactorBreakdown {
  deliveryRisk: number;       // 0–100 (Higher = Riskier)
  disruptionExposure: number; // 0–100
  geographicRisk: number;     // 0–100
  financialRisk: number;      // 0–100
  complianceRisk: number;     // 0–100
}

export interface SupplierRiskAssessment {
  supplierId: string;
  supplierName: string;
  legalName: string;
  location: string;
  country: string;
  riskTier: RiskTier;
  overallRiskScore: number; // 0–100 (Deterministic rule-based score)
  rank: number;
  confidenceLevel: 'verified_ledger' | 'rule_based_audit' | 'partial_estimate';
  predictionHorizon: '30_days' | '60_days' | '90_days';
  factors: RiskAssessmentFactorBreakdown;
  primaryRiskDriver: string;
  narrativeExplanation: string;
  contributingRootCauses: string[];
  recommendedMitigation: string;
  activeDisruptionsCount: number;
  activeDisruptions: string[];
  materialsAtRisk: string[];
  lastAssessmentDate: string;
}

export interface RiskAssessmentWeights {
  delivery: number;   // default 0.30 (30%)
  disruption: number; // default 0.25 (25%)
  geographic: number; // default 0.20 (20%)
  financial: number;  // default 0.15 (15%)
  compliance: number; // default 0.10 (10%)
}

export interface RiskAssessmentFilterParams {
  tier?: string;
  horizon?: string;
  search?: string;
  sortBy?: 'riskScore' | 'name' | 'rank';
  sortOrder?: 'asc' | 'desc';
}

export interface RiskAssessmentResponse {
  data: SupplierRiskAssessment[];
  total: number;
  kpis: {
    totalSuppliers: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    avgRiskScore: number;
  };
  appliedWeights: RiskAssessmentWeights;
  methodologyDisclosure: string;
}

// =============================================================================
// Task 8: Multi-Tier Dependency & Impact Explorer
// =============================================================================

export type DependencyNodeType =
  | 'sub_tier'
  | 'supplier'
  | 'material'
  | 'facility'
  | 'product'
  | 'order';

export interface DependencyNodeData {
  label: string;
  sublabel: string;
  type: DependencyNodeType;
  entityId: string;
  status: 'operational' | 'at_risk' | 'disrupted' | 'delayed';
  riskScore: number;
  disruptionTitle?: string;
  location?: string;
  sku?: string;
  valueINR?: number;
  leadTimeDays?: number;
  stockUnits?: number;
  erpLink?: string;
  isImpacted?: boolean;
  isRootSource?: boolean;
}

export interface DependencyGraphNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: DependencyNodeData;
}

export interface DependencyGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  style?: Record<string, any>;
  isImpacted?: boolean;
}

export interface DownstreamImpactSummary {
  selectedNodeId: string;
  selectedNodeName: string;
  selectedNodeType: DependencyNodeType;
  impactedSuppliersCount: number;
  impactedMaterialsCount: number;
  impactedProductsCount: number;
  impactedOrdersCount: number;
  totalRevenueAtRiskINR: number;
  highestSeverity: DisruptionSeverity;
  pathNodeIds: string[];
  pathEdgeIds: string[];
}

export interface DependencyGraphResponse {
  nodes: DependencyGraphNode[];
  edges: DependencyGraphEdge[];
  summary: {
    totalNodes: number;
    totalEdges: number;
    disruptedNodesCount: number;
    totalRevenueExposedINR: number;
  };
}

// =============================================================================
// Task 9: Mitigation Recommendation & Scenario Lab
// =============================================================================

export type MitigationStrategyType =
  | 'alternate_supplier'
  | 'expedited_freight'
  | 'inventory_rebalance'
  | 'safety_stock_drawdown'
  | 'split_procurement';

export const MITIGATION_STRATEGY_CONFIG: Record<
  MitigationStrategyType,
  { label: string; badge: string; color: string; bg: string; border: string; description: string }
> = {
  alternate_supplier: {
    label: 'Alternate Sourcing',
    badge: 'Dual / Alternate',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    description: 'Switch purchase allocations to pre-qualified secondary or tertiary suppliers.',
  },
  expedited_freight: {
    label: 'Expedited Freight',
    badge: 'Express Transit',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    description: 'Upgrade standard road/ocean freight to priority air cargo or dedicated express dispatch.',
  },
  inventory_rebalance: {
    label: 'Inventory Transfer',
    badge: 'Inter-Hub Transfer',
    color: 'text-cyan-700',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    description: 'Reallocate safety buffers from regional sister warehouses or unaffected assembly hubs.',
  },
  safety_stock_drawdown: {
    label: 'Buffer Stock Depletion',
    badge: 'Buffer Drawdown',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    description: 'Utilize plant-level emergency reserves with scheduled post-disruption replenishment.',
  },
  split_procurement: {
    label: 'Split Procurement (60/40)',
    badge: 'Split Allocation',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    description: 'Contract partial emergency volume to quick-turnaround supplier while retaining primary tier.',
  },
};

export interface MitigationAssumption {
  id: string;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  description: string;
}

export interface MitigationOption {
  id: string;
  disruptionId: string;
  title: string;
  strategyType: MitigationStrategyType;
  rank: number;
  isRecommended: boolean;
  score: number; // 0–100 deterministic baseline score
  summary: string;
  
  // Quantitative Metrics
  estimatedCostINR: number;
  recoveryTimeDays: number;
  ordersProtectedCount: number;
  ordersAtRiskRemaining: number;
  netRevenueProtectedINR: number;
  feasibilityPercent: number; // 0–100%
  residualRisk: RiskTier;
  
  // Implementation details
  sourceEntity: string;
  targetEntity: string;
  logisticsCarrierOrRoute?: string;
  executionSteps: string[];
  
  // Explainable rationale
  scoringRationale: {
    costEfficiencyScore: number;    // 0–100
    recoverySpeedScore: number;     // 0–100
    feasibilityScore: number;       // 0–100
    operationalEaseScore: number;   // 0–100
    explanation: string;
  };
  
  // Inline editable scenario assumptions
  assumptions: MitigationAssumption[];
}

export interface MitigationDisruptionContext {
  id: string;
  title: string;
  category: DisruptionCategory;
  severity: DisruptionSeverity;
  affectedSupplier: string;
  affectedSupplierId?: string;
  affectedMaterial: string;
  sku: string;
  currentDelayDays: number;
  totalOrdersAtRisk: number;
  totalRevenueAtRiskINR: number;
  options: MitigationOption[];
}

export interface MitigationLabWeights {
  costEfficiency: number;  // 0.35
  recoverySpeed: number;   // 0.35
  feasibility: number;     // 0.20
  operationalEase: number; // 0.10
}

export interface MitigationLabResponse {
  disruptions: MitigationDisruptionContext[];
  selectedDisruptionId: string;
  methodologyNote: string;
  appliedWeights: MitigationLabWeights;
}

// =============================================================================
// Task 10: Human Approval & Action Audit Trail
// =============================================================================

export type ApprovalDecisionStatus =
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'changes_requested';

export type DecisionType =
  | 'mitigation_plan'
  | 'supplier_switch'
  | 'supplier_qualification'
  | 'safety_stock_override'
  | 'sku_phaseout'
  | 'dual_source_split'
  | 'reroute_logistics'
  | 'substitute_sku'
  | 'expedited_freight';

export const APPROVAL_STATUS_CONFIG: Record<
  ApprovalDecisionStatus,
  { label: string; badge: string; color: string; bg: string; border: string }
> = {
  pending_review: {
    label: 'Pending Review',
    badge: 'Pending',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  approved: {
    label: 'Approved',
    badge: 'Approved',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    badge: 'Rejected',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
  changes_requested: {
    label: 'Changes Requested',
    badge: 'Re-simulation Required',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
};

export const DECISION_TYPE_LABELS: Record<DecisionType, string> = {
  mitigation_plan: 'Disruption Recovery Plan',
  supplier_switch: 'Supplier Allocation Switch',
  supplier_qualification: 'Supplier Qualification Gate',
  safety_stock_override: 'Emergency Buffer Drawdown',
  sku_phaseout: 'SKU Transition Execution',
  dual_source_split: 'Dual-Source Volume Split',
  reroute_logistics: 'Logistics Route Diversion',
  substitute_sku: 'SKU Material Substitution',
  expedited_freight: 'Expedited Priority Freight',
};

export interface ApprovalAuditEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: 'submitted' | 'reviewed' | 'approved' | 'rejected' | 'requested_changes' | 'reopened';
  comment: string;
  previousStatus?: ApprovalDecisionStatus;
  newStatus?: ApprovalDecisionStatus;
  metadata?: Record<string, any>;
}

export interface ApprovalDecisionItem {
  id: string; // e.g. APR-2026-001
  title: string;
  decisionType: DecisionType;
  status: ApprovalDecisionStatus;
  urgency: ActionUrgency;
  financialImpactINR: number;
  revenueProtectedINR?: number;
  submittedAt: string;
  submittedBy: {
    name: string;
    role: string;
    email: string;
  };
  assignedApprover: {
    name: string;
    role: string;
  };
  
  // Context linking to ERP and upstream models
  relatedDisruptionId?: string;
  relatedDisruptionTitle?: string;
  relatedSupplierId?: string;
  relatedSupplierName?: string;
  affectedMaterial?: string;
  sku?: string;
  
  // Summary & rationale
  summary: string;
  rationale: string;
  operationalTradeOffs: {
    costINR: number;
    timeDeltaDays: number;
    residualRisk: RiskTier;
    ordersImpacted: number;
  };
  
  // Simulated action steps (what would execute upon approval)
  executionChecklist: {
    step: string;
    responsibleParty: string;
    isSimulated: boolean;
  }[];
  
  // Audit trail history
  auditTrail: ApprovalAuditEntry[];
  
  // Reviewer feedback if evaluated
  resolutionDate?: string;
  resolutionComments?: string;
}

export interface ApprovalFilterParams {
  status?: ApprovalDecisionStatus | 'all';
  decisionType?: DecisionType | 'all';
  urgency?: ActionUrgency | 'all';
  search?: string;
  sortBy?: 'submittedAt' | 'financialImpact' | 'urgency';
  sortOrder?: 'asc' | 'desc';
}

export interface ApprovalActionPayload {
  action: 'approve' | 'reject' | 'request_changes';
  comments: string;
  reviewerName?: string;
  reviewerRole?: string;
}

export interface ApprovalsListResponse {
  data: ApprovalDecisionItem[];
  total: number;
  kpis: {
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    changesRequestedCount: number;
    totalExposureINR: number;
  };
}

// =============================================================================
// Task 11: Stakeholder Alerts & Notification Center
// =============================================================================

export type NotificationCategory =
  | 'risk_alert'
  | 'shipment_delay'
  | 'approval_request'
  | 'recommendation'
  | 'sku_transition';

export const NOTIFICATION_CATEGORY_CONFIG: Record<
  NotificationCategory,
  { label: string; badge: string; color: string; bg: string; border: string }
> = {
  risk_alert: {
    label: 'Risk Alert',
    badge: 'Risk Spike',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
  shipment_delay: {
    label: 'Shipment Delay',
    badge: 'Transit Delay',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  approval_request: {
    label: 'Approval Request',
    badge: 'Governance Sign-Off',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  recommendation: {
    label: 'Mitigation Plan',
    badge: 'Recovery Option',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  sku_transition: {
    label: 'SKU Transition',
    badge: 'Lifecycle Crossover',
    color: 'text-cyan-700',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
  },
};

export interface StakeholderNotification {
  id: string;
  category: NotificationCategory;
  severity: DisruptionSeverity;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  
  // Entity references & target deep link
  targetUrl: string;
  targetLabel: string;
  relatedEntityId?: string;
  relatedEntityName?: string;
  
  // Metrics summary
  metricBadge?: string;
}

export interface NotificationFilterParams {
  category?: NotificationCategory | 'all';
  severity?: DisruptionSeverity | 'all';
  unreadOnly?: boolean;
  search?: string;
}

export interface NotificationsResponse {
  data: StakeholderNotification[];
  total: number;
  unreadCount: number;
  categoryCounts: Record<NotificationCategory, number>;
}

export interface NotificationActionPayload {
  action: 'mark_as_read' | 'mark_as_unread' | 'mark_all_read';
  notificationIds?: string[];
}

// =============================================================================
// Task 12: Outcome Analytics, Post-Mortem & Quality Verification
// =============================================================================

export type OutcomeFinalStatus =
  | 'resolved_ontime'
  | 'resolved_delayed'
  | 'cost_overrun'
  | 'sla_breached'
  | 'escalated';

export const OUTCOME_STATUS_CONFIG: Record<
  OutcomeFinalStatus,
  { label: string; badge: string; color: string; bg: string; border: string }
> = {
  resolved_ontime: {
    label: 'Resolved On-Time',
    badge: 'On-Time Recovery',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  resolved_delayed: {
    label: 'Resolved with Delay',
    badge: 'Delayed Recovery',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  cost_overrun: {
    label: 'Cost Overrun',
    badge: 'Budget Exceeded',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  sla_breached: {
    label: 'SLA Breached',
    badge: 'SLA Penalty Incurred',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
  escalated: {
    label: 'Executive Escalation',
    badge: 'Board Escalation',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
};

export interface DisruptionOutcomeRecord {
  id: string;
  incidentCode: string;
  title: string;
  category: DisruptionCategory;
  severity: DisruptionSeverity;
  incidentDate: string;
  resolutionDate: string;
  recoveryDurationDays: number;
  targetSlaDays: number;
  affectedMaterial: string;
  primarySupplierId: string;
  primarySupplierName: string;
  decisionTaken: string;
  decisionType: DecisionType;
  decisionApprovedBy: string;
  mitigationCostINR: number;
  budgetAllocatedINR: number;
  penaltiesAvoidedINR: number;
  netBenefitINR: number;
  finalStatus: OutcomeFinalStatus;
  slaAdherence: boolean;
  postMortemConducted: boolean;
  postMortemId?: string;
  summaryNotes: string;
}

export interface PostMortemFiveWhys {
  why1: string;
  why2: string;
  why3: string;
  why4: string;
  why5: string;
}

export interface PostMortemActionItem {
  id: string;
  action: string;
  owner: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  impactArea: string;
}

export interface PostMortemRecord {
  id: string;
  outcomeId: string;
  incidentCode: string;
  incidentTitle: string;
  incidentCategory: DisruptionCategory;
  conductedAt: string;
  facilitator: string;
  participants: string[];
  rootCauseCategory:
    | 'supplier_capacity'
    | 'geopolitical_port'
    | 'quality_defect'
    | 'demand_spike'
    | 'single_source_failure'
    | 'weather_force_majeure';
  rootCauseSummary: string;
  fiveWhys: PostMortemFiveWhys;
  whatWentWell: string[];
  whatWentWrong: string[];
  actionItems: PostMortemActionItem[];
  preventivePolicy: string;
  status: 'draft' | 'completed' | 'under_review';
}

export interface RecurringRiskPattern {
  id: string;
  clusterName: string;
  frequencyCount: number;
  affectedCategories: DisruptionCategory[];
  affectedSuppliers: string[];
  averageRecoveryDays: number;
  totalExposureINR: number;
  systemicVulnerability: string;
  strategicRemedy: string;
  riskLevel: 'critical' | 'high' | 'medium';
  recurrenceTrend: 'increasing' | 'stable' | 'decreasing';
}

export interface OutcomeMonthlyTrendPoint {
  month: string;
  incidentsResolved: number;
  avgRecoveryDays: number;
  slaMetPercent: number;
  mitigationCostINR: number;
  penaltiesAvoidedINR: number;
  netBenefitINR: number;
}

export interface SupplierResilienceMetric {
  supplierId: string;
  supplierName: string;
  incidentsInvolved: number;
  resilienceScore: number;
  avgRecoveryDays: number;
  slaAdherenceRate: number;
  tier: RiskTier;
}

export interface OutcomeAnalyticsKpis {
  totalIncidentsAnalyzed: number;
  meanRecoveryDurationDays: number;
  meanRecoveryTargetDays: number;
  slaAdherenceRatePercent: number;
  totalMitigationSpendINR: number;
  totalPenaltiesAvoidedINR: number;
  netAvoidanceValueINR: number;
  postMortemCompletionRatePercent: number;
  recurringRiskClustersCount: number;
}

export interface OutcomeAnalyticsFilterParams {
  dateRange?: '3m' | '6m' | '12m' | 'all';
  category?: DisruptionCategory | 'all';
  finalStatus?: OutcomeFinalStatus | 'all';
  search?: string;
  sortBy?: 'incidentDate' | 'recoveryDurationDays' | 'netBenefitINR' | 'mitigationCostINR';
  sortOrder?: 'asc' | 'desc';
}

export interface OutcomeAnalyticsResponse {
  kpis: OutcomeAnalyticsKpis;
  monthlyTrends: OutcomeMonthlyTrendPoint[];
  outcomes: DisruptionOutcomeRecord[];
  recurringPatterns: RecurringRiskPattern[];
  supplierResilience: SupplierResilienceMetric[];
  postMortems: PostMortemRecord[];
  isSimulated: boolean;
  totalCount: number;
}

export interface PostMortemSubmissionPayload {
  outcomeId: string;
  facilitator: string;
  participants: string[];
  rootCauseCategory:
    | 'supplier_capacity'
    | 'geopolitical_port'
    | 'quality_defect'
    | 'demand_spike'
    | 'single_source_failure'
    | 'weather_force_majeure';
  rootCauseSummary: string;
  fiveWhys: PostMortemFiveWhys;
  whatWentWell: string[];
  whatWentWrong: string[];
  actionItems: Omit<PostMortemActionItem, 'id'>[];
  preventivePolicy: string;
  status: 'draft' | 'completed' | 'under_review';
}








