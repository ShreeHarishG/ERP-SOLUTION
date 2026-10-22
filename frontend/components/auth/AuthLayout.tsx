'use client';

import { ReactNode } from 'react';
import { Sparkles, Activity, Clock, ShieldCheck } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F5F5F5] text-[#1e1b1e]">
      {/* Left Pane (Form Card Container) */}
      <div className="w-full md:w-[45%] lg:w-[40%] xl:w-[35%] flex flex-col justify-between p-8 sm:p-12 min-h-screen bg-white border-r border-slate-100 relative overflow-y-auto z-10 shrink-0">
        <div className="my-auto max-w-sm w-full mx-auto space-y-6 py-6">
          {/* Premium Logo Header */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#DD88CF] to-[#4B164C] flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm">CQ</span>
            </div>
            <div>
              <h2 className="text-xs font-black text-[#4B164C] tracking-widest uppercase leading-none">ChainIQ</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 leading-none">Enterprise OS</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl">
            {children}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center md:text-left text-[9px] text-slate-400 font-semibold tracking-wider pt-6">
          © {new Date().getFullYear()} SHIV FURNITURE WORKS. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* Right Pane (Premium Showcase Canvas) */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#4B164C] via-[#2f0e30] to-[#170717] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Ambient Decorative Mesh Glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#DD88CF]/10 blur-[130px] pointer-events-none animate-pulse duration-10000" />
        <div className="absolute bottom-[-20%] left-[-15%] w-[500px] h-[500px] rounded-full bg-[#4B164C]/25 blur-[120px] pointer-events-none" />

        {/* Top Header Tag */}
        <div className="flex justify-between items-center z-10">
          <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full border border-white/5 backdrop-blur-sm flex items-center gap-1.5 text-[#DD88CF]">
            <Sparkles size={11} className="animate-pulse" /> AP-South Tenant Sandbox
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">v1.2.0 Stable Build</span>
        </div>

        {/* Center Product Pitch */}
        <div className="my-auto max-w-xl space-y-8 z-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Intelligent Manufacturing <br />
              <span className="text-[#DD88CF] bg-gradient-to-r from-[#DD88CF] to-purple-300 bg-clip-text text-transparent">Operating System</span>
            </h1>
            <p className="text-xs text-slate-300 font-medium max-w-md leading-relaxed">
              Every department works as one. ChainIQ automatically orchestrates Sales, Procurement, Inventory, and Production through real-time workflow telemetry.
            </p>
          </div>

          {/* Workflow Interactive Grid */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-5 shadow-2xl relative">
            <div className="absolute top-0 right-0 h-10 w-24 bg-gradient-to-bl from-[#DD88CF]/5 rounded-bl-2xl rounded-tr-2xl pointer-events-none" />
            <p className="text-[10px] font-extrabold text-[#DD88CF] uppercase tracking-widest flex items-center gap-1.5">
              <Activity size={12} className="animate-pulse" /> Live Workflow Orchestration
            </p>
            
            <div className="grid grid-cols-4 gap-3.5 text-center">
              <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1.5">
                <p className="text-[10px] font-extrabold text-white">Sales Order</p>
                <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">Confirmed</span>
              </div>
              <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1.5">
                <p className="text-[10px] font-extrabold text-white">BOM Explode</p>
                <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">Calculated</span>
              </div>
              <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1.5">
                <p className="text-[10px] font-extrabold text-white">RFQ Compare</p>
                <span className="text-[8px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase">In Progress</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-[#DD88CF]/20 bg-[#F8E7F6]/5 rounded-xl space-y-1.5">
                <p className="text-[10px] font-extrabold text-white">Shop Run</p>
                <span className="text-[8px] font-bold text-slate-400 bg-white/10 px-1.5 py-0.5 rounded uppercase">Queued</span>
              </div>
            </div>
            
            {/* Visual connecting progress bar */}
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#4B164C] to-[#DD88CF] rounded-full w-[65%] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Bottom Security verification */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider z-10">
          <ShieldCheck size={14} className="text-[#DD88CF]" /> Secured Corporate Sandbox Environment
        </div>
      </div>
    </div>
  );
}
