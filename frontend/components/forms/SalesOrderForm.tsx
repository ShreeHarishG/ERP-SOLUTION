'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { createSalesOrderSchema, CreateSalesOrderInput } from '@/lib/server/modules/sales/sales.validation';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function SalesOrderForm() {
  const router = useRouter();
  const { create, isCreating } = useSales();

  // Load products list for dropdown
  const { useList: useProductsList } = useProducts({ limit: 100 });
  const { data: productsData, isLoading: loadingProducts } = useProductsList();

  const finishedGoods = productsData?.products.filter(p => p.procurementType === 'manufacture') || [];

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateSalesOrderInput>({
    resolver: zodResolver(createSalesOrderSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      notes: '',
      items: [{ productId: '', quantityOrdered: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const handleProductChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodId = e.target.value;
    const prod = finishedGoods.find(p => p.id === prodId);
    if (prod) {
      setValue(`items.${index}.unitPrice`, Number(prod.salesPrice));
    }
  };

  const watchItems = watch('items');
  const totalAmount = watchItems?.reduce((sum, item) => sum + (Number(item.quantityOrdered || 0) * Number(item.unitPrice || 0)), 0) || 0;

  const onSubmit = async (data: CreateSalesOrderInput) => {
    try {
      await create(data);
      router.push('/sales');
    } catch {
      // hook handles toast
    }
  };

  if (loadingProducts) {
    return <div className="p-8 text-center text-text-secondary">Loading product catalog...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl bg-surface-card/30 border border-surface-border rounded-2xl p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Input
            {...register('customerName')}
            label="Customer Name"
            placeholder="John Doe"
            error={errors.customerName?.message}
            disabled={isCreating}
          />
        </div>
        <div>
          <Input
            {...register('customerEmail')}
            type="email"
            label="Customer Email"
            placeholder="john@example.com"
            error={errors.customerEmail?.message}
            disabled={isCreating}
          />
        </div>
        <div>
          <Input
            {...register('customerPhone')}
            label="Customer Phone"
            placeholder="+91 XXXXX XXXXX"
            error={errors.customerPhone?.message}
            disabled={isCreating}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-secondary">Notes</label>
        <textarea
          {...register('notes')}
          rows={2}
          className="input-field py-2 bg-white text-brand-primary placeholder-text-muted focus:outline-none border border-surface-border rounded-xl px-4"
          placeholder="Shipping address, delivery instructions..."
          disabled={isCreating}
        />
      </div>

      <div className="border-t border-surface-border pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-brand-primary">Order Line Items</h3>
          <Button
            type="button"
            variant="secondary"
            className="h-9 px-3 py-1.5 text-xs rounded-lg"
            onClick={() => append({ productId: '', quantityOrdered: 1, unitPrice: 0 })}
            disabled={isCreating}
          >
            <Plus size={14} /> Add Line Item
          </Button>
        </div>

        {errors.items?.root && (
          <p className="text-rose-400 text-xs">{errors.items.root.message}</p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-surface-card/10 p-3 rounded-xl border border-surface-border/50">
              <div className="md:col-span-5">
                <Select
                  {...register(`items.${index}.productId`)}
                  label={index === 0 ? "Finished Product" : undefined}
                  options={[
                    { value: '', label: 'Select Finished Good...' },
                    ...finishedGoods.map(p => ({ value: p.id, label: `${p.name} (${p.sku}) [Price: INR ${p.salesPrice}]` })),
                  ]}
                  onChange={(e) => handleProductChange(index, e)}
                  error={errors.items?.[index]?.productId?.message}
                  disabled={isCreating}
                />
              </div>
              <div className="md:col-span-3">
                <Input
                  {...register(`items.${index}.quantityOrdered`, { valueAsNumber: true })}
                  type="number"
                  label={index === 0 ? "Quantity" : undefined}
                  error={errors.items?.[index]?.quantityOrdered?.message}
                  disabled={isCreating}
                />
              </div>
              <div className="md:col-span-3">
                <Input
                  {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  label={index === 0 ? "Unit Price (INR)" : undefined}
                  error={errors.items?.[index]?.unitPrice?.message}
                  disabled={isCreating}
                />
              </div>
              <div className="md:col-span-1 text-right">
                <Button
                  type="button"
                  variant="danger"
                  className="p-3 w-10 h-10 rounded-xl"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1 || isCreating}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-surface-border pt-6 mt-6">
        <div>
          <span className="text-sm font-semibold text-text-secondary">Grand Total:</span>
          <span className="ml-2 text-xl font-bold text-brand-primary">INR {totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/sales')}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isCreating}
          >
            Create Sales Order
          </Button>
        </div>
      </div>
    </form>
  );
}
