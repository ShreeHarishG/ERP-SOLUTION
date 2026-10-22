import api from '@/lib/api';

export interface FullAuditLog {
  id: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AuditListResponse {
  logs: FullAuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const auditApi = {
  list: async (params?: {
    userId?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<AuditListResponse> => {
    const res = await api.get<{ data: AuditListResponse }>('/audit', { params });
    return res.data.data;
  },

  getActions: async (): Promise<string[]> => {
    const res = await api.get<{ data: string[] }>('/audit/actions');
    return res.data.data;
  },
};
