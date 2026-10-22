import api from '@/lib/api';
import type { ApiProduct } from './products.api';

export interface ApiSalesOrderItem {
  id: string;
  salesOrderId: string;
  productId: string;
  quantityOrdered: string | number;
  quantityDelivered: string | number;
  unitPrice: string | number;
  subtotal: string | number;
  createdAt: string;
  product: ApiProduct;
}

export interface ApiSalesOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  status: 'draft' | 'confirmed' | 'shortage_detected' | 'ready' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDelivery?: string;
  notes?: string;
  totalAmount: string | number;
  confirmedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  items: ApiSalesOrderItem[];
  creator?: {
    name: string;
  };
}

export const salesApi = {
  list: async (): Promise<ApiSalesOrder[]> => {
    const res = await api.get('/sales');
    return res.data.data;
  },

  getById: async (id: string): Promise<ApiSalesOrder> => {
    const res = await api.get(`/sales/${id}`);
    return res.data.data;
  },

  create: async (payload: any): Promise<ApiSalesOrder> => {
    const res = await api.post('/sales', payload);
    return res.data.data;
  },

  confirm: async (id: string): Promise<ApiSalesOrder> => {
    const res = await api.post(`/sales/${id}/confirm`);
    return res.data.data;
  },

  deliver: async (id: string): Promise<ApiSalesOrder> => {
    const res = await api.post(`/sales/${id}/deliver`);
    return res.data.data;
  },

  cancel: async (id: string): Promise<ApiSalesOrder> => {
    const res = await api.post(`/sales/${id}/cancel`);
    return res.data.data;
  },
};
