import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { purchaseApi } from '@/services/purchase.api';
import toast from 'react-hot-toast';

export const usePurchase = () => {
  const queryClient = useQueryClient();

  const useList = (options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: ['purchase-orders'],
      queryFn: () => purchaseApi.list(),
      enabled: options?.enabled,
    });
  };

  const useGet = (id: string) => {
    return useQuery({
      queryKey: ['purchase-order', id],
      queryFn: () => purchaseApi.getById(id),
      enabled: !!id,
    });
  };

  const selectQuotationMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      purchaseApi.selectQuotation(id, payload),
    onSuccess: (_data, vars) => {
      toast.success('Vendor quote selected!');
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to select vendor quote');
    },
  });

  const sendRFQMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { vendorNames: string[] } }) =>
      purchaseApi.sendRFQ(id, payload),
    onSuccess: (_data, vars) => {
      toast.success('Procurement verified & RFQs sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send RFQs');
    },
  });

  const confirmMutation = useMutation({
    mutationFn: purchaseApi.confirm,
    onSuccess: (data, id) => {
      const emailStr = data?.vendorEmail ? ` to ${data.vendorName} (${data.vendorEmail})` : '';
      toast.success(`Purchase Order confirmed and dispatched${emailStr}! Shared with Inventory Manager for tracking.`, {
        duration: 6000,
      });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to confirm purchase order');
    },
  });

  const receiveMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { checkResult: 'approve' | 'reject'; reason?: string } }) =>
      purchaseApi.receive(id, payload),
    onSuccess: (data, vars) => {
      toast.success(`Shipment receipt ${vars.payload.checkResult}ed!`);
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-ledger'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process receipt');
    },
  });

  const createMutation = useMutation({
    mutationFn: purchaseApi.create,
    onSuccess: () => {
      toast.success('Procurement request raised!');
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to raise procurement request');
    },
  });

  return {
    useList,
    useGet,
    selectQuotation: selectQuotationMutation.mutateAsync,
    isSelectingQuotation: selectQuotationMutation.isPending,
    sendRFQ: sendRFQMutation.mutateAsync,
    isSendingRFQ: sendRFQMutation.isPending,
    confirm: confirmMutation.mutateAsync,
    isConfirming: confirmMutation.isPending,
    receive: receiveMutation.mutateAsync,
    isReceiving: receiveMutation.isPending,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
};
