import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { manufacturingApi } from '@/services/manufacturing.api';
import toast from 'react-hot-toast';

export const useManufacturing = () => {
  const queryClient = useQueryClient();

  const useList = (options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: ['manufacturing-orders'],
      queryFn: () => manufacturingApi.list(),
      enabled: options?.enabled,
    });
  };

  const useGet = (id: string) => {
    return useQuery({
      queryKey: ['manufacturing-order', id],
      queryFn: () => manufacturingApi.getById(id),
      enabled: !!id,
    });
  };

  const createMutation = useMutation({
    mutationFn: manufacturingApi.createFromSo,
    onSuccess: (_data, vars) => {
      toast.success('Production request raised successfully!');
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['sales-order'] });
      if (vars?.salesOrderId) {
        queryClient.invalidateQueries({ queryKey: ['sales-order', vars.salesOrderId] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to request production');
    },
  });

  const approveMutation = useMutation({
    mutationFn: manufacturingApi.approve,
    onSuccess: (data, id) => {
      toast.success('Production request approved!');
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-order', id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      manufacturingApi.reject(id, reason),
    onSuccess: (_data, vars) => {
      toast.success('Production request rejected');
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-order', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    },
  });

  const startMutation = useMutation({
    mutationFn: ({ id, machine }: { id: string; machine: string }) =>
      manufacturingApi.start(id, machine),
    onSuccess: (_data, vars) => {
      toast.success('Manufacturing run started!');
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-order', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-ledger'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start manufacturing');
    },
  });

  const completeMutation = useMutation({
    mutationFn: manufacturingApi.complete,
    onSuccess: (data, id) => {
      toast.success('Manufacturing run completed!');
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-order', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      if (data.triggeredBySoId) {
        queryClient.invalidateQueries({ queryKey: ['sales-order', data.triggeredBySoId] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-ledger'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete manufacturing');
    },
  });

  return {
    useList,
    useGet,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    approve: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    reject: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
    start: startMutation.mutateAsync,
    isStarting: startMutation.isPending,
    complete: completeMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
  };
};
