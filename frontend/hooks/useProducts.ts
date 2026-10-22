import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/services/products.api';
import { useProgressiveList } from '@/hooks/useProgressiveList';
import toast from 'react-hot-toast';

export const useProducts = (filters?: any) => {
  const queryClient = useQueryClient();

  const useList = (options?: { initialData?: any }) => {
    const list = useProgressiveList({
      queryKey: ['products', filters],
      fetchPage: (params) => productsApi.list({ ...filters, ...params }),
      initialData: options?.initialData,
    });
    return {
      ...list,
      data: {
        products: list.data,
        total: list.total,
        hasMore: list.hasMore,
      },
    };
  };

  const useGet = (id: string, options?: { initialData?: any }) => {
    return useQuery({
      queryKey: ['product', id],
      queryFn: () => productsApi.getById(id),
      initialData: options?.initialData,
      enabled: !!id,
    });
  };

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      toast.success('Product created successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => productsApi.update(id, payload),
    onSuccess: (data, variables) => {
      toast.success('Product updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      toast.success('Product deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    },
  });

  return {
    useList,
    useGet,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProduct: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
