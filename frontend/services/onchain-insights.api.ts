// =============================================================================
// Onchain Insights — API Service
// Provider-pattern: reads NEXT_PUBLIC_ONCHAIN_DATA_MODE to select mock vs api.
// =============================================================================

import api from '@/lib/api';
import type {
  OnchainDashboardData,
  OnchainDashboardFilters,
  SupplierDetail,
  SupplierFilterParams,
  SwitchSimulatorParams,
  SwitchSimulationResult,
  SkuTransitionParams,
  SkuTransitionResult,
  DisruptionSignalDetail,
  DisruptionFilterParams,
  ShipmentTransitRecord,
  ShipmentFilterParams,
  DisruptionStatusUpdatePayload,
  RiskAssessmentWeights,
  RiskAssessmentFilterParams,
  RiskAssessmentResponse,
  DependencyGraphResponse,
  DownstreamImpactSummary,
  MitigationLabResponse,
  MitigationLabWeights,
  ApprovalDecisionItem,
  ApprovalFilterParams,
  ApprovalActionPayload,
  ApprovalsListResponse,
  NotificationFilterParams,
  NotificationsResponse,
  NotificationActionPayload,
  OutcomeAnalyticsFilterParams,
  OutcomeAnalyticsResponse,
  PostMortemSubmissionPayload,
  PostMortemRecord,
} from '@/types/onchain-insights';

const DATA_MODE = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_ONCHAIN_DATA_MODE || 'mock')
  : 'mock';

// --- Dashboard ---
async function fetchDashboardMock(filters: OnchainDashboardFilters): Promise<OnchainDashboardData> {
  const params = new URLSearchParams({
    dateRange: filters.dateRange,
    riskLevel: filters.riskLevel,
    supplierId: filters.supplierId,
  });
  const res = await api.get<{ data: OnchainDashboardData }>(`/onchain-insights/dashboard?${params}`);
  return res.data.data;
}

// --- Suppliers ---
async function fetchSuppliersMock(filters?: SupplierFilterParams): Promise<{ data: SupplierDetail[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.riskTier && filters.riskTier !== 'all') params.set('riskTier', filters.riskTier);
  if (filters?.qualificationStatus && filters.qualificationStatus !== 'all') params.set('qualificationStatus', filters.qualificationStatus);
  if (filters?.country && filters.country !== 'all') params.set('country', filters.country);
  if (filters?.material && filters.material !== 'all') params.set('material', filters.material);
  if (filters?.sortBy) params.set('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);

  const res = await api.get<{ data: SupplierDetail[]; total: number }>(`/onchain-insights/suppliers?${params}`);
  return res.data;
}

async function fetchSupplierByIdMock(id: string): Promise<SupplierDetail> {
  const res = await api.get<{ data: SupplierDetail }>(`/onchain-insights/suppliers/${id}`);
  return res.data.data;
}

async function compareSuppliersMock(ids: string[]): Promise<SupplierDetail[]> {
  const params = new URLSearchParams({ compare: ids.join(',') });
  const res = await api.get<{ data: SupplierDetail[] }>(`/onchain-insights/suppliers?${params}`);
  return res.data.data;
}

// --- Supplier Switching Simulator ---
async function simulateSwitchMock(params?: Partial<SwitchSimulatorParams>): Promise<SwitchSimulationResult> {
  const query = new URLSearchParams();
  if (params?.currentSupplierId) query.set('current', params.currentSupplierId);
  if (params?.alternativeSupplierId) query.set('alternative', params.alternativeSupplierId);
  if (params?.materialName) query.set('material', params.materialName);
  if (params?.annualVolume) query.set('volume', String(params.annualVolume));
  if (params?.currentUnitCost) query.set('currentCost', String(params.currentUnitCost));
  if (params?.alternativeUnitCost) query.set('altCost', String(params.alternativeUnitCost));
  if (params?.splitRatioCurrent !== undefined) query.set('split', String(params.splitRatioCurrent));
  if (params?.switchingCostOneTime !== undefined) query.set('switchingCost', String(params.switchingCostOneTime));
  if (params?.transitionWeeks) query.set('transitionWeeks', String(params.transitionWeeks));

  const res = await api.get<{ data: SwitchSimulationResult }>(`/onchain-insights/supplier-switch?${query}`);
  return res.data.data;
}

// --- Task 5: SKU Transition Planning ---
async function simulateSkuTransitionMock(params?: Partial<SkuTransitionParams>): Promise<{ data: SkuTransitionResult; presets: any[] }> {
  const query = new URLSearchParams();
  if (params?.oldSku) query.set('oldSku', params.oldSku);
  if (params?.newSku) query.set('newSku', params.newSku);
  if (params?.productName) query.set('productName', params.productName);
  if (params?.currentOldInventory !== undefined) query.set('currentOldInventory', String(params.currentOldInventory));
  if (params?.weeklyDemandRate !== undefined) query.set('weeklyDemandRate', String(params.weeklyDemandRate));
  if (params?.newSkuLeadTimeWeeks !== undefined) query.set('newSkuLeadTimeWeeks', String(params.newSkuLeadTimeWeeks));
  if (params?.unitCostOld !== undefined) query.set('unitCostOld', String(params.unitCostOld));
  if (params?.unitCostNew !== undefined) query.set('unitCostNew', String(params.unitCostNew));
  if (params?.holdingCostPerUnitYear !== undefined) query.set('holdingCostPerUnitYear', String(params.holdingCostPerUnitYear));
  if (params?.salvageScrapValuePercent !== undefined) query.set('salvageScrapValuePercent', String(params.salvageScrapValuePercent));

  const res = await api.get<{ data: SkuTransitionResult; presets: any[] }>(`/onchain-insights/sku-transition?${query}`);
  return res.data;
}

// --- API Provider (placeholder for real API integration) ---
async function fetchDashboardApi(filters: OnchainDashboardFilters): Promise<OnchainDashboardData> {
  throw new Error('API mode not configured. Set NEXT_PUBLIC_ONCHAIN_DATA_MODE=mock or provide API credentials.');
}

// --- Provider selector ---
export const onchainInsightsApi = {
  getDashboard: async (filters: OnchainDashboardFilters): Promise<OnchainDashboardData> => {
    if (DATA_MODE === 'api') {
      return fetchDashboardApi(filters);
    }
    return fetchDashboardMock(filters);
  },
  getSuppliers: async (filters?: SupplierFilterParams): Promise<{ data: SupplierDetail[]; total: number }> => {
    return fetchSuppliersMock(filters);
  },
  getSupplierById: async (id: string): Promise<SupplierDetail> => {
    return fetchSupplierByIdMock(id);
  },
  compareSuppliers: async (ids: string[]): Promise<SupplierDetail[]> => {
    return compareSuppliersMock(ids);
  },
  simulateSwitch: async (params?: Partial<SwitchSimulatorParams>): Promise<SwitchSimulationResult> => {
    return simulateSwitchMock(params);
  },

  // --- Task 3: Onboarding & Review Workflow ---
  getOnboardingSuppliers: async (stage?: string): Promise<{ data: any[]; total: number }> => {
    const params = new URLSearchParams();
    if (stage && stage !== 'all') params.set('stage', stage);
    const res = await api.get<{ data: any[]; total: number }>(`/onchain-insights/suppliers/onboard?${params}`);
    return res.data;
  },
  getOnboardingSupplierById: async (id: string): Promise<any> => {
    const res = await api.get<{ data: any }>(`/onchain-insights/suppliers/${id}/review`);
    return res.data.data;
  },
  submitOnboarding: async (input: any): Promise<any> => {
    const res = await api.post<{ data: any; message: string }>('/onchain-insights/suppliers/onboard', input);
    return res.data.data;
  },
  reviewSupplierOnboarding: async (id: string, payload: any): Promise<any> => {
    const res = await api.post<{ data: any; message: string }>(`/onchain-insights/suppliers/${id}/review`, payload);
    return res.data.data;
  },

  // --- Task 5: SKU Transition Planning ---
  getSkuTransition: async (params?: Partial<SkuTransitionParams>): Promise<{ data: SkuTransitionResult; presets: any[] }> => {
    return simulateSkuTransitionMock(params);
  },

  // --- Task 6: Disruption Signals & Shipment Monitoring ---
  getDisruptions: async (filters?: DisruptionFilterParams): Promise<{ data: DisruptionSignalDetail[]; total: number; kpis: any }> => {
    const params = new URLSearchParams();
    if (filters?.severity && filters.severity !== 'all') params.set('severity', filters.severity);
    if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
    if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters?.supplierId && filters.supplierId !== 'all') params.set('supplierId', filters.supplierId);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.sortBy) params.set('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);

    const res = await api.get<{ data: DisruptionSignalDetail[]; total: number; kpis: any }>(`/onchain-insights/disruptions?${params}`);
    return res.data;
  },

  getDisruptionById: async (id: string): Promise<DisruptionSignalDetail> => {
    const res = await api.get<{ data: DisruptionSignalDetail }>(`/onchain-insights/disruptions/${id}`);
    return res.data.data;
  },

  updateDisruptionStatus: async (id: string, payload: DisruptionStatusUpdatePayload): Promise<DisruptionSignalDetail> => {
    const res = await api.patch<{ data: DisruptionSignalDetail; message: string }>(`/onchain-insights/disruptions/${id}`, payload);
    return res.data.data;
  },

  getShipments: async (filters?: ShipmentFilterParams): Promise<{ data: ShipmentTransitRecord[]; total: number }> => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters?.supplierId && filters.supplierId !== 'all') params.set('supplierId', filters.supplierId);
    if (filters?.riskSeverity && filters.riskSeverity !== 'all') params.set('riskSeverity', filters.riskSeverity);
    if (filters?.search) params.set('search', filters.search);

    const res = await api.get<{ data: ShipmentTransitRecord[]; total: number }>(`/onchain-insights/shipments?${params}`);
    return res.data;
  },

  // --- Task 7: Disruption Prediction & Risk Prioritization ---
  getRiskAssessments: async (
    filters?: RiskAssessmentFilterParams,
    weights?: Partial<RiskAssessmentWeights>
  ): Promise<RiskAssessmentResponse> => {
    const params = new URLSearchParams();
    if (filters?.tier && filters.tier !== 'all') params.set('tier', filters.tier);
    if (filters?.horizon && filters.horizon !== 'all') params.set('horizon', filters.horizon);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.sortBy) params.set('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);

    if (weights?.delivery !== undefined) params.set('w_delivery', String(weights.delivery));
    if (weights?.disruption !== undefined) params.set('w_disruption', String(weights.disruption));
    if (weights?.geographic !== undefined) params.set('w_geographic', String(weights.geographic));
    if (weights?.financial !== undefined) params.set('w_financial', String(weights.financial));
    if (weights?.compliance !== undefined) params.set('w_compliance', String(weights.compliance));

    const res = await api.get<RiskAssessmentResponse>(`/onchain-insights/risk-assessment?${params}`);
    return res.data;
  },

  // --- Task 8: Multi-Tier Dependency & Impact Explorer ---
  getDependencyGraph: async (selectedNodeId?: string): Promise<{ data: DependencyGraphResponse; impact: DownstreamImpactSummary }> => {
    const params = new URLSearchParams();
    if (selectedNodeId) params.set('selectedNode', selectedNodeId);
    const res = await api.get<{ data: DependencyGraphResponse; impact: DownstreamImpactSummary }>(`/onchain-insights/dependencies?${params}`);
    return res.data;
  },

  // --- Task 9: Mitigation Recommendation & Scenario Lab ---
  getMitigationLab: async (
    disruptionId?: string,
    weights?: Partial<MitigationLabWeights>
  ): Promise<{ data: MitigationLabResponse }> => {
    const params = new URLSearchParams();
    if (disruptionId) params.set('disruptionId', disruptionId);
    if (weights?.costEfficiency !== undefined) params.set('w_cost', String(weights.costEfficiency));
    if (weights?.recoverySpeed !== undefined) params.set('w_speed', String(weights.recoverySpeed));
    if (weights?.feasibility !== undefined) params.set('w_feas', String(weights.feasibility));
    if (weights?.operationalEase !== undefined) params.set('w_ease', String(weights.operationalEase));

    const res = await api.get<{ data: MitigationLabResponse }>(`/onchain-insights/mitigation?${params}`);
    return res.data;
  },

  submitMitigationApproval: async (payload: {
    optionId: string;
    disruptionId: string;
    modifiedAssumptions?: Record<string, number>;
    comments?: string;
  }): Promise<{ success: boolean; message: string; approvalId: string }> => {
    const res = await api.post<{ success: boolean; message: string; approvalId: string }>(
      '/onchain-insights/mitigation',
      payload
    );
    return res.data;
  },

  // --- Task 10: Human Approval & Action Audit Trail ---
  getApprovals: async (filters?: ApprovalFilterParams): Promise<ApprovalsListResponse> => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters?.decisionType && filters.decisionType !== 'all') params.set('decisionType', filters.decisionType);
    if (filters?.urgency && filters.urgency !== 'all') params.set('urgency', filters.urgency);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.sortBy) params.set('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);

    const res = await api.get<ApprovalsListResponse>(`/onchain-insights/approvals?${params}`);
    return res.data;
  },

  getApprovalById: async (id: string): Promise<ApprovalDecisionItem> => {
    const res = await api.get<{ data: ApprovalDecisionItem }>(`/onchain-insights/approvals/${id}`);
    return res.data.data;
  },

  actionApproval: async (
    id: string,
    payload: ApprovalActionPayload
  ): Promise<{ success: boolean; data: ApprovalDecisionItem; message: string }> => {
    const res = await api.patch<{ success: boolean; data: ApprovalDecisionItem; message: string }>(
      `/onchain-insights/approvals/${id}`,
      payload
    );
    return res.data;
  },

  // --- Task 11: Stakeholder Alerts & Notification Center ---
  getNotifications: async (filters?: NotificationFilterParams): Promise<NotificationsResponse> => {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
    if (filters?.severity && filters.severity !== 'all') params.set('severity', filters.severity);
    if (filters?.unreadOnly) params.set('unreadOnly', 'true');
    if (filters?.search) params.set('search', filters.search);

    const res = await api.get<NotificationsResponse>(`/onchain-insights/notifications?${params}`);
    return res.data;
  },

  updateNotificationStatus: async (
    payload: NotificationActionPayload
  ): Promise<{ success: boolean; unreadCount: number; message: string }> => {
    const res = await api.patch<{ success: boolean; unreadCount: number; message: string }>(
      '/onchain-insights/notifications',
      payload
    );
    return res.data;
  },

  // --- Task 12: Outcome Analytics & Post-Mortem Lab ---
  getOutcomeAnalytics: async (
    filters?: OutcomeAnalyticsFilterParams
  ): Promise<OutcomeAnalyticsResponse> => {
    const params = new URLSearchParams();
    if (filters?.dateRange && filters.dateRange !== 'all') params.set('dateRange', filters.dateRange);
    if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
    if (filters?.finalStatus && filters.finalStatus !== 'all') params.set('finalStatus', filters.finalStatus);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.sortBy) params.set('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);

    const res = await api.get<OutcomeAnalyticsResponse>(`/onchain-insights/analytics?${params}`);
    return res.data;
  },

  submitPostMortem: async (
    payload: PostMortemSubmissionPayload
  ): Promise<{ success: boolean; data: PostMortemRecord; message: string }> => {
    const res = await api.post<{ success: boolean; data: PostMortemRecord; message: string }>(
      '/onchain-insights/analytics',
      payload
    );
    return res.data;
  },
};

export default onchainInsightsApi;


