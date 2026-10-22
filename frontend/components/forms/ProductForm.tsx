'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProducts } from '@/hooks/useProducts';
import { createProductSchema, CreateProductInput } from '@/lib/server/modules/products/products.validation';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProductFormProps {
  product?: any;
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { create, update, isCreating, isUpdating } = useProducts();
  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      category: 'Furniture',
      unitOfMeasure: 'pcs',
      salesPrice: 0,
      costPrice: 0,
      onHandQuantity: 0,
      reservedQuantity: 0,
      minStockLevel: 0,
      reorderQuantity: 0,
      procurementType: 'purchase',
      procurementStrategy: 'mts',
      isActive: true,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        description: product.description || '',
        category: product.category || 'Furniture',
        unitOfMeasure: product.unitOfMeasure,
        salesPrice: Number(product.salesPrice),
        costPrice: Number(product.costPrice),
        onHandQuantity: Number(product.onHandQuantity),
        reservedQuantity: Number(product.reservedQuantity),
        minStockLevel: Number(product.minStockLevel),
        reorderQuantity: Number(product.reorderQuantity),
        procurementType: product.procurementType,
        procurementStrategy: product.procurementStrategy,
        isActive: product.isActive,
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: CreateProductInput) => {
    try {
      if (isEditing) {
        await update({ id: product.id, payload: data });
      } else {
        await create(data);
      }
      router.push('/products');
    } catch {
      // hook handles toast
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-surface-card/30 border border-surface-border rounded-2xl p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          {...register('name')}
          label="Product Name"
          placeholder="e.g. Wooden Dining Table"
          error={errors.name?.message}
          disabled={isCreating || isUpdating}
        />
        <Input
          {...register('sku')}
          label="SKU Code"
          placeholder="e.g. FG-WDT-001"
          error={errors.sku?.message}
          disabled={isCreating || isUpdating || isEditing}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-secondary">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="input-field py-2 bg-white text-brand-primary placeholder-text-muted focus:outline-none border border-surface-border rounded-xl px-4"
          placeholder="Detailed description of the product..."
          disabled={isCreating || isUpdating}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          {...register('category')}
          label="Category"
          placeholder="Furniture, Hardware, etc."
          error={errors.category?.message}
          disabled={isCreating || isUpdating}
        />
        <Input
          {...register('unitOfMeasure')}
          label="Unit of Measure"
          placeholder="pcs, box, ltr"
          error={errors.unitOfMeasure?.message}
          disabled={isCreating || isUpdating}
        />
        <Select
          {...register('procurementType')}
          label="Procurement Type"
          options={[
            { value: 'purchase', label: 'Purchase (Raw Material)' },
            { value: 'manufacture', label: 'Manufacture (Finished Good)' },
          ]}
          error={errors.procurementType?.message}
          disabled={isCreating || isUpdating}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          {...register('salesPrice', { valueAsNumber: true })}
          type="number"
          step="0.01"
          label="Selling Price (INR)"
          error={errors.salesPrice?.message}
          disabled={isCreating || isUpdating}
        />
        <Input
          {...register('costPrice', { valueAsNumber: true })}
          type="number"
          step="0.01"
          label="Cost Price (INR)"
          error={errors.costPrice?.message}
          disabled={isCreating || isUpdating}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          {...register('minStockLevel', { valueAsNumber: true })}
          type="number"
          label="Minimum Stock Level"
          error={errors.minStockLevel?.message}
          disabled={isCreating || isUpdating}
        />
        <Input
          {...register('reorderQuantity', { valueAsNumber: true })}
          type="number"
          label="Reorder Quantity"
          error={errors.reorderQuantity?.message}
          disabled={isCreating || isUpdating}
        />
        <Select
          {...register('procurementStrategy')}
          label="Procurement Strategy"
          options={[
            { value: 'mts', label: 'MTS (Make-to-Stock)' },
            { value: 'mto', label: 'MTO (Make-to-Order)' },
          ]}
          error={errors.procurementStrategy?.message}
          disabled={isCreating || isUpdating}
        />
      </div>

      {!isEditing && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-surface-border pt-4">
          <Input
            {...register('onHandQuantity', { valueAsNumber: true })}
            type="number"
            label="Initial On Hand Quantity"
            error={errors.onHandQuantity?.message}
            disabled={isCreating || isUpdating}
          />
          <Input
            {...register('reservedQuantity', { valueAsNumber: true })}
            type="number"
            label="Initial Reserved Quantity"
            error={errors.reservedQuantity?.message}
            disabled={isCreating || isUpdating}
          />
        </div>
      )}

      <div className="flex items-center gap-3 justify-end border-t border-surface-border pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/products')}
          disabled={isCreating || isUpdating}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isCreating || isUpdating}
        >
          {isEditing ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
