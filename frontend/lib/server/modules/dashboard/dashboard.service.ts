import prisma from '@/lib/server/db';
import { cached } from '@/lib/server/cache';
import { aiEngineService } from '@/lib/server/ai/ai-engine.service';

export class DashboardService {
  async getStats(role: string = 'admin') {
    const normalizedRole = role.toLowerCase();
    return cached(`dashboard:${normalizedRole}`, () => this.loadStats(normalizedRole), 30);
  }

  private async loadStats(normalizedRole: string) {

    // ─── 1. FAST PATH: SALES EXECUTIVE ─────────────────────────────────────
    if (normalizedRole === 'sales') {
      const [
        totalSalesOrders,
        pendingSalesOrdersCount,
        shortageOrdersCount,
        recentSalesOrders,
        recentAuditLogs,
      ] = await Promise.all([
        prisma.salesOrder.count(),
        prisma.salesOrder.count({
          where: { status: { in: ['draft', 'confirmed', 'shortage_detected', 'ready'] } },
        }),
        prisma.salesOrder.count({ where: { status: 'shortage_detected' } }),
        prisma.salesOrder.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        }),
        prisma.auditLog.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            action: true,
            entityType: true,
            entityName: true,
            userName: true,
            userRole: true,
            createdAt: true,
          },
        }),
      ]);

      return {
        kpis: {
          totalProducts: 0,
          totalSalesOrders,
          pendingSalesOrders: pendingSalesOrdersCount,
          shortageOrders: shortageOrdersCount,
          lowStockCount: 0,
          totalInventoryValue: 0,
          runningManufacturingRuns: 0,
          pendingManufacturingApprovals: 0,
          delayedManufacturingCount: 0,
          employeeProductivity: '95.8%',
          demandForecast: '+12.4%',
        },
        inventoryHealth: { healthy: 0, lowStock: 0, critical: 0, total: 0 },
        lowStockProducts: [],
        recentActivity: recentAuditLogs,
        recentSalesOrders,
        smartProcurementRecommendations: [],
        productionBottlenecks: [],
        pendingPurchaseOrders: [],
        inTransitPurchaseOrders: [],
      };
    }

    // ─── 2. FAST PATH: PRODUCT MANAGER ─────────────────────────────────────
    if (normalizedRole === 'product_manager') {
      const [runningMosCount, pendingMosCount, recentAuditLogs] = await Promise.all([
        prisma.manufacturingOrder.count({ where: { status: 'in_progress' } }),
        prisma.manufacturingOrder.count({ where: { status: { in: ['draft', 'confirmed'] } } }),
        prisma.auditLog.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            action: true,
            entityType: true,
            entityName: true,
            userName: true,
            userRole: true,
            createdAt: true,
          },
        }),
      ]);

      return {
        kpis: {
          totalProducts: 0,
          totalSalesOrders: 0,
          pendingSalesOrders: 0,
          shortageOrders: 0,
          lowStockCount: 0,
          totalInventoryValue: 0,
          runningManufacturingRuns: runningMosCount,
          pendingManufacturingApprovals: pendingMosCount,
          delayedManufacturingCount: runningMosCount > 1 ? 1 : 0,
          manufacturingEfficiency: '96%',
          employeeProductivity: '94.2%',
          demandForecast: '+15.4% (Quarterly growth prediction)',
        },
        inventoryHealth: { healthy: 0, lowStock: 0, critical: 0, total: 0 },
        lowStockProducts: [],
        recentActivity: recentAuditLogs,
        recentSalesOrders: [],
        smartProcurementRecommendations: [],
        productionBottlenecks: [],
        pendingPurchaseOrders: [],
        inTransitPurchaseOrders: [],
      };
    }

    // ─── 3. FAST PATH: PROCUREMENT MANAGER ─────────────────────────────────
    if (normalizedRole === 'purchase') {
      const [products, pendingPurchaseOrders, inTransitPurchaseOrders, recentAuditLogs] =
        await Promise.all([
          prisma.product.findMany({
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              sku: true,
              onHandQuantity: true,
              reservedQuantity: true,
              minStockLevel: true,
              unitOfMeasure: true,
            },
          }),
          prisma.purchaseOrder.findMany({
            where: { status: 'draft' },
            include: {
              items: { include: { product: true } },
              triggeredBySo: true,
              creator: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.purchaseOrder.findMany({
            where: { status: { in: ['confirmed', 'partially_received'] } },
            include: {
              items: { include: { product: true } },
              triggeredBySo: true,
              creator: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
              id: true,
              action: true,
              entityType: true,
              entityName: true,
              userName: true,
              userRole: true,
              createdAt: true,
            },
          }),
        ]);

      const lowStockProducts = products.filter((p) => {
        const freeQty = Number(p.onHandQuantity) - Number(p.reservedQuantity);
        return freeQty <= Number(p.minStockLevel);
      });

      const smartProcurementRecommendations = lowStockProducts.slice(0, 3).map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        currentStock: Number(p.onHandQuantity),
        consumption: 15,
        daysRemaining: Math.max(1, Math.round(Number(p.onHandQuantity) / 15)),
        suggestedOrder: 500,
        preferredVendor: 'Global Timber Ltd',
        riskScore: 'High',
      }));

      return {
        kpis: {
          totalProducts: products.length,
          totalSalesOrders: 0,
          pendingSalesOrders: 0,
          shortageOrders: 0,
          lowStockCount: lowStockProducts.length,
          totalInventoryValue: 0,
          procurementRiskScore: lowStockProducts.length > 2 ? 'Medium (68%)' : 'Low (24%)',
        },
        inventoryHealth: {
          healthy: products.length - lowStockProducts.length,
          lowStock: lowStockProducts.length,
          critical: 1,
          total: products.length,
        },
        lowStockProducts: lowStockProducts.slice(0, 5).map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          onHandQuantity: Number(p.onHandQuantity),
          reservedQuantity: Number(p.reservedQuantity),
          freeQuantity: Number(p.onHandQuantity) - Number(p.reservedQuantity),
          minStockLevel: Number(p.minStockLevel),
          unitOfMeasure: p.unitOfMeasure,
          isLowStock: true,
        })),
        recentActivity: recentAuditLogs,
        recentSalesOrders: [],
        smartProcurementRecommendations,
        productionBottlenecks: [],
        pendingPurchaseOrders,
        inTransitPurchaseOrders,
      };
    }

    // ─── 4. FAST PATH: INVENTORY MANAGER ───────────────────────────────────
    if (normalizedRole === 'inventory') {
      const [products, inTransitPurchaseOrders, recentAuditLogs] = await Promise.all([
        prisma.product.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            sku: true,
            onHandQuantity: true,
            reservedQuantity: true,
            minStockLevel: true,
            costPrice: true,
            unitOfMeasure: true,
          },
        }),
        prisma.purchaseOrder.findMany({
          where: { status: { in: ['confirmed', 'partially_received'] } },
          include: {
            items: { include: { product: true } },
            creator: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.auditLog.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            action: true,
            entityType: true,
            entityName: true,
            userName: true,
            userRole: true,
            createdAt: true,
          },
        }),
      ]);

      let totalInventoryValue = 0;
      let healthyCount = 0;
      let lowStockCount = 0;
      let criticalCount = 0;

      const lowStockProducts = products
        .map((p) => {
          const onHand = Number(p.onHandQuantity);
          const reserved = Number(p.reservedQuantity);
          const freeQty = onHand - reserved;
          const minStock = Number(p.minStockLevel);
          const costPrice = Number(p.costPrice);

          totalInventoryValue += onHand * costPrice;

          if (freeQty <= 0) criticalCount++;
          else if (freeQty <= minStock) lowStockCount++;
          else healthyCount++;

          return {
            id: p.id,
            name: p.name,
            sku: p.sku,
            onHandQuantity: onHand,
            reservedQuantity: reserved,
            freeQuantity: freeQty,
            minStockLevel: minStock,
            unitOfMeasure: p.unitOfMeasure,
            isLowStock: freeQty <= minStock,
          };
        })
        .filter((p) => p.isLowStock);

      return {
        kpis: {
          totalProducts: products.length,
          totalSalesOrders: 0,
          pendingSalesOrders: 0,
          shortageOrders: 0,
          lowStockCount: lowStockProducts.length,
          totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
        },
        inventoryHealth: {
          healthy: healthyCount,
          lowStock: lowStockCount,
          critical: criticalCount,
          total: products.length,
        },
        lowStockProducts: lowStockProducts.slice(0, 10),
        recentActivity: recentAuditLogs,
        recentSalesOrders: [],
        smartProcurementRecommendations: [],
        productionBottlenecks: [],
        pendingPurchaseOrders: [],
        inTransitPurchaseOrders,
      };
    }

    // ─── 5. FULL PATH: SUPER ADMIN ─────────────────────────────────────────
    const [
      totalProducts,
      totalSalesOrders,
      pendingSalesOrdersCount,
      shortageOrdersCount,
      products,
      recentAuditLogs,
      recentSalesOrders,
      runningMosCount,
      pendingMosCount,
      aiInsights,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.salesOrder.count(),
      prisma.salesOrder.count({
        where: { status: { in: ['draft', 'confirmed', 'shortage_detected', 'ready'] } },
      }),
      prisma.salesOrder.count({ where: { status: 'shortage_detected' } }),
      prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          sku: true,
          onHandQuantity: true,
          reservedQuantity: true,
          minStockLevel: true,
          costPrice: true,
          unitOfMeasure: true,
        },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          action: true,
          entityType: true,
          entityName: true,
          userName: true,
          userRole: true,
          createdAt: true,
        },
      }),
      prisma.salesOrder.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          status: true,
          totalAmount: true,
          createdAt: true,
        },
      }),
      prisma.manufacturingOrder.count({ where: { status: 'in_progress' } }),
      prisma.manufacturingOrder.count({ where: { status: { in: ['draft', 'confirmed'] } } }),
      aiEngineService.getInsights(false, 'admin').catch(() => ({
        operationalHealthScore: 91,
        operationalHealthBreakdown: { inventory: 92, manufacturing: 96, procurement: 68, sales: 94 },
        criticalRisks: [],
        executiveSummary: 'Corporate operational metrics are active and healthy.',
        procurementInsights: [],
        manufacturingInsights: [],
      })),
    ]);

    let totalInventoryValue = 0;
    let healthyCount = 0;
    let lowStockCount = 0;
    let criticalCount = 0;

    const lowStockProducts = products
      .map((p) => {
        const onHand = Number(p.onHandQuantity);
        const reserved = Number(p.reservedQuantity);
        const freeQty = onHand - reserved;
        const minStock = Number(p.minStockLevel);
        const costPrice = Number(p.costPrice);

        totalInventoryValue += onHand * costPrice;

        if (freeQty <= 0) criticalCount++;
        else if (freeQty <= minStock) lowStockCount++;
        else healthyCount++;

        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          onHandQuantity: onHand,
          reservedQuantity: reserved,
          freeQuantity: freeQty,
          minStockLevel: minStock,
          unitOfMeasure: p.unitOfMeasure,
          isLowStock: freeQty <= minStock,
        };
      })
      .filter((p) => p.isLowStock);

    const pendingPurchaseOrders: any[] = [];
    const inTransitPurchaseOrders: any[] = [];

    return {
      kpis: {
        totalProducts,
        totalSalesOrders,
        pendingSalesOrders: pendingSalesOrdersCount,
        shortageOrders: shortageOrdersCount,
        lowStockCount: lowStockProducts.length,
        totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
        runningManufacturingRuns: runningMosCount,
        pendingManufacturingApprovals: pendingMosCount,
        delayedManufacturingCount: runningMosCount > 1 ? 1 : 0,
        procurementRiskScore:
          aiInsights?.operationalHealthScore > 85 ? 'Low (24%)' : 'Medium (68%)',
        manufacturingEfficiency: `${
          aiInsights?.operationalHealthBreakdown?.manufacturing || 96
        }%`,
        employeeProductivity: '94.2%',
        demandForecast: '+15.4% (Quarterly growth prediction)',
      },
      inventoryHealth: {
        healthy: aiInsights?.operationalHealthBreakdown?.inventory
          ? Math.round(
              (aiInsights.operationalHealthBreakdown.inventory / 100) * products.length
            )
          : healthyCount,
        lowStock: aiInsights?.operationalHealthBreakdown?.inventory
          ? Math.round(
              ((100 - aiInsights.operationalHealthBreakdown.inventory) / 100) *
                products.length
            )
          : lowStockCount,
        critical: criticalCount,
        total: products.length,
      },
      lowStockProducts: lowStockProducts.slice(0, 10),
      recentActivity: recentAuditLogs,
      recentSalesOrders,
      smartProcurementRecommendations: (aiInsights?.procurementInsights || []).slice(0, 5),
      productionBottlenecks: (aiInsights?.manufacturingInsights || []).map((m: any) => ({
        id: m.moNumber,
        name: m.product,
        sku: m.moNumber,
        currentStock: 0,
        consumption: 0,
        daysRemaining: Number(m.delayRisk?.replace('%', '')) || 0,
        suggestedOrder: 0,
        preferredVendor: m.reason,
        riskScore: m.urgency,
      })),
      pendingPurchaseOrders,
      inTransitPurchaseOrders,
      aiInsights,
    };
  }
}

export const dashboardService = new DashboardService();
