'use client';

import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { AiAssistant } from '@/components/ai/AiAssistant';
import { Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, useGetMe, user } = useAuth();
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isError } = useGetMe();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    // Only redirect after Zustand has rehydrated from localStorage
    if (!_hasHydrated) return;
    if (!isAuthenticated || isError) {
      router.push('/login');
    }
  }, [_hasHydrated, isAuthenticated, isError, router]);

  // Authorization check
  const isAuthorized = () => {
    const userRole = user?.role || '';
    if (userRole === 'admin') return true; // admin has full access
    
    if (pathname.startsWith('/users') || pathname.startsWith('/audit')) {
      return false; // admin only
    }
    if (pathname.startsWith('/bom') || pathname.startsWith('/manufacturing')) {
      return userRole === 'product_manager';
    }
    if (pathname.startsWith('/procurement')) {
      return userRole === 'purchase' || userRole === 'inventory';
    }
    if (pathname.startsWith('/onchain-insights')) {
      return ['purchase', 'product_manager', 'inventory', 'sales'].includes(userRole);
    }
    if (pathname.startsWith('/vendors')) {
      return userRole === 'purchase';
    }
    if (pathname.startsWith('/inventory')) {
      return userRole === 'inventory';
    }
    if (pathname.startsWith('/sales')) {
      return userRole === 'sales';
    }
    return true;
  };

  const authorized = isAuthorized();

  if (!_hasHydrated || (!user && isLoading) || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <Loader2 className="animate-spin text-[#4B164C]" size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F5] text-[#1e1b1e]">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Topbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          aiOpen={aiOpen}
          setAiOpen={setAiOpen}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto page-container">
          {authorized ? (
            children
          ) : (
            <div className="max-w-2xl mx-auto my-12 animate-slide-up">
              <div className="glass-card border border-rose-200 bg-rose-50/10 p-8 rounded-2xl text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto text-rose-600">
                  <ShieldAlert size={32} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-[#4B164C]">Access Restricted</h2>
                  <p className="text-sm text-text-secondary max-w-md mx-auto">
                    Your account role (<span className="font-bold capitalize">{user?.role?.replace('_', ' ')}</span>) is not authorized to access the <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-brand-primary">{pathname}</span> workspace.
                  </p>
                </div>
                
                {/* Visual Lock/Badge Details */}
                <div className="bg-white border border-slate-100 rounded-xl p-4 max-w-sm mx-auto text-left text-xs text-text-secondary space-y-2 font-medium">
                  <div className="flex justify-between">
                    <span>Active Account:</span>
                    <span className="font-bold text-text-primary">{user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email Address:</span>
                    <span className="font-bold text-text-primary">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned Permissions:</span>
                    <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded capitalize">{user?.role} Only</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Link href="/dashboard" className="btn-primary flex items-center gap-1.5 justify-center py-2 px-4 text-xs bg-brand-primary hover:bg-brand-hover">
                    <ArrowLeft size={14} /> Back to Dashboard
                  </Link>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  💡 Hint: Switch roles via the <b>Role Sandbox Switcher</b> in the top header.
                </p>
              </div>
            </div>
          )}
        </main>
        
        {/* Floating AI Panel */}
        <AiAssistant isOpen={aiOpen} onClose={() => setAiOpen(false)} />
      </div>
    </div>
  );
}
