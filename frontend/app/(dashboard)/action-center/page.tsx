'use client';

import React from 'react';
import { useSales } from '@/hooks/useSales';
import { useManufacturing } from '@/hooks/useManufacturing';
import { usePurchase } from '@/hooks/usePurchase';
import { useAuth } from '@/hooks/useAuth';
import { 
  Target, Loader2, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2, 
  Package, ShoppingCart, Truck, Hammer, ShieldQuestion, HelpCircle, Info
} from 'lucide-react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';

export default function ActionCenterPage() {
  const { user } = useAuth();
  const userRole = user?.role || 'sales';

  const canViewSales = ['admin', 'sales'].includes(userRole);
  const canViewMos = ['admin', 'product_manager'].includes(userRole);
  const canViewPos = ['admin', 'purchase', 'inventory'].includes(userRole);

  const { useList: useSalesList } = useSales();
  const { useList: useMoList } = useManufacturing();
  const { useList: usePoList } = usePurchase();

  const { data: sales, isLoading: salesLoading } = useSalesList({ enabled: canViewSales });
  const { data: mos, isLoading: mosLoading } = useMoList({ enabled: canViewMos });
  const { data: pos, isLoading: posLoading } = usePoList({ enabled: canViewPos });

  const isLoading = (canViewSales && salesLoading) || (canViewMos && mosLoading) || (canViewPos && posLoading);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col justify-center items-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="text-text-secondary text-sm">Running operations diagnostics...</p>
      </div>
    );
  }

  // Build active actions dynamically
  const buildActions = () => {
    const actionsList: Array<{
      id: string;
      title: string;
      desc: string;
      priority: 'high' | 'medium' | 'low';
      category: string;
      icon: any;
      link: string;
      actionText: string;
      impact: string;
      roles: string[];
    }> = [];

    // 1. Sales Shortages
    if (sales) {
      const shortages = sales.filter(s => s.status === 'shortage_detected');
      shortages.forEach(s => {
        actionsList.push({
          id: `so-shortage-${s.id}`,
          title: `Fulfillment Delay on ${s.orderNumber}`,
          desc: `Stockout detected on order. Quantity ordered exceeds available warehouse finished goods.`,
          priority: 'high' as const,
          category: 'sales',
          icon: ShoppingCart,
          link: `/sales/${s.id}`,
          actionText: 'Raise Production Request',
          impact: 'Unblocks customer order shipment',
          roles: ['admin', 'sales'],
        });
      });
    }

    // 2. PM MO Decisions
    if (mos) {
      const draftMos = mos.filter(m => m.status === 'draft');
      draftMos.forEach(m => {
        actionsList.push({
          id: `mo-draft-${m.id}`,
          title: `Pending Approval: MO ${m.orderNumber}`,
          desc: `New production request raised for ${m.product.name}. PM approval required to explode BOM.`,
          priority: 'high' as const,
          category: 'manufacturing',
          icon: Hammer,
          link: '/manufacturing',
          actionText: 'Verify Feasibility',
          impact: 'Initiates supply chain shortage analysis',
          roles: ['admin', 'product_manager'],
        });
      });

      // MOs ready to start
      const confirmedMos = mos.filter(m => m.status === 'confirmed');
      confirmedMos.forEach(m => {
        // check if has procurement generated or all available
        const isProcurementGen = m.notes?.includes('[Procurement Generated]');
        actionsList.push({
          id: `mo-conf-${m.id}`,
          title: `Confirmed MO Ready to Start: ${m.orderNumber}`,
          desc: `Recipe checks completed. Assign target machinery floor to start assembly of ${m.product.name}.`,
          priority: 'medium' as const,
          category: 'manufacturing',
          icon: Hammer,
          link: '/manufacturing',
          actionText: 'Assign Machine',
          impact: 'Launches assembly line runs',
          roles: ['admin', 'product_manager'],
        });
      });

      // MOs in progress
      const runningMos = mos.filter(m => m.status === 'in_progress');
      runningMos.forEach(m => {
        actionsList.push({
          id: `mo-run-${m.id}`,
          title: `MO Production In-Progress: ${m.orderNumber}`,
          desc: `${m.product.name} is undergoing shop floor routing. Check completion and register outputs.`,
          priority: 'medium' as const,
          category: 'manufacturing',
          icon: Hammer,
          link: '/manufacturing',
          actionText: 'Verify Outputs',
          impact: 'Fills warehouse catalog stocks',
          roles: ['admin', 'product_manager'],
        });
      });
    }

    // 3. Procurement PO Decisions
    if (pos) {
      // Draft RFQs
      const draftRFQs = pos.filter(p => p.status === 'draft' && (!p.vendorName || p.vendorName.includes('Recommended Vendor')));
      draftRFQs.forEach(p => {
        actionsList.push({
          id: `po-rfq-${p.id}`,
          title: `Compare Vendor Quotes: ${p.orderNumber}`,
          desc: `BOM shortages triggered an RFQ. Select best quotation based on cost & lead times.`,
          priority: 'medium' as const,
          category: 'purchase',
          icon: Truck,
          link: '/procurement',
          actionText: 'Evaluate Supplier Bids',
          impact: 'Prevents safety stockouts and controls costs',
          roles: ['admin', 'purchase'],
        });
      });

      // Awaiting PO confirm
      const draftConfirmations = pos.filter(p => p.status === 'draft' && p.vendorName && !p.vendorName.includes('Recommended Vendor'));
      draftConfirmations.forEach(p => {
        actionsList.push({
          id: `po-dispatch-${p.id}`,
          title: `Confirm PO Dispatch: ${p.orderNumber}`,
          desc: `Vendor quote selected for ${p.vendorName}. Disconnect RFQ status and confirm procurement PO.`,
          priority: 'high' as const,
          category: 'purchase',
          icon: Truck,
          link: '/procurement',
          actionText: 'Dispatch Order',
          impact: 'Initiates raw materials supplier shipment',
          roles: ['admin', 'purchase'],
        });
      });

      // Confirmed POs incoming
      const confirmedPOs = pos.filter(p => p.status === 'confirmed');
      confirmedPOs.forEach(p => {
        actionsList.push({
          id: `po-receive-${p.id}`,
          title: `Verify Material Shipment: ${p.orderNumber}`,
          desc: `Shipment from ${p.vendorName} arrived at bay. Inventory quality audit and invoice matching required.`,
          priority: 'high' as const,
          category: 'inventory',
          icon: Package,
          link: '/procurement',
          actionText: 'Verify Receipts',
          impact: 'Updates stock and notifies product managers',
          roles: ['admin', 'inventory'],
        });
      });
    }

    return actionsList;
  };

  const allActions = buildActions();
  const visibleActions = allActions.filter(a => a.roles.includes(userRole));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="page-title">Executive Action Center</h1>
        <p className="page-subtitle">Real-time decision intelligence engine aggregating operational bottlenecks</p>
      </div>

      {visibleActions.length === 0 ? (
        <div className="glass-card p-8 text-center space-y-4 max-w-lg mx-auto">
          <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
          <h3 className="text-base font-bold text-brand-primary">All Systems Nominal</h3>
          <p className="text-xs text-text-secondary">
            No active operational bottlenecks or pending approvals require attention for the <strong>{userRole.replace('_', ' ')}</strong> role at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-text-secondary">Displaying {visibleActions.length} Action Items for your role:</span>
            <span className="text-text-muted italic">Synced live</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {visibleActions.map((act) => {
              const Icon = act.icon;
              return (
                <div 
                  key={act.id} 
                  className={`glass-card p-5 border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:-translate-y-0.5 ${
                    act.priority === 'high' 
                      ? 'border-rose-500/20 bg-rose-500/[0.01] hover:border-rose-500/30' 
                      : 'border-amber-500/20 bg-amber-500/[0.01] hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shrink-0 ${
                      act.category === 'sales' ? 'bg-blue-50 text-blue-600' :
                      act.category === 'manufacturing' ? 'bg-purple-50 text-[#4B164C]' :
                      act.category === 'purchase' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      <Icon size={22} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-sm text-text-primary">{act.title}</h3>
                        <Badge variant={act.priority === 'high' ? 'red' : 'amber'}>
                          {act.priority.toUpperCase()} PRIORITY
                        </Badge>
                      </div>
                      <p className="text-xs text-text-secondary max-w-xl leading-relaxed">{act.desc}</p>
                      <p className="text-[10px] text-text-muted font-bold flex items-center gap-1">
                        <Info size={12} />
                        Impact: {act.impact}
                      </p>
                    </div>
                  </div>

                  <Link 
                    href={act.link}
                    className="btn-primary py-2.5 px-4 h-9 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 bg-[#4B164C] hover:bg-[#4B164C]/95 hover:text-white border-0 self-stretch md:self-auto justify-center text-center text-white"
                  >
                    {act.actionText} <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
