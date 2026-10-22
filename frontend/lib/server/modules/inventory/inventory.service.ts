import prisma from '@/lib/server/db';
import { createAuditLog } from '@/lib/server/utils/auditLog';
import type { UserRole } from '@prisma/client';
import type {
  InventoryAdjustInput,
  InventoryReserveInput,
  InventoryReleaseInput,
} from './inventory.validation';
import { adjustOnHand, HEAVY_TX, release, reserve } from './stock-ledger';

export class InventoryService {
  async list() {
    return prisma.product.findMany({
      orderBy: { sku: 'asc' },
    });
  }

  async movementsLedger(productId?: string, limit = 50, skip = 0) {
    const where: Record<string, unknown> = {};
    if (productId) {
      where.productId = productId;
    }

    return prisma.inventoryMovement.findMany({
      where,
      take: limit,
      skip,
      include: {
        product: { select: { id: true, sku: true, name: true } },
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
    return prisma.$transaction(async (tx) => {
      const mutation = await adjustOnHand(tx, dto.productId, dto.quantity);

      const movement = await tx.inventoryMovement.create({
        data: {
          productId: dto.productId,
          movementType: 'stock_adjustment',
          quantity: mutation.quantity,
          direction: dto.quantity > 0 ? 1 : -1,
          quantityBefore: mutation.onHandBefore,
          quantityAfter: mutation.onHandAfter,
          reservedBefore: mutation.reservedBefore,
          reservedAfter: mutation.reservedAfter,
          notes: dto.notes || 'Manual stock adjustment',
          createdBy: actorId,
        },
        include: {
          product: { select: { id: true, sku: true, name: true } },
          creator: { select: { name: true } },
        },
      });

      await createAuditLog(
        {
          userId: actorId,
          userName: actorName,
          userRole: actorRole,
          action: 'stock_adjusted',
          entityType: 'product',
          entityId: mutation.id,
          entityName: mutation.name,
          newValues: {
            onHandQuantity: mutation.onHandAfter,
            adjustment: dto.quantity,
            notes: dto.notes,
          },
        },
        tx,
      );

      const product = await tx.product.findUnique({ where: { id: dto.productId } });
      return { product, movement };
    }, HEAVY_TX);
  }

  async reserveStock(
    dto: InventoryReserveInput,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    return prisma.$transaction(async (tx) => {
      const mutation = await reserve(tx, dto.productId, dto.quantity);

      await tx.inventoryMovement.create({
        data: {
          productId: dto.productId,
          movementType: 'stock_reservation',
          quantity: dto.quantity,
          direction: -1,
          quantityBefore: mutation.onHandBefore,
          quantityAfter: mutation.onHandAfter,
          reservedBefore: mutation.reservedBefore,
          reservedAfter: mutation.reservedAfter,
          referenceSoId: dto.referenceSoId || null,
          notes: dto.notes || 'Stock reserved manually',
          createdBy: actorId,
        },
      });

      await createAuditLog(
        {
          userId: actorId,
          userName: actorName,
          userRole: actorRole,
          action: 'stock_reserved',
          entityType: 'product',
          entityId: mutation.id,
          entityName: mutation.name,
          newValues: {
            reservedQuantity: mutation.reservedAfter,
            quantityReserved: dto.quantity,
            referenceSoId: dto.referenceSoId,
          },
        },
        tx,
      );

      return tx.product.findUnique({ where: { id: dto.productId } });
    }, HEAVY_TX);
  }

  async releaseStock(
    dto: InventoryReleaseInput,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    return prisma.$transaction(async (tx) => {
      const mutation = await release(tx, dto.productId, dto.quantity);

      await tx.inventoryMovement.create({
        data: {
          productId: dto.productId,
          movementType: 'reservation_release',
          quantity: dto.quantity,
          direction: 1,
          quantityBefore: mutation.onHandBefore,
          quantityAfter: mutation.onHandAfter,
          reservedBefore: mutation.reservedBefore,
          reservedAfter: mutation.reservedAfter,
          referenceSoId: dto.referenceSoId || null,
          notes: dto.notes || 'Stock reservation released manually',
          createdBy: actorId,
        },
      });

      await createAuditLog(
        {
          userId: actorId,
          userName: actorName,
          userRole: actorRole,
          action: 'stock_reservation_released',
          entityType: 'product',
          entityId: mutation.id,
          entityName: mutation.name,
          newValues: {
            reservedQuantity: mutation.reservedAfter,
            quantityReleased: dto.quantity,
            referenceSoId: dto.referenceSoId,
          },
        },
        tx,
      );

      return tx.product.findUnique({ where: { id: dto.productId } });
    }, HEAVY_TX);
  }
}

export const inventoryService = new InventoryService();
