import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/services/inventory.api';
import toast from 'react-hot-toast';

export const useInventory = (productId?: string) => {
  const queryClient = useQueryClient();

  const useBalances = () => {
    return useQuery({
      queryKey: ['inventory-balances'],
      queryFn: () => inventoryApi.list(),
    });
  };

  const useLedger = () => {
    return useQuery({
      queryKey: ['inventory-ledger', productId],
      queryFn: () => inventoryApi.movementsLedger(productId),
    });
  };

  const adjustStockMutation = useMutation({
    mutationFn: inventoryApi.adjustStock,
    onSuccess: () => {
      toast.success('Stock level adjusted successfully!');
      queryClient.invalidateQueries({ queryKey: ['inventory-balances'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to adjust stock');
    },
  });

  return {
    useBalances,
    useLedger,
    adjustStock: adjustStockMutation.mutateAsync,
    isAdjusting: adjustStockMutation.isPending,
  };
};
