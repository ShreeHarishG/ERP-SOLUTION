import api from '@/lib/api';
import type { ApiProduct } from './products.api';

export interface ApiBomItem {
  id: string;
  bomId: string;
  componentId: string;
  quantity: string | number;
  unitOfMeasure: string;
  notes?: string;
  createdAt: string;
  component: ApiProduct;
}

export interface ApiBom {
  id: string;
  productId: string;
  name: string;
  quantity: string | number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  product: ApiProduct;
  items: ApiBomItem[];
}

export const bomsApi = {
  list: async (): Promise<ApiBom[]> => {
    const res = await api.get('/boms');
    return res.data.data;
  },

  getById: async (id: string): Promise<ApiBom> => {
    const res = await api.get(`/boms/${id}`);
    return res.data.data;
  },

  create: async (payload: any): Promise<ApiBom> => {
    const res = await api.post('/boms', payload);
    return res.data.data;
  },

  update: async (id: string, payload: any): Promise<ApiBom> => {
    const res = await api.put(`/boms/${id}`, payload);
    return res.data.data;
  },

  explode: async (productId: string, quantity: number): Promise<{
    hasBom: boolean;
    bomName?: string;
    materials: {
      componentId: string;
      sku: string;
      product: string;
      required: number;
      available: number;
      shortage: number;
      unitOfMeasure: string;
    }[];
  }> => {
    const res = await api.get('/boms/explode', { params: { productId, quantity } });
    return res.data.data;
  },
};
