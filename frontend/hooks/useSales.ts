import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { salesApi } from '@/services/sales.api';
import toast from 'react-hot-toast';

export const useSales = () => {
  const queryClient = useQueryClient();

  const useList = (options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: ['sales-orders'],
      queryFn: () => salesApi.list(),
      enabled: options?.enabled,
    });
  };

  const useGet = (id: string) => {
    return useQuery({
      queryKey: ['sales-order', id],
      queryFn: () => salesApi.getById(id),
      enabled: !!id,
    });
  };

  const createMutation = useMutation({
    mutationFn: salesApi.create,
    onSuccess: () => {
      toast.success('Sales Order created successfully!');
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create sales order');
    },
  });

  const confirmMutation = useMutation({
    mutationFn: salesApi.confirm,
    onSuccess: (data, id) => {
      toast.success('Order confirmation processed!');
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['sales-order', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-ledger'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to confirm order');
    },
  });

  const deliverMutation = useMutation({
    mutationFn: salesApi.deliver,
    onSuccess: (_data, id) => {
      toast.success('Order delivered!');
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['sales-order', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-ledger'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to deliver order');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: salesApi.cancel,
    onSuccess: (_data, id) => {
      toast.success('Order cancelled');
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['sales-order', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    },
  });

  return {
    useList,
    useGet,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    confirm: confirmMutation.mutateAsync,
    isConfirming: confirmMutation.isPending,
    deliver: deliverMutation.mutateAsync,
    isDelivering: deliverMutation.isPending,
    cancel: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
  };
};
