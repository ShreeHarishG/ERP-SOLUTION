'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  CheckCheck,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Truck,
  FileCheck,
  Sparkles,
  Layers,
  Radio,
  ExternalLink,
  Eye,
  EyeOff,
  Inbox,
  AlertOctagon,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { useOnchainInsights } from '@/hooks/useOnchainInsights';
import {
  NOTIFICATION_CATEGORY_CONFIG,
  RISK_TIER_CONFIG,
  type StakeholderNotification,
  type NotificationCategory,
  type DisruptionSeverity,
  type NotificationFilterParams,
} from '@/types/onchain-insights';

export default function NotificationsCenterPage() {
  const { useNotifications, useUpdateNotificationStatus } = useOnchainInsights();

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<DisruptionSeverity | 'all'>('all');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterParams: NotificationFilterParams = useMemo(() => ({
    category: selectedCategory,
    severity: selectedSeverity,
    unreadOnly,
    search: searchQuery || undefined,
  }), [selectedCategory, selectedSeverity, unreadOnly, searchQuery]);

  const { data: notifResponse, isLoading, isError, refetch } = useNotifications(filterParams);
  const updateStatusMutation = useUpdateNotificationStatus();

  const notifications = notifResponse?.data || [];
  const unreadCount = notifResponse?.unreadCount ?? 0;
  const categoryCounts = notifResponse?.categoryCounts || {
    risk_alert: 0,
    shipment_delay: 0,
    approval_request: 0,
    recommendation: 0,
    sku_transition: 0,
  };

  // Toggle single notification read state
  const handleToggleRead = async (id: string, currentRead: boolean) => {
    try {
      await updateStatusMutation.mutateAsync({
        action: currentRead ? 'mark_as_unread' : 'mark_as_read',
        notificationIds: [id],
      });
      toast.success(currentRead ? 'Marked alert as unread.' : 'Alert marked as read.');
    } catch (err: any) {
      toast.error('Failed to update alert state.');
    }
  };

  // Mark all read
  const handleMarkAllRead = async () => {
    try {
      await updateStatusMutation.mutateAsync({ action: 'mark_all_read' });
      toast.success('All stakeholder alerts marked as read.');
    } catch (err: any) {
      toast.error('Failed to mark all as read.');
    }
  };

  // Relative time helper
  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 5) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 animate-pulse">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 text-center border border-rose-200 bg-rose-50/50 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="mx-auto text-rose-500 mb-3" size={40} />
        <h3 className="font-bold text-base text-rose-800">Alert Center Error</h3>
        <p className="text-xs text-rose-600 mt-1 mb-4">
          Could not fetch real-time stakeholder alerts.
        </p>
        <button onClick={() => refetch()} className="btn-primary bg-rose-600 hover:bg-rose-700">
          Retry Alerts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-slide-up">
      {/* ================================================================ */}
      {/* HEADER & CONTROLS BAR */}
      {/* ================================================================ */}
      <div className="bg-white border border-surface-border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <Breadcrumbs
              items={[
                { label: 'Onchain Insights', href: '/onchain-insights' },
                { label: 'Alerts & Notification Center' },
              ]}
            />
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <h1 className="page-title text-2xl font-bold tracking-tight text-[#4B164C]">
                Stakeholder Alerts & Notification Center
              </h1>
              <Badge className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                <Bell size={11} className="text-purple-600" />
                Live Notification Stream
              </Badge>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse font-mono">
                  {unreadCount} Unread Alerts
                </span>
              )}
            </div>
            <p className="page-subtitle text-xs text-text-muted">
              Consolidated intelligence feed: critical disruption warnings, transit delay flags, executive sign-off requests, and SKU lifecycle transitions
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                refetch();
                toast.success('Alerts feed re-synchronized.');
              }}
              className="btn-secondary text-xs px-3.5 py-1.5 gap-1.5"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={updateStatusMutation.isPending}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#4B164C] text-white hover:bg-[#39103a] shadow-sm transition-all"
              >
                <CheckCheck size={13} />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tab Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider shrink-0 mr-1">
            Categories:
          </span>
          {[
            { id: 'all', label: 'All Alerts', count: notifications.length },
            { id: 'risk_alert', label: 'Risk Alerts', count: categoryCounts.risk_alert },
            { id: 'shipment_delay', label: 'Shipment Delays', count: categoryCounts.shipment_delay },
            { id: 'approval_request', label: 'Approval Requests', count: categoryCounts.approval_request },
            { id: 'recommendation', label: 'Mitigation Plans', count: categoryCounts.recommendation },
            { id: 'sku_transition', label: 'SKU Transitions', count: categoryCounts.sku_transition },
          ].map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#4B164C] text-white border-[#4B164C] shadow-xs'
                    : 'bg-slate-50 text-text-secondary border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================================ */}
      {/* FILTER & SEARCH STRIP */}
      {/* ================================================================ */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts by title, keyword, entity..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-text-primary focus:ring-2 focus:ring-[#4B164C]/20 focus:border-[#4B164C] outline-hidden"
          />
        </div>

        {/* Severity Filter & Unread Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Severity Dropdown */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as any)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-text-secondary outline-hidden"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Severity</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low Severity</option>
          </select>

          {/* Unread Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none text-text-secondary">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded border-slate-300 text-[#4B164C] focus:ring-[#4B164C] h-4 w-4"
            />
            <span>Unread Only ({unreadCount})</span>
          </label>

          {/* Reset Filters */}
          {(selectedCategory !== 'all' || selectedSeverity !== 'all' || unreadOnly || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSeverity('all');
                setUnreadOnly(false);
                setSearchQuery('');
              }}
              className="text-xs text-[#4B164C] hover:underline font-bold px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* NOTIFICATIONS STREAM CARDS */}
      {/* ================================================================ */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="glass-card p-12 text-center text-text-muted space-y-2 rounded-2xl">
            <Inbox size={40} className="mx-auto text-slate-400 mb-2" />
            <h3 className="font-bold text-sm text-text-primary">No Alerts Matching Selected Filters</h3>
            <p className="text-xs">All supply chain alerts in this view have been processed or filtered out.</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const catCfg = NOTIFICATION_CATEGORY_CONFIG[notif.category] || NOTIFICATION_CATEGORY_CONFIG.risk_alert;
            const sevCfg = RISK_TIER_CONFIG[notif.severity] || RISK_TIER_CONFIG.low;

            return (
              <div
                key={notif.id}
                className={`glass-card p-5 rounded-2xl transition-all border-l-4 relative group ${
                  notif.severity === 'critical'
                    ? 'border-l-rose-600'
                    : notif.severity === 'high'
                    ? 'border-l-orange-500'
                    : notif.severity === 'medium'
                    ? 'border-l-amber-500'
                    : 'border-l-emerald-500'
                } ${
                  !notif.isRead
                    ? 'bg-white shadow-md border-slate-300 ring-2 ring-purple-100'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Unread indicator */}
                    {!notif.isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" title="Unread Alert" />
                    )}

                    {/* Category Tag */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${catCfg.bg} ${catCfg.color} border ${catCfg.border}`}>
                      {catCfg.label}
                    </span>

                    {/* Severity Badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${sevCfg.bg} ${sevCfg.color}`}>
                      {notif.severity}
                    </span>

                    {/* Entity Tag */}
                    {notif.relatedEntityName && (
                      <span className="text-[11px] font-semibold text-text-muted">
                        • {notif.relatedEntityName}
                      </span>
                    )}
                  </div>

                  {/* Relative Timestamp & Read Toggle Button */}
                  <div className="flex items-center gap-3 shrink-0 text-xs">
                    <span className="text-[11px] font-mono text-text-muted">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                    <button
                      onClick={() => handleToggleRead(notif.id, notif.isRead)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-text-muted hover:text-text-primary transition-colors"
                      title={notif.isRead ? 'Mark as Unread' : 'Mark as Read'}
                    >
                      {notif.isRead ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Title & Body */}
                <div className="space-y-1">
                  <h3 className={`text-sm font-bold leading-snug ${!notif.isRead ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {notif.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {/* Footer Strip: Metric Badge & Action Navigation Link */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div>
                    {notif.metricBadge && (
                      <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        {notif.metricBadge}
                      </span>
                    )}
                  </div>

                  {/* Deep Link to Relevant Feature */}
                  <Link
                    href={notif.targetUrl}
                    onClick={() => {
                      if (!notif.isRead) {
                        updateStatusMutation.mutate({
                          action: 'mark_as_read',
                          notificationIds: [notif.id],
                        });
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-[#4B164C] text-white hover:bg-[#39103a] shadow-xs transition-all"
                  >
                    <span>{notif.targetLabel}</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
