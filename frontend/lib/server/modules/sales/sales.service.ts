import prisma from '@/lib/server/db';
import { cacheInvalidatePrefix } from '@/lib/server/cache';
import { toPageResult } from '@/lib/server/paginate';
import { createAuditLog, createAuditLogs } from '@/lib/server/utils/auditLog';
import { generateSalesOrderNumber } from '@/lib/server/utils/order-number';
import { bomsService } from '../boms/boms.service';
import { deduct, HEAVY_TX, lockProducts, lockSalesOrder, release, reserve } from '../inventory/stock-ledger';
import { Prisma, type UserRole } from '@prisma/client';
import type { CreateSalesOrderInput } from './sales.validation';

const PRICE_OVERRIDE_ROLES: UserRole[] = ['admin', 'product_manager'];

const LIST_INCLUDE = {
  items: {
    select: {
      id: true,
      productId: true,
      quantityOrdered: true,
      unitPrice: true,
      product: { select: { id: true, sku: true, name: true } },
    },
  },
  creator: { select: { name: true } },
} as const;

const ORDER_INCLUDE = {
  items: {
    include: {
      product: { select: { id: true, sku: true, name: true, unitOfMeasure: true, salesPrice: true } },
    },
  },
  creator: { select: { name: true } },
  manufacturingOrders: {
    include: {
      product: { select: { id: true, sku: true, name: true } },
      creator: { select: { name: true } },
    },
  },
  purchaseOrders: {
    include: {
      items: { include: { product: { select: { id: true, sku: true, name: true } } } },
      creator: { select: { name: true } },
    },
  },
} as const;

async function reservedForLine(
  tx: Prisma.TransactionClient,
  salesOrderId: string,
  productId: string,
): Promise<number> {
  const rows = await tx.inventoryMovement.findMany({
    where: { referenceSoId: salesOrderId, productId },
    select: { movementType: true, quantity: true },
  });

  return rows.reduce((total, row) => {
    const qty = Number(row.quantity);
    if (row.movementType === 'stock_reservation') return total + qty;
    if (
      row.movementType === 'stock_release' ||
      row.movementType === 'reservation_release' ||
      row.movementType === 'sales_delivery'
    ) {
      return total - qty;
    }
    return total;
  }, 0);
}

type ShortageRow = {
  productId: string;
  productName: string;
  sku: string;
  ordered: number;
  available: number;
  shortage: number;
  reserved: number;
  hasBom: boolean;
  bomName?: string;
  materialsNeeded: Array<{
    componentId: string;
    productName: string;
    required: number;
    available: number;
    shortage: number;
    unitOfMeasure: string;
  }>;
};

export class SalesService {
  async list(limit = 5, skip = 0, page = 1) {
    const [items, total] = await Promise.all([
      prisma.salesOrder.findMany({
        take: limit,
        skip,
        include: LIST_INCLUDE,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.salesOrder.count(),
    ]);

    return toPageResult(items, total, { page, limit, offset: skip });
  }

  async getById(id: string) {
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      throw Object.assign(new Error('Sales Order not found'), { statusCode: 404 });
    }

    return order;
  }

  async create(
    dto: CreateSalesOrderInput,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const productIds = [...new Set(dto.items.map((item) => item.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true, isActive: true, salesPrice: true },
    });

    const productMap = new Map(products.map((product) => [product.id, product]));
    const missing = productIds.filter((id) => !productMap.has(id));
    if (missing.length > 0) {
      throw Object.assign(new Error('One or more products do not exist'), { statusCode: 400 });
    }

    const inactive = products.filter((product) => !product.isActive);
    if (inactive.length > 0) {
      throw Object.assign(
        new Error(`Inactive products cannot be sold: ${inactive.map((p) => p.sku).join(', ')}`),
        { statusCode: 400 },
      );
    }

    const canOverridePrice = PRICE_OVERRIDE_ROLES.includes(actorRole);
    const priceOverrides: Array<{ sku: string; requested: number; catalog: number }> = [];

    const lineItems = dto.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const catalogPrice = new Prisma.Decimal(product.salesPrice);
      let unitPrice = catalogPrice;

      if (item.unitPrice !== undefined && canOverridePrice) {
        unitPrice = new Prisma.Decimal(item.unitPrice);
        if (!unitPrice.equals(catalogPrice)) {
          priceOverrides.push({
            sku: product.sku,
            requested: Number(item.unitPrice),
            catalog: Number(catalogPrice),
          });
        }
      }

      return {
        productId: item.productId,
        quantityOrdered: item.quantityOrdered,
        unitPrice,
      };
    });

    const totalAmount = lineItems.reduce(
      (sum, item) => sum.add(item.unitPrice.mul(item.quantityOrdered)),
      new Prisma.Decimal(0),
    );

    const fullOrder = await prisma.$transaction(async (tx) => {
      const orderNumber = await generateSalesOrderNumber(tx);

      return tx.salesOrder.create({
        data: {
          orderNumber,
          customerName: dto.customerName,
          customerEmail: dto.customerEmail || null,
          customerPhone: dto.customerPhone || null,
          notes: dto.notes || '',
          totalAmount,
          status: 'draft',
          createdBy: actorId,
          items: { create: lineItems },
        },
        include: ORDER_INCLUDE,
      });
    }, HEAVY_TX);

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'sales_order_created',
      entityType: 'sales_order',
      entityId: fullOrder.id,
      entityName: fullOrder.orderNumber,
      newValues: {
        totalAmount: Number(totalAmount),
        itemCount: lineItems.length,
        priceOverrides: priceOverrides.length > 0 ? priceOverrides : undefined,
      },
    });

    await cacheInvalidatePrefix('list:sales');
    await cacheInvalidatePrefix('dashboard:');
    return fullOrder;
  }

  async confirm(
    id: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const locked = await lockSalesOrder(tx, id);
      if (!locked) {
        throw Object.assign(new Error('Sales Order not found'), { statusCode: 404 });
      }

      if (!['draft', 'shortage_detected'].includes(locked.status)) {
        throw Object.assign(
          new Error('Only draft or shortage-detected orders can be confirmed'),
          { statusCode: 400 },
        );
      }

      const items = await tx.salesOrderItem.findMany({
        where: { salesOrderId: id },
        include: { product: true },
      });

      await lockProducts(
        tx,
        items.map((item) => item.productId),
      );

      const shortagesList: ShortageRow[] = [];
      let allFullyReserved = true;
      const movements: Prisma.InventoryMovementCreateManyInput[] = [];
      const audits: Parameters<typeof createAuditLogs>[0] = [];

      for (const item of items) {
        const ordered = Number(item.quantityOrdered);
        const alreadyReserved = await reservedForLine(tx, id, item.productId);
        const remaining = Math.max(0, ordered - alreadyReserved);
        if (remaining <= 0) continue;

        const fresh = await tx.product.findUnique({ where: { id: item.productId } });
        if (!fresh) continue;

        const free = Math.max(0, Number(fresh.onHandQuantity) - Number(fresh.reservedQuantity));
        const toReserve = Math.min(remaining, free);

        if (toReserve > 0) {
          const mutation = await reserve(tx, item.productId, toReserve);

          movements.push({
            productId: item.productId,
            movementType: 'stock_reservation',
            quantity: toReserve,
            direction: -1,
            quantityBefore: mutation.onHandBefore,
            quantityAfter: mutation.onHandAfter,
            reservedBefore: mutation.reservedBefore,
            reservedAfter: mutation.reservedAfter,
            referenceSoId: locked.id,
            notes: `Reserved ${toReserve} for Sales Order ${locked.orderNumber}`,
            createdBy: actorId,
          });

          audits.push({
            userId: actorId,
            userName: actorName,
            userRole: actorRole,
            action: 'stock_reserved',
            entityType: 'product',
            entityId: item.productId,
            entityName: fresh.name,
            newValues: {
              salesOrderId: locked.id,
              orderNumber: locked.orderNumber,
              quantityReserved: toReserve,
            },
          });
        }

        const reservedNow = alreadyReserved + toReserve;
        if (reservedNow < ordered) {
          allFullyReserved = false;
          const shortage = ordered - reservedNow;
          const bomExplosion = await bomsService.explode(item.productId, shortage);

          if (bomExplosion.hasBom) {
            audits.push({
              userId: actorId,
              userName: actorName,
              userRole: actorRole,
              action: 'bom_exploded',
              entityType: 'bom',
              entityId: item.productId,
              entityName: bomExplosion.bomName,
              newValues: {
                salesOrderId: locked.id,
                orderNumber: locked.orderNumber,
                shortageQty: shortage,
                materials: bomExplosion.materials,
              },
            });
          }

          shortagesList.push({
            productId: item.productId,
            productName: fresh.name,
            sku: fresh.sku,
            ordered,
            available: free,
            shortage,
            reserved: reservedNow,
            hasBom: bomExplosion.hasBom,
            bomName: bomExplosion.bomName,
            materialsNeeded: bomExplosion.materials.map((m) => ({
              componentId: m.componentId,
              productName: m.product,
              required: m.required,
              available: m.available,
              shortage: m.shortage,
              unitOfMeasure: m.unitOfMeasure,
            })),
          });
        }
      }

      if (movements.length > 0) {
        await tx.inventoryMovement.createMany({ data: movements });
      }
      await createAuditLogs(audits, tx);

      if (allFullyReserved) {
        return tx.salesOrder.update({
          where: { id },
          data: {
            status: 'ready',
            confirmedBy: actorId,
            confirmedAt: new Date(),
          },
          include: ORDER_INCLUDE,
        });
      }

      const analysisReport = {
        salesOrderId: locked.orderNumber,
        checkedAt: new Date().toISOString(),
        shortages: shortagesList,
      };
      const originalNotes = (locked.notes || '').split('\n\n[Shortage Analysis]\n')[0];
      const newNotes =
        originalNotes + '\n\n[Shortage Analysis]\n' + JSON.stringify(analysisReport, null, 2);

      const shortageOrder = await tx.salesOrder.update({
        where: { id },
        data: {
          status: 'shortage_detected',
          confirmedBy: actorId,
          confirmedAt: new Date(),
          notes: newNotes,
        },
        include: ORDER_INCLUDE,
      });

      await createAuditLog(
        {
          userId: actorId,
          userName: actorName,
          userRole: actorRole,
          action: 'shortage_detected',
          entityType: 'sales_order',
          entityId: id,
          entityName: locked.orderNumber,
          newValues: { shortages: shortagesList },
        },
        tx,
      );

      return shortageOrder;
    }, HEAVY_TX);

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'sales_order_confirmed',
      entityType: 'sales_order',
      entityId: id,
      entityName: updatedOrder.orderNumber,
      newValues: { status: updatedOrder.status },
    });

    await cacheInvalidatePrefix('list:sales');
    await cacheInvalidatePrefix('list:inventory');
    await cacheInvalidatePrefix('dashboard:');
    return updatedOrder;
  }

  async deliver(
    id: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const locked = await lockSalesOrder(tx, id);
      if (!locked) {
        throw Object.assign(new Error('Sales Order not found'), { statusCode: 404 });
      }

      if (locked.status !== 'ready') {
        throw Object.assign(new Error('Only orders in READY state can be delivered'), {
          statusCode: 400,
        });
      }

      const items = await tx.salesOrderItem.findMany({
        where: { salesOrderId: id },
        include: { product: true },
      });

      await lockProducts(
        tx,
        items.map((item) => item.productId),
      );

      const movements: Prisma.InventoryMovementCreateManyInput[] = [];

      for (const item of items) {
        const ordered = Number(item.quantityOrdered);
        const mutation = await deduct(tx, item.productId, ordered);

        await tx.salesOrderItem.update({
          where: { id: item.id },
          data: { quantityDelivered: ordered },
        });

        movements.push({
          productId: item.productId,
          movementType: 'sales_delivery',
          quantity: ordered,
          direction: -1,
          quantityBefore: mutation.onHandBefore,
          quantityAfter: mutation.onHandAfter,
          reservedBefore: mutation.reservedBefore,
          reservedAfter: mutation.reservedAfter,
          referenceSoId: locked.id,
          notes: `Delivery for Sales Order ${locked.orderNumber}`,
          createdBy: actorId,
        });
      }

      if (movements.length > 0) {
        await tx.inventoryMovement.createMany({ data: movements });
      }

      return tx.salesOrder.update({
        where: { id },
        data: {
          status: 'delivered',
          deliveredBy: actorId,
          deliveredAt: new Date(),
        },
        include: ORDER_INCLUDE,
      });
    }, HEAVY_TX);

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'sales_order_delivered',
      entityType: 'sales_order',
      entityId: id,
      entityName: updatedOrder.orderNumber,
      newValues: { status: 'delivered' },
    });

    await cacheInvalidatePrefix('list:sales');
    await cacheInvalidatePrefix('list:inventory');
    await cacheInvalidatePrefix('dashboard:');
    return updatedOrder;
  }

  async cancel(
    id: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const locked = await lockSalesOrder(tx, id);
      if (!locked) {
        throw Object.assign(new Error('Sales Order not found'), { statusCode: 404 });
      }

      if (['delivered', 'cancelled'].includes(locked.status)) {
        throw Object.assign(new Error('Cannot cancel a delivered or already cancelled order'), {
          statusCode: 400,
        });
      }

      const items = await tx.salesOrderItem.findMany({
        where: { salesOrderId: id },
      });

      if (locked.status === 'ready' || locked.status === 'shortage_detected') {
        await lockProducts(
          tx,
          items.map((item) => item.productId),
        );

        const movements: Prisma.InventoryMovementCreateManyInput[] = [];

        for (const item of items) {
          const toRelease = await reservedForLine(tx, id, item.productId);
          if (toRelease <= 0) continue;

          const mutation = await release(tx, item.productId, toRelease);

          movements.push({
            productId: item.productId,
            movementType: 'stock_release',
            quantity: toRelease,
            direction: 1,
            quantityBefore: mutation.onHandBefore,
            quantityAfter: mutation.onHandAfter,
            reservedBefore: mutation.reservedBefore,
            reservedAfter: mutation.reservedAfter,
            referenceSoId: locked.id,
            notes: `Released reservation for cancelled order ${locked.orderNumber}`,
            createdBy: actorId,
          });
        }

        if (movements.length > 0) {
          await tx.inventoryMovement.createMany({ data: movements });
        }
      }

      return tx.salesOrder.update({
        where: { id },
        data: { status: 'cancelled' },
        include: ORDER_INCLUDE,
      });
    }, HEAVY_TX);

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'sales_order_cancelled',
      entityType: 'sales_order',
      entityId: id,
      entityName: updatedOrder.orderNumber,
      newValues: { status: 'cancelled' },
    });

    await cacheInvalidatePrefix('list:sales');
    await cacheInvalidatePrefix('list:inventory');
    await cacheInvalidatePrefix('dashboard:');
    return updatedOrder;
  }
}

export const salesService = new SalesService();
