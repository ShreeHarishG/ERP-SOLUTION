// =============================================================================
// Onchain Insights — TanStack Query Hooks
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onchainInsightsApi } from '@/services/onchain-insights.api';
import type {
  OnchainDashboardFilters,
  SupplierFilterParams,
  SwitchSimulatorParams,
  OnboardingFormInput,
  ReviewDecisionPayload,
  SkuTransitionParams,
  DisruptionFilterParams,
  DisruptionStatusUpdatePayload,
  ShipmentFilterParams,
  RiskAssessmentFilterParams,
  RiskAssessmentWeights,
  MitigationLabWeights,
  ApprovalFilterParams,
  ApprovalActionPayload,
  NotificationFilterParams,
  NotificationActionPayload,
  OutcomeAnalyticsFilterParams,
  PostMortemSubmissionPayload,
} from '@/types/onchain-insights';

export const useOnchainInsights = () => {
  const queryClient = useQueryClient();
  const CACHE_TIME = 5 * 60 * 1000; // 5 minutes cache for instant navigation

  const useDashboard = (filters: OnchainDashboardFilters) => {
    return useQuery({
      queryKey: ['onchainInsightsDashboard', filters],
      queryFn: () => onchainInsightsApi.getDashboard(filters),
      staleTime: CACHE_TIME,
    });
  };

  const useSuppliers = (filters?: SupplierFilterParams) => {
    return useQuery({
      queryKey: ['onchainSuppliers', filters],
      queryFn: () => onchainInsightsApi.getSuppliers(filters),
      staleTime: CACHE_TIME,
    });
  };

  const useSupplier = (id: string) => {
    return useQuery({
      queryKey: ['onchainSupplierDetail', id],
      queryFn: () => onchainInsightsApi.getSupplierById(id),
      enabled: Boolean(id),
      staleTime: CACHE_TIME,
    });
  };

  const useSupplierComparison = (ids: string[]) => {
    return useQuery({
      queryKey: ['onchainSupplierComparison', ids],
      queryFn: () => onchainInsightsApi.compareSuppliers(ids),
      enabled: ids.length > 0,
      staleTime: CACHE_TIME,
    });
  };

  const useSupplierSwitch = (params?: Partial<SwitchSimulatorParams>) => {
    return useQuery({
      queryKey: ['onchainSupplierSwitch', params],
      queryFn: () => onchainInsightsApi.simulateSwitch(params),
      staleTime: CACHE_TIME,
    });
  };

  // --- Task 3: Onboarding & Review Hooks ---
  const useOnboardingSuppliers = (stage?: string) => {
    return useQuery({
      queryKey: ['onchainOnboardingSuppliers', stage],
      queryFn: () => onchainInsightsApi.getOnboardingSuppliers(stage),
      staleTime: CACHE_TIME,
    });
  };

  const useOnboardingSupplier = (id: string) => {
    return useQuery({
      queryKey: ['onchainOnboardingSupplier', id],
      queryFn: () => onchainInsightsApi.getOnboardingSupplierById(id),
      enabled: Boolean(id),
      staleTime: CACHE_TIME,
    });
  };

  const useSubmitOnboarding = () => {
    return useMutation({
      mutationFn: (input: OnboardingFormInput) => onchainInsightsApi.submitOnboarding(input),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['onchainOnboardingSuppliers'] });
      },
    });
  };

  const useReviewOnboarding = () => {
    return useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Omit<ReviewDecisionPayload, 'supplierId'> }) =>
        onchainInsightsApi.reviewSupplierOnboarding(id, payload),
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['onchainOnboardingSuppliers'] });
        queryClient.invalidateQueries({ queryKey: ['onchainOnboardingSupplier', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['onchainSuppliers'] });
      },
    });
  };

  // --- Task 5: SKU Transition Hook ---
  const useSkuTransition = (params?: Partial<SkuTransitionParams>) => {
    return useQuery({
      queryKey: ['onchainSkuTransition', params],
      queryFn: () => onchainInsightsApi.getSkuTransition(params),
      staleTime: CACHE_TIME,
    });
  };

  // --- Task 6: Disruptions & Shipments Hooks ---
  const useDisruptions = (filters?: DisruptionFilterParams) => {
    return useQuery({
      queryKey: ['onchainDisruptions', filters],
      queryFn: () => onchainInsightsApi.getDisruptions(filters),
      staleTime: CACHE_TIME,
    });
  };

  const useDisruption = (id: string) => {
    return useQuery({
      queryKey: ['onchainDisruptionDetail', id],
      queryFn: () => onchainInsightsApi.getDisruptionById(id),
      enabled: Boolean(id),
      staleTime: CACHE_TIME,
    });
  };

  const useUpdateDisruptionStatus = () => {
    return useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: DisruptionStatusUpdatePayload }) =>
        onchainInsightsApi.updateDisruptionStatus(id, payload),
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['onchainDisruptions'] });
        queryClient.invalidateQueries({ queryKey: ['onchainDisruptionDetail', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['onchainInsightsDashboard'] });
      },
    });
  };

  const useShipments = (filters?: ShipmentFilterParams) => {
    return useQuery({
      queryKey: ['onchainShipments', filters],
      queryFn: () => onchainInsightsApi.getShipments(filters),
      staleTime: CACHE_TIME,
    });
  };

  // --- Task 7: Risk Assessment Hook ---
  const useRiskAssessment = (
    filters?: RiskAssessmentFilterParams,
    weights?: Partial<RiskAssessmentWeights>
  ) => {
    return useQuery({
      queryKey: ['onchainRiskAssessment', filters, weights],
      queryFn: () => onchainInsightsApi.getRiskAssessments(filters, weights),
      staleTime: CACHE_TIME,
    });
  };

  // --- Task 8: Multi-Tier Dependency Graph Hook ---
  const useDependencyGraph = (selectedNodeId?: string) => {
    return useQuery({
      queryKey: ['onchainDependencyGraph', selectedNodeId],
      queryFn: () => onchainInsightsApi.getDependencyGraph(selectedNodeId),
      staleTime: CACHE_TIME,
    });
  };

  // --- Task 9: Mitigation Recommendation & Scenario Lab Hook ---
  const useMitigationLab = (
    disruptionId?: string,
    weights?: Partial<MitigationLabWeights>
  ) => {
    return useQuery({
      queryKey: ['onchainMitigationLab', disruptionId, weights],
      queryFn: () => onchainInsightsApi.getMitigationLab(disruptionId, weights),
      staleTime: CACHE_TIME,
    });
  };

  const useSubmitMitigationApproval = () => {
    return useMutation({
      mutationFn: (payload: {
        optionId: string;
        disruptionId: string;
        modifiedAssumptions?: Record<string, number>;
        comments?: string;
      }) => onchainInsightsApi.submitMitigationApproval(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['onchainMitigationLab'] });
        queryClient.invalidateQueries({ queryKey: ['onchainApprovals'] });
      },
    });
  };

  // --- Task 10: Human Approval & Action Audit Trail Hooks ---
  const useApprovals = (filters?: ApprovalFilterParams) => {
    return useQuery({
      queryKey: ['onchainApprovals', filters],
      queryFn: () => onchainInsightsApi.getApprovals(filters),
      staleTime: CACHE_TIME,
    });
  };

  const useApproval = (id: string) => {
    return useQuery({
      queryKey: ['onchainApproval', id],
      queryFn: () => onchainInsightsApi.getApprovalById(id),
      enabled: Boolean(id),
      staleTime: CACHE_TIME,
    });
  };

  const useActionApproval = () => {
    return useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: ApprovalActionPayload }) =>
        onchainInsightsApi.actionApproval(id, payload),
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['onchainApprovals'] });
        queryClient.invalidateQueries({ queryKey: ['onchainApproval', variables.id] });
      },
    });
  };

  // --- Task 11: Stakeholder Alerts & Notification Center Hooks ---
  const useNotifications = (filters?: NotificationFilterParams, options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: ['onchainNotifications', filters],
      queryFn: () => onchainInsightsApi.getNotifications(filters),
      staleTime: CACHE_TIME,
      enabled: options?.enabled !== undefined ? options.enabled : true,
    });
  };

  const useUpdateNotificationStatus = () => {
    return useMutation({
      mutationFn: (payload: NotificationActionPayload) =>
        onchainInsightsApi.updateNotificationStatus(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['onchainNotifications'] });
      },
    });
  };

  // --- Task 12: Outcome Analytics & Post-Mortem Lab Hooks ---
  const useOutcomeAnalytics = (filters?: OutcomeAnalyticsFilterParams) => {
    return useQuery({
      queryKey: ['onchainOutcomeAnalytics', filters],
      queryFn: () => onchainInsightsApi.getOutcomeAnalytics(filters),
      staleTime: CACHE_TIME,
    });
  };

  const useSubmitPostMortem = () => {
    return useMutation({
      mutationFn: (payload: PostMortemSubmissionPayload) =>
        onchainInsightsApi.submitPostMortem(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['onchainOutcomeAnalytics'] });
      },
    });
  };

  return {
    useDashboard,
    useSuppliers,
    useSupplier,
    useSupplierComparison,
    useSupplierSwitch,
    useOnboardingSuppliers,
    useOnboardingSupplier,
    useSubmitOnboarding,
    useReviewOnboarding,
    useSkuTransition,
    useDisruptions,
    useDisruption,
    useUpdateDisruptionStatus,
    useShipments,
    useRiskAssessment,
    useDependencyGraph,
    useMitigationLab,
    useSubmitMitigationApproval,
    useApprovals,
    useApproval,
    useActionApproval,
    useNotifications,
    useUpdateNotificationStatus,
    useOutcomeAnalytics,
    useSubmitPostMortem,
  };
};

export default useOnchainInsights;



