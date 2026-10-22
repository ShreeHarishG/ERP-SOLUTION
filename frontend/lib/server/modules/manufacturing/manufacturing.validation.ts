import { z } from 'zod';

export const createManufacturingOrderSchema = z.object({
  salesOrderId: z.string().uuid('Sales Order ID must be a valid UUID'),
});

export const rejectManufacturingOrderSchema = z.object({
  reason: z.string().min(2, 'Rejection reason must be at least 2 characters'),
});

export const startManufacturingOrderSchema = z.object({
  machine: z.string().min(1, 'Machine selection is required'),
});

export type CreateManufacturingOrderInput = z.infer<typeof createManufacturingOrderSchema>;
export type RejectManufacturingOrderInput = z.infer<typeof rejectManufacturingOrderSchema>;
export type StartManufacturingOrderInput = z.infer<typeof startManufacturingOrderSchema>;
