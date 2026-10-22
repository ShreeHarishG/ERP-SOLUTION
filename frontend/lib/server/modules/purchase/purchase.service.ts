import prisma from '@/lib/server/db';
import { createAuditLog } from '@/lib/server/utils/auditLog';
import { generatePurchaseOrderNumber } from '@/lib/server/utils/order-number';
import { bomsService } from '../boms/boms.service';
import type { UserRole } from '@prisma/client';

export class PurchaseService {
  async list() {
    return prisma.purchaseOrder.findMany({
      include: {
        items: {
          include: { product: true },
        },
        triggeredBySo: true,
        creator: { select: { name: true } },
        quotations: true,
        invoices: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        triggeredBySo: true,
        creator: { select: { name: true } },
        quotations: true,
        invoices: true,
      },
    });

    if (!po) {
      throw Object.assign(new Error('Purchase Order not found'), { statusCode: 404 });
    }

    return po;
  }

  async selectQuotation(
    poId: string,
    payload: { vendorName: string; vendorEmail?: string; vendorPhone?: string; totalAmount: number },
    actorId: string,
    actorName: string,
    actorRole: UserRole
  ) {
    const po = await this.getById(poId);

    if (po.status !== 'draft') {
      throw Object.assign(new Error('Can only select vendor quotation for draft requests'), {
        statusCode: 400,
      });
    }

    // Update quotations status in DB
    await prisma.vendorQuotation.updateMany({
      where: { purchaseOrderId: poId },
      data: { status: 'rejected' },
    });

    await prisma.vendorQuotation.updateMany({
      where: {
        purchaseOrderId: poId,
        vendorName: payload.vendorName,
      },
      data: { status: 'selected' },
    });

    const updatedPo = await prisma.purchaseOrder.update({
      where: { id: poId },
      data: {
        vendorName: payload.vendorName,
        vendorEmail: payload.vendorEmail || null,
        vendorPhone: payload.vendorPhone || null,
        totalAmount: payload.totalAmount,
        notes: `${po.notes || ''}\n\nVendor quotation selected: ${payload.vendorName}. Total cost: INR ${payload.totalAmount.toLocaleString()}`,
      },
      include: {
        items: { include: { product: true } },
        triggeredBySo: true,
        quotations: true,
        invoices: true,
      },
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'purchase_order_created', // using existing purchase_order_created action for changes
      entityType: 'purchase_order',
      entityId: po.id,
      entityName: po.orderNumber,
      newValues: {
        vendorName: payload.vendorName,
        totalAmount: payload.totalAmount,
      },
    });

    return updatedPo;
  }

  async sendRFQ(
    poId: string,
    payload: { vendorNames: string[] },
    actorId: string,
    actorName: string,
    actorRole: UserRole
  ) {
    const po = await this.getById(poId);

    if (po.status !== 'draft') {
      throw Object.assign(new Error('Can only send RFQ for draft requests'), {
        statusCode: 400,
      });
    }

    // Delete any existing quotations for this PO to allow retry/updates
    await prisma.vendorQuotation.deleteMany({
      where: { purchaseOrderId: poId },
    });

    // Create a quotation for each selected vendor
    for (const vendorName of payload.vendorNames) {
      const dbVendor = await prisma.vendor.findUnique({
        where: { name: vendorName },
      });

      const charSum = vendorName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const factor = 0.85 + ((charSum % 30) / 100);
      const days = 1 + (charSum % 6);
      const rating = parseFloat((4.0 + ((charSum % 10) / 10)).toFixed(1));
      
      const baseCost = Number(po.totalAmount) || 1000;
      const totalAmount = Math.round(baseCost * factor);

      await prisma.vendorQuotation.create({
        data: {
          purchaseOrderId: poId,
          vendorName,
          vendorEmail: dbVendor?.email || `${vendorName.toLowerCase().replace(/\s+/g, '')}@supplier.com`,
          vendorPhone: dbVendor?.phone || `+91 ${90000 + (charSum % 10000)} ${50000 + (charSum % 50000)}`,
          totalAmount,
          deliveryDays: days,
          rating,
          status: 'pending',
        },
      });
    }

    const updatedPo = await prisma.purchaseOrder.update({
      where: { id: poId },
      data: {
        vendorName: 'RFQ Sent (Pending Bids)',
        notes: `${po.notes || ''}\n\n[RFQ Sent] Procurement request verified. RFQs dispatched to selected vendors: ${payload.vendorNames.join(', ')}`,
      },
      include: {
        items: { include: { product: true } },
        triggeredBySo: true,
        quotations: true,
        invoices: true,
      },
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'purchase_order_created',
      entityType: 'purchase_order',
      entityId: po.id,
      entityName: po.orderNumber,
      newValues: {
        vendorName: 'RFQ Sent (Pending Bids)',
        requestedVendors: payload.vendorNames,
      },
    });

    return updatedPo;
  }

  async confirmPO(
    poId: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole
  ) {
    const po = await this.getById(poId);

    if (po.status !== 'draft') {
      throw Object.assign(new Error('Only draft purchase orders can be confirmed'), {
        statusCode: 400,
      });
    }

    if (!po.vendorName || po.vendorName.includes('Recommended Vendor')) {
      throw Object.assign(new Error('Please select a valid vendor quote before confirming the PO'), {
        statusCode: 400,
      });
    }

    // Generate a unique invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create the invoice
    await prisma.invoice.create({
      data: {
        invoiceNumber,
        purchaseOrderId: poId,
        vendorName: po.vendorName,
        amount: po.totalAmount,
        status: 'pending',
      },
    });

    const updatedPo = await prisma.purchaseOrder.update({
      where: { id: poId },
      data: {
        status: 'confirmed',
        confirmedBy: actorId,
        confirmedAt: new Date(),
        notes: `${po.notes || ''}\n\n[PO Dispatched & Shared] Purchase Order confirmed and dispatched to vendor: ${po.vendorName} (${po.vendorEmail || 'pending email'}). Notification CC'd to Inventory Manager (neha@shivfurniture.com) for incoming tracking.`,
      },
      include: {
        items: { include: { product: true } },
        triggeredBySo: true,
        quotations: true,
        invoices: true,
      },
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'purchase_order_confirmed',
      entityType: 'purchase_order',
      entityId: po.id,
      entityName: `Procurement Request Sent: PO ${po.orderNumber} confirmed`,
      newValues: {
        status: 'confirmed',
      },
    });

    return updatedPo;
  }

  async receiveMaterials(
    poId: string,
    payload: { checkResult: 'approve' | 'reject'; reason?: string },
    actorId: string,
    actorName: string,
    actorRole: UserRole
  ) {
    const po = await this.getById(poId);

    if (po.status !== 'confirmed') {
      throw Object.assign(new Error('Only confirmed purchase orders in-transit can be verified'), {
        statusCode: 400,
      });
    }

    if (payload.checkResult === 'approve') {
      const updatedPo = await prisma.$transaction(async (tx) => {
        // Increment on-hand quantity for raw materials
        for (const item of po.items) {
          const qty = Number(item.quantityOrdered);
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) continue;

          const onHand = Number(product.onHandQuantity);
          const newOnHand = onHand + qty;

          await tx.product.update({
            where: { id: item.productId },
            data: { onHandQuantity: newOnHand },
          });

          // Create inventory movement
          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              movementType: 'purchase_receipt',
              quantity: qty,
              direction: 1,
              quantityBefore: onHand,
              quantityAfter: newOnHand,
              referencePoId: po.id,
              notes: `Received materials for Purchase Order ${po.orderNumber}`,
              createdBy: actorId,
            },
          });
        }

        await tx.invoice.updateMany({
          where: { purchaseOrderId: poId },
          data: { status: 'verified' },
        });

        return tx.purchaseOrder.update({
          where: { id: poId },
          data: {
            status: 'received',
            receivedBy: actorId,
            receivedAt: new Date(),
            notes: `${po.notes || ''}\n\nIncoming receipt verified and approved. Materials added to inventory.`,
          },
          include: {
            items: { include: { product: true } },
            triggeredBySo: true,
            quotations: true,
            invoices: true,
          },
        });
      });

      await createAuditLog({
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        action: 'purchase_order_received',
        entityType: 'purchase_order',
        entityId: po.id,
        entityName: `Material Received: PO ${po.orderNumber} materials received`,
        newValues: {
          status: 'received',
        },
      });

      await createAuditLog({
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        action: 'stock_adjusted',
        entityType: 'product',
        entityId: po.id,
        entityName: `Inventory Updated: Raw materials added to stock`,
        newValues: {
          poNumber: po.orderNumber,
          items: po.items.map(item => ({ productId: item.productId, quantity: item.quantityOrdered })),
        },
      });

      // Update related Manufacturing Orders triggered by the same Sales Order
      if (po.triggeredBySoId) {
        const waitingMOs = await prisma.manufacturingOrder.findMany({
          where: {
            triggeredBySoId: po.triggeredBySoId,
            status: 'confirmed',
          },
        });

        for (const mo of waitingMOs) {
          await prisma.manufacturingOrder.update({
            where: { id: mo.id },
            data: {
              notes: `${mo.notes || ''}\n\n[Receipt Notification] Raw materials received under PO ${po.orderNumber}. Ready for manufacturing start.`,
            },
          });

          // Check if shortages are now resolved
          const bomExplosion = await bomsService.explode(mo.productId, Number(mo.quantityToProduce));
          const hasShortages = bomExplosion.materials.some((mat) => mat.shortage > 0);
          
          if (!hasShortages) {
            // Write Audit Log: Manufacturing Ready
            await createAuditLog({
              userId: actorId,
              userName: actorName,
              userRole: actorRole,
              action: 'bom_exploded',
              entityType: 'manufacturing_order',
              entityId: mo.id,
              entityName: `Manufacturing Ready: All components allocated. MO ${mo.orderNumber} ready to start`,
              newValues: { moNumber: mo.orderNumber, status: 'READY_TO_START' },
            });
          }
        }
      }

      return updatedPo;
    } else {
      // Reject incoming receipt
      const updatedPo = await prisma.purchaseOrder.update({
        where: { id: poId },
        data: {
          status: 'cancelled',
          notes: `${po.notes || ''}\n\n[Receipt Verification REJECTED] Reason: ${payload.reason || 'Not specified'}. PO cancelled.`,
        },
        include: {
          items: { include: { product: true } },
          triggeredBySo: true,
        },
      });

      await createAuditLog({
        userId: actorId,
        userName: actorName,
        userRole: actorRole,
        action: 'purchase_order_cancelled',
        entityType: 'purchase_order',
        entityId: po.id,
        entityName: po.orderNumber,
        newValues: {
          status: 'cancelled',
          rejectionReason: payload.reason,
        },
      });

      return updatedPo;
    }
  }

  async create(
    payload: { productId: string; quantity: number },
    actorId: string,
    actorName: string,
    actorRole: UserRole
  ) {
    const { productId, quantity } = payload;

    if (quantity <= 0) {
      throw Object.assign(new Error('Quantity must be greater than 0'), { statusCode: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }

    if (product.procurementType !== 'purchase') {
      throw Object.assign(
        new Error(`Cannot create purchase order for product ${product.name} with procurement type ${product.procurementType}`),
        { statusCode: 400 }
      );
    }

    const costPrice = Number(product.costPrice) || 0;
    const totalAmount = costPrice * quantity;

    const po = await prisma.$transaction(async (tx) => {
      const orderNumber = await generatePurchaseOrderNumber(tx);

      const createdPo = await tx.purchaseOrder.create({
        data: {
          orderNumber,
          vendorName: 'Recommended Vendor (Pending Quote)',
          status: 'draft',
          totalAmount,
          createdBy: actorId,
          notes: `Manually requested procurement of raw material ${product.name} (SKU: ${product.sku}).`,
          items: {
            create: [
              {
                productId,
                quantityOrdered: quantity,
                unitCost: costPrice,
              },
            ],
          },
        },
        include: {
          items: {
            include: { product: true },
          },
          creator: { select: { name: true } },
          triggeredBySo: true,
        },
      });

      return createdPo;
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'purchase_order_created',
      entityType: 'purchase_order',
      entityId: po.id,
      entityName: po.orderNumber,
      newValues: {
        productId,
        quantity,
        totalAmount,
      },
    });

    return po;
  }
}

export const purchaseService = new PurchaseService();
