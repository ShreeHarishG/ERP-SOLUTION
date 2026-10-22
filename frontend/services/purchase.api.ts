import api from '@/lib/api';
import type { ApiProduct } from './products.api';
import type { ApiSalesOrder } from './sales.api';

export interface ApiPurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  quantityOrdered: string | number;
  quantityReceived: string | number;
  unitCost: string | number;
  product: ApiProduct;
}

export interface ApiVendorQuotation {
  id: string;
  purchaseOrderId: string;
  vendorName: string;
  vendorEmail?: string;
  vendorPhone?: string;
  totalAmount: string | number;
  deliveryDays: number;
  rating?: string | number;
  status: 'pending' | 'selected' | 'rejected';
  createdAt: string;
}

export interface ApiInvoice {
  id: string;
  invoiceNumber: string;
  purchaseOrderId: string;
  vendorName: string;
  amount: string | number;
  status: 'pending' | 'verified';
  createdAt: string;
}

export interface ApiPurchaseOrder {
  id: string;
  orderNumber: string;
  vendorName: string;
  vendorEmail?: string;
  vendorPhone?: string;
  status: 'draft' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
  orderDate: string;
  expectedDelivery?: string;
  notes?: string;
  totalAmount: string | number;
  triggeredBySoId?: string;
  createdAt: string;
  items: ApiPurchaseOrderItem[];
  triggeredBySo?: ApiSalesOrder;
  creator?: {
    name: string;
  };
  quotations?: ApiVendorQuotation[];
  invoices?: ApiInvoice[];
}

export const purchaseApi = {
  list: async (params?: { offset?: number; limit?: number; page?: number }) => {
    const res = await api.get('/purchase', { params });
    return res.data.data as {
      items: ApiPurchaseOrder[];
      page: number;
      limit: number;
      offset: number;
      total: number;
      hasMore: boolean;
    };
  },

  create: async (payload: { productId: string; quantity: number }): Promise<ApiPurchaseOrder> => {
    const res = await api.post('/purchase', payload);
    return res.data.data;
  },

  getById: async (id: string): Promise<ApiPurchaseOrder> => {
    const res = await api.get(`/purchase/${id}`);
    return res.data.data;
  },

  selectQuotation: async (
    id: string,
    payload: { vendorName: string; vendorEmail?: string; vendorPhone?: string; totalAmount: number }
  ): Promise<ApiPurchaseOrder> => {
    const res = await api.post(`/purchase/${id}/quotation`, payload);
    return res.data.data;
  },

  sendRFQ: async (
    id: string,
    payload: { vendorNames: string[] }
  ): Promise<ApiPurchaseOrder> => {
    const res = await api.post(`/purchase/${id}/rfq`, payload);
    return res.data.data;
  },

  confirm: async (id: string): Promise<ApiPurchaseOrder> => {
    const res = await api.post(`/purchase/${id}/confirm`);
    return res.data.data;
  },

  receive: async (
    id: string,
    payload: { checkResult: 'approve' | 'reject'; reason?: string }
  ): Promise<ApiPurchaseOrder> => {
    const res = await api.post(`/purchase/${id}/receive`, payload);
    return res.data.data;
  },
};
