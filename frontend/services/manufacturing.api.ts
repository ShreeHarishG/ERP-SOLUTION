import api from '@/lib/api';
import type { ApiProduct } from './products.api';
import type { ApiSalesOrder } from './sales.api';

export interface ApiManufacturingOrder {
  id: string;
  orderNumber: string;
  productId: string;
  bomId: string;
  quantityToProduce: string | number;
  quantityProduced: string | number;
  status: 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'WAITING_FOR_PROCUREMENT' | 'READY_TO_START';
  scheduledStart?: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  notes?: string;
  triggeredBySoId?: string;
  createdAt: string;
  product: ApiProduct;
  bom: any;
  triggeredBySo?: ApiSalesOrder;
  creator?: {
    name: string;
  };
}

export const manufacturingApi = {
  list: async (): Promise<ApiManufacturingOrder[]> => {
    const res = await api.get('/manufacturing');
    return res.data.data;
  },

  getById: async (id: string): Promise<ApiManufacturingOrder> => {
    const res = await api.get(`/manufacturing/${id}`);
    return res.data.data;
  },

  createFromSo: async (payload: { salesOrderId: string }): Promise<ApiManufacturingOrder[]> => {
    const res = await api.post('/manufacturing', payload);
    return res.data.data;
  },

  approve: async (id: string): Promise<ApiManufacturingOrder> => {
    const res = await api.post(`/manufacturing/${id}/approve`);
    return res.data.data;
  },

  reject: async (id: string, reason: string): Promise<ApiManufacturingOrder> => {
    const res = await api.post(`/manufacturing/${id}/reject`, { reason });
    return res.data.data;
  },

  start: async (id: string, machine: string): Promise<ApiManufacturingOrder> => {
    const res = await api.post(`/manufacturing/${id}/start`, { machine });
    return res.data.data;
  },

  complete: async (id: string): Promise<ApiManufacturingOrder> => {
    const res = await api.post(`/manufacturing/${id}/complete`);
    return res.data.data;
  },
};
