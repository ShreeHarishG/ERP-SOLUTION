// =============================================================================
// Autonomous Supply Chain Control Tower — 14-Agent Type Definitions & Contracts
// Based on Control Tower Agent I/O Specification v1.0
// =============================================================================

export interface CommonIncidentEvent {
  event_id: string;
  timestamp: string;
  supplier_id: string;
  product_id: string;
  material_id: string;
  location: string;
  risk_type: string;
  risk_score: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: number;
  prediction_window: string;
  affected_quantity: number;
  inventory_days: number;
  revenue_at_risk: number;
  recommended_actions: string[];
  status: 'OPEN' | 'IN_PROGRESS' | 'MITIGATED' | 'RESOLVED' | 'CLOSED';
  confidence: number;
}

export type AgentId =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14
  | 'supplier_mapping'
  | 'shipment_tracking'
  | 'external_risk'
  | 'financial_health'
  | 'disruption_prediction'
  | 'impact_assessment'
  | 'mitigation'
  | 'procurement_trigger'
  | 'demand_supply'
  | 'supplier_scorecard'
  | 'carbon_sustainability'
  | 'dashboard'
  | 'stakeholder_alert'
  | 'post_mortem';

export interface AgentDefinition {
  id: number;
  key: string;
  name: string;
  type: 'Knowledge Graph' | 'Telematics / IoT' | 'OSINT / Feeds' | 'Financial ML' | 'Predictive ML Core' | 'Deterministic Impact' | 'Optimization Solver' | 'Orchestrator' | 'Linear Programming' | 'Composite Scoring' | 'GHG Engine' | 'Aggregation Layer' | 'Rules & Dispatch' | 'RL / Feedback Loop';
  investorPitch: string;
  purpose: string;
  inputsDescription: string;
  outputsDescription: string;
  upstream: number[];
  downstream: number[];
  sampleInput: Record<string, any>;
  sampleOutput: Record<string, any>;
  latencyMs: number;
  accuracyConfidence: number;
}

export interface UnifiedWebhookRequest {
  agent_id?: AgentId;
  event?: Partial<CommonIncidentEvent>;
  payload?: Record<string, any>;
  callback_url?: string;
  simulate_delay_ms?: number;
}

export interface UnifiedWebhookResponse {
  success: boolean;
  mode: 'live_webhook' | 'mock_simulation';
  agent_id: number;
  agent_name: string;
  timestamp: string;
  latency_ms: number;
  enriched_event: CommonIncidentEvent;
  agent_output: Record<string, any>;
  downstream_agents: number[];
  callback_status?: {
    delivered: boolean;
    url?: string;
    status_code?: number;
  };
  error?: string;
}

export interface ControlTowerConfig {
  mode: 'mock' | 'webhook';
  webhookUrl: string;
  webhookSecret: string;
  outgoingCallbackUrl: string;
  simulateLatency: boolean;
  lastHealthCheck?: {
    timestamp: string;
    status: 'healthy' | 'degraded' | 'offline';
    latencyMs: number;
    httpStatus: number;
  };
}
