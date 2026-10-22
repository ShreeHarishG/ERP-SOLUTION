import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard.api';

export const useDashboard = (role?: string) => {
  const useStats = (options?: { initialData?: any }) => {
    return useQuery({
      queryKey: ['dashboardStats', role],
      queryFn: () => dashboardApi.getStats(role),
      staleTime: 5 * 60 * 1000,
      initialData: options?.initialData,
    });
  };

  return {
    useStats,
  };
};
export default useDashboard;
