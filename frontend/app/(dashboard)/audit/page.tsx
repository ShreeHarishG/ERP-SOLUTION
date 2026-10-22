import React from 'react';
import AuditClient from '@/components/audit/AuditClient';
import { auditService } from '@/lib/server/modules/audit/audit.service';

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
  let initialData: any = null;
  let initialActions: string[] = [];

  try {
    const [result, actions] = await Promise.all([
      auditService.list({ page: 1, limit: 15 }),
      auditService.getDistinctActions(),
    ]);

    initialData = JSON.parse(JSON.stringify(result));
    initialActions = JSON.parse(JSON.stringify(actions));
  } catch (err) {
    console.error('Failed to pre-fetch audit logs on server:', err);
  }

  return <AuditClient initialData={initialData} initialActions={initialActions} />;
}
