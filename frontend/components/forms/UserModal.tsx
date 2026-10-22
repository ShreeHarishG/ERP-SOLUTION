'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ApiUser, CreateUserPayload, UpdateUserPayload } from '@/services/users.api';
import { X, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  role: z.enum(['admin', 'product_manager', 'sales', 'purchase', 'inventory']),
  isActive: z.boolean(),
}).refine((data) => {
  // If editing, password can be empty. If creating, it's required.
  // We'll pass a prop `isEditing` to the component to handle this properly, 
  // but for Zod, we'll just check if password is provided when creating (handled in component logic).
  return true; 
});

type UserFormData = z.infer<typeof userSchema>;

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  user: ApiUser | null;
  isSubmitting: boolean;
}

export default function UserModal({ isOpen, onClose, onSubmit, user, isSubmitting }: UserModalProps) {
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'sales',
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          name: user.name,
          email: user.email,
          password: '',
          role: user.role as any,
          isActive: user.isActive,
        });
      } else {
        reset({
          name: '',
          email: '',
          password: '',
          role: 'sales',
          isActive: true,
        });
      }
    }
  }, [isOpen, user, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: UserFormData) => {
    if (!isEditing && !data.password) {
      // Need password for creation
      return; 
    }
    
    const payload: any = { ...data };
    if (isEditing && !payload.password) {
      delete payload.password;
    }
    
    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-md shadow-card-hover overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border bg-surface-card/50">
          <h2 className="text-xl font-bold text-slate-100">
            {isEditing ? 'Edit User' : 'Add New User'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Full Name</label>
            <input
              {...register('name')}
              className={`input-field ${errors.name ? 'border-rose-500/50' : ''}`}
              placeholder="John Doe"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Email Address</label>
            <input
              {...register('email')}
              type="email"
              className={`input-field ${errors.email ? 'border-rose-500/50' : ''}`}
              placeholder="john@example.com"
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Password {isEditing && <span className="text-slate-500 font-normal">(Leave empty to keep current)</span>}
            </label>
            <input
              {...register('password')}
              type="password"
              className={`input-field ${errors.password ? 'border-rose-500/50' : ''}`}
              placeholder="••••••••"
              disabled={isSubmitting}
              required={!isEditing}
            />
            {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Role</label>
            <select
              {...register('role')}
              className="input-field appearance-none"
              disabled={isSubmitting}
            >
              <option value="admin">Admin</option>
              <option value="product_manager">Product Manager</option>
              <option value="sales">Sales</option>
              <option value="purchase">Purchase</option>
              <option value="inventory">Inventory</option>
            </select>
          </div>

          <div className="flex items-center mt-2">
            <input
              {...register('isActive')}
              id="isActive"
              type="checkbox"
              className="w-4 h-4 rounded border-surface-border bg-surface-input text-brand focus:ring-brand"
              disabled={isSubmitting}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-slate-300 cursor-pointer">
              Active Account
            </label>
          </div>

          {/* Footer */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-surface-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
