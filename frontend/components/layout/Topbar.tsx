'use client';

import { useAuth } from '@/hooks/useAuth';
import { Menu, Bell, Search, LogOut, User, Sparkles, ChevronDown, Plus, CheckCheck, ExternalLink, AlertTriangle, ArrowRight } from 'lucide-react';
import React, { useState } from 'react';
import Link from 'next/link';
import { useOnchainInsights } from '@/hooks/useOnchainInsights';
import { NOTIFICATION_CATEGORY_CONFIG } from '@/types/onchain-insights';

export default function Topbar({
  sidebarOpen,
  setSidebarOpen,
  aiOpen,
  setAiOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
  aiOpen: boolean;
  setAiOpen: (val: boolean) => void;
}) {
  const { logout, isLoggingOut, user, login } = useAuth();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);

  const { useNotifications, useUpdateNotificationStatus } = useOnchainInsights();
  const { data: notificationsData } = useNotifications(undefined, { enabled: Boolean(user) });
  const updateStatusMutation = useUpdateNotificationStatus();

  const unreadCount = notificationsData?.unreadCount ?? 0;
  const recentNotifications = (notificationsData?.data || []).slice(0, 4);

  const rolesList = [
    { name: 'Super Admin',      email: 'admin@shivfurniture.com',  role: 'admin' },
    { name: 'Sales Executive',  email: 'priya@shivfurniture.com',  role: 'sales' },
    { name: 'Product Manager',  email: 'ravi@shivfurniture.com',   role: 'product_manager' },
    { name: 'Procurement Mgr',  email: 'amit@shivfurniture.com',   role: 'purchase' },
    { name: 'Inventory Manager',email: 'neha@shivfurniture.com',   role: 'inventory' },
  ];

  const handleSwitchRole = async (email: string) => {
    try {
      await login({ email, password: 'Admin@123' });
      window.location.reload();
    } catch (e) {
      console.error('Failed to switch role', e);
    }
  };

  return (
    <header className="h-16 bg-white/70 backdrop-blur-md border-b border-surface-border flex items-center gap-3 px-4 shrink-0 sticky top-0 z-50">

      {/* ── LEFT: Menu + Workspace + Role (fixed, no growth) ── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-text-secondary hover:text-brand-primary p-1.5 rounded-lg hover:bg-surface-hover/30 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Workspace Selector — hidden below lg to save space */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-hover/30 text-xs font-semibold text-text-primary border border-surface-border bg-slate-50/50 transition-all whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Shiv Furniture Works (AP-South)</span>
            <ChevronDown size={13} className="text-text-muted shrink-0" />
          </button>

          {showWorkspaceMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowWorkspaceMenu(false)} />
              <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-surface-border rounded-xl shadow-lg z-50 p-1.5 space-y-1 animate-fade-in">
                <div className="px-3 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">Workspaces</div>
                <button className="w-full text-left px-3 py-2 rounded-lg bg-surface-hover text-xs font-medium text-brand-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  AP South Production (Active)
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-text-secondary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  IN North Warehouse (Transit)
                </button>
              </div>
            </>
          )}
        </div>

        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-brand-accent/25 bg-[#F8E7F6]/40 text-[#4B164C] hover:bg-[#F8E7F6]/70 hover:border-brand-accent transition-all duration-200 whitespace-nowrap"
            title="Instant Demo Role Switcher"
          >
            <Sparkles size={13} className="text-brand-accent animate-pulse shrink-0" />
            <span>Role:</span>
            <span className="capitalize">{user?.role?.replace('_', ' ')}</span>
            <ChevronDown size={13} className="text-text-muted shrink-0" />
          </button>

          {showRoleMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowRoleMenu(false)} />
              <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-surface-border rounded-xl shadow-xl z-[100] p-1.5 space-y-1 animate-fade-in">
                <div className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-1">
                  Demo Sandbox Role Switcher
                </div>
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => { setShowRoleMenu(false); handleSwitchRole(r.email); }}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-medium flex items-center justify-between transition-colors ${
                      user?.role === r.role ? 'bg-[#F8E7F6]/30 text-[#4B164C] font-semibold' : 'text-text-secondary hover:text-[#4B164C]'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span>{r.name}</span>
                      <span className="text-[9px] text-text-muted">{r.email}</span>
                    </div>
                    {user?.role === r.role && <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── CENTER: Search (absorbs remaining space) ── */}
      <div className="flex-1 min-w-0 hidden md:block">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
          <input
            type="text"
            placeholder="Search products, orders, SKUs..."
            className="w-full bg-slate-50/50 border border-surface-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:bg-white focus:border-brand-highlight focus:ring-1 focus:ring-brand-highlight/10 transition-all"
          />
        </div>
      </div>

      {/* ── RIGHT: Actions (fixed, no growth) ── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* New Product */}
        <Link
          href="/products/new"
          className="btn-primary text-xs px-3 py-1.5 hidden sm:flex items-center gap-1.5 shadow-none bg-brand-primary hover:bg-brand-hover whitespace-nowrap"
        >
          <Plus size={14} />
          <span>New Product</span>
        </Link>

        {/* AI Insights */}
        <button
          onClick={() => setAiOpen(!aiOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
            aiOpen
              ? 'bg-brand-accent/20 border-brand-accent text-brand-primary font-bold shadow-sm'
              : 'bg-white border-surface-border text-brand-primary hover:bg-brand-accent/10 hover:border-brand-accent'
          }`}
          title="Toggle AI Insight Assistant"
        >
          <Sparkles size={14} className={aiOpen ? 'text-brand-primary' : 'text-brand-accent'} />
          <span className="hidden sm:inline">AI Insights</span>
        </button>

        {/* Notifications & Flyout */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
            className="relative p-1.5 text-text-secondary hover:text-brand-primary rounded-lg hover:bg-surface-hover/30 transition-all"
            title="Stakeholder Alerts & Notification Center"
          >
            <Bell size={18} />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 text-[9px] font-bold text-white bg-rose-600 rounded-full flex items-center justify-center animate-pulse shadow-xs">
                {unreadCount}
              </span>
            ) : null}
          </button>

          {showNotificationsMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotificationsMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-surface-border rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in text-xs">
                {/* Header */}
                <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Bell size={14} className="text-[#4B164C]" />
                    <span className="font-bold text-text-primary text-xs">Supply Chain Alerts</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 font-mono">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ action: 'mark_all_read' })}
                      className="text-[10px] text-[#4B164C] hover:underline font-bold flex items-center gap-1"
                    >
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                </div>

                {/* Notification Items Preview */}
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {recentNotifications.length === 0 ? (
                    <div className="p-6 text-center text-text-muted">
                      No recent supply chain alerts.
                    </div>
                  ) : (
                    recentNotifications.map((notif) => {
                      const cfg = NOTIFICATION_CATEGORY_CONFIG[notif.category] || NOTIFICATION_CATEGORY_CONFIG.risk_alert;
                      return (
                        <Link
                          key={notif.id}
                          href={notif.targetUrl}
                          onClick={() => {
                            setShowNotificationsMenu(false);
                            if (!notif.isRead) {
                              updateStatusMutation.mutate({
                                action: 'mark_as_read',
                                notificationIds: [notif.id],
                              });
                            }
                          }}
                          className={`block p-3 hover:bg-slate-50/80 transition-colors ${
                            !notif.isRead ? 'bg-purple-50/20' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            <span className="text-[9px] text-text-muted font-mono">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className={`mt-1 font-bold leading-tight ${!notif.isRead ? 'text-[#4B164C]' : 'text-text-primary'}`}>
                            {notif.title}
                          </p>
                          <p className="mt-0.5 text-[11px] text-text-secondary line-clamp-1">
                            {notif.message}
                          </p>
                        </Link>
                      );
                    })
                  )}
                </div>

                {/* Footer Link */}
                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <Link
                    href="/onchain-insights/notifications"
                    onClick={() => setShowNotificationsMenu(false)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4B164C] hover:underline"
                  >
                    <span>View All Notifications & History</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-6 w-px bg-surface-border" />

        {/* User + Logout */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-text-primary">
            <User size={14} className="text-text-muted shrink-0" />
            <span className="max-w-[80px] truncate">{user?.name}</span>
          </div>
          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="p-1.5 text-text-muted hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}