import api from '@/lib/api';
import type { ApiProduct } from './products.api';

export interface ApiInventoryMovement {
  id: string;
  productId: string;
  movementType: 'stock_adjustment' | 'stock_reservation' | 'reservation_release' | 'purchase_receipt' | 'sales_delivery' | 'manufacturing_consume' | 'manufacturing_produce';
  quantity: string | number;
  direction: number;
  quantityBefore: string | number;
  quantityAfter: string | number;
  notes?: string;
  createdAt: string;
  product: ApiProduct;
  creator?: {
    name: string;
  };
}

export const inventoryApi = {
  list: async (): Promise<ApiProduct[]> => {
    const res = await api.get('/inventory');
    return res.data.data;
  },

  adjustStock: async (payload: {
    productId: string;
    quantity: number;
    notes?: string;
  }): Promise<{ product: ApiProduct; movement: ApiInventoryMovement }> => {
    const res = await api.post('/inventory/adjust', payload);
    return res.data.data;
  },

  movementsLedger: async (productId?: string): Promise<ApiInventoryMovement[]> => {
    const res = await api.get('/inventory/movements', { params: { productId } });
    return res.data.data;
  },
};
