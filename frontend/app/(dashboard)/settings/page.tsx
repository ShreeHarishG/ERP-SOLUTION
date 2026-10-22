'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  Settings, User, Building2, Cpu, DollarSign, ShieldCheck, Database, Info 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="page-title">System Settings</h1>
        <p className="page-subtitle">Configure company details, currency formats, operational machinery, and review permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User profile details */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-bold text-brand-primary flex items-center gap-2 pb-2 border-b border-surface-border">
            <User size={18} />
            User Identity Profile
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#DD88CF] to-[#4B164C] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h4 className="font-bold text-text-primary text-sm">{user?.name}</h4>
                <p className="text-xs text-text-muted capitalize">{user?.role?.replace('_', ' ')} Role</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-text-secondary">Email Address</span>
                <span className="font-semibold text-text-primary">{user?.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-text-secondary">Status</span>
                <span className="font-semibold text-emerald-600">Active Session</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-text-secondary">Connected Company</span>
                <span className="font-semibold text-text-primary">Shiv Furniture Works</span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Settings */}
        <div className="glass-card p-6 space-y-4 lg:col-span-2">
          <h3 className="text-base font-bold text-brand-primary flex items-center gap-2 pb-2 border-b border-surface-border">
            <Building2 size={18} />
            Company Operations Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Company Name</label>
                <input 
                  type="text" 
                  disabled 
                  value="Shiv Furniture Works" 
                  className="w-full text-xs p-3 rounded-xl border border-surface-border bg-slate-50 text-text-secondary font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Corporate Address</label>
                <input 
                  type="text" 
                  disabled 
                  value="Industrial Area, Sector 2, Kirti Nagar, New Delhi" 
                  className="w-full text-xs p-3 rounded-xl border border-surface-border bg-slate-50 text-text-secondary font-medium"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Default ERP Currency</label>
                <div className="flex items-center gap-2">
                  <span className="p-2.5 bg-slate-100 rounded-lg text-xs font-bold">₹</span>
                  <input 
                    type="text" 
                    disabled 
                    value="INR (Indian Rupee)" 
                    className="w-full text-xs p-3 rounded-xl border border-surface-border bg-slate-50 text-text-secondary font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Standard Tax Rate (GST)</label>
                <input 
                  type="text" 
                  disabled 
                  value="18% CGST + SGST" 
                  className="w-full text-xs p-3 rounded-xl border border-surface-border bg-slate-50 text-text-secondary font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Machinery configuration */}
        <div className="glass-card p-6 space-y-4 lg:col-span-3">
          <h3 className="text-base font-bold text-brand-primary flex items-center gap-2 pb-2 border-b border-surface-border">
            <Cpu size={18} />
            Shop Floor Machinery Configuration
          </h3>

          <div className="space-y-4">
            <p className="text-xs text-text-secondary">Standard calibrated machinery lines registered for recipe execution: </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Machine CNC-A', code: 'CNC-001', type: 'Computerized Router', cap: 'High Yield Production' },
                { name: 'Machine L-1', code: 'VEN-002', type: 'Veneering Press', cap: 'Premium Finishing' },
                { name: 'Assembly Line B-4', code: 'ASM-004', type: 'Manual Joinery bench', cap: 'Bespoke Crafting' },
              ].map((mac) => (
                <div key={mac.name} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-brand-primary">{mac.name}</h4>
                    <span className="font-mono text-[9px] font-bold bg-[#F8E7F6] text-[#4B164C] px-1.5 py-0.5 rounded">{mac.code}</span>
                  </div>
                  <div className="text-[11px] text-text-secondary space-y-0.5 font-medium">
                    <p>Machine Type: {mac.type}</p>
                    <p>Capability: {mac.cap}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
