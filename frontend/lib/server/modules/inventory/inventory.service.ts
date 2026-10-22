import prisma from '@/lib/server/db';
import { createAuditLog } from '@/lib/server/utils/auditLog';
import type { UserRole } from '@prisma/client';
import type {
  InventoryAdjustInput,
  InventoryReserveInput,
  InventoryReleaseInput,
} from './inventory.validation';

export class InventoryService {
  async list() {
    return prisma.product.findMany({
      orderBy: { sku: 'asc' },
    });
  }

  async movementsLedger(productId?: string) {
    const where: Record<string, any> = {};
    if (productId) {
      where.productId = productId;
    }

    return prisma.inventoryMovement.findMany({
      where,
      include: {
        product: true,
        creator: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async adjustStock(
    dto: InventoryAdjustInput,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const product = await prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }

    const onHand = Number(product.onHandQuantity);
    const reserved = Number(product.reservedQuantity);
    const newOnHand = onHand + dto.quantity;

    if (newOnHand < 0) {
      throw Object.assign(new Error('Physical stock cannot be adjusted below zero'), {
        statusCode: 400,
      });
    }

    if (newOnHand < reserved) {
      throw Object.assign(
        new Error(`Cannot adjust stock below reservation commitments. Minimum required: ${reserved}`),
        { statusCode: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: dto.productId },
        data: { onHandQuantity: newOnHand },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          productId: dto.productId,
          movementType: 'stock_adjustment',
          quantity: Math.abs(dto.quantity),
          direction: dto.quantity > 0 ? 1 : -1,
          quantityBefore: onHand,
          quantityAfter: newOnHand,
          reservedBefore: reserved,
          reservedAfter: reserved,
          notes: dto.notes || 'Manual stock adjustment',
          createdBy: actorId,
        },
        include: {
          product: true,
          creator: { select: { name: true } },
        },
      });

      return { product: updatedProduct, movement };
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'stock_adjusted',
      entityType: 'product',
      entityId: product.id,
      entityName: product.name,
      newValues: {
        onHandQuantity: newOnHand,
        adjustment: dto.quantity,
        notes: dto.notes,
      },
    });

    return result;
  }

  async reserveStock(
    dto: InventoryReserveInput,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });

      if (!product) {
        throw Object.assign(new Error('Product not found'), { statusCode: 404 });
      }

      const onHand = Number(product.onHandQuantity);
      const reserved = Number(product.reservedQuantity);
      const free = Math.max(0, onHand - reserved);

      if (dto.quantity > free) {
        throw Object.assign(
          new Error(`Insufficient free stock available to reserve. Available: ${free}`),
          { statusCode: 400 }
        );
      }

      const newReserved = reserved + dto.quantity;

      const updatedProduct = await tx.product.update({
        where: { id: dto.productId },
        data: { reservedQuantity: newReserved },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: dto.productId,
          movementType: 'stock_reservation',
          quantity: dto.quantity,
          direction: -1,
          quantityBefore: onHand,
          quantityAfter: onHand,
          reservedBefore: reserved,
          reservedAfter: newReserved,
          referenceSoId: dto.referenceSoId || null,
          notes: dto.notes || `Stock reserved manually`,
          createdBy: actorId,
        },
      });

      await createAuditLog({
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        action: 'stock_reserved',
        entityType: 'product',
        entityId: product.id,
        entityName: product.name,
        newValues: {
          reservedQuantity: newReserved,
          quantityReserved: dto.quantity,
          referenceSoId: dto.referenceSoId,
        },
      });

      return updatedProduct;
    });
  }

  async releaseStock(
    dto: InventoryReleaseInput,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });

      if (!product) {
        throw Object.assign(new Error('Product not found'), { statusCode: 404 });
      }

      const onHand = Number(product.onHandQuantity);
      const reserved = Number(product.reservedQuantity);

      if (dto.quantity > reserved) {
        throw Object.assign(
          new Error(`Cannot release more stock than currently reserved. Reserved: ${reserved}`),
          { statusCode: 400 }
        );
      }

      const newReserved = reserved - dto.quantity;

      const updatedProduct = await tx.product.update({
        where: { id: dto.productId },
        data: { reservedQuantity: newReserved },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: dto.productId,
          movementType: 'reservation_release',
          quantity: dto.quantity,
          direction: 1,
          quantityBefore: onHand,
          quantityAfter: onHand,
          reservedBefore: reserved,
          reservedAfter: newReserved,
          referenceSoId: dto.referenceSoId || null,
          notes: dto.notes || `Stock reservation released manually`,
          createdBy: actorId,
        },
      });

      await createAuditLog({
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        action: 'stock_reservation_released',
        entityType: 'product',
        entityId: product.id,
        entityName: product.name,
        newValues: {
          reservedQuantity: newReserved,
          quantityReleased: dto.quantity,
          referenceSoId: dto.referenceSoId,
        },
      });

      return updatedProduct;
    });
  }
}

export const inventoryService = new InventoryService();
