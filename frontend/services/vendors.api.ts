import api from '@/lib/api';

export interface ApiVendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export const vendorsApi = {
  list: async (): Promise<ApiVendor[]> => {
    const res = await api.get('/vendors');
    return res.data.data;
  },

  create: async (payload: { name: string; email?: string; phone?: string }): Promise<ApiVendor> => {
    const res = await api.post('/vendors', payload);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/vendors?id=${id}`);
  },
};
