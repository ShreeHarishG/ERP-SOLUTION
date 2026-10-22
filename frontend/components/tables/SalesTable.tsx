'use client';

import React from 'react';
import Badge from '../ui/Badge';
import { format } from 'date-fns';
import { Button } from '../ui/Button';
import { useSales } from '@/hooks/useSales';
import { CheckCircle2, Play, Eye } from 'lucide-react';

interface SalesTableProps {
  orders: any[];
  onViewDetails: (order: any) => void;
}

export default function SalesTable({ orders, onViewDetails }: SalesTableProps) {
  const { confirm, deliver, isConfirming, isDelivering } = useSales();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'gray';
      case 'confirmed':
        return 'blue';
      case 'shortage_detected':
        return 'red';
      case 'ready':
        return 'amber';
      case 'delivered':
        return 'green';
      default:
        return 'gray';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <table className="erp-table">
      <thead>
        <tr>
          <th>Order Number</th>
          <th>Customer</th>
          <th>Order Date</th>
          <th>Status</th>
          <th>Total Amount</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => {
          const date = new Date(order.orderDate);

          return (
            <tr key={order.id}>
              <td className="font-mono text-xs font-semibold">{order.orderNumber}</td>
              <td>
                <div>
                  <p className="font-medium text-text-primary">{order.customerName}</p>
                  {order.customerEmail && <p className="text-[11px] text-text-muted">{order.customerEmail}</p>}
                </div>
              </td>
              <td className="text-text-secondary">
                {isNaN(date.getTime()) ? '-' : format(date, 'MMM d, yyyy')}
              </td>
              <td>
                <Badge variant={getStatusVariant(order.status)}>
                  {formatStatus(order.status)}
                </Badge>
              </td>
              <td className="font-semibold text-brand-primary">
                INR {Number(order.totalAmount).toLocaleString()}
              </td>
              <td>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="p-1 h-8 text-xs text-text-secondary"
                    onClick={() => onViewDetails(order)}
                    title="View Details & Analysis"
                  >
                    <Eye size={16} /> Details
                  </Button>
                  {(order.status === 'draft' || order.status === 'shortage_detected') && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="px-2.5 py-1 text-xs h-8 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border-0"
                      onClick={() => confirm(order.id)}
                      isLoading={isConfirming}
                    >
                      <Play size={12} /> Confirm
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="px-2.5 py-1 text-xs h-8 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-0"
                      onClick={() => deliver(order.id)}
                      isLoading={isDelivering}
                    >
                      <CheckCircle2 size={12} /> Ship
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
