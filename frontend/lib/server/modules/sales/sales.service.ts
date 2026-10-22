import prisma from '@/lib/server/db';
import { createAuditLog } from '@/lib/server/utils/auditLog';
import { generateSalesOrderNumber } from '@/lib/server/utils/order-number';
import { bomsService } from '../boms/boms.service';
import type { UserRole } from '@prisma/client';
import type { CreateSalesOrderInput } from './sales.validation';

function freeQty(onHand: number, reserved: number): number {
  return Math.max(0, onHand - reserved);
}

export class SalesService {
  async list() {
    return prisma.salesOrder.findMany({
      include: {
        items: {
          include: { product: true },
        },
        manufacturingOrders: {
          include: {
            product: true,
            creator: { select: { name: true } },
          },
        },
        purchaseOrders: {
          include: {
            items: { include: { product: true } },
            creator: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        creator: { select: { name: true } },
        manufacturingOrders: {
          include: {
            product: true,
            creator: { select: { name: true } },
          },
        },
        purchaseOrders: {
          include: {
            items: { include: { product: true } },
            creator: { select: { name: true } },
          },
        },
      },
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
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantityOrdered * item.unitPrice,
      0,
    );

    const order = await prisma.$transaction(async (tx) => {
      const orderNumber = await generateSalesOrderNumber(tx);

      const createdOrder = await tx.salesOrder.create({
        data: {
          orderNumber,
          customerName: dto.customerName,
          customerEmail: dto.customerEmail || null,
          customerPhone: dto.customerPhone || null,
          notes: dto.notes || '',
          totalAmount,
          status: 'draft',
          createdBy: actorId,
        },
      });

      await Promise.all(
        dto.items.map((item) =>
          tx.salesOrderItem.create({
            data: {
              salesOrderId: createdOrder.id,
              productId: item.productId,
              quantityOrdered: item.quantityOrdered,
              unitPrice: item.unitPrice,
            },
          }),
        ),
      );

      return createdOrder;
    });

    const fullOrder = await this.getById(order.id);

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'sales_order_created',
      entityType: 'sales_order',
      entityId: order.id,
      entityName: order.orderNumber,
      newValues: JSON.parse(JSON.stringify(fullOrder)),
    });

    return fullOrder;
  }

  async confirm(
    id: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!order) {
      throw Object.assign(new Error('Sales Order not found'), { statusCode: 404 });
    }

    if (!['draft', 'shortage_detected'].includes(order.status)) {
      throw Object.assign(
        new Error('Only draft or shortage-detected orders can be confirmed'),
        { statusCode: 400 },
      );
    }

    const shortagesList: Array<{
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
    }> = [];

    let allFullyReserved = true;

    for (const item of order.items) {
      const onHand = Number(item.product.onHandQuantity);
      const reserved = Number(item.product.reservedQuantity);
      const free = freeQty(onHand, reserved);
      const ordered = Number(item.quantityOrdered);

      if (free < ordered) {
        allFullyReserved = false;
        const shortage = ordered - free;
        const bomExplosion = await bomsService.explode(item.productId, shortage);

        if (bomExplosion.hasBom) {
          await createAuditLog({
            userId: actorId,
            userName: actorName,
            userRole: actorRole,
            action: 'bom_exploded',
            entityType: 'bom',
            entityId: item.productId,
            entityName: bomExplosion.bomName,
            newValues: {
              salesOrderId: order.id,
              orderNumber: order.orderNumber,
              shortageQty: shortage,
              materials: bomExplosion.materials,
            },
          });
        }

        shortagesList.push({
          productId: item.productId,
          productName: item.product.name,
          sku: item.product.sku,
          ordered,
          available: free,
          shortage,
          reserved: free,
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

    const updatedOrder = await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;

        const onHand = Number(product.onHandQuantity);
        const reserved = Number(product.reservedQuantity);
        const free = freeQty(onHand, reserved);
        const ordered = Number(item.quantityOrdered);
        const toReserve = Math.min(ordered, free);

        if (toReserve > 0) {
          const newReserved = reserved + toReserve;

          await tx.product.update({
            where: { id: item.productId },
            data: { reservedQuantity: newReserved },
          });

          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              movementType: 'stock_reservation',
              quantity: toReserve,
              direction: -1,
              quantityBefore: onHand,
              quantityAfter: onHand,
              reservedBefore: reserved,
              reservedAfter: newReserved,
              referenceSoId: order.id,
              notes: `Reserved ${toReserve} for Sales Order ${order.orderNumber}`,
              createdBy: actorId,
            },
          });

          await createAuditLog({
            userId: actorId,
            userName: actorName,
            userRole: actorRole,
            action: 'stock_reserved',
            entityType: 'product',
            entityId: item.productId,
            entityName: product.name,
            newValues: {
              salesOrderId: order.id,
              orderNumber: order.orderNumber,
              quantityReserved: toReserve,
            },
          });
        }
      }

      if (allFullyReserved) {
        return tx.salesOrder.update({
          where: { id },
          data: {
            status: 'ready',
            confirmedBy: actorId,
            confirmedAt: new Date(),
          },
          include: { items: { include: { product: true } } },
        });
      }

      const analysisReport = {
        salesOrderId: order.orderNumber,
        checkedAt: new Date().toISOString(),
        shortages: shortagesList,
      };

      const originalNotes = (order.notes || '').split('\n\n[Shortage Analysis]\n')[0];
      const newNotes =
        originalNotes + '\n\n[Shortage Analysis]\n' + JSON.stringify(analysisReport, null, 2);

      return tx.salesOrder.update({
        where: { id },
        data: {
          status: 'shortage_detected',
          confirmedBy: actorId,
          confirmedAt: new Date(),
          notes: newNotes,
        },
        include: { items: { include: { product: true } } },
      });
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'sales_order_confirmed',
      entityType: 'sales_order',
      entityId: id,
      entityName: order.orderNumber,
      newValues: {
        status: allFullyReserved ? 'ready' : 'shortage_detected',
      },
    });

    if (!allFullyReserved) {
      await createAuditLog({
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        action: 'shortage_detected',
        entityType: 'sales_order',
        entityId: id,
        entityName: order.orderNumber,
        newValues: { shortages: shortagesList },
      });
    }

    return updatedOrder;
  }

  async deliver(
    id: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      throw Object.assign(new Error('Sales Order not found'), { statusCode: 404 });
    }

    if (order.status !== 'ready') {
      throw Object.assign(new Error('Only orders in READY state can be delivered'), {
        statusCode: 400,
      });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const ordered = Number(item.quantityOrdered);
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        const onHand = Number(product?.onHandQuantity || 0);
        const reserved = Number(product?.reservedQuantity || 0);

        if (onHand < ordered) {
          throw Object.assign(
            new Error(
              `Insufficient physical stock to deliver ${item.product.name}. Required: ${ordered}, On hand: ${onHand}`,
            ),
            { statusCode: 400 },
          );
        }

        const newOnHand = onHand - ordered;
        const newReserved = Math.max(0, reserved - ordered);

        await tx.product.update({
          where: { id: item.productId },
          data: {
            onHandQuantity: newOnHand,
            reservedQuantity: newReserved,
          },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            movementType: 'sales_delivery',
            quantity: ordered,
            direction: -1,
            quantityBefore: onHand,
            quantityAfter: newOnHand,
            reservedBefore: reserved,
            reservedAfter: newReserved,
            referenceSoId: order.id,
            notes: `Delivery for Sales Order ${order.orderNumber}`,
            createdBy: actorId,
          },
        });
      }

      return tx.salesOrder.update({
        where: { id },
        data: {
          status: 'delivered',
          deliveredBy: actorId,
          deliveredAt: new Date(),
        },
        include: { items: { include: { product: true } } },
      });
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'sales_order_delivered',
      entityType: 'sales_order',
      entityId: id,
      entityName: order.orderNumber,
      newValues: { status: 'delivered' },
    });

    return updatedOrder;
  }

  async cancel(
    id: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      throw Object.assign(new Error('Sales Order not found'), { statusCode: 404 });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      throw Object.assign(new Error('Cannot cancel a delivered or already cancelled order'), {
        statusCode: 400,
      });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (order.status === 'ready' || order.status === 'shortage_detected') {
        for (const item of order.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) continue;

          const reserved = Number(product.reservedQuantity);
          const ordered = Number(item.quantityOrdered);
          const onHand = Number(product.onHandQuantity);
          const toRelease = Math.min(ordered, reserved);

          if (toRelease > 0) {
            const newReserved = reserved - toRelease;

            await tx.product.update({
              where: { id: item.productId },
              data: { reservedQuantity: newReserved },
            });

            await tx.inventoryMovement.create({
              data: {
                productId: item.productId,
                movementType: 'stock_release',
                quantity: toRelease,
                direction: 1,
                quantityBefore: onHand,
                quantityAfter: onHand,
                reservedBefore: reserved,
                reservedAfter: newReserved,
                referenceSoId: order.id,
                notes: `Released reservation for cancelled order ${order.orderNumber}`,
                createdBy: actorId,
              },
            });
          }
        }
      }

      return tx.salesOrder.update({
        where: { id },
        data: { status: 'cancelled' },
        include: { items: { include: { product: true } } },
      });
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'sales_order_cancelled',
      entityType: 'sales_order',
      entityId: id,
      entityName: order.orderNumber,
      newValues: { status: 'cancelled' },
    });

    return updatedOrder;
  }
}

export const salesService = new SalesService();
