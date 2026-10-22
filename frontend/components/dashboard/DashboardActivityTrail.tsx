'use client';

import React from 'react';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import { format } from 'date-fns';
import type { AuditLog } from '@/services/dashboard.api';

interface DashboardActivityTrailProps {
  recentActivity?: AuditLog[];
  userRole?: string;
}

export default function DashboardActivityTrail({
  recentActivity,
  userRole,
}: DashboardActivityTrailProps) {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-2">
          <Activity size={16} className="text-brand-accent animate-pulse" />
          Connected Operations Activity Trail
        </h3>
        {userRole === 'admin' && (
          <Link href="/audit" className="text-xs font-semibold text-brand-primary hover:underline">
            Full Log →
          </Link>
        )}
      </div>

      <div className="overflow-y-auto space-y-4 pr-1 mt-2 max-h-[300px] text-xs">
        {recentActivity && recentActivity.length > 0 ? (
          recentActivity.map((log: any) => (
            <div
              key={log.id}
              className="relative pl-6 pb-2 border-l border-slate-100 last:border-0 last:pb-0"
            >
              <span className="absolute left-[-4.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#4B164C] ring-4 ring-purple-100" />
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wide">
                  {log.action.replace(/_/g, ' ')}
                </span>
                <time className="text-[9px] text-text-muted">
                  {format(new Date(log.createdAt), 'MMM d, HH:mm')}
                </time>
              </div>
              <p className="text-text-secondary font-medium">
                <span className="font-bold text-text-primary">{log.userName}</span>
                {log.entityName && <> — {log.entityName}</>}
              </p>
            </div>
          ))
        ) : (
          <p className="text-text-muted">No activity logs recorded yet.</p>
        )}
      </div>
    </div>
  );
}
