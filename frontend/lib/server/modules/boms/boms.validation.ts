import { z } from 'zod';

export const createBomItemSchema = z.object({
  componentId: z.string().uuid('Component ID must be a valid UUID'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitOfMeasure: z.string().default('pcs'),
  notes: z.string().optional().nullable(),
});

export const createBomSchema = z.object({
  productId: z.string().uuid('Product ID must be a valid UUID'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  quantity: z.number().positive('Quantity must be greater than 0').default(1),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  items: z.array(createBomItemSchema).min(1, 'At least one component item is required'),
});

export type CreateBomInput = z.infer<typeof createBomSchema>;
