import prisma from '@/lib/server/db';

export class AIContextService {
  async getLiveContext() {
    const now = new Date();

    const [
      products,
      salesOrders,
      manufacturingOrders,
      purchaseOrders,
      auditLogs,
    ] = await Promise.all([
      // Get all active products
      prisma.product.findMany({
        where: { isActive: true },
        include: {
          bomHeaders: true,
        },
      }),
      // Get sales orders
      prisma.salesOrder.findMany({
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      // Get manufacturing orders
      prisma.manufacturingOrder.findMany({
        include: {
          product: true,
          bom: true,
        },
      }),
      // Get purchase orders
      prisma.purchaseOrder.findMany({
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      // Get latest audit logs for timeline context
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    // 1. Inventory Analysis
    let totalInventoryValue = 0;
    const rawMaterials: any[] = [];
    const finishedGoods: any[] = [];
    const lowStockItems: any[] = [];

    products.forEach((p) => {
      const onHand = Number(p.onHandQuantity);
      const reserved = Number(p.reservedQuantity);
      const cost = Number(p.costPrice);
      const freeQty = Math.max(0, onHand - reserved);
      const minStock = Number(p.minStockLevel);

      totalInventoryValue += onHand * cost;

      const productInfo = {
        id: p.id,
        name: p.name,
        sku: p.sku,
        onHand,
        reserved,
        freeQty,
        minStock,
        unitOfMeasure: p.unitOfMeasure,
        costPrice: cost,
      };

      if (p.productType === 'raw_material') {
        rawMaterials.push(productInfo);
      } else {
        finishedGoods.push(productInfo);
      }

      if (freeQty <= minStock) {
        lowStockItems.push(productInfo);
      }
    });

    // 2. Sales Analysis
    const openSalesOrders = salesOrders.filter((so) =>
      ['draft', 'confirmed', 'shortage_detected', 'ready'].includes(so.status)
    );
    const delayedSalesOrders = openSalesOrders.filter(
      (so) => so.expectedDelivery && new Date(so.expectedDelivery) < now
    );
    const totalRevenue = salesOrders
      .filter((so) => so.status === 'delivered')
      .reduce((sum, so) => sum + Number(so.totalAmount), 0);

    const demandMap: Record<string, { sku: string; name: string; quantity: number }> = {};
    salesOrders.forEach((so) => {
      if (so.status !== 'cancelled') {
        so.items.forEach((item) => {
          if (!demandMap[item.productId]) {
            demandMap[item.productId] = {
              sku: item.product.sku,
              name: item.product.name,
              quantity: 0,
            };
          }
          demandMap[item.productId].quantity += Number(item.quantityOrdered);
        });
      }
    });
    const customerDemand = Object.values(demandMap);

    // 3. Manufacturing Analysis
    const activeMOs = manufacturingOrders.filter((mo) => mo.status === 'in_progress');
    const delayedMOs = manufacturingOrders.filter(
      (mo) =>
        ['draft', 'confirmed', 'in_progress'].includes(mo.status) &&
        mo.scheduledEnd &&
        new Date(mo.scheduledEnd) < now
    );

    // Capacity & Machine Utilization Estimation
    const machineRuns = activeMOs
      .map((mo) => {
        const match = mo.notes?.match(/Machine:?\s*([^\n.]+)/i);
        return match ? match[1].trim() : 'Unknown Line';
      })
      .filter((m) => m);

    // 4. Procurement Analysis
    const pendingPOs = purchaseOrders.filter((po) =>
      ['draft', 'confirmed', 'partially_received'].includes(po.status)
    );
    const delayedPOs = pendingPOs.filter(
      (po) => po.expectedDelivery && new Date(po.expectedDelivery) < now
    );

    // Estimate material shortages
    const materialShortages = lowStockItems.filter(
      (item) => item.sku.startsWith('RM-') || item.sku.includes('wood')
    );

    // Vendor SLA estimates based on purchase history
    const vendorPerformanceMap: Record<string, { completedCount: number; delayedCount: number }> = {};
    purchaseOrders.forEach((po) => {
      if (po.vendorName) {
        if (!vendorPerformanceMap[po.vendorName]) {
          vendorPerformanceMap[po.vendorName] = { completedCount: 0, delayedCount: 0 };
        }
        if (po.status === 'received') {
          vendorPerformanceMap[po.vendorName].completedCount++;
        }
        if (po.expectedDelivery && po.receivedAt && new Date(po.receivedAt) > new Date(po.expectedDelivery)) {
          vendorPerformanceMap[po.vendorName].delayedCount++;
        }
      }
    });

    // 5. Timeline & Activity Analysis
    const recentActivities = auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityName: log.entityName,
      user: log.userName || 'System',
      role: log.userRole || 'system',
      timestamp: log.createdAt,
    }));

    const failedOperations = auditLogs
      .filter(
        (log) =>
          log.action.includes('cancelled') ||
          log.action.includes('deleted') ||
          log.action.includes('shortage')
      )
      .map((log) => ({
        action: log.action,
        entityType: log.entityType,
        entityName: log.entityName,
        timestamp: log.createdAt,
      }));

    return {
      inventory: {
        totalValue: totalInventoryValue,
        rawMaterialsCount: rawMaterials.length,
        finishedGoodsCount: finishedGoods.length,
        lowStockItems: lowStockItems.map((item) => ({
          name: item.name,
          sku: item.sku,
          stock: item.onHand,
          reserved: item.reserved,
          free: item.freeQty,
          safety: item.minStock,
        })),
        rawMaterials: rawMaterials.slice(0, 10),
        finishedGoods: finishedGoods.slice(0, 10),
      },
      sales: {
        openOrdersCount: openSalesOrders.length,
        delayedOrdersCount: delayedSalesOrders.length,
        revenue: totalRevenue,
        customerDemand,
        recentOrders: salesOrders.slice(0, 5).map((so) => ({
          orderNumber: so.orderNumber,
          customer: so.customerName,
          status: so.status,
          total: so.totalAmount,
        })),
      },
      manufacturing: {
        activeOrdersCount: activeMOs.length,
        delayedOrdersCount: delayedMOs.length,
        activeRuns: activeMOs.map((mo) => ({
          moNumber: mo.orderNumber,
          product: mo.product.name,
          qty: mo.quantityToProduce,
        })),
        machineUtilization: machineRuns,
      },
      procurement: {
        pendingPOsCount: pendingPOs.length,
        delayedPOsCount: delayedPOs.length,
        materialShortages: materialShortages.map((item) => ({
          name: item.name,
          sku: item.sku,
          free: item.freeQty,
          safety: item.minStock,
        })),
        vendorPerformance: Object.entries(vendorPerformanceMap).map(([name, perf]) => ({
          vendor: name,
          fulfilled: perf.completedCount,
          delays: perf.delayedCount,
        })),
      },
      timeline: {
        recentActivities,
        failedOperations,
      },
    };
  }
}

export const aiContextService = new AIContextService();
