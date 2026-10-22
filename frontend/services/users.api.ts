import api from '@/lib/api';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersListResponse {
  users: ApiUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  isActive?: boolean;
}

export const usersApi = {
  list: async (params?: {
    search?: string;
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<UsersListResponse> => {
    const res = await api.get<{ data: UsersListResponse }>('/users', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<ApiUser> => {
    const res = await api.get<{ data: ApiUser }>(`/users/${id}`);
    return res.data.data;
  },

  create: async (payload: CreateUserPayload): Promise<ApiUser> => {
    const res = await api.post<{ data: ApiUser }>('/users', payload);
    return res.data.data;
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<ApiUser> => {
    const res = await api.put<{ data: ApiUser }>(`/users/${id}`, payload);
    return res.data.data;
  },

  toggleStatus: async (id: string): Promise<ApiUser> => {
    const res = await api.patch<{ data: ApiUser }>(`/users/${id}/toggle-status`);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
