import {
  StakeholderNotification,
  NotificationFilterParams,
  NotificationsResponse,
  NotificationActionPayload,
  NotificationCategory,
} from '@/types/onchain-insights';

let MOCK_NOTIFICATIONS: StakeholderNotification[] = [
  {
    id: 'NOTIF-2026-001',
    category: 'approval_request',
    severity: 'critical',
    title: 'Executive Sign-Off Required: Emergency Blue Dart Air Freight Charter',
    message: 'Logistics team requested authorization for ₹1,65,000 air cargo uplift (Mumbai to Bangalore) to prevent line starvation on 40 sales orders.',
    createdAt: '2026-10-12T08:15:00Z',
    isRead: false,
    targetUrl: '/onchain-insights/approvals/APR-2026-001',
    targetLabel: 'Review & Sign Off Decision',
    relatedEntityId: 'APR-2026-001',
    relatedEntityName: 'Blue Dart BOM-BLR Charter',
    metricBadge: 'Immediate Urgency • ₹1.65L',
  },
  {
    id: 'NOTIF-2026-002',
    category: 'risk_alert',
    severity: 'critical',
    title: 'Disruption Severity Escalation: Nhava Sheva Berth 4 Congestion',
    message: 'Port container turnaround delay escalated to +18 days. High-Tensile Steel Fastener delivery reliability depressed by 24%.',
    createdAt: '2026-10-12T07:45:00Z',
    isRead: false,
    targetUrl: '/onchain-insights/disruptions',
    targetLabel: 'Inspect Disruption Timeline',
    relatedEntityId: 'DIS-2026-001',
    relatedEntityName: 'Nhava Sheva (JNPT) Terminal',
    metricBadge: '+18 Days Delay',
  },
  {
    id: 'NOTIF-2026-003',
    category: 'recommendation',
    severity: 'high',
    title: 'New Recovery Plan Generated: Rajkot Sub-Tier Foundry Outage',
    message: 'Baseline Algorithm evaluated 3 recovery options. Recommended Strategy: Contract Coimbatore Precision Foundry at ₹2,10,000 to recover 17 days.',
    createdAt: '2026-10-12T06:30:00Z',
    isRead: false,
    targetUrl: '/onchain-insights/mitigation',
    targetLabel: 'Open Scenario Lab',
    relatedEntityId: 'DIS-2026-002',
    relatedEntityName: 'Rajkot Foundry Grid Halt',
    metricBadge: 'Rank #1 • Saves 17 Days',
  },
  {
    id: 'NOTIF-2026-004',
    category: 'sku_transition',
    severity: 'high',
    title: 'SKU Crossover Threshold Reached: SKU-STL-001 Depletion Alert',
    message: 'Legacy Fastener stock has reached critical crossover point (220 units remaining). Automatic transition trigger recommends activating SKU-STL-002 next week.',
    createdAt: '2026-10-12T05:10:00Z',
    isRead: false,
    targetUrl: '/onchain-insights/sku-transition',
    targetLabel: 'View Transition Plan',
    relatedEntityId: 'SKU-STL-001',
    relatedEntityName: 'Fastener M10 Class-A',
    metricBadge: 'Stock Depletion: 82%',
  },
  {
    id: 'NOTIF-2026-005',
    category: 'shipment_delay',
    severity: 'high',
    title: 'Shipment Intercept: Freight Consignment TRK-IN-9081 Held at ICD',
    message: 'Consignment TRK-IN-9081 carrying 1,400 kg Cast Iron Motor Housings delayed by railway shunting bottleneck at Ahmedabad junction.',
    createdAt: '2026-10-12T04:20:00Z',
    isRead: false,
    targetUrl: '/onchain-insights/disruptions',
    targetLabel: 'Track Shipment Consignment',
    relatedEntityId: 'SHP-9081',
    relatedEntityName: 'TRK-IN-9081 (Western Foundries)',
    metricBadge: '+5 Days In-Transit',
  },
  {
    id: 'NOTIF-2026-006',
    category: 'approval_request',
    severity: 'high',
    title: 'Pending Dual-Sourcing Sourcing Approval: Bharat Precision (60/40 Split)',
    message: 'Senior Sourcing team submitted dual-sourcing allocation contract addendum for ₹95,000 setup & unit premium to hedge JNPT port risks.',
    createdAt: '2026-10-12T03:50:00Z',
    isRead: false,
    targetUrl: '/onchain-insights/approvals/APR-2026-002',
    targetLabel: 'Review Dual-Source Plan',
    relatedEntityId: 'APR-2026-002',
    relatedEntityName: 'Bharat Precision Dual-Source',
    metricBadge: 'Urgent Urgency • ₹95,000',
  },
  {
    id: 'NOTIF-2026-007',
    category: 'risk_alert',
    severity: 'high',
    title: 'Supplier Risk Score Spike: Apex Fasteners India Surges to 84/100',
    message: 'Rule-based risk assessment flagged delivery score degradation from 92% to 68% following maritime container demurrage.',
    createdAt: '2026-10-11T20:15:00Z',
    isRead: true,
    targetUrl: '/onchain-insights/risk-assessment',
    targetLabel: 'View Risk Prioritization',
    relatedEntityId: 'SUP-001',
    relatedEntityName: 'Apex Fasteners India Ltd',
    metricBadge: 'Score 84/100 (Critical)',
  },
  {
    id: 'NOTIF-2026-008',
    category: 'approval_request',
    severity: 'medium',
    title: 'Approved Governance Decision: Kochi Tanker Road Diversion (₹65,000)',
    message: 'Executive VP Vikram Mehta approved road tanker procurement for 8,000L lubricant to bypass Chennai storm gates.',
    createdAt: '2026-10-11T16:45:00Z',
    isRead: true,
    targetUrl: '/onchain-insights/approvals/APR-2026-003',
    targetLabel: 'View Approved Decision',
    relatedEntityId: 'APR-2026-003',
    relatedEntityName: 'Kochi Bulk Tanker',
    metricBadge: 'Approved by VP',
  },
  {
    id: 'NOTIF-2026-009',
    category: 'shipment_delay',
    severity: 'medium',
    title: 'Vessel AIS Telemetry Notice: MV Golden Trader Anchored at Mumbai Roads',
    message: 'Container carrier carrying 2,200 units of raw extruded rods anchored awaiting pilotage berth slot.',
    createdAt: '2026-10-11T14:10:00Z',
    isRead: true,
    targetUrl: '/onchain-insights/disruptions',
    targetLabel: 'Inspect AIS Telemetry',
    relatedEntityId: 'SHP-8821',
    relatedEntityName: 'MV Golden Trader',
    metricBadge: 'Anchored Offshore',
  },
  {
    id: 'NOTIF-2026-010',
    category: 'sku_transition',
    severity: 'medium',
    title: 'Transition Progress Milestone: SKU-CAS-002 Phase-In on Schedule',
    message: 'New Ductile Iron Housing qualification tests passed metallurgical review. 650 units staged at Pune warehouse.',
    createdAt: '2026-10-11T11:00:00Z',
    isRead: true,
    targetUrl: '/onchain-insights/sku-transition',
    targetLabel: 'Open Transition Workspace',
    relatedEntityId: 'SKU-CAS-002',
    relatedEntityName: 'Ductile Iron Housing Gen-2',
    metricBadge: 'Week 4 Balanced Run',
  },
  {
    id: 'NOTIF-2026-011',
    category: 'recommendation',
    severity: 'medium',
    title: 'Mitigation Trade-Off Analysis: Chennai Inter-Plant Buffer Drawdown',
    message: 'Scenario Lab evaluated Option 3 (Dedicated hotshot truck ₹42,000). Feasibility 80%, but leaves Chennai plant at 18% reserve.',
    createdAt: '2026-10-11T09:30:00Z',
    isRead: true,
    targetUrl: '/onchain-insights/mitigation',
    targetLabel: 'Inspect Scenario Trade-Off',
    relatedEntityId: 'OPT-001-C',
    relatedEntityName: 'Chennai Buffer Drawdown',
    metricBadge: 'High Residual Risk',
  },
  {
    id: 'NOTIF-2026-012',
    category: 'risk_alert',
    severity: 'medium',
    title: 'Secondary Tier-2 Warning: Sub-Tier Foundry Rajkot Grid Failure',
    message: 'Western Foundries declared auxiliary power generation active; heat capacity operating at 45% standard volume.',
    createdAt: '2026-10-10T18:00:00Z',
    isRead: true,
    targetUrl: '/onchain-insights/dependencies',
    targetLabel: 'View Sub-Tier Dependency',
    relatedEntityId: 'sub-002',
    relatedEntityName: 'Western Foundries Rajkot',
    metricBadge: '45% Capacity Utilization',
  },
  {
    id: 'NOTIF-2026-013',
    category: 'approval_request',
    severity: 'low',
    title: 'Governance Rejection: Commercial Customer Delivery Deferral Concessions',
    message: 'Executive team rejected proposal to grant 2% client rebate for 10-day delay. Secondary foundry contracted instead.',
    createdAt: '2026-10-10T15:30:00Z',
    isRead: true,
    targetUrl: '/onchain-insights/approvals/APR-2026-005',
    targetLabel: 'Inspect Rejected Decision',
    relatedEntityId: 'APR-2026-005',
    relatedEntityName: 'Commercial Deferral Proposal',
    metricBadge: 'Rejected by VP',
  },
  {
    id: 'NOTIF-2026-014',
    category: 'shipment_delay',
    severity: 'low',
    title: 'Weather Warning Advisory: Coastal Heavy Rains Expected at Ennore Port',
    message: 'IMD regional meteorological bureau issued coastal storm advisory for Tamil Nadu corridor. Low immediate operational threat.',
    createdAt: '2026-10-10T12:00:00Z',
    isRead: true,
    targetUrl: '/onchain-insights/disruptions',
    targetLabel: 'View Weather Signals',
    relatedEntityId: 'DIS-2026-003',
    relatedEntityName: 'Ennore Marine Gateway',
    metricBadge: 'Advisory Active',
  },
  {
    id: 'NOTIF-2026-015',
    category: 'approval_request',
    severity: 'low',
    title: 'Qualification Gate Authorized: Coimbatore Precision Castings Approved',
    message: 'Supplier qualification review queue approved Coimbatore Precision Castings following metallurgical defect rate audit.',
    createdAt: '2026-10-09T17:00:00Z',
    isRead: true,
    targetUrl: '/onchain-insights/suppliers/SUP-004',
    targetLabel: 'Inspect Supplier Profile',
    relatedEntityId: 'SUP-004',
    relatedEntityName: 'Coimbatore Precision Castings',
    metricBadge: 'Qualified Status',
  },
  {
    id: 'NOTIF-2026-016',
    category: 'sku_transition',
    severity: 'low',
    title: 'SKU Master Record Updated: SKU-STL-002 Cross-Referenced in ERP',
    message: 'Bill of Materials explode engine updated: all new assemblies mapped to High-Tensile Steel Fastener series.',
    createdAt: '2026-10-09T10:30:00Z',
    isRead: true,
    targetUrl: '/onchain-insights/sku-transition',
    targetLabel: 'Open BOM Mapping',
    relatedEntityId: 'SKU-STL-002',
    relatedEntityName: 'High-Tensile Fasteners',
    metricBadge: 'BOM Synced',
  },
];

/**
 * Filter notifications.
 */
export function getNotifications(filters?: NotificationFilterParams): NotificationsResponse {
  let list = [...MOCK_NOTIFICATIONS];

  if (filters?.unreadOnly) {
    list = list.filter((item) => !item.isRead);
  }

  if (filters?.category && filters.category !== 'all') {
    list = list.filter((item) => item.category === filters.category);
  }

  if (filters?.severity && filters.severity !== 'all') {
    list = list.filter((item) => item.severity === filters.severity);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.relatedEntityName && item.relatedEntityName.toLowerCase().includes(q))
    );
  }

  // Sort newest first
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;

  const categoryCounts: Record<NotificationCategory, number> = {
    risk_alert: MOCK_NOTIFICATIONS.filter((n) => n.category === 'risk_alert').length,
    shipment_delay: MOCK_NOTIFICATIONS.filter((n) => n.category === 'shipment_delay').length,
    approval_request: MOCK_NOTIFICATIONS.filter((n) => n.category === 'approval_request').length,
    recommendation: MOCK_NOTIFICATIONS.filter((n) => n.category === 'recommendation').length,
    sku_transition: MOCK_NOTIFICATIONS.filter((n) => n.category === 'sku_transition').length,
  };

  return {
    data: list,
    total: list.length,
    unreadCount,
    categoryCounts,
  };
}

/**
 * Update read/unread status.
 */
export function updateNotificationStatus(
  payload: NotificationActionPayload
): { success: boolean; unreadCount: number } {
  if (payload.action === 'mark_all_read') {
    MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.map((n) => ({ ...n, isRead: true }));
  } else if (payload.notificationIds && payload.notificationIds.length > 0) {
    const targetIds = new Set(payload.notificationIds.map((id) => id.toUpperCase()));
    const targetRead = payload.action === 'mark_as_read';

    MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.map((n) => {
      if (targetIds.has(n.id.toUpperCase())) {
        return { ...n, isRead: targetRead };
      }
      return n;
    });
  }

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;
  return { success: true, unreadCount };
}
