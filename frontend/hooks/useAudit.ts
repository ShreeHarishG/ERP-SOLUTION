import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/services/audit.api';

export const useAudit = (filters?: any) => {
  const useList = () => {
    return useQuery({
      queryKey: ['auditLogs', filters],
      queryFn: () => auditApi.list(filters),
    });
  };

  const useActions = () => {
    return useQuery({
      queryKey: ['auditActions'],
      queryFn: () => auditApi.getActions(),
    });
  };

  return {
    useList,
    useActions,
  };
};
export default useAudit;
