'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/services/audit.api';
import { Filter, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  
  const { data: actionsData } = useQuery({
    queryKey: ['auditActions'],
    queryFn: auditApi.getActions,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['auditLogs', page, actionFilter],
    queryFn: () => auditApi.list({ page, limit: 15, action: actionFilter || undefined }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Audit Logs</h1>
        <p className="page-subtitle">Track system activity and user actions</p>
      </div>

      <div className="glass-card flex flex-col min-h-[600px]">
        {/* Filters */}
        <div className="p-4 border-b border-surface-border flex flex-wrap gap-4 items-center bg-surface-card/50">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter size={18} />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <select 
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="input-field py-1.5 h-9 w-48 text-sm"
          >
            <option value="">All Actions</option>
            {actionsData?.map(action => (
              <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center items-center h-full">
              <Loader2 className="animate-spin text-brand" size={32} />
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-rose-400">Failed to load audit logs</div>
          ) : data?.logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No activity found matching filters</div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {data?.logs.map(log => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar size={14} className="text-slate-500" />
                        {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-slate-200">{log.userName || 'System'}</p>
                        <p className="text-xs text-slate-500 capitalize">{log.userRole?.replace('_', ' ') || '-'}</p>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-purple uppercase text-[10px] tracking-wider">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-slate-400 capitalize">{log.entityType}</span>
                    </td>
                    <td className="max-w-xs">
                      <p className="text-sm text-slate-300 truncate" title={log.entityName}>
                        {log.entityName || '-'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-surface-border flex items-center justify-between bg-surface-card/30">
            <span className="text-sm text-slate-400">
              Showing page {data.page} of {data.totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="btn-ghost"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
