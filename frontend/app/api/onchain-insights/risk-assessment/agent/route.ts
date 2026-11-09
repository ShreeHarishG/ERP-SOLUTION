// =============================================================================
// Onchain Insights — Autonomous AI Risk Analysis Agent Gateway
// Proxies risk evaluation requests to the external SNSHub n8n Agent Webhook
// with resilient fallback to deterministic scoring.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { calculateSupplierRiskAssessments } from '@/lib/server/modules/onchain-insights/risk-scoring';
import type { AgentRiskAuditResult, RiskTier } from '@/types/onchain-insights';

const DEFAULT_WEBHOOK_URL = 'https://api.agents.snsihub.ai/webhook/56967650-dad6-4a36-814a-22134bbc62fe';

function normalizeRiskTier(tier?: string): RiskTier {
  if (!tier) return 'medium';
  const clean = tier.toLowerCase().trim();
  if (clean === 'critical') return 'critical';
  if (clean === 'high') return 'high';
  if (clean === 'low') return 'low';
  return 'medium';
}

function parseJsonSafely(text: string): any {
  try {
    return JSON.parse(text);
  } catch (err) {
    // Attempt markdown code block extraction
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    throw err;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supplierId = body.supplierId || 'sup-001';
    const supplierName = body.supplierName || 'Timber Corp India';
    const query = body.query || 'Assess supplier risk';

    const webhookUrl =
      process.env.RISK_ANALYSIS_WEBHOOK_URL ||
      DEFAULT_WEBHOOK_URL;

    // Call external AI agent webhook with an 8-second timeout
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
        body: JSON.stringify({
          supplier_id: supplierId,
          supplier_name: supplierName,
          query: query,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const rawText = await res.text();
        const parsed = parseJsonSafely(rawText);
        liveData = Array.isArray(parsed) ? parsed[0] : parsed;
        if (liveData && (liveData.overall_score !== undefined || liveData.narrative_explanation)) {
          agentSucceeded = true;
        }
      }
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      console.warn('[Risk Agent Webhook] Connection error or timeout:', fetchErr?.message || fetchErr);
    }

    if (agentSucceeded && liveData) {
      const overallScore = typeof liveData.overall_score === 'number'
        ? liveData.overall_score
        : Number(liveData.overall_score) || 50;

      const result: AgentRiskAuditResult = {
        id: liveData.id || `agent-${Date.now()}`,
        supplierId,
        supplierName,
        overallScore,
        riskTier: normalizeRiskTier(liveData.risk_tier),
        factors: liveData.factors || {},
        primaryRiskDriver: liveData.primary_risk_driver || 'Operational corridor exposure',
        narrativeExplanation:
          liveData.narrative_explanation ||
          `${supplierName} risk assessment completed by AI agent with score ${overallScore}/100.`,
        contributingRootCauses: Array.isArray(liveData.contributingRootCauses)
          ? liveData.contributingRootCauses
          : ['Single-source supply chain dependency', 'Capacity limit exposure'],
        recommendedMitigation:
          liveData.recommended_mitigation ||
          'Establish secondary supply corridor and monitor monthly delivery performance.',
        lastAssessmentDate: liveData.last_assessment_date || new Date().toISOString(),
        source: 'live_agent',
        confidenceLevel: 'AI Agent Verified (SNSHub)',
      };

      return NextResponse.json({
        success: true,
        source: 'live_agent',
        data: result,
      });
    }

    // --- Resilient Fallback Engine ---
    // If webhook is unreachable or timed out, calculate deterministic score
    const fallbackResults = calculateSupplierRiskAssessments();
    const matched = fallbackResults.data.find((s) => s.supplierId === supplierId) || fallbackResults.data[0];

    const fallbackResult: AgentRiskAuditResult = {
      id: `fallback-${supplierId}`,
      supplierId: matched.supplierId,
      supplierName: matched.supplierName,
      overallScore: matched.overallRiskScore,
      riskTier: matched.riskTier,
      factors: matched.factors,
      primaryRiskDriver: matched.primaryRiskDriver,
      narrativeExplanation: matched.narrativeExplanation,
      contributingRootCauses: matched.contributingRootCauses,
      recommendedMitigation: matched.recommendedMitigation,
      lastAssessmentDate: new Date().toISOString(),
      source: 'fallback_engine',
      confidenceLevel: 'Deterministic Fallback Engine',
    };

    return NextResponse.json({
      success: true,
      source: 'fallback_engine',
      warning: 'Live AI agent unavailable. Deterministic rule-based assessment served.',
      data: fallbackResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Internal risk assessment agent proxy error', details: err?.message },
      { status: 500 }
    );
  }
}

