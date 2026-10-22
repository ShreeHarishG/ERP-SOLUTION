import prisma from '@/lib/server/db';
import { cacheInvalidatePrefix } from '@/lib/server/cache';
import { toPageResult } from '@/lib/server/paginate';
import { createAuditLog } from '@/lib/server/utils/auditLog';
import type { UserRole } from '@prisma/client';
import type {
  InventoryAdjustInput,
  InventoryReserveInput,
  InventoryReleaseInput,
} from './inventory.validation';
import { adjustOnHand, HEAVY_TX, release, reserve } from './stock-ledger';

export class InventoryService {
  async list(limit = 5, skip = 0, page = 1) {
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        take: limit,
        skip,
        orderBy: { sku: 'asc' },
        select: {
          id: true,
          name: true,
          sku: true,
          category: true,
          unitOfMeasure: true,
          salesPrice: true,
          costPrice: true,
          onHandQuantity: true,
          reservedQuantity: true,
          minStockLevel: true,
          reorderQuantity: true,
          procurementType: true,
          isActive: true,
        },
      }),
      prisma.product.count(),
    ]);

    return toPageResult(items, total, { page, limit, offset: skip });
  }

  async summary() {
    const products = await prisma.product.findMany({
      select: {
        onHandQuantity: true,
        reservedQuantity: true,
        costPrice: true,
        minStockLevel: true,
        procurementType: true,
      },
    });

    let inventoryValue = 0;
    let reserved = 0;
    let lowStock = 0;
    let purchaseSkus = 0;

    for (const product of products) {
      const onHand = Number(product.onHandQuantity);
      const reservedQty = Number(product.reservedQuantity);
      inventoryValue += onHand * Number(product.costPrice);
      reserved += reservedQty;
      if (onHand - reservedQty <= Number(product.minStockLevel)) lowStock += 1;
      if (product.procurementType === 'purchase') purchaseSkus += 1;
    }

    return {
      total: products.length,
      inventoryValue,
      reserved,
      lowStock,
      incomingEstimate: purchaseSkus * 25,
    };
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
      await cacheInvalidatePrefix('list:inventory');
      await cacheInvalidatePrefix('list:products');
      await cacheInvalidatePrefix('dashboard:');
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
