'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProducts } from '@/hooks/useProducts';
import { useBom } from '@/hooks/useBom';
import { createBomSchema, CreateBomInput } from '@/lib/server/modules/boms/boms.validation';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

interface BomFormProps {
  bom?: any;
}

export default function BomForm({ bom }: BomFormProps) {
  const router = useRouter();
  const { create, update, isCreating, isUpdating } = useBom();
  const isEditing = !!bom;
  
  // Load products list for dropdowns
  const { useList: useProductsList } = useProducts({ limit: 100 });
  const { data: productsData, isLoading: loadingProducts } = useProductsList();

  const finishedGoods = productsData?.products.filter(p => p.procurementType === 'manufacture') || [];
  const rawMaterials = productsData?.products.filter(p => p.procurementType === 'purchase') || [];

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateBomInput>({
    resolver: zodResolver(createBomSchema),
    defaultValues: {
      productId: '',
      name: '',
      quantity: 1,
      notes: '',
      isActive: true,
      items: [{ componentId: '', quantity: 1, unitOfMeasure: 'pcs', notes: '' }],
    },
  });

  useEffect(() => {
    if (bom) {
      reset({
        productId: bom.productId,
        name: bom.name,
        quantity: Number(bom.quantity),
        notes: bom.notes || '',
        isActive: bom.isActive,
        items: bom.items.map((item: any) => ({
          componentId: item.componentId,
          quantity: Number(item.quantity),
          unitOfMeasure: item.unitOfMeasure,
          notes: item.notes || '',
        })),
      });
    }
  }, [bom, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedProduct = finishedGoods.find(p => p.id === selectedId);
    if (selectedProduct) {
      setValue('name', `${selectedProduct.name} - Standard BoM`);
    }
  };

  const handleComponentChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    const compId = e.target.value;
    const comp = rawMaterials.find(p => p.id === compId);
    if (comp) {
      setValue(`items.${index}.unitOfMeasure`, comp.unitOfMeasure);
    }
  };

  const onSubmit = async (data: CreateBomInput) => {
    try {
      if (isEditing) {
        await update({ id: bom.id, payload: data });
      } else {
        await create(data);
      }
      router.push('/bom');
    } catch {
      // hook handles toast
    }
  };

  if (loadingProducts) {
    return <div className="p-8 text-center text-text-secondary">Loading product catalog...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl bg-surface-card/30 border border-surface-border rounded-2xl p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          {...register('productId')}
          label="Finished Good (Product to Produce)"
          options={[
            { value: '', label: 'Select Finished Good...' },
            ...finishedGoods.map(p => ({ value: p.id, label: `${p.name} (${p.sku})` })),
          ]}
          onChange={handleProductChange}
          error={errors.productId?.message}
          disabled={isCreating || isUpdating || isEditing}
        />
        <Input
          {...register('name')}
          label="Recipe Name"
          placeholder="e.g. Standard Wooden Dining Table BoM"
          error={errors.name?.message}
          disabled={isCreating || isUpdating}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          {...register('quantity', { valueAsNumber: true })}
          type="number"
          label="Yield Quantity (Output Yield)"
          error={errors.quantity?.message}
          disabled={isCreating || isUpdating}
        />
        <Input
          {...register('notes')}
          label="Notes"
          placeholder="e.g. Assembly instructions..."
          error={errors.notes?.message}
          disabled={isCreating || isUpdating}
        />
      </div>

      <div className="border-t border-surface-border pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-brand-primary">Components & Ingredients</h3>
          <Button
            type="button"
            variant="secondary"
            className="h-9 px-3 py-1.5 text-xs rounded-lg"
            onClick={() => append({ componentId: '', quantity: 1, unitOfMeasure: 'pcs', notes: '' })}
            disabled={isCreating || isUpdating}
          >
            <Plus size={14} /> Add Component
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
                  {...register(`items.${index}.componentId`)}
                  label={index === 0 ? "Raw Material Component" : undefined}
                  options={[
                    { value: '', label: 'Select Component...' },
                    ...rawMaterials.map(p => ({ value: p.id, label: `${p.name} (${p.sku}) [Free: ${Number(p.onHandQuantity) - Number(p.reservedQuantity)} ${p.unitOfMeasure}]` })),
                  ]}
                  onChange={(e) => handleComponentChange(index, e)}
                  error={errors.items?.[index]?.componentId?.message}
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  type="number"
                  step="any"
                  label={index === 0 ? "Quantity" : undefined}
                  error={errors.items?.[index]?.quantity?.message}
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  {...register(`items.${index}.unitOfMeasure`)}
                  label={index === 0 ? "UOM" : undefined}
                  error={errors.items?.[index]?.unitOfMeasure?.message}
                  disabled={isCreating || isUpdating}
                  readOnly
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  {...register(`items.${index}.notes`)}
                  label={index === 0 ? "Notes" : undefined}
                  placeholder="Notes..."
                  error={errors.items?.[index]?.notes?.message}
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="md:col-span-1 text-right">
                <Button
                  type="button"
                  variant="danger"
                  className="p-3 w-10 h-10 rounded-xl"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1 || isCreating || isUpdating}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 justify-end border-t border-surface-border pt-6 mt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/bom')}
          disabled={isCreating || isUpdating}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isCreating || isUpdating}
        >
          {isEditing ? 'Save Changes' : 'Save BOM Recipe'}
        </Button>
      </div>
    </form>
  );
}
