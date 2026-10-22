'use client';

import React, { useState } from 'react';
import { useVendors } from '@/hooks/useVendors';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, Loader2, AlertTriangle, Plus, Trash2, Mail, Phone, Clock, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';

export default function VendorsPage() {
  const { useList, createVendor, deleteVendor, isCreating, isDeleting } = useVendors();
  const { data: vendors, isLoading, isError } = useList();
  const { user } = useAuth();
  const userRole = user?.role || 'sales';
  const isAdminOrPurchase = userRole === 'admin' || userRole === 'purchase';

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      await createVendor({ name, email: email || undefined, phone: phone || undefined });
      setName('');
      setEmail('');
      setPhone('');
    } catch {
      // Toast handles error
    }
  };

  const handleDelete = async (id: string, vendorName: string) => {
    if (window.confirm(`Are you sure you want to remove ${vendorName} from the vendor registry?`)) {
      await deleteVendor(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col justify-center items-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="text-text-secondary text-sm">Loading vendor registry...</p>
      </div>
    );
  }

  if (isError || !vendors) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="mx-auto text-rose-500" size={40} />
        <h2 className="text-xl font-bold text-brand-primary">Error Loading Registry</h2>
        <p className="text-sm text-text-secondary">Could not fetch vendor directory from the database.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Title */}
      <div>
        <h1 className="page-title">Vendor & Supplier Directory</h1>
        <p className="page-subtitle">Manage raw material suppliers, RFQ targets, and external contact portfolios</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Add vendor */}
        {isAdminOrPurchase && (
          <div className="glass-card p-5 space-y-4 h-fit">
            <div>
              <h3 className="text-base font-bold text-[#4B164C] flex items-center gap-2">
                <Plus size={18} /> Register Supplier Partner
              </h3>
              <p className="text-[11px] text-text-secondary mt-0.5">Add a new external supplier for RFQ quote comparisons</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-text-secondary">Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Global Timber Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field w-full text-xs"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-text-secondary">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. sales@globaltimber.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full text-xs"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-text-secondary">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 88888 77777"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field w-full text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={isCreating || !name}
                className="w-full bg-[#4B164C] hover:bg-[#381039] text-white border-0 font-semibold text-xs py-2 rounded-lg"
              >
                {isCreating ? 'Registering...' : 'Register Vendor'}
              </Button>
            </form>
          </div>
        )}

        {/* Right column: List vendors */}
        <div className={`${isAdminOrPurchase ? 'lg:col-span-2' : 'lg:col-span-3'} glass-card p-5 space-y-4`}>
          <div>
            <h3 className="text-base font-bold text-[#4B164C] flex items-center gap-2">
              <Users size={18} /> Supplier Directory Catalog
            </h3>
            <p className="text-[11px] text-text-secondary mt-0.5">Active registry of trusted business raw material suppliers</p>
          </div>

          {vendors.length === 0 ? (
            <Alert variant="info">No suppliers registered in the database directory.</Alert>
          ) : (
            <div className="border border-surface-border rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-surface-card/30 text-text-secondary uppercase">
                  <tr className="border-b border-surface-border">
                    <th className="p-4">Vendor Partner</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Phone Contact</th>
                    {isAdminOrPurchase && <th className="p-4 text-right pr-6">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border bg-surface-input">
                  {vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#F8E7F6] text-[#4B164C] font-bold text-xs flex items-center justify-center">
                            {v.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-text-primary text-xs">{v.name}</span>
                            <p className="text-[9px] text-text-muted mt-0.5">Supplier Partner</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-text-secondary">
                        {v.email ? (
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-text-muted" />
                            <span>{v.email}</span>
                          </div>
                        ) : (
                          <span className="text-text-muted text-[10px]">No email provided</span>
                        )}
                      </td>
                      <td className="p-4 font-medium text-text-secondary">
                        {v.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} className="text-text-muted" />
                            <span>{v.phone}</span>
                          </div>
                        ) : (
                          <span className="text-text-muted text-[10px]">No phone provided</span>
                        )}
                      </td>
                      {isAdminOrPurchase && (
                        <td className="p-4 text-right pr-6">
                          <button
                            onClick={() => handleDelete(v.id, v.name)}
                            disabled={isDeleting}
                            className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Remove Supplier Partner"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
