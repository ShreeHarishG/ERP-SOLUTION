'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { login, isLoggingIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email Field */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">Email Address</label>
        <div className="relative">
          <input
            {...register('email')}
            type="email"
            className={`input-field ${errors.email ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
            placeholder="admin@chainiq.com"
            autoComplete="email"
            disabled={isLoggingIn}
          />
        </div>
        {errors.email && (
          <p className="text-rose-400 text-xs mt-1 animate-slide-up">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-300">Password</label>
          <a href="#" className="text-xs text-brand hover:text-brand-hover transition-colors">Forgot password?</a>
        </div>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            className={`input-field pr-10 ${errors.password ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isLoggingIn}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-rose-400 text-xs mt-1 animate-slide-up">{errors.password.message}</p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center">
        <input
          {...register('rememberMe')}
          id="rememberMe"
          type="checkbox"
          className="w-4 h-4 rounded border-surface-border bg-surface-input text-brand focus:ring-brand focus:ring-offset-surface-card"
          disabled={isLoggingIn}
        />
        <label htmlFor="rememberMe" className="ml-2 block text-sm text-slate-400 cursor-pointer">
          Remember me for 7 days
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoggingIn}
        className="btn-primary w-full mt-2"
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Authenticating...
          </>
        ) : (
          <>
            <LogIn size={20} />
            Sign In
          </>
        )}
      </button>

      {/* Demo Sandbox Mode */}
      <div className="pt-5 border-t border-slate-100 mt-5">
        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          Reviewer Demo Quick-Access
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isLoggingIn}
            onClick={() => login({ email: 'admin@shivfurniture.com', password: 'Admin@123' })}
            className="flex flex-col items-start p-2.5 rounded-lg border border-purple-200 bg-purple-50/30 hover:bg-purple-50 text-left transition-all duration-150 disabled:opacity-50"
          >
            <span className="text-[10px] font-bold text-purple-700">Super Admin</span>
            <span className="text-[9px] text-slate-400 truncate w-full">admin@shivfurniture.com</span>
          </button>

          <button
            type="button"
            disabled={isLoggingIn}
            onClick={() => login({ email: 'priya@shivfurniture.com', password: 'Admin@123' })}
            className="flex flex-col items-start p-2.5 rounded-lg border border-pink-200 bg-pink-50/30 hover:bg-pink-50 text-left transition-all duration-150 disabled:opacity-50"
          >
            <span className="text-[10px] font-bold text-pink-700">Sales Executive</span>
            <span className="text-[9px] text-slate-400 truncate w-full">priya@shivfurniture.com</span>
          </button>

          <button
            type="button"
            disabled={isLoggingIn}
            onClick={() => login({ email: 'ravi@shivfurniture.com', password: 'Admin@123' })}
            className="flex flex-col items-start p-2.5 rounded-lg border border-[#4B164C]/20 bg-[#F8E7F6]/30 hover:bg-[#F8E7F6]/60 text-left transition-all duration-150 disabled:opacity-50"
          >
            <span className="text-[10px] font-bold text-[#4B164C]">Product Manager</span>
            <span className="text-[9px] text-slate-400 truncate w-full">ravi@shivfurniture.com</span>
          </button>

          <button
            type="button"
            disabled={isLoggingIn}
            onClick={() => login({ email: 'amit@shivfurniture.com', password: 'Admin@123' })}
            className="flex flex-col items-start p-2.5 rounded-lg border border-amber-200 bg-amber-50/30 hover:bg-amber-50 text-left transition-all duration-150 disabled:opacity-50"
          >
            <span className="text-[10px] font-bold text-amber-700">Procurement Manager</span>
            <span className="text-[9px] text-slate-400 truncate w-full">amit@shivfurniture.com</span>
          </button>

          <button
            type="button"
            disabled={isLoggingIn}
            onClick={() => login({ email: 'neha@shivfurniture.com', password: 'Admin@123' })}
            className="flex flex-col items-start p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-left transition-all duration-150 col-span-2 disabled:opacity-50"
          >
            <div className="flex justify-between w-full items-center">
              <span className="text-[10px] font-bold text-slate-700">Inventory Manager</span>
              <span className="text-[9px] text-slate-400">neha@shivfurniture.com</span>
            </div>
          </button>
        </div>
      </div>
    </form>
  );
}
