'use client';

import React, { useState } from 'react';
import Badge from '../ui/Badge';
import Link from 'next/link';
import { Edit2, Trash2, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

interface ProductsTableProps {
  products: any[];
  onDelete: (id: string) => void;
  onOrderRawMaterial?: (product: any) => void;
}

/** Maps product name keywords → public image path */
function resolveProductImage(name: string, type: string): string {
  const n = name.toLowerCase();
  if (n.includes('bookshelf') || n.includes('shelf')) return '/products/bookshelf.png';
  if (n.includes('chair')) return '/products/chair.png';
  if (n.includes('dining table') || n.includes('dining')) return '/products/dining-table.png';
  if (n.includes('table')) return '/products/dining-table.png';
  if (type === 'purchase') return '/products/raw-material.png';
  return '/products/bookshelf.png'; // generic finished goods fallback
}

export default function ProductsTable({ products, onDelete, onOrderRawMaterial }: ProductsTableProps) {
  const { user } = useAuth();
  const isAdminOrPM = user?.role === 'admin' || user?.role === 'product_manager';
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  return (
    <div className="overflow-x-auto">
      <table className="erp-table">
        <thead>
          <tr>
            <th className="w-16 text-center">Preview</th>
            <th>SKU</th>
            <th>Product Details</th>
            <th>Type</th>
            <th>Cost Basis</th>
            <th>Selling Price</th>
            <th className="text-right">On Hand</th>
            <th className="text-right">Reserved</th>
            <th className="text-right">Available Free</th>
            <th className="text-right">Min Level</th>
            {isAdminOrPM && <th className="text-right pr-6">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const onHand = Number(product.onHandQuantity);
            const reserved = Number(product.reservedQuantity);
            const free = onHand - reserved;
            const min = Number(product.minStockLevel);
            const isLowStock = free <= min;
            const imgSrc = resolveProductImage(product.name, product.procurementType);
            const hasError = imgErrors[product.id];

            return (
              <tr key={product.id}>
                {/* ── Preview Thumbnail ── */}
                <td className="w-16">
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-lg border border-surface-border bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      {hasError ? (
                        <Package size={18} className="text-text-muted" />
                      ) : (
                        <Image
                          src={imgSrc}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="object-contain w-full h-full p-0.5"
                          onError={() =>
                            setImgErrors((prev) => ({ ...prev, [product.id]: true }))
                          }
                        />
                      )}
                    </div>
                  </div>
                </td>

                <td className="font-mono text-xs font-semibold text-[#4B164C]">{product.sku}</td>

                <td>
                  <div className="flex flex-col">
                    <span className="font-semibold text-text-primary text-xs">{product.name}</span>
                    {product.category && (
                      <span className="text-[10px] text-text-muted mt-0.5">
                        Category: {product.category}
                      </span>
                    )}
                  </div>
                </td>

                <td>
                  <Badge variant={product.procurementType === 'manufacture' ? 'purple' : 'blue'}>
                    {product.procurementType === 'manufacture' ? 'Finished Assembly' : 'Raw Material'}
                  </Badge>
                </td>

                <td className="font-medium text-xs">₹{Number(product.costPrice).toLocaleString('en-IN')}</td>
                <td className="font-medium text-xs">₹{Number(product.salesPrice).toLocaleString('en-IN')}</td>
                <td className="text-right font-medium text-xs">{onHand}</td>
                <td className="text-right text-text-muted text-xs">{reserved}</td>
                <td className="text-right">
                  <span className={`font-bold text-xs ${isLowStock ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {free}
                  </span>
                </td>
                <td className="text-right text-text-muted text-xs">{min}</td>

                {isAdminOrPM && (
                  <td>
                    <div className="flex items-center justify-end gap-2 pr-4">
                      {product.procurementType === 'purchase' && onOrderRawMaterial && (
                        <button
                          onClick={() => onOrderRawMaterial(product)}
                          className="px-2 py-1 text-[10px] font-bold bg-brand-primary hover:bg-brand-hover text-white rounded transition-colors mr-1"
                          title="Order Raw Materials"
                        >
                          Order
                        </button>
                      )}
                      <Link
                        href={`/products/${product.id}`}
                        className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-[#F8E7F6] rounded-lg transition-colors"
                        title="Edit Product Details"
                      >
                        <Edit2 size={14} />
                      </Link>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
                              onDelete(product.id);
                            }
                          }}
                          className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
