import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorsApi } from '@/services/vendors.api';
import toast from 'react-hot-toast';

export const useVendors = () => {
  const queryClient = useQueryClient();

  const useList = () => {
    return useQuery({
      queryKey: ['vendors'],
      queryFn: () => vendorsApi.list(),
    });
  };

  const createMutation = useMutation({
    mutationFn: vendorsApi.create,
    onSuccess: () => {
      toast.success('Vendor added successfully!');
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add vendor');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: vendorsApi.delete,
    onSuccess: () => {
      toast.success('Vendor removed successfully!');
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove vendor');
    },
  });

  return {
    useList,
    createVendor: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteVendor: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export default useVendors;
