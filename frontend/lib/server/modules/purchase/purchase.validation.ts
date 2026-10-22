import { z } from 'zod';

export const selectQuotationSchema = z.object({
  vendorName: z.string().min(2, 'Vendor name is required'),
  vendorEmail: z.string().email('Valid email is required').optional().or(z.literal('')),
  vendorPhone: z.string().optional().or(z.literal('')),
  totalAmount: z.number().positive('Total price must be positive'),
});

export const receivePurchaseOrderSchema = z.object({
  checkResult: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
});

export const sendRFQSchema = z.object({
  vendorNames: z.array(z.string()).min(1, 'Select at least one vendor to send RFQ'),
});

export type SelectQuotationInput = z.infer<typeof selectQuotationSchema>;
export type ReceivePurchaseOrderInput = z.infer<typeof receivePurchaseOrderSchema>;
export type SendRFQInput = z.infer<typeof sendRFQSchema>;
