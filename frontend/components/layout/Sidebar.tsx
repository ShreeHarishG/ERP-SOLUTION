'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Package,
  ClipboardList,
  Warehouse,
  ShoppingCart,
  BookOpen,
  Hammer,
  Truck,
  Clock,
  Target,
  Settings,
  Radar,
  ShieldCheck,
  ArrowLeftRight,
  UserPlus,
  Layers,
  Radio,
  Network,
  SlidersHorizontal,
  FileCheck,
  Bell,
  LineChart,
  Cpu,
} from 'lucide-react';

const SECTIONS = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'product_manager', 'sales', 'purchase', 'inventory'] },
    ]
  },
  {
    title: 'Customer & Catalog',
    items: [
      { name: 'Products', path: '/products', icon: Package, roles: ['admin', 'product_manager', 'sales', 'purchase', 'inventory'] },
      { name: 'Bill of Materials', path: '/bom', icon: ClipboardList, roles: ['admin', 'product_manager'] },
      { name: 'Sales Orders', path: '/sales', icon: ShoppingCart, roles: ['admin', 'sales'] },
    ]
  },
  {
    title: 'Supply Chain Operations',
    items: [
      { name: 'Manufacturing', path: '/manufacturing', icon: Hammer, roles: ['admin', 'product_manager'] },
      { name: 'Procurement', path: '/procurement', icon: Truck, roles: ['admin', 'purchase', 'inventory'] },
      { name: 'Vendor Directory', path: '/vendors', icon: Users, roles: ['admin', 'purchase'] },
      { name: 'Inventory', path: '/inventory', icon: Warehouse, roles: ['admin', 'inventory'] },
      { name: 'Stock Ledger', path: '/inventory/ledger', icon: BookOpen, roles: ['admin', 'inventory'] },
    ]
  },
  {
    title: 'Supply Chain Intelligence',
    items: [
      { name: 'Overview', path: '/onchain-insights', icon: Radar, roles: ['admin', 'purchase'] },
      { name: 'AI Models & Webhook Tower', path: '/onchain-insights/agents', icon: Cpu, roles: ['admin', 'purchase', 'product_manager'] },
      { name: 'Disruptions & Shipments', path: '/onchain-insights/disruptions', icon: Radio, roles: ['admin', 'purchase', 'inventory'] },
      { name: 'Supplier Qualification', path: '/onchain-insights/suppliers', icon: ShieldCheck, roles: ['admin', 'purchase'] },
      { name: 'Onboarding & Review', path: '/onchain-insights/suppliers/onboard/queue', icon: UserPlus, roles: ['admin', 'purchase'] },
      { name: 'Switching Simulator', path: '/onchain-insights/supplier-switch', icon: ArrowLeftRight, roles: ['admin', 'purchase'] },
      { name: 'SKU Transition Planning', path: '/onchain-insights/sku-transition', icon: Layers, roles: ['admin', 'purchase'] },
      { name: 'Risk Prioritization', path: '/onchain-insights/risk-assessment', icon: ShieldAlert, roles: ['admin', 'purchase'] },
      { name: 'Dependency Explorer', path: '/onchain-insights/dependencies', icon: Network, roles: ['admin', 'purchase', 'product_manager'] },
      { name: 'Mitigation Scenario Lab', path: '/onchain-insights/mitigation', icon: SlidersHorizontal, roles: ['admin', 'purchase', 'product_manager'] },
      { name: 'Decision & Approvals', path: '/onchain-insights/approvals', icon: FileCheck, roles: ['admin', 'purchase'] },
      { name: 'Alerts & Notifications', path: '/onchain-insights/notifications', icon: Bell, roles: ['admin', 'purchase', 'sales', 'product_manager', 'inventory'] },
      { name: 'Outcome Analytics', path: '/onchain-insights/analytics', icon: LineChart, roles: ['admin', 'purchase', 'product_manager'] },
    ]
  },
  {
    title: 'Decision Intelligence',
    items: [
      { name: 'Business Timeline', path: '/timeline', icon: Clock, roles: ['admin', 'sales', 'product_manager', 'purchase', 'inventory'] },
      { name: 'Action Center', path: '/action-center', icon: Target, roles: ['admin', 'sales', 'product_manager', 'purchase', 'inventory'] },
    ]
  },
  {
    title: 'System & Security',
    items: [
      { name: 'Users', path: '/users', icon: Users, roles: ['admin'] },
      { name: 'Audit Logs', path: '/audit', icon: ShieldAlert, roles: ['admin'] },
      { name: 'Settings', path: '/settings', icon: Settings, roles: ['admin', 'sales', 'product_manager', 'purchase', 'inventory'] },
    ]
  }
];

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.role || 'sales';

  // Filter sections and items based on role
  const visibleSections = SECTIONS.map(section => {
    const visibleItems = section.items.filter(item => item.roles.includes(userRole));
    return { ...section, items: visibleItems };
  }).filter(section => section.items.length > 0);

  return (
    <aside
      className={`${isOpen ? 'w-[260px]' : 'w-[72px]'} bg-brand-primary text-text-inverse transition-all duration-300 relative flex flex-col z-20 shrink-0 border-r border-white/5`}
    >
      {/* Brand header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 relative">
        <div className={`flex items-center gap-3 w-full ${!isOpen && 'justify-center'}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-accent to-white flex items-center justify-center shrink-0 shadow-md">
            <span className="text-brand-primary font-bold text-sm">CQ</span>
          </div>
          {isOpen && (
            <div className="overflow-hidden animate-fade-in">
              <p className="font-bold text-sm text-white leading-tight tracking-wide truncate">ChainIQ</p>
              <p className="text-[10px] text-slate-300 truncate">Enterprise ERP</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-5 bg-white border border-surface-border rounded-full p-1 text-brand-primary hover:text-brand-hover shadow-md z-30 transition-transform duration-200 hover:scale-105"
        >
          {isOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
        {visibleSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {isOpen ? (
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                {section.title}
              </div>
            ) : (
              <div className="h-px bg-white/10 my-2 mx-1" />
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = item.path === '/onchain-insights' || item.path === '/inventory' || item.path === '/dashboard'
                  ? pathname === item.path
                  : pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    prefetch={false}
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-all text-sm relative group ${
                      isActive
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                    title={!isOpen ? item.name : undefined}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-accent rounded-r" />
                    )}
                    <Icon
                      size={18}
                      className={`shrink-0 transition-colors ${
                        isActive ? 'text-brand-accent' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {isOpen && <span className="ml-3 truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer User Info */}
      <div className="p-4 border-t border-white/5 bg-brand-hover/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-accent to-slate-200 flex items-center justify-center shrink-0 text-sm font-bold text-brand-primary shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {isOpen && (
            <div className="overflow-hidden min-w-0 animate-fade-in">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-300 truncate capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
