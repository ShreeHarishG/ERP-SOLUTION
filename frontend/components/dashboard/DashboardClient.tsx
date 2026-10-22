'use client';

import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import Skeleton from '@/components/ui/Skeleton';
import { AlertTriangle } from 'lucide-react';

// Modular Role Dashboard Views
import SalesDashboardView from '@/components/dashboard/SalesDashboardView';
import AdminDashboardView from '@/components/dashboard/AdminDashboardView';
import ProductManagerDashboardView from '@/components/dashboard/ProductManagerDashboardView';
import ProcurementDashboardView from '@/components/dashboard/ProcurementDashboardView';
import InventoryDashboardView from '@/components/dashboard/InventoryDashboardView';

interface DashboardClientProps {
  initialData?: any;
  initialRole?: string;
  initialUser?: any;
}

export default function DashboardClient({
  initialData,
  initialRole = 'sales',
  initialUser,
}: DashboardClientProps) {
  const { user } = useAuth();
  // Prefer active client store role, fallback to server-passed initial role
  const userRole = user?.role || initialRole;
  const activeUser = user || initialUser;

  // If role matches initialRole, provide initialData so it renders instantly without skeleton pulse
  const isMatchingRole = userRole === initialRole;
  const { useStats } = useDashboard(userRole);
  const { data, isLoading, isError } = useStats(
    isMatchingRole && initialData ? { initialData } : undefined
  );

  const displayData = data || (isMatchingRole ? initialData : null);

  if (isLoading && !displayData) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if ((isError || !displayData) && !isLoading) {
    return (
      <div className="p-12 text-center border border-rose-200/50 bg-rose-50/50 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="mx-auto text-rose-500 mb-3" size={40} />
        <h3 className="font-bold text-base text-rose-800">Connection Interrupted</h3>
        <p className="text-xs text-rose-600 mt-1 mb-4">
          Could not connect to the remote database pooler. Please verify the environment variables.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary bg-rose-600 hover:bg-rose-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // ─── STRICT ROLE ISOLATION ───────────────────────────────────────────────
  if (userRole === 'sales') {
    return <SalesDashboardView data={displayData} user={activeUser} />;
  }

  if (userRole === 'product_manager') {
    return <ProductManagerDashboardView data={displayData} user={activeUser} />;
  }

  if (userRole === 'purchase') {
    return <ProcurementDashboardView data={displayData} user={activeUser} />;
  }

  if (userRole === 'inventory') {
    return <InventoryDashboardView data={displayData} user={activeUser} />;
  }

  // Super Admin Executive Command Center
  return <AdminDashboardView data={displayData} user={activeUser} />;
}
