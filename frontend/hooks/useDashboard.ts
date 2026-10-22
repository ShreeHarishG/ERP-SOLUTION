import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard.api';

export const useDashboard = () => {
  const useStats = () => {
    return useQuery({
      queryKey: ['dashboardStats'],
      queryFn: () => dashboardApi.getStats(),
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    useStats,
  };
};
export default useDashboard;
