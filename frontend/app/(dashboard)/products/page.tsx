'use client';

import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import ProductsTable from '@/components/tables/ProductsTable';
import { Plus, Search, Package, FileDown, Layers, Landmark, Info } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { usePurchase } from '@/hooks/usePurchase';
import Modal from '@/components/ui/Modal';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'finished' | 'raw'>('all');
  const { useList, deleteProduct } = useProducts({ search });
  const { data, isLoading, isError } = useList();
  const { user } = useAuth();
  const userRole = user?.role || 'sales';

  const { create, isCreating } = usePurchase();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);

  const handleOrderRawMaterial = (product: any) => {
    setSelectedProduct(product);
    const free = Number(product.onHandQuantity) - Number(product.reservedQuantity);
    const min = Number(product.minStockLevel);
    const recommended = min > free ? min - free : 1;
    setOrderQuantity(recommended <= 0 ? 1 : recommended);
    setIsOrderModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
  };

  const products = data?.products || [];
  
  // Filter out raw materials for sales role
  const visibleProducts = userRole === 'sales'
    ? products.filter(p => p.procurementType === 'manufacture')
    : products;
  
  // Calculate summary counts from visible products list
  const totalProductsCount = visibleProducts.length;
  const rawMaterialsCount = visibleProducts.filter(p => p.procurementType === 'purchase').length;
  const finishedGoodsCount = visibleProducts.filter(p => p.procurementType === 'manufacture').length;
  const lowStockCount = visibleProducts.filter(p => {
    const free = Number(p.onHandQuantity) - Number(p.reservedQuantity);
    return free <= Number(p.minStockLevel);
  }).length;
  const totalInventoryVal = visibleProducts.reduce((acc, p) => acc + (Number(p.onHandQuantity) * Number(p.costPrice)), 0);

  // Apply tab filter on client side
  const filteredProducts = visibleProducts.filter(p => {
    if (filterTab === 'finished') return p.procurementType === 'manufacture';
    if (filterTab === 'raw') return p.procurementType === 'purchase';
    return true;
  });

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="page-title">Products Master</h1>
          <p className="page-subtitle">Configure finished assemblies, raw materials, and costing standard metrics</p>
        </div>
        <div className="flex gap-2">
          <Link href="/products/new" className="btn-primary text-xs flex items-center gap-1.5 bg-[#4B164C] hover:bg-[#381039]">
            <Plus size={16} />
            <span>Create Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Header */}
      {isLoading ? (
        <div className={`grid grid-cols-2 ${userRole === 'sales' ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-4`}>
          {[...Array(userRole === 'sales' ? 4 : 5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className={`grid grid-cols-2 ${userRole === 'sales' ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-4`}>
          <div className="bg-white border border-surface-border rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Catalog Products</p>
            <p className="text-xl font-bold text-text-primary mt-1">{totalProductsCount}</p>
          </div>
          <div className="bg-white border border-surface-border rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Finished Goods</p>
            <p className="text-xl font-bold text-[#4B164C] mt-1">{finishedGoodsCount}</p>
          </div>
          {userRole !== 'sales' && (
            <div className="bg-white border border-surface-border rounded-xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Raw Materials</p>
              <p className="text-xl font-bold text-blue-600 mt-1">{rawMaterialsCount}</p>
            </div>
          )}
          <div className="bg-white border border-surface-border rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Low Stock Items</p>
            <p className={`text-xl font-bold mt-1 ${lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{lowStockCount}</p>
          </div>
          <div className="bg-white border border-surface-border rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Stock Valuation</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">₹{Number(totalInventoryVal).toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}

      {/* Main Grid Card */}
      <div className="glass-card flex flex-col min-h-[500px]">
        {/* Toolbar & Filters */}
        <div className="p-4 border-b border-surface-border flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          {/* Tabs */}
          {userRole !== 'sales' ? (
            <div className="flex bg-slate-100 p-1 rounded-lg border border-surface-border text-xs shrink-0 self-stretch sm:self-start">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  filterTab === 'all' ? 'bg-white text-brand-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => setFilterTab('finished')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  filterTab === 'finished' ? 'bg-white text-brand-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Finished Assemblies
              </button>
              <button
                onClick={() => setFilterTab('raw')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  filterTab === 'raw' ? 'bg-white text-brand-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Raw Materials
              </button>
            </div>
          ) : (
            <div className="text-xs font-bold text-brand-primary uppercase tracking-wider pl-2">
              Finished Assemblies Catalog
            </div>
          )}

          <div className="flex gap-3 w-full md:w-auto items-center">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
              <input
                type="text"
                placeholder="Search SKU or Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 h-9 text-xs focus:bg-white"
              />
            </div>

            {/* Export */}
            <button className="btn-secondary h-9 py-1 px-3 text-xs flex items-center gap-1.5 hover:bg-slate-50 shadow-none shrink-0 border border-surface-border">
              <FileDown size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-rose-500 font-medium">Failed to load products.</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12">
              <EmptyState
                title="No Products Found"
                description="Configure raw materials (wooden legs, table tops, screws) and finished assemblies (wooden dining tables) to build inventory."
                icon={Package}
                action={
                  <Link href="/products/new" className="btn-primary text-xs bg-[#4B164C] hover:bg-[#381039]">
                    <Plus size={14} /> Create First Product
                  </Link>
                }
              />
            </div>
          ) : (
            <ProductsTable
              products={filteredProducts}
              onDelete={handleDelete}
              onOrderRawMaterial={handleOrderRawMaterial}
            />
          )}
        </div>
      </div>

      {/* Manual Procurement Order Modal */}
      {selectedProduct && (
        <Modal
          isOpen={isOrderModalOpen}
          onClose={() => {
            setIsOrderModalOpen(false);
            setSelectedProduct(null);
          }}
          title="Raise Procurement Request"
        >
          <div className="space-y-4 text-text-primary text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-surface-border space-y-1">
              <p className="font-semibold text-brand-primary">{selectedProduct.name}</p>
              <p className="text-[10px] text-text-muted">SKU: {selectedProduct.sku}</p>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-text-muted">Available Free:</span>{' '}
                  <span className="font-bold text-slate-800">
                    {Number(selectedProduct.onHandQuantity) - Number(selectedProduct.reservedQuantity)}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted">Min Stock Level:</span>{' '}
                  <span className="font-bold text-slate-800">{Number(selectedProduct.minStockLevel)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary">
                Order Quantity ({selectedProduct.unitOfMeasure || 'pcs'})
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(Number(e.target.value))}
                className="input-field w-full text-xs"
                placeholder="Enter quantity to purchase"
              />
              <p className="text-[10px] text-text-muted">
                Recommended minimum: {Math.max(1, Number(selectedProduct.minStockLevel) - (Number(selectedProduct.onHandQuantity) - Number(selectedProduct.reservedQuantity)))}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-surface-border mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsOrderModalOpen(false);
                  setSelectedProduct(null);
                }}
                disabled={isCreating}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (orderQuantity <= 0) return;
                  try {
                    await create({
                      productId: selectedProduct.id,
                      quantity: orderQuantity,
                    });
                    setIsOrderModalOpen(false);
                    setSelectedProduct(null);
                  } catch (err) {
                    // Toast error is handled in usePurchase hook
                  }
                }}
                disabled={isCreating || orderQuantity <= 0}
                className="btn-primary bg-brand-primary hover:bg-brand-hover text-white flex items-center justify-center gap-1.5"
              >
                {isCreating ? 'Creating...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
