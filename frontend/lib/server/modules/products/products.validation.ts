import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().min(2, 'SKU must be at least 2 characters'),
  productType: z.enum(['raw_material', 'finished_good']).default('finished_good'),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  unitOfMeasure: z.string().default('pcs'),
  salesPrice: z.number().nonnegative().default(0),
  costPrice: z.number().nonnegative().default(0),
  onHandQuantity: z.number().nonnegative().default(0),
  reservedQuantity: z.number().nonnegative().default(0),
  minStockLevel: z.number().nonnegative().default(0),
  reorderQuantity: z.number().nonnegative().default(0),
  procurementType: z.enum(['purchase', 'manufacture']).default('purchase'),
  procurementStrategy: z.enum(['mts', 'mto']).default('mts'),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
