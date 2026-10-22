'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
  IndianRupee,
  CheckCircle2,
  Sparkles,
  Hammer,
  Truck,
  Target,
  Settings,
  ShieldCheck,
  User,
  Clock,
  Briefcase,
  ClipboardList,
  AlertCircle,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  Plus,
  RefreshCw,
  Info,
  CheckSquare,
  Square
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Alert from '@/components/ui/Alert';
import { productsApi } from '@/services/products.api';
import { salesApi } from '@/services/sales.api';
import { inventoryApi } from '@/services/inventory.api';
import toast from 'react-hot-toast';
import { useVendors } from '@/hooks/useVendors';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { useStats } = useDashboard();
  const { data, isLoading, isError } = useStats();
  const { user } = useAuth();
  const userRole = user?.role || 'sales';

  // --- Vendor Registry Hooks & State ---
  const { useList: useVendorsList, createVendor, isCreating: isCreatingVendor } = useVendors();
  const { data: vendorsList } = useVendorsList();

  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName) return;
    try {
      await createVendor({
        name: newVendorName,
        email: newVendorEmail,
        phone: newVendorPhone,
      });
      setNewVendorName('');
      setNewVendorEmail('');
      setNewVendorPhone('');
    } catch (err) {
      // Handled by toast
    }
  };

  // --- State for Inline Quick Actions ---
  // Sales Order Quick Create
  const [quickSoCustomer, setQuickSoCustomer] = useState('');
  const [quickSoProduct, setQuickSoProduct] = useState('');
  const [quickSoQty, setQuickSoQty] = useState(1);
  const [isCreatingSo, setIsCreatingSo] = useState(false);

  // Inventory Stock Adjustment
  const [quickAdjProduct, setQuickAdjProduct] = useState('');
  const [quickAdjQty, setQuickAdjQty] = useState(10);
  const [quickAdjNotes, setQuickAdjNotes] = useState('Routine stock audit adjustment');
  const [isAdjustingStock, setIsAdjustingStock] = useState(false);

  // Sales Checklist tasks
  const [salesTasks, setSalesTasks] = useState([
    { id: 1, text: 'Follow up with ABC Furniture on pending quotation confirmation', completed: false },
    { id: 2, text: 'Verify stock reserves for Wooden Chair shipment', completed: true },
    { id: 3, text: 'Submit quarterly sales ledger logs to admin', completed: false },
    { id: 4, text: 'Verify shipping lead times with Logistics Team', completed: false },
  ]);

  // Load products list for quick actions
  const { data: productsData } = useQuery({
    queryKey: ['productsList'],
    queryFn: () => productsApi.list({ limit: 100 }),
    enabled: !!user,
  });

  const toggleSalesTask = (id: number) => {
    setSalesTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    toast.success('Task status updated');
  };

  const handleQuickSoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSoCustomer || !quickSoProduct || quickSoQty <= 0) {
      toast.error('Please enter customer name, select a product, and enter quantity');
      return;
    }

    const matchedProd = productsData?.products.find(p => p.id === quickSoProduct);
    if (!matchedProd) {
      toast.error('Invalid product selected');
      return;
    }

    setIsCreatingSo(true);
    try {
      await salesApi.create({
        customerName: quickSoCustomer,
        customerEmail: `${quickSoCustomer.toLowerCase().replace(/\s+/g, '')}@example.com`,
        customerPhone: '+919876543210',
        notes: 'Quick order created from Sales Executive Dashboard',
        items: [{
          productId: quickSoProduct,
          quantityOrdered: Number(quickSoQty),
          unitPrice: Number(matchedProd.salesPrice)
        }]
      });
      toast.success('Sales Order created successfully!');
      setQuickSoCustomer('');
      setQuickSoProduct('');
      setQuickSoQty(1);
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create sales order');
    } finally {
      setIsCreatingSo(false);
    }
  };

  const handleQuickAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAdjProduct || quickAdjQty === 0) {
      toast.error('Please select a product and enter a non-zero quantity');
      return;
    }

    setIsAdjustingStock(true);
    try {
      await inventoryApi.adjustStock({
        productId: quickAdjProduct,
        quantity: Number(quickAdjQty),
        notes: quickAdjNotes
      });
      toast.success('Stock level adjusted successfully!');
      setQuickAdjProduct('');
      setQuickAdjQty(10);
      setQuickAdjNotes('Routine stock audit adjustment');
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock level');
    } finally {
      setIsAdjustingStock(false);
    }
  };



  if (isLoading) {
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

  if (isError || !data) {
    return (
      <div className="p-12 text-center border border-rose-200/50 bg-rose-50/50 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="mx-auto text-rose-500 mb-3" size={40} />
        <h3 className="font-bold text-base text-rose-800">Connection Interrupted</h3>
        <p className="text-xs text-rose-600 mt-1 mb-4">Could not connect to the remote database pooler. Please verify the environment variables.</p>
        <button onClick={() => window.location.reload()} className="btn-primary bg-rose-600 hover:bg-rose-700">Retry Connection</button>
      </div>
    );
  }

  const { kpis, lowStockProducts, recentActivity, inventoryHealth, recentSalesOrders, smartProcurementRecommendations, productionBottlenecks, aiInsights } = data;

  const s_sales = aiInsights?.operationalHealthBreakdown?.sales ?? 94;
  const s_pm = aiInsights?.operationalHealthBreakdown?.manufacturing ?? 85;
  const s_proc = aiInsights?.operationalHealthBreakdown?.procurement ?? 68;
  const s_inv = aiInsights?.operationalHealthBreakdown?.inventory ?? 92;
  const s_oee = aiInsights?.operationalHealthBreakdown?.manufacturing ?? 96;
  const s_ful = aiInsights?.operationalHealthBreakdown?.sales ?? 88;

  const r_sales = 80 * (s_sales / 100);
  const r_pm = 80 * (s_pm / 100);
  const r_proc = 80 * (s_proc / 100);
  const r_inv = 80 * (s_inv / 100);
  const r_oee = 80 * (s_oee / 100);
  const r_ful = 80 * (s_ful / 100);

  const pt_sales = `100,${(100 - r_sales).toFixed(1)}`;
  const pt_pm = `${(100 + r_pm * 0.866).toFixed(1)},${(100 - r_pm * 0.5).toFixed(1)}`;
  const pt_proc = `${(100 + r_proc * 0.866).toFixed(1)},${(100 + r_proc * 0.5).toFixed(1)}`;
  const pt_inv = `100,${(100 + r_inv).toFixed(1)}`;
  const pt_oee = `${(100 - r_oee * 0.866).toFixed(1)},${(100 + r_oee * 0.5).toFixed(1)}`;
  const pt_ful = `${(100 - r_ful * 0.866).toFixed(1)},${(100 - r_ful * 0.5).toFixed(1)}`;

  const radarPoints = `${pt_sales} ${pt_pm} ${pt_proc} ${pt_inv} ${pt_oee} ${pt_ful}`;

  const totalRev = recentSalesOrders?.reduce((acc: number, o: any) => acc + Number(o.totalAmount), 0) || 0;

  // Render different dashboards based on role
  return (
    <div className="space-y-6 p-6 animate-slide-up">
      {/* Role specific header with prominent greeting and badge */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-surface-border p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <Breadcrumbs items={[{ label: 'Dashboard' }]} />
          <div className="flex items-center gap-3 mt-1">
            <h1 className="page-title text-2xl font-bold tracking-tight text-[#4B164C]">
              {userRole === 'sales' && `Welcome Back, Priya Singh`}
              {userRole === 'product_manager' && `Welcome Back, Ravi Sharma`}
              {userRole === 'purchase' && `Welcome Back, Amit Patel`}
              {userRole === 'inventory' && `Welcome Back, Neha Gupta`}
              {userRole === 'admin' && `Executive Command Center`}
            </h1>
            <Badge className={`uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 ${
              userRole === 'admin' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
              userRole === 'sales' ? 'bg-pink-100 text-pink-800 border border-pink-200' :
              userRole === 'product_manager' ? 'bg-[#F8E7F6] text-[#4B164C] border border-brand-accent/20' :
              userRole === 'purchase' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
              'bg-slate-100 text-slate-800 border border-slate-200'
            }`}>
              {userRole.replace('_', ' ')}
            </Badge>
          </div>
          <p className="page-subtitle text-xs text-text-muted">
            {userRole === 'sales' && `Shiv Furniture Works — Sales Pipeline, Shortage Triggers, and Customer Journeys`}
            {userRole === 'product_manager' && `Shiv Furniture Works — Floor Operations, BOM Exploder, and Machine Telemetry`}
            {userRole === 'purchase' && `Shiv Furniture Works — Procurement Strategy, Vendor RFQ Comparisons, and Lead Times`}
            {userRole === 'inventory' && `Shiv Furniture Works — Raw Material Inventory Health, Receipts, and stock movements`}
            {userRole === 'admin' && `Corporate Overview — Unified Department Metrics, Audits, and Real-time Decision Diagnostics`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted bg-[#F8E7F6]/40 border border-brand-accent/15 rounded-xl px-4 py-2.5 shadow-inner">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="text-left leading-tight font-medium">
            <p className="font-bold text-text-primary text-[11px] capitalize">{user?.name || 'Authorized Session'}</p>
            <p className="text-[9px] text-text-muted">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 1. SALES EXECUTIVE DASHBOARD VIEW */}
      {/* ========================================================== */}
      {userRole === 'sales' && (
        <>
          {/* Sales KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Today's Sales Revenue</p>
                <p className="text-2xl font-bold text-text-primary tracking-tight">₹{Number(totalRev).toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                  <TrendingUp size={12} /> +12.4% vs Yesterday
                </p>
              </div>
              <div className="p-3 rounded-xl bg-pink-50 text-pink-600 shrink-0">
                <IndianRupee size={22} />
              </div>
            </div>
            
            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Active Quotations</p>
                <p className="text-2xl font-bold text-text-primary tracking-tight">{kpis.totalSalesOrders}</p>
                <p className="text-[10px] text-text-muted font-semibold">Total sales drafts & active orders</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <ShoppingCart size={22} />
              </div>
            </div>

            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Blocked by Shortage</p>
                <p className="text-2xl font-bold text-rose-600 tracking-tight">{kpis.shortageOrders}</p>
                <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5">
                  <AlertTriangle size={12} /> Requires PM Action
                </p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 shrink-0">
                <AlertCircle size={22} />
              </div>
            </div>

            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Orders Ready for Dispatch</p>
                <p className="text-2xl font-bold text-[#4B164C] tracking-tight">{kpis.pendingSalesOrders - kpis.shortageOrders}</p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 size={12} /> Ready for delivery
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8E7F6] text-[#4B164C] shrink-0">
                <Truck size={22} />
              </div>
            </div>
          </div>

          {/* Main Sales visual & quick forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Pipeline Funnel SVG */}
            <div className="glass-card p-5 space-y-4 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Sales Conversion Pipeline</h3>
                  <p className="text-lg font-bold text-[#4B164C] mt-0.5">Lead-to-Order Conversion Funnel</p>
                </div>
                <div className="flex flex-wrap gap-2.5 text-[9px] font-bold text-text-muted bg-white border border-slate-100 rounded-lg p-1.5 shadow-xs shrink-0">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#4B164C]" /> Active</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#DD88CF]" /> Negotiation</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#F8E7F6] border border-[#4B164C]" /> Shortage</div>
                </div>
              </div>
              <div className="h-56 w-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100 p-4">
                <svg viewBox="0 0 400 215" className="w-full h-full max-w-sm overflow-visible">
                  <defs>
                    <linearGradient id="funnelGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4B164C" />
                      <stop offset="100%" stopColor="#6d246f" />
                    </linearGradient>
                    <linearGradient id="funnelGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#DD88CF" />
                      <stop offset="100%" stopColor="#b551a3" />
                    </linearGradient>
                  </defs>
                  
                  {/* Lead Section */}
                  <polygon points="10,10 390,10 330,50 70,50" fill="url(#funnelGrad1)" opacity="0.9" className="hover:opacity-100 transition-opacity cursor-pointer duration-200" />
                  <text x="200" y="32" textAnchor="middle" fill="#ffffff" className="text-xs font-bold font-sans">Leads & Inquiries (120 inquiries)</text>
                  
                  {/* RFQs Section */}
                  <polygon points="72,54 328,54 278,98 122,98" fill="url(#funnelGrad2)" opacity="0.85" className="hover:opacity-100 transition-opacity cursor-pointer duration-200" />
                  <text x="200" y="80" textAnchor="middle" fill="#ffffff" className="text-[11px] font-bold font-sans">Quoted Proposals (48 RFQs)</text>
                  
                  {/* Shortage Pending */}
                  <polygon points="124,102 276,102 236,146 164,146" fill="#F8E7F6" stroke="#4B164C" strokeWidth="1" className="hover:bg-[#F8E7F6]/90 transition-all cursor-pointer" />
                  <text x="200" y="128" textAnchor="middle" fill="#4B164C" className="text-[10px] font-bold font-sans">Awaiting PM / Raw Stock (18 SOs)</text>
                  
                  {/* Confirmed Orders */}
                  <polygon points="166,150 234,150 214,190 186,190" fill="#4B164C" className="hover:opacity-90 transition-opacity cursor-pointer duration-200" />
                  <text x="200" y="206" textAnchor="middle" fill="#4B164C" className="text-[10px] font-bold font-sans">Delivered (12 Completed)</text>
                </svg>
              </div>
            </div>

            {/* Quick Create Sales Order */}
            <div className="glass-card p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Sales Representative Actions</h3>
                <p className="text-lg font-bold text-text-primary mt-0.5">Quick Create Sales Order</p>
              </div>
              <form onSubmit={handleQuickSoSubmit} className="space-y-3.5 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 text-left">
                    <label className="block text-[11px] font-bold text-text-secondary uppercase">Customer Name</label>
                    <input 
                      type="text" 
                      className="input-field py-1.5 px-3 h-9 text-xs"
                      placeholder="e.g. ABC Furniture"
                      value={quickSoCustomer}
                      onChange={e => setQuickSoCustomer(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="block text-[11px] font-bold text-text-secondary uppercase">Select Product</label>
                    <select 
                      className="input-field py-1.5 px-3 h-9 text-xs"
                      value={quickSoProduct}
                      onChange={e => setQuickSoProduct(e.target.value)}
                    >
                      <option value="">-- Choose Item --</option>
                      {productsData?.products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (SKU: {p.sku} | Price: ₹{Number(p.salesPrice).toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div className="space-y-1 text-left">
                    <label className="block text-[11px] font-bold text-text-secondary uppercase">Quantity</label>
                    <input 
                      type="number" 
                      className="input-field py-1.5 px-3 h-9 text-xs"
                      min="1"
                      value={quickSoQty}
                      onChange={e => setQuickSoQty(Number(e.target.value))}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isCreatingSo}
                    className="btn-primary py-1.5 px-4 h-9 text-xs bg-brand-primary hover:bg-brand-hover flex items-center justify-center gap-1 shadow-none w-full"
                  >
                    {isCreatingSo ? <RefreshCw className="animate-spin" size={14} /> : <Plus size={14} />}
                    Create Sales Order
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Details Tables (Recent Sales, Top Customers, Follow-ups) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card p-5 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-1.5">
                  <ShoppingCart size={16} /> Recent Sales Orders & Traceability
                </h3>
                <Link href="/sales" className="text-xs font-semibold text-brand-primary hover:underline">View Sales Book →</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="erp-table text-xs">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer Name</th>
                      <th>Status</th>
                      <th className="text-right">Valuation</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSalesOrders.map(order => (
                      <tr key={order.id}>
                        <td>
                          <Link href={`/sales/${order.id}`} className="font-mono font-bold text-brand-primary hover:underline">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="font-medium text-text-primary">{order.customerName}</td>
                        <td>
                          <Badge variant={order.status === 'shortage_detected' ? 'red' : order.status === 'ready' ? 'amber' : order.status === 'delivered' ? 'green' : 'gray'}>
                            {order.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="text-right font-bold text-text-primary">₹{Number(order.totalAmount).toLocaleString('en-IN')}</td>
                        <td className="text-text-muted">{format(new Date(order.createdAt), 'MMM d, yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-1.5">
                <CheckSquare size={16} /> Follow-Up Tasks
              </h3>
              <div className="space-y-3 mt-2">
                {salesTasks.map(t => (
                  <div key={t.id} className="flex items-start gap-2.5 p-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-lg transition-colors text-xs">
                    <button onClick={() => toggleSalesTask(t.id)} className="text-brand-primary hover:scale-105 transition-transform mt-0.5">
                      {t.completed ? <CheckSquare size={16} className="text-[#4B164C]" /> : <Square size={16} />}
                    </button>
                    <span className={`font-semibold text-text-secondary leading-snug ${t.completed ? 'line-through text-text-muted' : ''}`}>
                      {t.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================== */}
      {/* 2. PRODUCT MANAGER DASHBOARD VIEW */}
      {/* ========================================================== */}
      {userRole === 'product_manager' && (
        <>
          {/* PM KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Pending PM Approvals</p>
                <p className="text-2xl font-bold text-rose-600 tracking-tight">{kpis.pendingManufacturingApprovals}</p>
                <p className="text-[10px] text-text-secondary font-medium">Production runs in pipeline</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 shrink-0">
                <ClipboardList size={22} />
              </div>
            </div>

            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Active Shop Floor Runs</p>
                <p className="text-2xl font-bold text-text-primary tracking-tight">{kpis.runningManufacturingRuns}</p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                  <TrendingUp size={12} /> Running on CNCs
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <Hammer size={22} />
              </div>
            </div>

            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Overall Equipment Effectiveness</p>
                <p className="text-2xl font-bold text-[#4B164C] tracking-tight">{kpis.manufacturingEfficiency}</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Average shop floor score</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8E7F6] text-[#4B164C] shrink-0">
                <Activity size={22} />
              </div>
            </div>

            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Delayed MO Runs</p>
                <p className="text-2xl font-bold text-amber-600 tracking-tight">{kpis.delayedManufacturingCount}</p>
                <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
                  <AlertTriangle size={12} /> Requires Calibration
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <Clock size={22} />
              </div>
            </div>
          </div>

          {/* Forecast chart & fast moving */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SVG line chart: PM demand forecast */}
            <div className="glass-card p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Manufacturing Scheduling</h3>
                  <p className="text-lg font-bold text-text-primary mt-0.5">Production Demand Forecast (Units)</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  +15.4% Forecast
                </span>
              </div>
              <div className="h-56 w-full bg-slate-50/50 rounded-xl p-3 border border-slate-100 relative">
                <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4B164C" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#F8E7F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  <line x1="30" y1="20" x2="480" y2="20" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="30" y1="65" x2="480" y2="65" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="30" y1="110" x2="480" y2="110" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="30" y1="155" x2="480" y2="155" stroke="#cbd5e1" strokeWidth="1.5" />

                  {/* Shaded Area */}
                  <path d="M 30 155 L 30 110 L 120 70 L 210 90 L 300 45 L 390 30 L 480 15 L 480 155 Z" fill="url(#forecastGrad)" />
                  
                  {/* Actual Forecast Line */}
                  <path d="M 30 110 L 120 70 L 210 90 L 300 45 L 390 30 L 480 15" fill="none" stroke="#4B164C" strokeWidth="2.5" strokeLinecap="round" />
                  
                  {/* Dots */}
                  <circle cx="30" cy="110" r="4.5" fill="#4B164C" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="120" cy="70" r="4.5" fill="#4B164C" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="210" cy="90" r="4.5" fill="#4B164C" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="300" cy="45" r="4.5" fill="#4B164C" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="390" cy="30" r="4.5" fill="#4B164C" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="480" cy="15" r="4.5" fill="#DD88CF" stroke="#fff" strokeWidth="1.5" />

                  <text x="30" y="172" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-bold">Week 25</text>
                  <text x="120" y="172" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-bold">Week 26</text>
                  <text x="210" y="172" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-bold">Week 27</text>
                  <text x="300" y="172" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-bold">Week 28</text>
                  <text x="390" y="172" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-bold">Week 29</text>
                  <text x="480" y="172" textAnchor="middle" fill="#4B164C" className="text-[9px] font-bold">Week 30 (Forecast)</text>
                </svg>
              </div>
            </div>

            {/* PM Workflow Shortcuts */}
            <div className="glass-card p-5 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">PM Workflow Shortcuts</h3>
                <p className="text-lg font-bold text-text-primary mt-0.5">Quick Operations</p>
                <p className="text-xs text-text-secondary mt-1">
                  Access primary product management tools, track active factory shop runs, and inspect bill of materials configurations.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-3 text-xs mt-2">
                <Link href="/bom" className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-xl transition-all">
                  <div>
                    <p className="font-bold text-text-primary font-semibold">Check Recipes (BOMs)</p>
                    <p className="text-[10px] text-text-muted">Manage bill of materials and recipe configurations</p>
                  </div>
                  <ChevronRight size={16} className="text-brand-primary" />
                </Link>

                <Link href="/manufacturing" className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-xl transition-all">
                  <div>
                    <p className="font-bold text-text-primary font-semibold">Configure Active Shop Run</p>
                    <p className="text-[10px] text-text-muted">Monitor and release manufacturing order schedules</p>
                  </div>
                  <ChevronRight size={16} className="text-brand-primary" />
                </Link>
              </div>
            </div>
          </div>

          {/* Product Lifecycle & availability grids */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card p-5 space-y-3 lg:col-span-2">
              <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                <Layers size={16} /> Fast-Moving Products & Stock Yield
              </h3>
              <div className="overflow-x-auto text-xs">
                <table className="erp-table text-left">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>On Hand</th>
                      <th>Reserved</th>
                      <th>Safety Level</th>
                      <th>Strategy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsData?.products.slice(0, 4).map(p => (
                      <tr key={p.id}>
                        <td className="font-bold text-text-primary">{p.name}</td>
                        <td className="font-mono text-text-secondary">{p.sku}</td>
                        <td>{Number(p.onHandQuantity)} pcs</td>
                        <td className="text-amber-600 font-bold">{Number(p.reservedQuantity)} reserved</td>
                        <td>{Number(p.minStockLevel)} safety</td>
                        <td>
                          <Badge variant={p.procurementStrategy === 'mts' ? 'green' : 'amber'}>
                            {p.procurementStrategy.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Product Lifecycle Status
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg space-y-1">
                  <div className="flex justify-between font-bold text-emerald-800">
                    <span>Standard Catalog items</span>
                    <span>14 Active</span>
                  </div>
                  <div className="h-1 bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                </div>
                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg space-y-1">
                  <div className="flex justify-between font-bold text-amber-800">
                    <span>Prototype Iterations</span>
                    <span>2 Custom</span>
                  </div>
                  <div className="h-1 bg-amber-500 rounded-full" style={{ width: '15%' }} />
                </div>
                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-lg space-y-1">
                  <div className="flex justify-between font-bold text-rose-800">
                    <span>Deprecated Recipes</span>
                    <span>1 Archive</span>
                  </div>
                  <div className="h-1 bg-rose-500 rounded-full" style={{ width: '5%' }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================== */}
      {/* 3. PROCUREMENT MANAGER DASHBOARD VIEW */}
      {/* ========================================================== */}
      {userRole === 'purchase' && (
        <>
          {/* Procurement KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Material Shortages Predicted</p>
                <p className="text-2xl font-bold text-rose-600 tracking-tight">{smartProcurementRecommendations?.length || 0}</p>
                <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5">
                  <AlertTriangle size={12} /> Stockouts impending
                </p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 shrink-0">
                <AlertCircle size={22} />
              </div>
            </div>

            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">AI Buffer Purchase Orders</p>
                <p className="text-2xl font-bold text-[#4B164C] tracking-tight">{kpis.lowStockCount}</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Suggested procurement actions</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8E7F6] text-[#4B164C] shrink-0">
                <Sparkles size={22} />
              </div>
            </div>

            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Active POs in Transit</p>
                <p className="text-2xl font-bold text-blue-600 tracking-tight">{(data as any).inTransitPurchaseOrders?.length || 0}</p>
                <p className="text-[10px] text-text-secondary font-semibold">Incoming cargo checks</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Truck size={22} />
              </div>
            </div>

            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Supply Chain Portfolio Risk</p>
                <p className="text-2xl font-bold text-amber-600 tracking-tight">{kpis.procurementRiskScore}</p>
                <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
                  <TrendingUp size={12} /> Calculated Risk Score
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <Briefcase size={22} />
              </div>
            </div>
          </div>

          {/* Smart procurement SVG bar chart & AI recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vendor lead times comparison */}
            <div className="glass-card p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Procurement intelligence</h3>
                  <p className="text-lg font-bold text-text-primary mt-0.5">Supplier Lead Time Analytics (Days)</p>
                </div>
                <span className="text-[10px] font-bold text-[#4B164C] bg-[#F8E7F6] px-2 py-0.5 rounded border border-brand-accent/20">
                  Global Timber Preferred
                </span>
              </div>
              <div className="h-56 w-full bg-slate-50/50 rounded-xl p-3 border border-slate-100 relative">
                <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
                  {/* Grid lines */}
                  <line x1="30" y1="20" x2="480" y2="20" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="30" y1="65" x2="480" y2="65" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="30" y1="110" x2="480" y2="110" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="30" y1="150" x2="480" y2="150" stroke="#cbd5e1" />

                  {/* Bars - Vendor A */}
                  <rect x="55" y="65" width="30" height="85" rx="3" fill="#4B164C" />
                  <text x="70" y="55" textAnchor="middle" fill="#4B164C" className="text-[10px] font-bold">5 Days</text>
                  <text x="70" y="165" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-bold">Vendor A (Apex)</text>

                  {/* Bars - Vendor B */}
                  <rect x="185" y="110" width="30" height="40" rx="3" fill="#DD88CF" />
                  <text x="200" y="100" textAnchor="middle" fill="#DD88CF" className="text-[10px] font-bold">2 Days</text>
                  <text x="200" y="165" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-bold">Vendor B (Global)</text>

                  {/* Bars - Vendor C */}
                  <rect x="315" y="30" width="30" height="120" rx="3" fill="#94a3b8" opacity="0.6" />
                  <text x="330" y="20" textAnchor="middle" fill="#64748b" className="text-[10px] font-bold">8 Days</text>
                  <text x="330" y="165" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-bold">Vendor C (Rainbow)</text>

                  {/* Line representing benchmark average */}
                  <line x1="30" y1="80" x2="480" y2="80" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,4" />
                  <text x="440" y="74" fill="#ef4444" className="text-[8px] font-bold">SLA Target (4.5d)</text>
                </svg>
              </div>
            </div>

            {/* Smart Procurement Recommendations Widget */}
            <div className="glass-card p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-2">
                  <Sparkles size={16} className="text-brand-accent animate-pulse" />
                  AI Procurement Recommendations
                </h3>
                <span className="text-[9px] text-text-muted font-semibold uppercase">Predictive Stockout buffers</span>
              </div>
              <div className="space-y-3">
                {smartProcurementRecommendations && smartProcurementRecommendations.length > 0 ? (
                  smartProcurementRecommendations.slice(0, 2).map((rec: any) => (
                    <div key={rec.sku} className="p-3.5 border border-brand-accent/20 bg-[#F8E7F6]/15 rounded-xl space-y-2 relative overflow-hidden text-xs">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded">
                          Stockout in {rec.daysRemaining} Days
                        </span>
                        <Badge variant={rec.riskScore === 'High' ? 'red' : 'amber'}>
                          {rec.riskScore} Risk
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-bold text-text-primary">{rec.name}</h4>
                        <p className="text-[10px] text-text-muted">SKU: {rec.sku} | Consumption: {rec.consumption}/day</p>
                      </div>
                      <div className="text-[10px] text-text-secondary bg-white p-2 border border-slate-100 rounded-lg space-y-1 font-semibold">
                        <div className="flex justify-between">
                          <span>Current Stock:</span> <span className="text-text-primary">{rec.currentStock} pcs</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Suggested PO size:</span> <span className="text-emerald-600 font-bold">{rec.suggestedOrder} Units</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Preferred Vendor:</span> <span className="text-[#4B164C]">{rec.preferredVendor}</span>
                        </div>
                      </div>
                      <Link href="/procurement" className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-0.5 pt-1">
                        Initiate Reorder PO <ArrowRight size={10} />
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-text-muted">No pending smart procurement suggestions.</p>
                )}
              </div>
            </div>
          </div>

          {/* Real Purchase Orders and Vendor registry grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Open Purchase Requests & RFQs */}
            <div className="glass-card p-5 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#4B164C]">Open Purchase Requests & RFQs</h3>
                <Link href="/procurement" className="text-xs font-semibold text-brand-primary hover:underline">Procurement Workspace →</Link>
              </div>
              <div className="overflow-x-auto text-xs">
                <table className="erp-table text-left">
                  <thead>
                    <tr>
                      <th>PO Number</th>
                      <th>Items & Quantities Requested</th>
                      <th>Status</th>
                      <th>Requested By</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data as any).pendingPurchaseOrders && (data as any).pendingPurchaseOrders.length > 0 ? (
                      (data as any).pendingPurchaseOrders.map((po: any) => {
                        return (
                          <tr key={po.id} className="align-middle">
                            <td className="p-4 font-mono font-bold text-brand-primary text-xs">
                              {po.orderNumber}
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1.5 max-w-md">
                                {po.items?.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center bg-[#F8E7F6]/10 border border-brand-accent/15 rounded-lg p-2 font-medium text-xs text-text-primary">
                                    <div className="flex flex-col">
                                      <span className="font-bold">{item.product?.name}</span>
                                      <span className="text-[10px] text-text-muted font-mono">SKU: {item.product?.sku}</span>
                                    </div>
                                    <span className="font-extrabold text-[#4B164C] bg-[#F8E7F6] px-2 py-0.5 rounded text-[11px] whitespace-nowrap ml-4">
                                      {Number(item.quantityOrdered)} {item.product?.unitOfMeasure}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge
                                variant={
                                  po.vendorName === 'Recommended Vendor (Pending Quote)'
                                    ? 'gray'
                                    : po.vendorName === 'RFQ Sent (Pending Bids)'
                                    ? 'purple'
                                    : 'blue'
                                }
                              >
                                {po.vendorName === 'Recommended Vendor (Pending Quote)'
                                  ? 'PENDING VERIFICATION'
                                  : po.vendorName === 'RFQ Sent (Pending Bids)'
                                  ? 'RFQ SENT'
                                  : 'PO DRAFT'}
                              </Badge>
                            </td>
                            <td className="p-4 font-medium text-text-secondary">{po.creator?.name || 'System'}</td>
                            <td className="p-4">
                              <Link
                                href="/procurement"
                                className="text-[10px] font-bold text-white bg-[#4B164C] hover:bg-[#381039] px-2.5 py-1.5 rounded-lg transition-colors inline-block whitespace-nowrap"
                              >
                                {po.vendorName === 'Recommended Vendor (Pending Quote)' ? 'Verify & Request' : 'Compare Quotes'}
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-text-muted">
                          No pending raw material purchase requests.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vendor Registry & Creation Widget */}
            <div className="glass-card p-5 space-y-4 lg:col-span-1">
              <h3 className="font-bold text-sm text-[#4B164C]">Vendor Directory</h3>
              
              {/* Add Vendor Form */}
              <form onSubmit={handleAddVendor} className="space-y-2 p-3 bg-slate-50 border border-surface-border rounded-xl">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Register Vendor Partner</p>
                <input
                  type="text"
                  placeholder="Vendor Name *"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  className="input-field py-1 px-2.5 h-8 text-[11px] focus:bg-white"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={newVendorEmail}
                    onChange={(e) => setNewVendorEmail(e.target.value)}
                    className="input-field py-1 px-2.5 h-8 text-[11px] focus:bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={newVendorPhone}
                    onChange={(e) => setNewVendorPhone(e.target.value)}
                    className="input-field py-1 px-2.5 h-8 text-[11px] focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreatingVendor}
                  className="w-full h-8 text-xs font-semibold bg-[#4B164C] hover:bg-[#381039] text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  {isCreatingVendor ? 'Adding...' : 'Add Vendor'}
                </button>
              </form>

              {/* Vendors List */}
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {vendorsList && vendorsList.length > 0 ? (
                  vendorsList.map((v: any) => (
                    <div key={v.id} className="p-2 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors text-[11px]">
                      <p className="font-bold text-text-primary">{v.name}</p>
                      {v.email && <p className="text-[10px] text-text-secondary">{v.email}</p>}
                      {v.phone && <p className="text-[10px] text-text-secondary">{v.phone}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-text-muted text-center py-4">No registered vendors yet.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================== */}
      {/* 4. INVENTORY MANAGER DASHBOARD VIEW */}
      {/* ========================================================== */}
      {userRole === 'inventory' && (
        <>
          {/* Inventory KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Inventory Assets Value</p>
                <p className="text-2xl font-bold text-[#4B164C] tracking-tight">₹{Number(kpis.totalInventoryValue).toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                  <TrendingUp size={12} /> Live Valuation
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8E7F6] text-[#4B164C] shrink-0">
                <IndianRupee size={22} />
              </div>
            </div>

            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Safety Stock Alerts</p>
                <p className="text-2xl font-bold text-rose-600 tracking-tight">{kpis.lowStockCount}</p>
                <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5">
                  <AlertTriangle size={12} /> Below Minimum
                </p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 shrink-0">
                <AlertCircle size={22} />
              </div>
            </div>

            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Warehouse Utilisation</p>
                <p className="text-2xl font-bold text-text-primary tracking-tight">64.2%</p>
                <p className="text-[10px] text-text-secondary font-semibold">1,240 cu. ft remaining</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <Layers size={22} />
              </div>
            </div>

            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Inventory Health Index</p>
                <p className="text-2xl font-bold text-emerald-600 tracking-tight">
                  {inventoryHealth.healthy} / {inventoryHealth.total}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold">Sufficient buffer stock</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          {/* Warehouse space visualizer & Stock Adjust form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Warehouse Utilisation circular gauge */}
            <div className="glass-card p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Warehouse Management</h3>
                  <p className="text-lg font-bold text-text-primary mt-0.5">Capacity Allocation Chart</p>
                </div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                  Optimal capacity
                </span>
              </div>
              
              <div className="h-56 w-full flex items-center justify-center bg-slate-50/50 border border-slate-100 rounded-xl p-4 relative">
                <svg viewBox="0 0 200 200" className="w-full h-44">
                  {/* Outer circle */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#e2e8f0" strokeWidth="15" />
                  {/* Gauge indicator */}
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="80" 
                    fill="none" 
                    stroke="#4B164C" 
                    strokeWidth="15" 
                    strokeDasharray="502" 
                    strokeDashoffset="180" 
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                  />
                  {/* Inner text */}
                  <text x="100" y="95" textAnchor="middle" fill="#4B164C" className="text-2xl font-extrabold font-sans">64.2%</text>
                  <text x="100" y="118" textAnchor="middle" fill="#64748b" className="text-[9px] font-bold uppercase tracking-wider">Capacity Used</text>
                  <text x="100" y="132" textAnchor="middle" fill="#94a3b8" className="text-[8px] font-bold">Shiv AP-South</text>
                </svg>
                <div className="absolute bottom-4 right-4 flex flex-col gap-1 text-[8px] font-bold text-text-muted bg-white p-2 border border-slate-100 rounded-lg shadow-sm">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#4B164C]" /> Timber Storage (42%)</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500" /> Finished Goods (14%)</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#e2e8f0]" /> Empty Space (35.8%)</div>
                </div>
              </div>
            </div>

            {/* Quick stock adjustment form */}
            <div className="glass-card p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Inventory Manager Operations</h3>
                <p className="text-lg font-bold text-text-primary mt-0.5">Quick Stock Level Adjustment</p>
              </div>
              <form onSubmit={handleQuickAdjustSubmit} className="space-y-3 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                <div className="space-y-1 text-left">
                  <label className="block text-[11px] font-bold text-text-secondary uppercase">Product Material</label>
                  <select 
                    className="input-field py-1.5 px-3 h-9 text-xs"
                    value={quickAdjProduct}
                    onChange={e => setQuickAdjProduct(e.target.value)}
                  >
                    <option value="">-- Choose Raw Material or Finished Good --</option>
                    {productsData?.products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (SKU: {p.sku} | Current: {Number(p.onHandQuantity)} pcs)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3 items-end">
                  <div className="space-y-1 text-left col-span-1">
                    <label className="block text-[11px] font-bold text-text-secondary uppercase">Delta Quantity</label>
                    <input 
                      type="number" 
                      className="input-field py-1.5 px-3 h-9 text-xs"
                      value={quickAdjQty}
                      onChange={e => setQuickAdjQty(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1 text-left col-span-2">
                    <label className="block text-[11px] font-bold text-text-secondary uppercase">Audit Adjustment Notes</label>
                    <input 
                      type="text" 
                      className="input-field py-1.5 px-3 h-9 text-xs"
                      value={quickAdjNotes}
                      onChange={e => setQuickAdjNotes(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isAdjustingStock}
                  className="btn-primary py-1.5 px-4 h-9 text-xs bg-brand-primary hover:bg-brand-hover flex items-center justify-center gap-1 shadow-none w-full mt-1"
                >
                  {isAdjustingStock ? <RefreshCw className="animate-spin" size={14} /> : <Settings size={14} />}
                  Confirm Stock Adjustment Ledger
                </button>
              </form>
            </div>
          </div>

          {/* Incoming cargo tracking for Inventory Managers */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-1.5">
              <Truck size={16} className="text-blue-600" /> Incoming Raw Materials (Purchase Orders in Transit)
            </h3>
            <div className="overflow-x-auto text-xs">
              <table className="erp-table text-left">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Supplier / Vendor</th>
                    <th>Product details</th>
                    <th>Quantity ordered</th>
                    <th>Date Dispatched</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(data as any).inTransitPurchaseOrders && (data as any).inTransitPurchaseOrders.length > 0 ? (
                    (data as any).inTransitPurchaseOrders.map((po: any) => {
                      const firstItem = po.items?.[0];
                      const productName = firstItem?.product?.name || 'Unknown';
                      const qty = firstItem ? `${Number(firstItem.quantityOrdered)} ${firstItem.product?.unitOfMeasure || 'pcs'}` : '0 pcs';

                      return (
                        <tr key={po.id}>
                          <td className="font-mono font-bold text-brand-primary">{po.orderNumber}</td>
                          <td className="font-semibold text-text-primary">
                            <div>
                              <span>{po.vendorName}</span>
                              {po.vendorPhone && <p className="text-[9px] text-text-muted mt-0.5">{po.vendorPhone}</p>}
                            </div>
                          </td>
                          <td>{productName}</td>
                          <td className="font-bold text-[#4B164C]">{qty}</td>
                          <td>{po.confirmedAt ? format(new Date(po.confirmedAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}</td>
                          <td>
                            <Badge variant="blue">IN TRANSIT</Badge>
                          </td>
                          <td>
                            <Link href="/procurement" className="text-[10px] font-bold text-brand-primary bg-[#F8E7F6] px-2 py-1 rounded hover:bg-[#F8E7F6]/80 whitespace-nowrap">
                              Inspect & Verify
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-text-muted">
                        No purchase orders currently in transit.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details logs (aging, alerts) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card p-5 space-y-4 lg:col-span-2">
              <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                <CheckCircle2 size={16} /> Raw Materials Safety Stock Alert Board
              </h3>
              <div className="overflow-x-auto text-xs">
                <table className="erp-table text-left">
                  <thead>
                    <tr>
                      <th>Raw Material</th>
                      <th>SKU</th>
                      <th>On Hand</th>
                      <th>Safety Level</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.slice(0, 4).map(p => (
                      <tr key={p.id}>
                        <td className="font-bold text-text-primary">{p.name}</td>
                        <td className="font-mono text-text-secondary">{p.sku}</td>
                        <td className="font-semibold text-rose-600">{p.onHandQuantity} {p.unitOfMeasure}</td>
                        <td>{p.minStockLevel} {p.unitOfMeasure}</td>
                        <td>
                          <Badge variant="red">Critical Low</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-1.5">
                <Clock size={16} /> Inventory Aging Analysis
              </h3>
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-text-secondary">Fast Moving Stocks (&lt; 15 days)</span>
                  <span className="font-bold text-emerald-600">68%</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-text-secondary">Medium Rotation (15 - 45 days)</span>
                  <span className="font-bold text-amber-500">22%</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="font-semibold text-text-secondary">Slow Aging Stocks (&gt; 45 days)</span>
                  <span className="font-bold text-rose-500">10%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================== */}
      {/* 5. SUPER ADMIN DASHBOARD VIEW */}
      {/* ========================================================== */}
      {userRole === 'admin' && (
        <>
          {/* Admin KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Gross Business Revenue</p>
                <p className="text-2xl font-bold text-text-primary tracking-tight">₹{Number(totalRev || 283500).toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                  <TrendingUp size={12} /> +14.2% MoM
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <IndianRupee size={22} />
              </div>
            </div>

            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Manufacturing Load Runs</p>
                <p className="text-2xl font-bold text-text-primary tracking-tight">{kpis.runningManufacturingRuns} Runs</p>
                <p className="text-[10px] text-text-secondary font-semibold">{kpis.pendingManufacturingApprovals} approvals pending</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8E7F6] text-[#4B164C] shrink-0">
                <Hammer size={22} />
              </div>
            </div>

            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Supply Chain Safety Risk</p>
                <p className="text-2xl font-bold text-rose-600 tracking-tight">{kpis.lowStockCount} Low Items</p>
                <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5">
                  <AlertTriangle size={12} /> Critical stock limits
                </p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 shrink-0">
                <AlertCircle size={22} />
              </div>
            </div>

            <div className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Customer Order Backlogs</p>
                <p className="text-2xl font-bold text-amber-600 tracking-tight">{kpis.pendingSalesOrders}</p>
                <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
                  <Clock size={12} /> Pending Delivery
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <ShoppingCart size={22} />
              </div>
            </div>
          </div>

          {/* AI Insights & Radar comparison SVG */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Business Insights Panel */}
            <div className="glass-card p-5 space-y-4 lg:col-span-2 border border-brand-accent/25 bg-[#F8E7F6]/10 relative overflow-hidden">
              <div className="absolute right-0 top-0 h-24 w-24 bg-brand-primary/[0.03] rounded-bl-full pointer-events-none" />
              <div className="flex justify-between items-center pb-2 border-b border-brand-accent/20">
                <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-2">
                  <Sparkles size={16} className="text-brand-accent animate-pulse" />
                  AI ERP Corporate Business Insights
                </h3>
                <span className="text-[9px] text-[#4B164C] bg-[#F8E7F6] px-2 py-0.5 rounded font-bold uppercase">
                  Generative Analytics Engine
                </span>
              </div>
              
              <div className="space-y-3.5 text-xs text-text-secondary leading-relaxed">
                <p>
                  🤖 <b>CEO Operations Digest:</b> {aiInsights?.executiveSummary || 'Corporate metrics are loading. Review standard department logs below.'}
                </p>
                {aiInsights?.criticalRisks && aiInsights.criticalRisks.length > 0 ? (
                  aiInsights.criticalRisks.slice(0, 1).map((risk: any, index: number) => (
                    <div key={index} className={`p-3.5 ${risk.severity.toLowerCase() === 'high' ? 'bg-rose-500/[0.02] border-rose-500/10' : 'bg-amber-500/[0.02] border-amber-500/10'} border rounded-xl space-y-2`}>
                      <p className="font-bold text-[#4B164C] flex items-center gap-1.5 text-xs">
                        <AlertTriangle size={14} className={risk.severity.toLowerCase() === 'high' ? 'text-rose-500' : 'text-amber-500'} /> {risk.risk} ({risk.severity} Severity)
                      </p>
                      <p className="text-[11px]">
                        {risk.reason}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-3.5 bg-rose-500/[0.02] border border-rose-500/10 rounded-xl space-y-2">
                    <p className="font-bold text-[#4B164C] flex items-center gap-1.5 text-xs">
                      <AlertTriangle size={14} className="text-rose-500" /> Procurement Stockout Warning
                    </p>
                    <p className="text-[11px]">
                      Current raw wood screw levels are at <b>200 pcs</b>. Based on active manufacturing runs of 80 wooden chairs, we predict a stockout in <b>4 days</b>. Reorder suggestion is <b>1,000 units</b> from <i>Apex Fasteners Corp</i> to avoid assembly floor idle times.
                    </p>
                  </div>
                )}
                <div className="flex gap-2 pt-1.5">
                  <Link href="/timeline" className="btn-primary py-2 px-4 text-[10px] font-bold bg-[#F8E7F6] text-[#4B164C] hover:bg-[#F8E7F6]/80 shadow-none">
                    Trace Sales Order Timeline
                  </Link>
                  <Link href="/audit" className="btn-primary py-2 px-4 text-[10px] font-bold bg-brand-primary hover:bg-brand-hover shadow-none">
                    Inspect Corporate Audit Log
                  </Link>
                </div>
              </div>
            </div>
 
            {/* Radar Department Performance Comparison SVG */}
            <div className="glass-card p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Corporate Diagnostics</h3>
                <p className="text-lg font-bold text-text-primary mt-0.5">Department Scorecard</p>
              </div>
              <div className="h-48 w-full flex items-center justify-center bg-slate-50/50 border border-slate-100 rounded-xl p-2">
                <svg viewBox="0 0 200 200" className="w-full h-full max-h-40">
                  {/* Draw radar grid hexagons */}
                  <polygon points="100,20 180,60 180,140 100,180 20,140 20,60" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                  <polygon points="100,50 150,75 150,125 100,150 50,125 50,75" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                  <polygon points="100,75 125,87 125,112 100,125 75,112 75,87" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                   
                  {/* Axis lines */}
                  <line x1="100" y1="20" x2="100" y2="180" stroke="#cbd5e1" strokeWidth="0.5" />
                  <line x1="20" y1="60" x2="180" y2="140" stroke="#cbd5e1" strokeWidth="0.5" />
                  <line x1="20" y1="140" x2="180" y2="60" stroke="#cbd5e1" strokeWidth="0.5" />
 
                  {/* Axis labels */}
                  <text x="100" y="15" textAnchor="middle" fill="#64748b" className="text-[8px] font-bold font-sans">Sales ({s_sales}%)</text>
                  <text x="190" y="60" textAnchor="start" fill="#64748b" className="text-[8px] font-bold font-sans">PM ({s_pm}%)</text>
                  <text x="190" y="145" textAnchor="start" fill="#64748b" className="text-[8px] font-bold font-sans">Procurement ({s_proc}%)</text>
                  <text x="100" y="195" textAnchor="middle" fill="#64748b" className="text-[8px] font-bold font-sans">Inventory ({s_inv}%)</text>
                  <text x="10" y="145" textAnchor="end" fill="#64748b" className="text-[8px] font-bold font-sans">OEE ({s_oee}%)</text>
                  <text x="10" y="60" textAnchor="end" fill="#64748b" className="text-[8px] font-bold font-sans">Fulfillment ({s_ful}%)</text>
 
                  {/* Actual Score Radar Shape */}
                  <polygon 
                    points={radarPoints} 
                    fill="rgba(75, 22, 76, 0.2)" 
                    stroke="#4B164C" 
                    strokeWidth="2" 
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* User management and telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card p-5 space-y-4 lg:col-span-2">
              <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-1.5">
                <User size={16} /> Corporate Active Users & Activities
              </h3>
              <div className="overflow-x-auto text-xs">
                <table className="erp-table text-left">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Email Address</th>
                      <th>Assigned Role</th>
                      <th>Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-bold text-text-primary">Super Admin</td>
                      <td>admin@shivfurniture.com</td>
                      <td><Badge variant="purple">Admin</Badge></td>
                      <td>Viewing CEO corporate dashboard (Live)</td>
                    </tr>
                    <tr>
                      <td className="font-bold text-text-primary">Priya Singh</td>
                      <td>priya@shivfurniture.com</td>
                      <td><Badge variant="blue">Sales</Badge></td>
                      <td>Created Sales Order draft</td>
                    </tr>
                    <tr>
                      <td className="font-bold text-text-primary">Ravi Sharma</td>
                      <td>ravi@shivfurniture.com</td>
                      <td><Badge variant="green">Product Manager</Badge></td>
                      <td>Approved production recipe MO-001</td>
                    </tr>
                    <tr>
                      <td className="font-bold text-text-primary">Amit Patel</td>
                      <td>amit@shivfurniture.com</td>
                      <td><Badge variant="amber">Purchase</Badge></td>
                      <td>Compared vendor quotes for screws PO</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card p-5 space-y-4">
              <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-1.5">
                <Activity size={16} /> Server Telemetry Diagnostics
              </h3>
              <div className="space-y-3.5 text-xs font-semibold text-text-secondary leading-relaxed">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span>API Telemetry Latency</span>
                  <span className="text-emerald-600 font-bold">14ms (Optimal)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span>Database Pooler Load</span>
                  <span className="text-emerald-600 font-bold">1.2% (Active)</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span>Audit Event Log Sync</span>
                  <span className="text-emerald-600 font-bold">Synchronized</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================== */}
      {/* 6. GENERAL WIDGETS (Visible to Roles where necessary) */}
      {/* ========================================================== */}
      {/* Dynamic Action Center Alert Banner */}
      {userRole !== 'admin' && (
        <div className="mt-6 flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-brand-accent/20 bg-slate-50">
          <div className="flex items-center gap-3">
            <Info className="text-brand-accent shrink-0 animate-pulse" size={16} />
            <div>
              <p className="font-bold text-xs text-[#4B164C]">Action Center Alerts</p>
              <p className="text-[11px] text-text-secondary mt-0.5">Need immediate decision routing? View unified diagnostics for bottlenecks and delay resolutions.</p>
            </div>
          </div>
          <Link href="/action-center" className="text-xs font-bold text-[#4B164C] whitespace-nowrap hover:underline flex items-center gap-0.5 shrink-0">
            Resolve Bottlenecks <ChevronRight size={13} />
          </Link>
        </div>
      )}

      {/* Activity Trail (Visible to all, shows recent operations) */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-sm text-[#4B164C] flex items-center gap-2">
            <Activity size={16} className="text-brand-accent animate-pulse" />
            Connected Operations Activity Trail
          </h3>
          {userRole === 'admin' && (
            <Link href="/audit" className="text-xs font-semibold text-brand-primary hover:underline">Full Log →</Link>
          )}
        </div>
        
        <div className="overflow-y-auto space-y-4 pr-1 mt-2 max-h-[300px] text-xs">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.map((log: any) => (
              <div key={log.id} className="relative pl-6 pb-2 border-l border-slate-100 last:border-0 last:pb-0">
                <span className="absolute left-[-4.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#4B164C] ring-4 ring-purple-100" />
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wide">
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  <time className="text-[9px] text-text-muted">{format(new Date(log.createdAt), 'MMM d, HH:mm')}</time>
                </div>
                <p className="text-text-secondary font-medium">
                  <span className="font-bold text-text-primary">{log.userName}</span>
                  {log.entityName && <> — {log.entityName}</>}
                </p>
              </div>
            ))
          ) : (
            <p className="text-text-muted">No activity logs recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
