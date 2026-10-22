import { z } from 'zod';

export const inventoryAdjustSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().refine((v) => v !== 0, 'Quantity cannot be zero'),
  notes: z.string().max(500).optional(),
});

export const inventoryReserveSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive('Quantity must be positive'),
  referenceSoId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

export const inventoryReleaseSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive('Quantity must be positive'),
  referenceSoId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

export type InventoryAdjustInput = z.infer<typeof inventoryAdjustSchema>;
export type InventoryReserveInput = z.infer<typeof inventoryReserveSchema>;
export type InventoryReleaseInput = z.infer<typeof inventoryReleaseSchema>;
