// =============================================================================
// Autonomous Control Tower — Unified Webhook Service & Simulation Engine
// Single Gateway for all 14 AI Agents with Outgoing Webhook Dispatcher
// =============================================================================

import {
  AgentId,
  CommonIncidentEvent,
  ControlTowerConfig,
  UnifiedWebhookRequest,
  UnifiedWebhookResponse,
} from '@/types/control-tower-agents';
import {
  CONTROL_TOWER_AGENTS,
  INITIAL_COMMON_EVENT,
} from '@/lib/mock-data/control-tower-agents';
import { assertSafeHttpUrl } from '@/lib/server/utils/safe-url';

// Runtime configuration singleton
let towerConfig: ControlTowerConfig = {
  mode: process.env.CONTROL_TOWER_MODE === 'webhook' ? 'webhook' : 'mock',
  webhookUrl: process.env.CONTROL_TOWER_WEBHOOK_URL || '',
  webhookSecret: process.env.CONTROL_TOWER_WEBHOOK_SECRET || '',
  outgoingCallbackUrl: process.env.CONTROL_TOWER_OUTGOING_WEBHOOK || '',
  simulateLatency: true,
  lastHealthCheck: undefined,
};

let webhookStats = {
  totalProcessed: 0,
  successfulCalls: 0,
  fallbackCount: 0,
  averageLatencyMs: 85,
  lastActive: new Date().toISOString(),
};

import prisma from '@/lib/server/db';

let isInitialized = false;

export class ControlTowerWebhookService {
  /**
   * Lazily ensure persistent mode is loaded from database
   */
  async ensureInitialized(): Promise<void> {
    if (isInitialized) return;
    try {
      const rows: any = await prisma.$queryRawUnsafe(
        `SELECT value FROM system_settings WHERE key = 'control_tower_mode' LIMIT 1`
      );
      if (rows && rows.length > 0 && (rows[0].value === 'mock' || rows[0].value === 'webhook')) {
        towerConfig.mode = rows[0].value;
      }
      isInitialized = true;
    } catch {
      // Fall back to env-configured default if database is unavailable
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): ControlTowerConfig {
    return { ...towerConfig };
  }

  /**
   * Get telemetry stats
   */
  getStats() {
    return { ...webhookStats };
  }

  /**
   * Admin may toggle mode only. URLs always come from env.
   * Mode is persisted to PostgreSQL system_settings so it survives restarts.
   */
  async updateConfig(patch: { mode?: ControlTowerConfig['mode'] }): Promise<ControlTowerConfig> {
    if (patch.mode === 'mock' || patch.mode === 'webhook') {
      towerConfig.mode = patch.mode;
      try {
        await prisma.$executeRawUnsafe(
          `INSERT INTO system_settings (key, value, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
          'control_tower_mode',
          patch.mode
        );
      } catch (err) {
        console.warn('[ControlTower] Warning: could not persist mode to DB:', err);
      }
    }
    towerConfig.webhookUrl = process.env.CONTROL_TOWER_WEBHOOK_URL || '';
    towerConfig.webhookSecret = process.env.CONTROL_TOWER_WEBHOOK_SECRET || '';
    towerConfig.outgoingCallbackUrl = process.env.CONTROL_TOWER_OUTGOING_WEBHOOK || '';
    return this.getConfig();
  }


  /**
   * Ping / Health check the external single webhook endpoint
   */
  async pingWebhook(url?: string): Promise<{
    status: 'healthy' | 'degraded' | 'offline';
    latencyMs: number;
    httpStatus: number;
    message: string;
  }> {
    void url;
    const targetUrl = process.env.CONTROL_TOWER_WEBHOOK_URL || '';
    if (!targetUrl) {
      return {
        status: 'offline',
        latencyMs: 0,
        httpStatus: 400,
        message: 'No webhook endpoint configured. Currently running in mock data mode.',
      };
    }

    let safeUrl: string;
    try {
      safeUrl = assertSafeHttpUrl(targetUrl);
    } catch (err: any) {
      return {
        status: 'offline',
        latencyMs: 0,
        httpStatus: 400,
        message: err.message || 'Webhook URL is not allowed',
      };
    }

    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const response = await fetch(safeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-control-tower-ping': 'true',
          ...(towerConfig.webhookSecret
            ? { Authorization: `Bearer ${towerConfig.webhookSecret}` }
            : {}),
        },
        body: JSON.stringify({
          action: 'PING',
          timestamp: new Date().toISOString(),
          version: '1.0',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - start;

      const isHealthy = response.ok;
      towerConfig.lastHealthCheck = {
        timestamp: new Date().toISOString(),
        status: isHealthy ? 'healthy' : 'degraded',
        latencyMs,
        httpStatus: response.status,
      };

      return {
        status: isHealthy ? 'healthy' : 'degraded',
        latencyMs,
        httpStatus: response.status,
        message: isHealthy
          ? `Webhook connected successfully (${latencyMs}ms)`
          : `Webhook returned HTTP status ${response.status}`,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      towerConfig.lastHealthCheck = {
        timestamp: new Date().toISOString(),
        status: 'offline',
        latencyMs,
        httpStatus: 0,
      };

      return {
        status: 'offline',
        latencyMs,
        httpStatus: 0,
        message: `Webhook unreachable: ${err.message}`,
      };
    }
  }

  /**
   * Resolve numeric Agent ID from input
   */
  resolveAgentId(idOrKey?: AgentId, payload?: Record<string, any>): number {
    if (typeof idOrKey === 'number' && idOrKey >= 1 && idOrKey <= 14) {
      return idOrKey;
    }

    if (typeof idOrKey === 'string') {
      const found = CONTROL_TOWER_AGENTS.find((a) => a.key === idOrKey);
      if (found) return found.id;
    }

    // Auto-detect agent from payload signature
    if (payload) {
      if ('bom' in payload) return 1;
      if ('shipment_id' in payload && 'carrier' in payload) return 2;
      if ('risk_category' in payload || 'corridor' in payload) return 3;
      if ('total_debt' in payload || 'liquidity' in payload) return 4;
      if ('external_risk_score' in payload) return 5;
      if ('affected_materials' in payload || 'impact_window_days' in payload) return 6;
      if ('acceptable_lead_time_days' in payload || 'disrupted_supplier' in payload) return 7;
      if ('unit_price' in payload && 'required_date' in payload) return 8;
      if ('supply_deficit' in payload || 'warehouses' in payload) return 9;
      if ('rolling_window_months' in payload) return 10;
      if ('weight_kg' in payload && 'transport_mode' in payload) return 11;
      if ('include_active_incidents' in payload) return 12;
      if ('revenue_at_risk' in payload && 'supplier_name' in payload) return 13;
      if ('actual_delay_days' in payload || 'mitigation_cost' in payload) return 14;
    }

    return 5; // Default to Disruption ML Core
  }

  /**
   * Main Webhook Processor: All-in-One Ingestion & Outgoing Webhook Dispatch
   */
  async processWebhook(request: UnifiedWebhookRequest): Promise<UnifiedWebhookResponse> {
    await this.ensureInitialized();
    const startTime = Date.now();
    const agentId = this.resolveAgentId(request.agent_id, request.payload);
    const agentDef = CONTROL_TOWER_AGENTS.find((a) => a.id === agentId)!;

    webhookStats.totalProcessed += 1;
    webhookStats.lastActive = new Date().toISOString();

    let agentOutput: Record<string, any>;
    let executionMode: 'live_webhook' | 'mock_simulation' = 'mock_simulation';
    let errorMessage: string | undefined;

    // 1. Check if Single External Webhook Mode is enabled
    if (towerConfig.mode === 'webhook' && towerConfig.webhookUrl) {
      try {
        const safeUrl = assertSafeHttpUrl(towerConfig.webhookUrl);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(safeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-agent-id': String(agentId),
            'x-agent-key': agentDef.key,
            ...(towerConfig.webhookSecret
              ? { Authorization: `Bearer ${towerConfig.webhookSecret}` }
              : {}),
          },
          body: JSON.stringify({
            agent_id: agentId,
            agent_key: agentDef.key,
            timestamp: new Date().toISOString(),
            event: request.event || INITIAL_COMMON_EVENT,
            payload: request.payload || agentDef.sampleInput,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`External webhook returned HTTP ${response.status}`);
        }

        const externalData = await response.json();
        agentOutput = externalData.output || externalData.agent_output || externalData;
        executionMode = 'live_webhook';
        webhookStats.successfulCalls += 1;
      } catch (err: any) {
        console.warn(`[ControlTowerWebhook] External webhook failed (${err.message}). Gracefully falling back to mock engine.`);
        errorMessage = `External webhook error: ${err.message}. Seamlessly fell back to built-in simulation.`;
        webhookStats.fallbackCount += 1;
        agentOutput = this.generateMockOutput(agentDef, request.payload);
      }
    } else {
      // 2. High-fidelity Mock Mode
      if (towerConfig.simulateLatency) {
        const delay = request.simulate_delay_ms || agentDef.latencyMs || 80;
        await new Promise((resolve) => setTimeout(resolve, Math.min(delay, 500)));
      }
      agentOutput = this.generateMockOutput(agentDef, request.payload);
      webhookStats.successfulCalls += 1;
    }

    // 3. Enrich the Common Incident Event
    const enrichedEvent: CommonIncidentEvent = {
      ...INITIAL_COMMON_EVENT,
      ...(request.event || {}),
      timestamp: new Date().toISOString(),
    };

    // Agent-specific enrichments
    if (agentId === 3 && agentOutput.severity) {
      enrichedEvent.risk_score = agentOutput.severity * 10;
    } else if (agentId === 5 && agentOutput.disruption_probability) {
      enrichedEvent.probability = agentOutput.disruption_probability;
      enrichedEvent.severity = agentOutput.risk_level || 'CRITICAL';
    } else if (agentId === 6 && agentOutput.estimated_revenue_impact) {
      enrichedEvent.revenue_at_risk = agentOutput.estimated_revenue_impact;
      enrichedEvent.inventory_days = agentOutput.inventory_coverage_days || 4;
    } else if (agentId === 7 && agentOutput.recommended_action) {
      enrichedEvent.recommended_actions = [
        agentOutput.recommended_action,
        ...(agentOutput.recommendations?.map((r: any) => r.action) || []),
      ];
    } else if (agentId === 8 && agentOutput.status) {
      enrichedEvent.status = agentOutput.status === 'CREATED' ? 'MITIGATED' : 'IN_PROGRESS';
    }

    const totalLatency = Date.now() - startTime;
    webhookStats.averageLatencyMs = Math.round(
      (webhookStats.averageLatencyMs * 0.8) + (totalLatency * 0.2)
    );

    // 4. Outgoing Webhook Dispatcher
    const callbackTarget = towerConfig.outgoingCallbackUrl;
    let callbackStatus: UnifiedWebhookResponse['callback_status'] = undefined;

    if (callbackTarget) {
      callbackStatus = await this.dispatchOutgoingWebhook(callbackTarget, {
        agent_id: agentId,
        agent_name: agentDef.name,
        timestamp: new Date().toISOString(),
        event: enrichedEvent,
        output: agentOutput,
      });
    }

    return {
      success: true,
      mode: executionMode,
      agent_id: agentId,
      agent_name: agentDef.name,
      timestamp: new Date().toISOString(),
      latency_ms: totalLatency,
      enriched_event: enrichedEvent,
      agent_output: agentOutput,
      downstream_agents: agentDef.downstream,
      callback_status: callbackStatus,
      error: errorMessage,
    };
  }

  /**
   * Dispatch output to destination webhook
   */
  private async dispatchOutgoingWebhook(
    url: string,
    data: Record<string, any>
  ): Promise<{ delivered: boolean; url: string; status_code?: number }> {
    try {
      const safeUrl = assertSafeHttpUrl(url);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(safeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-control-tower-event': 'agent_output',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return {
        delivered: res.ok,
        url,
        status_code: res.status,
      };
    } catch {
      return {
        delivered: false,
        url,
        status_code: 0,
      };
    }
  }

  /**
   * Generate realistic mock response merging any user overrides
   */
  private generateMockOutput(
    agentDef: (typeof CONTROL_TOWER_AGENTS)[0],
    userPayload?: Record<string, any>
  ): Record<string, any> {
    const base = JSON.parse(JSON.stringify(agentDef.sampleOutput));
    if (!userPayload) return base;

    // Dynamic contextual adjustments
    if (userPayload.supplier_id && 'supplier_id' in base) {
      base.supplier_id = userPayload.supplier_id;
    }
    if (userPayload.product_id && 'product_id' in base) {
      base.product_id = userPayload.product_id;
    }
    if (userPayload.location && 'location' in base) {
      base.location = userPayload.location;
    }
    if (userPayload.shipment_id && 'shipment_id' in base) {
      base.shipment_id = userPayload.shipment_id;
    }

    return base;
  }
}

export const controlTowerWebhookService = new ControlTowerWebhookService();
