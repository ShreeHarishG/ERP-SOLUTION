'use client';

import { useSales } from '@/hooks/useSales';
import { useAuth } from '@/hooks/useAuth';
import SalesTable from '@/components/tables/SalesTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { Plus, ShoppingCart, Loader2, Calendar, User, Phone, Mail, AlertTriangle, CheckCircle, PackageOpen } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import { format } from 'date-fns';

export default function SalesPage() {
  const { useList, confirm, deliver, isConfirming, isDelivering } = useSales();
  const { data: orders, isLoading, isError } = useList();
  const { user } = useAuth();
  const isPMOrAdmin = user?.role === 'admin' || user?.role === 'product_manager';

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleConfirmAction = async (id: string) => {
    try {
      const updated = await confirm(id);
      setSelectedOrder(updated);
    } catch {
      // Handled by hook toast
    }
  };

  const handleDeliverAction = async (id: string) => {
    try {
      const updated = await deliver(id);
      setSelectedOrder(updated);
    } catch {
      // Handled by hook toast
    }
  };

  // Shortage parser helper
  const parseShortageAnalysis = (notes: string | null) => {
    if (!notes) return null;
    const delimiter = '\n\n[Shortage Analysis]\n';
    const parts = notes.split(delimiter);
    if (parts.length < 2) return null;
    try {
      return JSON.parse(parts[1]);
    } catch {
      return null;
    }
  };

  const getOriginalNotes = (notes: string | null) => {
    if (!notes) return '';
    const delimiter = '\n\n[Shortage Analysis]\n';
    return notes.split(delimiter)[0];
  };

  const shortageReport = selectedOrder ? parseShortageAnalysis(selectedOrder.notes) : null;
  const originalNotes = selectedOrder ? getOriginalNotes(selectedOrder.notes) : '';

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="page-title">Sales Orders</h1>
          <p className="page-subtitle">Track customer orders, check stock levels, and coordinate shipments</p>
        </div>
        <Link href="/sales/new" className="btn-primary">
          <Plus size={20} />
          New Sales Order
        </Link>
      </div>

      <div className="glass-card flex flex-col" style={{ minHeight: 'calc(100vh - 13rem)' }}>
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center items-center h-full min-h-[300px]">
              <Loader2 className="animate-spin text-brand-primary" size={32} />
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-rose-400">Failed to load sales orders</div>
          ) : !orders || orders.length === 0 ? (
            <div className="p-12">
              <EmptyState
                title="No Sales Orders"
                description="Create a sales order for a customer and run the shortage check workflow to allocate inventory components."
                icon={ShoppingCart}
                action={
                  <Link href="/sales/new" className="btn-primary">
                    <Plus size={16} /> New Sales Order
                  </Link>
                }
              />
            </div>
          ) : (
            <SalesTable orders={orders} onViewDetails={handleViewDetails} />
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={selectedOrder ? `Order: ${selectedOrder.orderNumber}` : ''}
      >
        {selectedOrder && (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-card/40 p-4 rounded-xl border border-surface-border">
              <div className="space-y-1">
                <span className="text-xs text-text-muted">Order Date</span>
                <p className="text-sm font-semibold flex items-center gap-1.5 text-brand-primary">
                  <Calendar size={14} />
                  {format(new Date(selectedOrder.orderDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-text-muted">Status</span>
                <div>
                  <Badge
                    variant={
                      selectedOrder.status === 'draft' ? 'gray' :
                      selectedOrder.status === 'confirmed' ? 'blue' :
                      selectedOrder.status === 'shortage_detected' ? 'red' :
                      selectedOrder.status === 'ready' ? 'amber' : 'green'
                    }
                  >
                    {selectedOrder.status.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider">Customer Details</h4>
              <div className="p-4 bg-surface-input rounded-xl border border-surface-border space-y-2 text-sm">
                <div className="flex items-center gap-2 text-text-secondary">
                  <User size={15} className="text-text-muted" />
                  <span className="font-semibold text-text-primary">{selectedOrder.customerName}</span>
                </div>
                {selectedOrder.customerPhone && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Phone size={15} className="text-text-muted" />
                    <span>{selectedOrder.customerPhone}</span>
                  </div>
                )}
                {selectedOrder.customerEmail && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Mail size={15} className="text-text-muted" />
                    <span>{selectedOrder.customerEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider">Ordered Products</h4>
              <div className="border border-surface-border rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-card/30 text-text-secondary uppercase">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3 text-right">Quantity</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border bg-surface-input">
                    {selectedOrder.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="p-3">
                          <p className="font-semibold text-text-primary">{item.product.name}</p>
                          <p className="text-[10px] text-text-muted">SKU: {item.product.sku}</p>
                        </td>
                        <td className="p-3 text-right font-medium">
                          {Number(item.quantityOrdered)} {item.product.unitOfMeasure}
                        </td>
                        <td className="p-3 text-right">
                          INR {Number(item.unitPrice).toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-bold text-brand-primary">
                          INR {Number(item.subtotal || (Number(item.quantityOrdered) * Number(item.unitPrice))).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-right pr-3 pt-1">
                <span className="text-xs text-text-secondary">Grand Total:</span>
                <span className="ml-2 font-bold text-brand-primary text-base">INR {Number(selectedOrder.totalAmount).toLocaleString()}</span>
              </div>
            </div>

            {/* Shortage Warning Box */}
            {selectedOrder.status === 'shortage_detected' && shortageReport && (
              <div className="space-y-3">
                <Alert variant="danger">
                  <span className="font-bold block mb-1">Shortage Detected!</span>
                  Insufficient finished goods in stock. Material explosion analysis below highlights component gaps.
                </Alert>

                <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-3">
                  {shortageReport.shortages.map((sh: any, sIdx: number) => (
                    <div key={sIdx} className="space-y-2">
                      <div className="flex justify-between items-center text-xs border-b border-rose-500/10 pb-1.5">
                        <span className="font-bold text-rose-500">{sh.productName} ({sh.sku})</span>
                        <span className="bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded font-bold">
                          Shortage: {sh.shortage} pcs
                        </span>
                      </div>

                      {isPMOrAdmin ? (
                        sh.hasBom ? (
                          <div className="space-y-1.5 pl-2">
                            <p className="text-[10px] text-text-secondary italic">BoM recipe exploded: {sh.bomName}</p>
                            <div className="space-y-1">
                              {sh.materialsNeeded.map((mat: any, mIdx: number) => {
                                const isMissing = mat.shortage > 0;
                                return (
                                  <div key={mIdx} className="flex justify-between items-center text-[11px] p-1.5 rounded bg-surface-input">
                                    <span className="text-text-primary font-medium">{mat.product}</span>
                                    <div className="flex items-center gap-3">
                                      <span className="text-text-muted">
                                        Needed: {mat.required} | Free: {mat.available}
                                      </span>
                                      {isMissing ? (
                                        <span className="text-rose-500 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded text-[10px]">
                                          Shortage: {mat.shortage} {mat.unitOfMeasure}
                                        </span>
                                      ) : (
                                        <span className="text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                                          Available
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] text-rose-500 pl-2">No active BoM recipe found to explode components!</p>
                        )
                      ) : (
                        <p className="text-[10px] text-text-muted pl-2 italic">Detailed component breakdown restricted to Admin/Product Manager.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedOrder.status === 'ready' && (
              <Alert variant="success">
                <span className="font-bold block mb-1">Stock Reserved & Ready!</span>
                All finished good items are fully reserved in inventory. Ready for shipment dispatch.
              </Alert>
            )}

            {originalNotes && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-text-secondary uppercase">Order Notes</span>
                <p className="text-xs p-3 bg-surface-input rounded-xl border border-surface-border text-text-secondary">
                  {originalNotes}
                </p>
              </div>
            )}

            {/* Actions Footer inside modal */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-surface-border">
              <Button type="button" variant="secondary" onClick={() => setIsDetailsOpen(false)} disabled={isConfirming || isDelivering}>
                Close
              </Button>

              {(selectedOrder.status === 'draft' || selectedOrder.status === 'shortage_detected') && (
                <Button type="button" onClick={() => handleConfirmAction(selectedOrder.id)} isLoading={isConfirming}>
                  Run Stock Check & Confirm
                </Button>
              )}

              {selectedOrder.status === 'ready' && (
                <Button type="button" className="bg-emerald-500 hover:bg-emerald-600 border-0" onClick={() => handleDeliverAction(selectedOrder.id)} isLoading={isDelivering}>
                  Ship & Deliver Order
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
