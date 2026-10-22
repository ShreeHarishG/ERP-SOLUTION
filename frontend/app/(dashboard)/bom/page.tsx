'use client';

import { useBom } from '@/hooks/useBom';
import { Plus, ClipboardList, ChevronDown, ChevronUp, Info, IndianRupee, Edit2 } from 'lucide-react';
import Link from 'next/link';
import EmptyState from '@/components/ui/EmptyState';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import Badge from '@/components/ui/Badge';
import React, { useState } from 'react';
import Skeleton from '@/components/ui/Skeleton';

export default function BomPage() {
  const { user } = useAuth();
  const { useList } = useBom();
  const { data: boms, isLoading, isError } = useList();
  
  // Track expanded rows on the client
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const isPMOrAdmin = user?.role === 'admin' || user?.role === 'product_manager';

  // Calculate BoM statistics
  const totalBoms = boms?.length || 0;
  const activeBoms = boms?.filter(b => b.isActive).length || 0;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="page-title">Bills of Materials (BoM)</h1>
          <p className="page-subtitle">Configure multi-level component recipes, raw material costings, and yields</p>
        </div>
        {isPMOrAdmin && (
          <Link href="/bom/new" className="btn-primary text-xs flex items-center gap-1.5 bg-[#4B164C] hover:bg-[#381039]">
            <Plus size={16} />
            <span>Define BoM Recipe</span>
          </Link>
        )}
      </div>

      {/* KPI stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-surface-border rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Recipes</span>
            <p className="text-lg font-bold text-text-primary mt-0.5">{totalBoms}</p>
          </div>
          <div className="bg-white border border-surface-border rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Active Recipes</span>
            <p className="text-lg font-bold text-[#4B164C] mt-0.5">{activeBoms}</p>
          </div>
          <div className="bg-white border border-surface-border rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Material Class Count</span>
            <p className="text-lg font-bold text-blue-600 mt-0.5">9 items</p>
          </div>
          <div className="bg-white border border-surface-border rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Status Code</span>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">Optimal</p>
          </div>
        </div>
      )}

      {/* Main Workspace Card */}
      <div className="glass-card flex flex-col min-h-[500px] overflow-hidden">
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-rose-500 font-medium">Failed to load Bills of Materials.</div>
          ) : !boms || boms.length === 0 ? (
            <div className="p-12">
              <EmptyState
                title="No BoM Recipes Defined"
                description="Configure a recipe linking your finished dining tables or chairs to their component raw materials."
                icon={ClipboardList}
                action={
                  isPMOrAdmin ? (
                    <Link href="/bom/new" className="btn-primary text-xs bg-[#4B164C] hover:bg-[#381039]">
                      <Plus size={14} /> Define First Recipe
                    </Link>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th className="w-10"></th>
                  <th>Finished Assembly</th>
                  <th>Recipe Name</th>
                  <th className="text-right">Yield Qty</th>
                  <th className="text-right">Est. Material Cost</th>
                  <th className="text-right">Components</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  {isPMOrAdmin && <th className="text-right pr-6">Action</th>}
                </tr>
              </thead>
              <tbody>
                {boms.map((bom) => {
                  const isExpanded = !!expandedRows[bom.id];
                  
                  // Calculate total material cost dynamically
                  const totalCost = bom.items.reduce((acc: number, item: any) => {
                    return acc + (Number(item.quantity) * Number(item.component.costPrice));
                  }, 0);
                  
                  const materialCount = bom.items.length;

                  return (
                    <React.Fragment key={bom.id}>
                      <tr
                        className="cursor-pointer hover:bg-surface-hover/10"
                        onClick={() => toggleRow(bom.id)}
                      >
                        <td className="text-center">
                          <button className="text-text-muted hover:text-[#4B164C]">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                        <td>
                          <div className="flex flex-col">
                            <span className="font-semibold text-text-primary text-xs">{bom.product.name}</span>
                            <span className="font-mono text-[10px] text-[#4B164C] mt-0.5">{bom.product.sku}</span>
                          </div>
                        </td>
                        <td className="font-semibold text-text-primary text-xs">{bom.name}</td>
                        <td className="text-right font-medium text-xs">
                          {Number(bom.quantity)} <span className="text-[10px] text-text-muted">{bom.product.unitOfMeasure}</span>
                        </td>
                        <td className="text-right font-bold text-xs text-emerald-600">
                          ₹{Number(totalCost).toLocaleString('en-IN')}
                        </td>
                        <td className="text-right text-xs font-semibold text-text-secondary">
                          {materialCount} items
                        </td>
                        <td>
                          <Badge variant={bom.isActive ? 'green' : 'gray'}>
                            {bom.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="text-xs text-text-muted">{format(new Date(bom.createdAt), 'MMM d, yyyy')}</td>
                        {isPMOrAdmin && (
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end pr-4">
                              <Link
                                href={`/bom/${bom.id}`}
                                className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-[#F8E7F6] rounded-lg transition-colors"
                                title="View details"
                              >
                                <Edit2 size={14} />
                              </Link>
                            </div>
                          </td>
                        )}
                      </tr>
                      
                      {/* Expanded Section */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={isPMOrAdmin ? 9 : 8} className="bg-slate-50/50 p-4 border-b border-surface-border">
                            <div className="rounded-xl border border-surface-border bg-white p-4 space-y-3 animate-fade-in">
                              <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Recipe Cost Breakdown</h4>
                              
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                  <thead>
                                    <tr className="border-b border-slate-100 text-text-muted">
                                      <th className="py-2 font-semibold">SKU</th>
                                      <th className="py-2 font-semibold">Component Name</th>
                                      <th className="py-2 font-semibold text-right">Required Qty</th>
                                      <th className="py-2 font-semibold text-right">Unit cost</th>
                                      <th className="py-2 font-semibold text-right">Total cost</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {bom.items.map((item: any) => {
                                      const cost = Number(item.quantity) * Number(item.component.costPrice);
                                      return (
                                        <tr key={item.id}>
                                          <td className="py-2 font-mono font-semibold text-brand-primary">{item.component.sku}</td>
                                          <td className="py-2 text-text-primary">{item.component.name}</td>
                                          <td className="py-2 text-right font-medium">
                                            {Number(item.quantity)} <span className="text-[10px] text-text-muted">{item.unitOfMeasure}</span>
                                          </td>
                                          <td className="py-2 text-right text-text-muted">
                                            ₹{Number(item.component.costPrice).toLocaleString('en-IN')}
                                          </td>
                                          <td className="py-2 text-right font-semibold text-text-primary">
                                            ₹{Number(cost).toLocaleString('en-IN')}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                    {/* Cost Summary Row */}
                                    <tr className="font-bold border-t border-slate-200 text-brand-primary">
                                      <td colSpan={3} className="py-3 text-left">Total Raw Material Cost Estimation</td>
                                      <td colSpan={2} className="py-3 text-right text-emerald-600 text-sm">
                                        ₹{Number(totalCost).toLocaleString('en-IN')}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              {bom.notes && (
                                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs mt-2">
                                  <span className="font-bold text-text-primary block mb-0.5">Recipe Execution Notes:</span>
                                  <span className="text-text-secondary">{bom.notes}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
