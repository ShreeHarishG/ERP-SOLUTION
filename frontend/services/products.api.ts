import api from '@/lib/api';

export interface ApiProduct {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category?: string;
  unitOfMeasure: string;
  salesPrice: string | number;
  costPrice: string | number;
  onHandQuantity: string | number;
  reservedQuantity: string | number;
  minStockLevel: string | number;
  reorderQuantity: string | number;
  procurementType: 'purchase' | 'manufacture';
  procurementStrategy: 'mts' | 'mto';
  isActive: boolean;
  createdAt: string;
}

export const productsApi = {
  list: async (params?: {
    search?: string;
    category?: string;
    procurementType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: ApiProduct[]; total: number; page: number; limit: number; totalPages: number }> => {
    const res = await api.get('/products', { params });
    return res.data.data;
  },

  getById: async (id: string): Promise<ApiProduct & { bomHeaders: any[] }> => {
    const res = await api.get(`/products/${id}`);
    return res.data.data;
  },

  create: async (payload: any): Promise<ApiProduct> => {
    const res = await api.post('/products', payload);
    return res.data.data;
  },

  update: async (id: string, payload: any): Promise<ApiProduct> => {
    const res = await api.put(`/products/${id}`, payload);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
