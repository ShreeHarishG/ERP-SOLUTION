'use client';

import React from 'react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Badge from '@/components/ui/Badge';
import { LayoutDashboard, TrendingUp, Cpu, Truck, Warehouse } from 'lucide-react';
import type { User } from '@/services/auth.api';

interface DashboardHeaderProps {
  userRole: string;
  user: User | null;
}

export default function DashboardHeader({ userRole, user }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-surface-border p-6 rounded-2xl shadow-sm">
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: 'Dashboard' }]} />
        <div className="flex items-center gap-3 mt-1">
          <div className="w-10 h-10 rounded-xl bg-[#F8E7F6] flex items-center justify-center shrink-0 shadow-xs border border-brand-accent/20">
            {userRole === 'sales' && <TrendingUp size={20} className="text-pink-600" />}
            {userRole === 'product_manager' && <Cpu size={20} className="text-[#4B164C]" />}
            {userRole === 'purchase' && <Truck size={20} className="text-indigo-600" />}
            {userRole === 'inventory' && <Warehouse size={20} className="text-amber-600" />}
            {userRole === 'admin' && <LayoutDashboard size={20} className="text-amber-700" />}
          </div>
          <h1 className="page-title text-2xl font-bold tracking-tight text-[#4B164C]">
            {userRole === 'sales' && 'Welcome Back, Priya Singh'}
            {userRole === 'product_manager' && 'Welcome Back, Ravi Sharma'}
            {userRole === 'purchase' && 'Welcome Back, Amit Patel'}
            {userRole === 'inventory' && 'Welcome Back, Neha Gupta'}
            {userRole === 'admin' && 'Executive Command Center'}
          </h1>
          <Badge
            className={`uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 ${
              userRole === 'admin'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : userRole === 'sales'
                ? 'bg-pink-100 text-pink-800 border border-pink-200'
                : userRole === 'product_manager'
                ? 'bg-[#F8E7F6] text-[#4B164C] border border-brand-accent/20'
                : userRole === 'purchase'
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}
          >
            {userRole.replace('_', ' ')}
          </Badge>
        </div>
        <p className="page-subtitle text-xs text-text-muted">
          {userRole === 'sales' &&
            'Shiv Furniture Works — Sales Pipeline, Shortage Triggers, and Customer Journeys'}
          {userRole === 'product_manager' &&
            'Shiv Furniture Works — Floor Operations, BOM Exploder, and Machine Telemetry'}
          {userRole === 'purchase' &&
            'Shiv Furniture Works — Procurement Strategy, Vendor RFQ Comparisons, and Lead Times'}
          {userRole === 'inventory' &&
            'Shiv Furniture Works — Raw Material Inventory Health, Receipts, and stock movements'}
          {userRole === 'admin' &&
            'Corporate Overview — Unified Department Metrics, Audits, and Real-time Decision Diagnostics'}
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-text-muted bg-[#F8E7F6]/40 border border-brand-accent/15 rounded-xl px-4 py-2.5 shadow-inner">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <div className="text-left leading-tight font-medium">
          <p className="font-bold text-text-primary text-[11px] capitalize">
            {user?.name || 'Authorized Session'}
          </p>
          <p className="text-[9px] text-text-muted">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}
