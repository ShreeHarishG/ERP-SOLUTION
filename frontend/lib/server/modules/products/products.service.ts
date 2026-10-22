import prisma from '@/lib/server/db';
import { createAuditLog } from '@/lib/server/utils/auditLog';
import type { UserRole } from '@prisma/client';
import type { CreateProductInput, UpdateProductInput } from './products.validation';

export class ProductsService {
  async list(filters: {
    search?: string;
    category?: string;
    procurementType?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { search, category, procurementType, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, any> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (procurementType) {
      where.procurementType = procurementType;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        bomHeaders: true,
      },
    });

    if (!product) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }

    return product;
  }

  async create(
    dto: CreateProductInput,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const existing = await prisma.product.findUnique({
      where: { sku: dto.sku },
    });
    if (existing) {
      throw Object.assign(new Error('SKU already in use'), { statusCode: 409 });
    }

    const product = await prisma.product.create({
      data: {
        name: dto.name,
        sku: dto.sku,
        productType: dto.productType,
        description: dto.description,
        category: dto.category,
        unitOfMeasure: dto.unitOfMeasure,
        salesPrice: dto.salesPrice,
        costPrice: dto.costPrice,
        onHandQuantity: dto.onHandQuantity,
        reservedQuantity: dto.reservedQuantity,
        minStockLevel: dto.minStockLevel,
        reorderQuantity: dto.reorderQuantity,
        procurementType: dto.procurementType,
        procurementStrategy: dto.procurementStrategy,
        isActive: dto.isActive,
        createdBy: actorId,
      },
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'product_created',
      entityType: 'product',
      entityId: product.id,
      entityName: product.name,
      newValues: product as any,
    });

    return product;
  }

  async update(
    id: string,
    dto: UpdateProductInput,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const existing = await prisma.product.findUnique({
      where: { id },
    });
    if (!existing) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }

    if (dto.sku && dto.sku !== existing.sku) {
      const skuInUse = await prisma.product.findUnique({
        where: { sku: dto.sku },
      });
      if (skuInUse) {
        throw Object.assign(new Error('SKU already in use'), { statusCode: 409 });
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: dto,
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'product_updated',
      entityType: 'product',
      entityId: updated.id,
      entityName: updated.name,
      oldValues: existing as any,
      newValues: updated as any,
    });

    return updated;
  }

  async delete(
    id: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const existing = await prisma.product.findUnique({
      where: { id },
    });
    if (!existing) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    await createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'product_deleted',
      entityType: 'product',
      entityId: id,
      entityName: existing.name,
      oldValues: existing as any,
      newValues: updated as any,
    });

    return { message: 'Product deactivated successfully' };
  }
}

export const productsService = new ProductsService();
