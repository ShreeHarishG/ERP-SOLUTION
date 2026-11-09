// =============================================================================
// Onchain Insights — Autonomous AI Tier Mapping Agent Gateway
// Proxies multi-tier BOM and supplier-component mapping requests to
// the SNSHub n8n Tier Mapping Webhook with resilient fallback.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getMockDependencyGraph } from '@/lib/mock-data/onchain-insights/dependencies';
import type { TierMappingAgentResult } from '@/types/onchain-insights';

const DEFAULT_TIER_MAPPING_URL = 'https://api.agents.snsihub.ai/webhook/30176d2a-a7cd-4f37-8da2-dda955fb52a5';

function parseJsonSafely(text: string): any {
  try {
    return JSON.parse(text);
  } catch (err) {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    throw err;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const webhookUrl =
      process.env.TIER_MAPPING_WEBHOOK_URL ||
      DEFAULT_TIER_MAPPING_URL;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let liveData: any = null;
    let agentSucceeded = false;

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const rawText = await res.text();
        const parsed = parseJsonSafely(rawText);
        liveData = parsed._responseData || (Array.isArray(parsed) ? parsed[0] : parsed);
        if (liveData && (liveData.parse_success !== undefined || liveData.summary)) {
          agentSucceeded = true;
        }
      }
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      console.warn('[Tier Mapping Webhook] Request error or timeout:', fetchErr?.message || fetchErr);
    }

    if (agentSucceeded && liveData) {
      const result: TierMappingAgentResult = {
        parseSuccess: Boolean(liveData.parse_success ?? true),
        supplierComponentRelationships: liveData.supplier_component_relationships || [],
        bomComponentRelationships: liveData.bom_component_relationships || [],
        unmappedSuppliers: liveData.unmapped_suppliers || [],
        unmappedComponents: liveData.unmapped_components || [],
        unmappedBoms: liveData.unmapped_boms || [],
        summary: {
          suppliersAnalyzed: Number(liveData.summary?.suppliers_analyzed ?? 0),
          componentsAnalyzed: Number(liveData.summary?.components_analyzed ?? 0),
          bomsAnalyzed: Number(liveData.summary?.boms_analyzed ?? 0),
          supplierComponentRelationshipsFound: Number(liveData.summary?.supplier_component_relationships_found ?? 0),
          bomComponentRelationshipsFound: Number(liveData.summary?.bom_component_relationships_found ?? 0),
        },
        validation: {
          valid: Boolean(liveData.validation?.valid ?? true),
          invalidSupplierRelationships: liveData.validation?.invalid_supplier_relationships || [],
          invalidBomRelationships: liveData.validation?.invalid_bom_relationships || [],
        },
        source: 'live_agent',
        lastMappedDate: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        source: 'live_agent',
        data: result,
      });
    }

    // --- Resilient Fallback Engine ---
    // If webhook is offline, analyze mock graph DAG to produce realistic tier audit
    const graph = getMockDependencyGraph();
    const suppliers = graph.nodes.filter(n => n.data.type === 'supplier');
    const materials = graph.nodes.filter(n => n.data.type === 'material');
    const products = graph.nodes.filter(n => n.data.type === 'product');

    const fallbackResult: TierMappingAgentResult = {
      parseSuccess: true,
      supplierComponentRelationships: suppliers.map((s, idx) => ({
        supplierId: s.id,
        supplierName: s.data.label,
        componentId: materials[idx % materials.length]?.id || 'mat-001',
        componentName: materials[idx % materials.length]?.data.label || 'Raw Material',
        tierLevel: 1,
      })),
      bomComponentRelationships: products.map((p, idx) => ({
        bomId: `bom-${p.id}`,
        productName: p.data.label,
        componentId: materials[idx % materials.length]?.id || 'mat-001',
        quantity: 1,
      })),
      unmappedSuppliers: [],
      unmappedComponents: ['mat-unmapped-01', 'mat-unmapped-02'],
      unmappedBoms: ['bom-custom-01'],
      summary: {
        suppliersAnalyzed: suppliers.length,
        componentsAnalyzed: materials.length,
        bomsAnalyzed: products.length,
        supplierComponentRelationshipsFound: suppliers.length,
        bomComponentRelationshipsFound: products.length,
      },
      validation: {
        valid: true,
        invalidSupplierRelationships: [],
        invalidBomRelationships: [],
      },
      source: 'fallback_engine',
      lastMappedDate: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      source: 'fallback_engine',
      warning: 'Live tier mapping agent unavailable. Fallback topology audit served.',
      data: fallbackResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Internal tier mapping agent proxy error', details: err?.message },
      { status: 500 }
    );
  }
}

