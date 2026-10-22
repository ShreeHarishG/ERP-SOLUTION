import prisma from '@/lib/server/db';
import { createAuditLog } from '@/lib/server/utils/auditLog';
import { generateManufacturingOrderNumber } from '@/lib/server/utils/order-number';
import { bomsService } from '../boms/boms.service';
import type { UserRole } from '@prisma/client';

async function mapMOStatus(mo: any) {
  if (mo && mo.status === 'confirmed') {
    // Check component availability
    const bomExplosion = await bomsService.explode(mo.productId, Number(mo.quantityToProduce));
    const hasShortages = bomExplosion.materials.some((mat) => mat.shortage > 0);
    mo.status = hasShortages ? 'WAITING_FOR_PROCUREMENT' : 'READY_TO_START';
  }
  return mo;
}

export class ManufacturingService {
  async list() {
    const orders = await prisma.manufacturingOrder.findMany({
      include: {
        product: true,
        bom: {
          include: {
            items: {
              include: {
                component: true,
              },
            },
          },
        },
        triggeredBySo: true,
        creator: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(orders.map(mapMOStatus));
  }

  async getById(id: string) {
    const order = await prisma.manufacturingOrder.findUnique({
      where: { id },
      include: {
        product: true,
        bom: {
          include: {
            items: {
              include: {
                component: true,
              },
            },
          },
        },
        triggeredBySo: true,
        creator: { select: { name: true } },
      },
    });

    if (!order) {
      throw Object.assign(new Error('Manufacturing Order not found'), { statusCode: 404 });
    }

    return mapMOStatus(order);
  }

  async createFromSalesOrder(
    salesOrderId: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const salesOrder = await prisma.salesOrder.findUnique({
      where: { id: salesOrderId },
      include: { items: { include: { product: true } } },
    });

    if (!salesOrder) {
      throw Object.assign(new Error('Sales Order not found'), { statusCode: 404 });
    }

    // Guard: check if an active (non-cancelled) MO already exists for this sales order
    const existingMOs = await prisma.manufacturingOrder.findMany({
      where: {
        triggeredBySoId: salesOrderId,
        status: { notIn: ['cancelled'] },
      },
    });

    if (existingMOs.length > 0) {
      throw Object.assign(
        new Error('A production request for this sales order already exists. Check the Manufacturing workspace.'),
        { statusCode: 409 }
      );
    }

    const createdOrders = await prisma.$transaction(async (tx) => {
      const ordersToCreate: any[] = [];
      
      for (const item of salesOrder.items) {
        const reservationMvs = await tx.inventoryMovement.findMany({
          where: {
            referenceSoId: salesOrderId,
            productId: item.productId,
            movementType: 'stock_reservation',
          },
        });
        const reservedForThisSo = reservationMvs.reduce((sum, mv) => sum + Number(mv.quantity), 0);
        const ordered = Number(item.quantityOrdered);
        const shortage = Math.max(0, ordered - reservedForThisSo);

        if (shortage > 0) {
          const activeBom = await tx.bom.findFirst({
            where: { productId: item.productId, isActive: true },
          });
          if (!activeBom) {
            throw Object.assign(
              new Error(`No active Bill of Materials found for product ${item.product.name}`),
              { statusCode: 400 }
            );
          }

          // Generate a unique MO order number
          const orderNumber = await generateManufacturingOrderNumber(tx);

          const mo = await tx.manufacturingOrder.create({
            data: {
              orderNumber,
              productId: item.productId,
              bomId: activeBom.id,
              quantityToProduce: shortage,
              status: 'draft',
              triggeredBySoId: salesOrderId,
              createdBy: actorId,
              notes: `Triggered from Sales Order ${salesOrder.orderNumber} for shortage of ${shortage} ${item.product.unitOfMeasure}.`,
            },
            include: {
              product: true,
              bom: {
                include: {
                  items: {
                    include: {
                      component: true,
                    },
                  },
                },
              },
              triggeredBySo: true,
              creator: { select: { name: true } },
            },
          });

          ordersToCreate.push(mo);

          await createAuditLog({
            userId: actorId,
            userName: actorName,
            userRole: actorRole,
            action: 'manufacturing_order_created',
            entityType: 'manufacturing_order',
            entityId: mo.id,
            entityName: mo.orderNumber,
            newValues: JSON.parse(JSON.stringify(mo)),
          });
        }
      }
      
      return ordersToCreate;
    }, { maxWait: 5000, timeout: 20000 });

    return Promise.all(createdOrders.map(mapMOStatus));
  }

  async approve(
    id: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const existing = await prisma.manufacturingOrder.findUnique({
      where: { id },
    });
    if (!existing) {
      throw Object.assign(new Error('Manufacturing Order not found'), { statusCode: 404 });
    }
    if (existing.status === 'confirmed') {
      return mapMOStatus(existing);
    }
    if (existing.status !== 'draft') {
      throw Object.assign(new Error('Only draft manufacturing orders can be approved'), { statusCode: 400 });
    }

    const updated = await prisma.manufacturingOrder.update({
      where: { id },
      data: {
        status: 'confirmed',
        notes: `${existing.notes || ''}\n\n[Approved] Production approved by ${actorName}. Awaiting execution.`,
      },
      include: {
        product: true,
        bom: {
          include: {
            items: {
              include: {
                component: true,
              },
            },
          },
        },
        triggeredBySo: true,
        creator: { select: { name: true } },
      },
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'manufacturing_order_started', // audit action representing status updates
      entityType: 'manufacturing_order',
      entityId: id,
      entityName: updated.orderNumber,
      newValues: { status: 'confirmed' },
    });

    return mapMOStatus(updated);
  }

  async reject(
    id: string,
    reason: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const existing = await prisma.manufacturingOrder.findUnique({
      where: { id },
    });
    if (!existing) {
      throw Object.assign(new Error('Manufacturing Order not found'), { statusCode: 404 });
    }
    if (existing.status !== 'draft') {
      throw Object.assign(new Error('Only draft manufacturing orders can be rejected'), { statusCode: 400 });
    }

    const updated = await prisma.manufacturingOrder.update({
      where: { id },
      data: {
        status: 'cancelled',
        notes: `${existing.notes || ''}\n\n[Rejected] Rejected by ${actorName}. Reason: ${reason}`,
      },
      include: {
        product: true,
        bom: {
          include: {
            items: {
              include: {
                component: true,
              },
            },
          },
        },
        triggeredBySo: true,
        creator: { select: { name: true } },
      },
    });

    if (existing.triggeredBySoId) {
      const so = await prisma.salesOrder.findUnique({
        where: { id: existing.triggeredBySoId },
      });
      if (so) {
        const soNotes = so.notes || '';
        const cleanNotes = soNotes.split('\n\n[Production Rejected]')[0];
        await prisma.salesOrder.update({
          where: { id: existing.triggeredBySoId },
          data: {
            notes: `${cleanNotes}\n\n[Production Rejected] Rejection reason: ${reason}`,
          },
        });
      }
    }

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'manufacturing_order_cancelled',
      entityType: 'manufacturing_order',
      entityId: id,
      entityName: existing.orderNumber,
      newValues: { status: 'cancelled', reason },
    });

    return mapMOStatus(updated);
  }

  async start(
    id: string,
    machine: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const updated = await prisma.$transaction(async (tx) => {
      const mo = await tx.manufacturingOrder.findUnique({
        where: { id },
        include: {
          bom: {
            include: {
              items: {
                include: {
                  component: true,
                },
              },
            },
          },
        },
      });

      if (!mo) {
        throw Object.assign(new Error('Manufacturing Order not found'), { statusCode: 404 });
      }

      if (mo.status !== 'confirmed') {
        throw Object.assign(new Error('Only confirmed manufacturing orders can be started'), { statusCode: 400 });
      }

      // Verify and consume components
      for (const item of mo.bom.items) {
        const required = (Number(item.quantity) / Number(mo.bom.quantity)) * Number(mo.quantityToProduce);
        const onHand = Number(item.component.onHandQuantity);

        if (onHand < required) {
          throw Object.assign(
            new Error(`Insufficient stock for component ${item.component.name}. Required: ${required}, On Hand: ${onHand}`),
            { statusCode: 400 }
          );
        }

        const newOnHand = onHand - required;

        await tx.product.update({
          where: { id: item.componentId },
          data: { onHandQuantity: newOnHand },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: item.componentId,
            movementType: 'manufacturing_consume',
            quantity: required,
            direction: -1,
            quantityBefore: onHand,
            quantityAfter: newOnHand,
            referenceMoId: id,
            notes: `Consumed for Manufacturing Order ${mo.orderNumber} on line ${machine}`,
            createdBy: actorId,
          },
        });
      }

      return tx.manufacturingOrder.update({
        where: { id },
        data: {
          status: 'in_progress',
          actualStart: new Date(),
          notes: `${mo.notes || ''}\n\n[Started] Production started on machine: ${machine}. Raw materials consumed.`,
        },
        include: {
          product: true,
          bom: {
            include: {
              items: {
                include: {
                  component: true,
                },
              },
            },
          },
          triggeredBySo: true,
          creator: { select: { name: true } },
        },
      });
    }, { maxWait: 5000, timeout: 20000 });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'manufacturing_order_started',
      entityType: 'manufacturing_order',
      entityId: id,
      entityName: updated.orderNumber,
      newValues: { status: 'in_progress', machine },
    });

    return mapMOStatus(updated);
  }

  async complete(
    id: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const updated = await prisma.$transaction(async (tx) => {
      const mo = await tx.manufacturingOrder.findUnique({
        where: { id },
        include: { product: true },
      });

      if (!mo) {
        throw Object.assign(new Error('Manufacturing Order not found'), { statusCode: 404 });
      }

      if (mo.status !== 'in_progress') {
        throw Object.assign(new Error('Only in-progress manufacturing orders can be completed'), { statusCode: 400 });
      }

      // 1. Increment on-hand quantity of finished good product
      const product = await tx.product.findUnique({ where: { id: mo.productId } });
      if (!product) {
        throw Object.assign(new Error('Product not found'), { statusCode: 404 });
      }
      const onHand = Number(product.onHandQuantity);
      const newOnHand = onHand + Number(mo.quantityToProduce);

      await tx.product.update({
        where: { id: mo.productId },
        data: { onHandQuantity: newOnHand },
      });

      // 2. Create inventory movement for production receipt
      await tx.inventoryMovement.create({
        data: {
          productId: mo.productId,
          movementType: 'manufacturing_produce',
          quantity: Number(mo.quantityToProduce),
          direction: 1,
          quantityBefore: onHand,
          quantityAfter: newOnHand,
          referenceMoId: id,
          notes: `Produced by Manufacturing Order ${mo.orderNumber}`,
          createdBy: actorId,
        },
      });

      // 3. Reserve newly produced quantity for the linked Sales Order
      if (mo.triggeredBySoId) {
        const so = await tx.salesOrder.findUnique({
          where: { id: mo.triggeredBySoId },
          include: { items: true },
        });

        if (so) {
          const soItem = so.items.find((item) => item.productId === mo.productId);
          if (soItem) {
            const currentReserved = Number(product.reservedQuantity);
            const newReserved = currentReserved + Number(mo.quantityToProduce);

            await tx.product.update({
              where: { id: mo.productId },
              data: { reservedQuantity: newReserved },
            });

            await tx.inventoryMovement.create({
              data: {
                productId: mo.productId,
                movementType: 'stock_reservation',
                quantity: Number(mo.quantityToProduce),
                direction: -1,
                quantityBefore: newOnHand,
                quantityAfter: newOnHand,
                reservedBefore: currentReserved,
                reservedAfter: newReserved,
                referenceSoId: so.id,
                notes: `Reserved newly produced ${mo.quantityToProduce} for Sales Order ${so.orderNumber}`,
                createdBy: actorId,
              },
            });

            await createAuditLog({
              userId: actorId,
              userName: actorName,
              userRole: actorRole,
              action: 'stock_reserved',
              entityType: 'product',
              entityId: mo.productId,
              entityName: product.name,
              newValues: {
                salesOrderId: so.id,
                orderNumber: so.orderNumber,
                quantityReserved: Number(mo.quantityToProduce),
              },
            });
          }

          // Check if sales order is now fully ready (no other pending MOs or POs)
          const pendingMOs = await tx.manufacturingOrder.findMany({
            where: {
              triggeredBySoId: so.id,
              NOT: { id: id },
              status: { in: ['draft', 'confirmed', 'in_progress'] },
            },
          });

          const pendingPOs = await tx.purchaseOrder.findMany({
            where: {
              triggeredBySoId: so.id,
              status: { in: ['draft', 'confirmed', 'partially_received'] },
            },
          });

          if (pendingMOs.length === 0 && pendingPOs.length === 0) {
            await tx.salesOrder.update({
              where: { id: so.id },
              data: { status: 'ready' },
            });

            await createAuditLog({
              userId: actorId,
              userName: actorName,
              userRole: actorRole,
              action: 'sales_order_confirmed',
              entityType: 'sales_order',
              entityId: so.id,
              entityName: `Sales Order ${so.orderNumber} is now READY`,
              newValues: { status: 'ready' },
            });
          }
        }
      }

      // Update the MO itself
      return tx.manufacturingOrder.update({
        where: { id },
        data: {
          status: 'completed',
          actualEnd: new Date(),
          quantityProduced: mo.quantityToProduce,
          notes: `${mo.notes || ''}\n\n[Completed] Production run completed. Finished goods added to stock.`,
        },
        include: {
          product: true,
          bom: {
            include: {
              items: {
                include: {
                  component: true,
                },
              },
            },
          },
          triggeredBySo: true,
          creator: { select: { name: true } },
        },
      });
    }, { maxWait: 5000, timeout: 20000 });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'manufacturing_order_completed',
      entityType: 'manufacturing_order',
      entityId: id,
      entityName: updated.orderNumber,
      newValues: { status: 'completed' },
    });

    return mapMOStatus(updated);
  }
}

export const manufacturingService = new ManufacturingService();
