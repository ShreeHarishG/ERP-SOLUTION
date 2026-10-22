import React from 'react';
import { getCurrentUser } from '@/lib/server/auth';
import { dashboardService } from '@/lib/server/modules/dashboard/dashboard.service';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const role = user?.role || 'admin';

  let initialData = null;
  try {
    initialData = await dashboardService.getStats(role);
  } catch (err) {
    console.warn('[DashboardPage SSR] Could not prefetch stats:', err);
  }

  return (
    <DashboardClient
      initialData={initialData}
      initialRole={role}
      initialUser={
        user
          ? {
              id: user.sub,
              email: user.email,
              role: user.role,
              name: user.name,
            }
          : null
      }
    />
  );
}
