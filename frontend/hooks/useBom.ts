import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bomsApi } from '@/services/bom.api';
import toast from 'react-hot-toast';

export const useBom = () => {
  const queryClient = useQueryClient();

  const useList = () => {
    return useQuery({
      queryKey: ['boms'],
      queryFn: () => bomsApi.list(),
    });
  };

  const useGet = (id: string) => {
    return useQuery({
      queryKey: ['bom', id],
      queryFn: () => bomsApi.getById(id),
      enabled: !!id,
    });
  };

  const createMutation = useMutation({
    mutationFn: bomsApi.create,
    onSuccess: () => {
      toast.success('BOM created successfully!');
      queryClient.invalidateQueries({ queryKey: ['boms'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create BOM');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => bomsApi.update(id, payload),
    onSuccess: () => {
      toast.success('BOM updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['boms'] });
      queryClient.invalidateQueries({ queryKey: ['bom'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update BOM');
    },
  });

  const useExplode = (productId: string, quantity: number) => {
    return useQuery({
      queryKey: ['bom-explode', productId, quantity],
      queryFn: () => bomsApi.explode(productId, quantity),
      enabled: !!productId && quantity > 0,
    });
  };

  return {
    useList,
    useGet,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    useExplode,
  };
};
