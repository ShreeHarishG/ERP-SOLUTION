import { aiContextService } from './ai-context.service';

interface CacheEntry {
  timestamp: number;
  data: any;
}

let cachedInsights: Record<string, CacheEntry> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let lastFastAPIFailureTime = 0;
const FASTAPI_COOLDOWN = 60 * 1000; // 60s cooldown if FastAPI is offline

export class AIEngineService {
  async getInsights(bypassCache = false, role = 'admin') {
    const now = Date.now();
    const cacheKey = role.toLowerCase();
    
    if (!bypassCache && cachedInsights[cacheKey] && now - cachedInsights[cacheKey].timestamp < CACHE_DURATION) {
      console.log(`[AIEngineService] Returning cached AI insights for role: ${role}`);
      return cachedInsights[cacheKey].data;
    }

    console.log(`[AIEngineService] Generating fresh AI insights for role: ${role}...`);
    const context = await aiContextService.getLiveContext();

    let insights: any;
    if (now - lastFastAPIFailureTime < FASTAPI_COOLDOWN) {
      insights = this.generateLocalFallback(context);
    } else {
      try {
        insights = await this.queryFastAPIAgent(context, role);
        console.log(`[AIEngineService] Successfully generated insights using FastAPI Agent for role: ${role}`);
      } catch (err: any) {
        lastFastAPIFailureTime = Date.now();
        console.warn(`[AIEngineService] FastAPI Agent offline/failed, falling back to local business logic:`, err.message);
        insights = this.generateLocalFallback(context);
      }
    }

    cachedInsights[cacheKey] = {
      timestamp: now,
      data: insights,
    };

    return insights;
  }

  private async queryFastAPIAgent(context: any, role: string) {
    const fastapiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600); // 600ms max timeout if FastAPI offline

    try {
      const response = await fetch(`${fastapiUrl}/api/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          context,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`FastAPI agent returned status ${response.status}`);
      }

      const data = await response.json();

      // Validate that the response has the required structure
      const requiredFields = ['operationalHealthScore', 'criticalRisks', 'recommendations', 'procurementInsights', 'manufacturingInsights'];
      const isValid = requiredFields.every(field => data[field] !== undefined);
      if (!isValid) {
        throw new Error('FastAPI agent returned invalid insights structure, falling back to local logic');
      }

      // Ensure all array fields are actually arrays
      data.criticalRisks = Array.isArray(data.criticalRisks) ? data.criticalRisks : [];
      data.recommendations = Array.isArray(data.recommendations) ? data.recommendations : [];
      data.procurementInsights = Array.isArray(data.procurementInsights) ? data.procurementInsights : [];
      data.manufacturingInsights = Array.isArray(data.manufacturingInsights) ? data.manufacturingInsights : [];

      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }


  private generateLocalFallback(context: any) {
    // 1. Calculate Health Score
    const totalProducts = (context.inventory.rawMaterialsCount + context.inventory.finishedGoodsCount) || 1;
    const lowStockRatio = context.inventory.lowStockItems.length / totalProducts;
    
    const inventoryScore = Math.max(50, Math.round(100 - lowStockRatio * 150));
    const manufacturingScore = Math.max(50, Math.round(100 - context.manufacturing.delayedOrdersCount * 12));
    const procurementScore = Math.max(50, Math.round(100 - context.procurement.delayedPOsCount * 15));
    const salesScore = Math.max(50, Math.round(100 - context.sales.delayedOrdersCount * 10));
    
    const healthScore = Math.round((inventoryScore + manufacturingScore + procurementScore + salesScore) / 4);

    // 2. Generate Critical Risks & Recommendations
    const criticalRisks: any[] = [];
    const recommendations: any[] = [];

    // Check low stock raw materials
    context.inventory.lowStockItems.forEach((item: any) => {
      if (item.sku.startsWith('RM-') || item.name.includes('Wood') || item.name.includes('Screw')) {
        criticalRisks.push({
          risk: 'Stockout Expected',
          severity: item.free <= 0 ? 'High' : 'Medium',
          reason: `${item.name} is below safety limits. Remaining free stock: ${item.free} ${item.unitOfMeasure || 'pcs'}.`,
          roles: ['admin', 'inventory', 'purchase'],
        });

        const rate = item.sku === 'RM-SC-001' ? 15.0 : 3.0; // consumption estimation
        const days = item.free > 0 ? Math.floor(item.free / rate) : 0;

        recommendations.push({
          action: `Reorder ${item.name}`,
          impact: days <= 3 ? 'Critical' : 'High',
          reason: `Stockout expected within ${days} days. Current safety stock limits breached.`,
          roles: ['admin', 'purchase'],
        });
      }
    });

    // Check delayed orders
    if (context.sales.delayedOrdersCount > 0) {
      criticalRisks.push({
        risk: 'Fulfillment Delays',
        severity: 'High',
        reason: `${context.sales.delayedOrdersCount} sales orders are past their expected delivery dates.`,
        roles: ['admin', 'sales'],
      });
    }

    // Check pending approvals
    if (context.procurement.pendingPOsCount > 0) {
      recommendations.push({
        action: 'Approve Pending RFQs',
        impact: 'High',
        reason: `${context.procurement.pendingPOsCount} procurement request orders are pending quote evaluations.`,
        roles: ['admin', 'purchase'],
      });
    }

    // 3. Procurement Insights
    const procurementInsights = context.inventory.lowStockItems.map((item: any) => {
      let consumption = 1.0;
      let vendor = 'Apex Fasteners Corp';
      if (item.sku === 'RM-SC-001') {
        consumption = 15.0;
      } else if (item.sku.startsWith('RM-WL') || item.sku.startsWith('RM-CL') || item.sku.startsWith('RM-WT') || item.sku.startsWith('RM-CS') || item.sku.startsWith('RM-CB')) {
        consumption = 4.0;
        vendor = 'Global Timber Ltd';
      } else if (item.sku.startsWith('RM-WF')) {
        consumption = 1.5;
        vendor = 'Rainbow Coatings';
      }

      const daysRemaining = Math.max(0, Math.floor(item.free / consumption));
      const suggestedOrder = Math.max(100, Math.round(consumption * 30));

      return {
        name: item.name,
        sku: item.sku,
        currentStock: item.stock,
        consumption,
        daysRemaining,
        suggestedOrder,
        preferredVendor: vendor,
        riskScore: daysRemaining <= 4 ? 'High' : daysRemaining <= 8 ? 'Medium' : 'Low',
        urgency: daysRemaining <= 4 ? 'High' : 'Medium',
        reason: 'Projected demand exceeds current safety minimum.',
      };
    }).sort((a: any, b: any) => a.daysRemaining - b.daysRemaining);

    // 4. Manufacturing Insights
    const manufacturingInsights = context.manufacturing.activeRuns.map((mo: any, idx: number) => {
      // delay estimation based on raw materials
      const hasShortages = context.procurement.materialShortages.length > 0;
      const delayPct = hasShortages ? (idx === 0 ? '78%' : '45%') : '12%';

      return {
        moNumber: mo.moNumber,
        product: mo.product,
        delayRisk: delayPct,
        reason: hasShortages 
          ? 'Required raw materials have not arrived at inventory.' 
          : 'Machinery schedules are on track.',
        urgency: hasShortages ? 'High' : 'Low',
      };
    });

    // Provide default backup for demo data if database is empty
    if (procurementInsights.length === 0) {
      procurementInsights.push({
        name: 'Wood Screws',
        sku: 'RM-SC-001',
        currentStock: 120,
        consumption: 15,
        daysRemaining: 8,
        suggestedOrder: 500,
        preferredVendor: 'Global Timber Ltd',
        riskScore: 'High',
        urgency: 'Medium',
        reason: 'Projected demand exceeds current inventory.',
      });
    }

    if (manufacturingInsights.length === 0) {
      manufacturingInsights.push({
        moNumber: 'MO-102',
        product: 'Wooden Chair',
        delayRisk: '78%',
        reason: 'Required materials have not arrived.',
        urgency: 'High',
      });
    }

    // 5. Executive Summary
    const pendingSales = context.sales.openOrdersCount;
    const delayedMOsCount = context.manufacturing.delayedOrdersCount;
    const materialShortagesCount = context.procurement.materialShortages.length;

    let executiveSummary = `Production demand is active with ${pendingSales} open customer sales orders. `;
    if (delayedMOsCount > 0) {
      executiveSummary += `We have detected ${delayedMOsCount} manufacturing orders at delay risk. `;
    }
    if (materialShortagesCount > 0) {
      executiveSummary += `Three raw material lines are showing stockout warnings. `;
    }
    executiveSummary += `Procurement delays could impact delivery targets. Immediate action recommended: Evaluate and dispatch pending purchase orders.`;

    return {
      operationalHealthScore: healthScore,
      operationalHealthBreakdown: {
        inventory: inventoryScore,
        manufacturing: manufacturingScore,
        procurement: procurementScore,
        sales: salesScore,
      },
      criticalRisks: criticalRisks.length > 0 ? criticalRisks : [
        {
          risk: 'Low Stock Safety Alert',
          severity: 'Medium',
          reason: 'Average raw material reserves are nearing minimum buffer thresholds.',
          roles: ['admin', 'inventory'],
        }
      ],
      recommendations: recommendations.length > 0 ? recommendations : [
        {
          action: 'Approve Pending Purchase RFQs',
          impact: 'High',
          reason: 'Prevents safety stockouts across the assembly line.',
          roles: ['admin', 'purchase'],
        }
      ],
      procurementInsights,
      manufacturingInsights,
      executiveSummary,
    };
  }
}

export const aiEngineService = new AIEngineService();
