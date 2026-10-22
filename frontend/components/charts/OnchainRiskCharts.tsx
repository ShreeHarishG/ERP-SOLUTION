'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { RISK_TIER_CONFIG } from '@/types/onchain-insights';
import type { RiskTier } from '@/types/onchain-insights';

const PIE_COLORS: Record<RiskTier, string> = {
  critical: '#e11d48',
  high: '#ea580c',
  medium: '#d97706',
  low: '#059669',
};

const RiskTrendTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-surface-border rounded-lg shadow-lg p-3 text-xs space-y-1.5">
      <p className="font-bold text-text-primary">{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#4B164C]" />
        <span className="text-text-secondary">Risk Score:</span>
        <span className="font-bold text-[#4B164C]">{payload[0]?.value}</span>
      </div>
      {payload[1] && (
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-text-secondary">Disruptions:</span>
          <span className="font-bold text-rose-600">{payload[1]?.value}</span>
        </div>
      )}
    </div>
  );
};

interface OnchainRiskChartsProps {
  shipmentRiskTrend: Array<{
    date: string;
    riskScore: number;
    activeDisruptions: number;
  }>;
  supplierRiskDistribution: Array<{
    tier: RiskTier;
    count: number;
    percentage: number;
  }>;
}

export default function OnchainRiskCharts({
  shipmentRiskTrend,
  supplierRiskDistribution,
}: OnchainRiskChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Shipment Risk Trend (Area Chart) */}
      <div className="glass-card p-5 space-y-4 lg:col-span-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Risk Monitoring
            </h3>
            <p className="text-lg font-bold text-text-primary mt-0.5">Shipment Risk Trend</p>
          </div>
          <div className="flex flex-wrap gap-3 text-[9px] font-bold text-text-muted">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#4B164C]" /> Risk Score
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Active Disruptions
            </div>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={shipmentRiskTrend}
              margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
            >
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4B164C" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4B164C" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="disruptionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: '#a396a1', fontWeight: 600 }}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
                interval={Math.floor(shipmentRiskTrend.length / 8)}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#a396a1', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip content={<RiskTrendTooltip />} />
              <Area
                type="monotone"
                dataKey="riskScore"
                stroke="#4B164C"
                strokeWidth={2}
                fill="url(#riskGradient)"
                name="Risk Score"
              />
              <Area
                type="monotone"
                dataKey="activeDisruptions"
                stroke="#e11d48"
                strokeWidth={1.5}
                fill="url(#disruptionGradient)"
                name="Disruptions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supplier Risk Distribution (Pie/Donut) */}
      <div className="glass-card p-5 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Risk Distribution
          </h3>
          <p className="text-lg font-bold text-text-primary mt-0.5">Supplier Risk Tiers</p>
        </div>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={supplierRiskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="count"
                nameKey="tier"
                strokeWidth={2}
                stroke="#ffffff"
              >
                {supplierRiskDistribution.map((entry) => (
                  <Cell key={entry.tier} fill={PIE_COLORS[entry.tier]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${value ?? 0} supplier${value !== 1 ? 's' : ''}`,
                  typeof name === 'string'
                    ? name.charAt(0).toUpperCase() + name.slice(1)
                    : String(name || ''),
                ]}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: any) => (
                  <span className="text-[10px] font-semibold text-text-secondary capitalize">
                    {String(value)}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Summary counts below pie */}
        <div className="grid grid-cols-4 gap-1.5">
          {supplierRiskDistribution.map((d) => (
            <div
              key={d.tier}
              className={`text-center p-1.5 rounded-lg ${RISK_TIER_CONFIG[d.tier].bg} border ${
                RISK_TIER_CONFIG[d.tier].border
              }`}
            >
              <p className={`text-lg font-bold ${RISK_TIER_CONFIG[d.tier].color}`}>{d.count}</p>
              <p className="text-[8px] font-bold uppercase tracking-wider text-text-muted">{d.tier}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
