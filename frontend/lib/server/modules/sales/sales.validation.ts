import { z } from 'zod';

export const createSalesOrderItemSchema = z.object({
  productId: z.string().uuid('Product ID must be a valid UUID'),
  quantityOrdered: z.number().positive('Quantity must be greater than 0'),
  unitPrice: z.number().nonnegative('Unit price cannot be negative'),
});

export const createSalesOrderSchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  customerEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  customerPhone: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  items: z.array(createSalesOrderItemSchema).min(1, 'At least one item is required'),
});

export type CreateSalesOrderInput = z.infer<typeof createSalesOrderSchema>;
