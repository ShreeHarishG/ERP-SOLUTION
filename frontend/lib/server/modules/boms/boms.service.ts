import prisma from '@/lib/server/db';
import { createAuditLog } from '@/lib/server/utils/auditLog';
import type { UserRole } from '@prisma/client';
import type { CreateBomInput } from './boms.validation';

export class BomsService {
  async list() {
    return prisma.bom.findMany({
      include: {
        product: true,
        items: {
          include: {
            component: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    const bom = await prisma.bom.findUnique({
      where: { id },
      include: {
        product: true,
        items: {
          include: {
            component: true,
          },
        },
      },
    });

    if (!bom) {
      throw Object.assign(new Error('BoM not found'), { statusCode: 404 });
    }

    return bom;
  }

  async getByProductId(productId: string) {
    return prisma.bom.findFirst({
      where: { productId, isActive: true },
      include: {
        items: {
          include: {
            component: true,
          },
        },
      },
    });
  }

  async create(
    dto: CreateBomInput,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) {
      throw Object.assign(new Error('Finished product not found'), { statusCode: 404 });
    }

    // Set other active BOMs for this product to inactive if this new one is active
    if (dto.isActive) {
      await prisma.bom.updateMany({
        where: { productId: dto.productId, isActive: true },
        data: { isActive: false },
      });
    }

    const bom = await prisma.$transaction(async (tx) => {
      // Create BOM header
      const createdBom = await tx.bom.create({
        data: {
          productId: dto.productId,
          name: dto.name,
          quantity: dto.quantity,
          isActive: dto.isActive,
          notes: dto.notes,
          createdBy: actorId,
        },
      });

      // Create BOM items
      await Promise.all(
        dto.items.map((item) =>
          tx.bomItem.create({
            data: {
              bomId: createdBom.id,
              componentId: item.componentId,
              quantity: item.quantity,
              unitOfMeasure: item.unitOfMeasure,
              notes: item.notes,
            },
          })
        )
      );

      return createdBom;
    });

    const fullBom = await this.getById(bom.id);

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'bom_created',
      entityType: 'bom',
      entityId: bom.id,
      entityName: bom.name,
      newValues: JSON.parse(JSON.stringify(fullBom)),
    });

    return fullBom;
  }

  async explode(productId: string, quantity: number) {
    const bom = await this.getByProductId(productId);
    if (!bom) {
      return { hasBom: false, materials: [] };
    }

    const materials = bom.items.map((item) => {
      const required = (Number(item.quantity) / Number(bom.quantity)) * quantity;
      const onHand = Number(item.component.onHandQuantity);
      const reserved = Number(item.component.reservedQuantity);
      const available = Math.max(0, onHand - reserved);
      const shortage = Math.max(0, required - available);

      return {
        componentId: item.component.id,
        sku: item.component.sku,
        product: item.component.name,
        required,
        available,
        shortage,
        unitOfMeasure: item.unitOfMeasure,
      };
    });

    return {
      hasBom: true,
      bomName: bom.name,
      materials,
    };
  }

  async update(
    id: string,
    dto: CreateBomInput,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    // Check if BOM exists
    const existingBom = await prisma.bom.findUnique({ where: { id } });
    if (!existingBom) {
      throw Object.assign(new Error('BoM not found'), { statusCode: 404 });
    }

    // Check if finished product exists
    const product = await prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) {
      throw Object.assign(new Error('Finished product not found'), { statusCode: 404 });
    }

    // Set other active BOMs for this product to inactive if this one is active
    if (dto.isActive) {
      await prisma.bom.updateMany({
        where: { productId: dto.productId, isActive: true, NOT: { id } },
        data: { isActive: false },
      });
    }

    const bom = await prisma.$transaction(async (tx) => {
      // 1. Update BOM header
      const updatedBom = await tx.bom.update({
        where: { id },
        data: {
          productId: dto.productId,
          name: dto.name,
          quantity: dto.quantity,
          isActive: dto.isActive,
          notes: dto.notes,
        },
      });

      // 2. Delete all existing items
      await tx.bomItem.deleteMany({
        where: { bomId: id },
      });

      // 3. Re-create items
      await Promise.all(
        dto.items.map((item) =>
          tx.bomItem.create({
            data: {
              bomId: id,
              componentId: item.componentId,
              quantity: item.quantity,
              unitOfMeasure: item.unitOfMeasure,
              notes: item.notes,
            },
          })
        )
      );

      return updatedBom;
    });

    const fullBom = await this.getById(bom.id);

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'bom_updated',
      entityType: 'bom',
      entityId: bom.id,
      entityName: bom.name,
      newValues: JSON.parse(JSON.stringify(fullBom)),
    });

    return fullBom;
  }
}

export const bomsService = new BomsService();
