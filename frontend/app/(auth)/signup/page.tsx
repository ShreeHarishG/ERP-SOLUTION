'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  companyName: z.string().min(2, 'Company Name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(5, 'Phone Number is required'),
  country: z.string().min(1, 'Country is required'),
  language: z.string().min(1, 'Language is required'),
  companySize: z.string().min(1, 'Company size is required'),
  primaryInterest: z.string().min(1, 'Primary Interest is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { register: registerUser, isRegistering } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      companyName: '',
      email: '',
      phone: '+91 ',
      country: 'India',
      language: 'English',
      companySize: '1 - 5 employees',
      primaryInterest: 'Use it in my company',
      password: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    await registerUser(data);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header */}
      <div className="text-center mb-8 relative">
        <h1 className="text-6xl font-bold text-[#111827] mb-2 font-mono tracking-tighter" style={{ fontFamily: 'cursive' }}>
          Get Started
        </h1>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-48 h-2 bg-[#10b981] rounded-full rotate-2"></div>
        <p className="mt-6 text-lg font-medium text-slate-800">
          Free instant access. No credit card required.
        </p>
      </div>

      <div className="w-full max-w-3xl space-y-6">
        


        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" suppressHydrationWarning>
          
          <div className="bg-white rounded-lg shadow-sm">
            <input
              {...register('name')}
              className={`w-full px-4 py-4 text-slate-800 placeholder-slate-400 bg-transparent border-0 focus:ring-2 focus:ring-[#DD88CF] rounded-lg ${errors.name ? 'ring-2 ring-rose-500' : ''}`}
              placeholder="First and Last Name"
              disabled={isRegistering}
              suppressHydrationWarning
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <input
              {...register('companyName')}
              className={`w-full px-4 py-4 text-slate-800 placeholder-slate-400 bg-transparent border-0 focus:ring-2 focus:ring-[#DD88CF] rounded-lg ${errors.companyName ? 'ring-2 ring-rose-500' : ''}`}
              placeholder="Company Name"
              disabled={isRegistering}
              suppressHydrationWarning
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm">
              <input
                {...register('email')}
                type="email"
                className={`w-full px-4 py-4 text-slate-800 placeholder-slate-400 bg-transparent border-0 focus:ring-2 focus:ring-[#DD88CF] rounded-lg ${errors.email ? 'ring-2 ring-rose-500' : ''}`}
                placeholder="Email"
                disabled={isRegistering}
                suppressHydrationWarning
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-sm relative pt-6 pb-2 px-4">
              <label className="absolute top-2 left-4 text-xs text-slate-400">Phone Number</label>
              <input
                {...register('phone')}
                className={`w-full text-slate-800 bg-transparent border-0 p-0 focus:ring-0 ${errors.phone ? 'text-rose-500' : ''}`}
                placeholder="+91"
                disabled={isRegistering}
                suppressHydrationWarning
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm relative pt-6 pb-2 px-4">
              <label className="absolute top-2 left-4 text-xs text-slate-400">Country</label>
              <select {...register('country')} className="w-full text-slate-800 bg-transparent border-0 p-0 focus:ring-0 appearance-none cursor-pointer" disabled={isRegistering} suppressHydrationWarning>
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm relative pt-6 pb-2 px-4">
              <label className="absolute top-2 left-4 text-xs text-slate-400">Language</label>
              <select {...register('language')} className="w-full text-slate-800 bg-transparent border-0 p-0 focus:ring-0 appearance-none cursor-pointer" disabled={isRegistering} suppressHydrationWarning>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm relative pt-6 pb-2 px-4">
              <label className="absolute top-2 left-4 text-xs text-slate-400">Company size</label>
              <select {...register('companySize')} className="w-full text-slate-800 bg-transparent border-0 p-0 focus:ring-0 appearance-none cursor-pointer" disabled={isRegistering} suppressHydrationWarning>
                <option value="1 - 5 employees">1 - 5 employees</option>
                <option value="6 - 20 employees">6 - 20 employees</option>
                <option value="21 - 50 employees">21 - 50 employees</option>
                <option value="50+ employees">50+ employees</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm relative pt-6 pb-2 px-4">
              <label className="absolute top-2 left-4 text-xs text-slate-400">Primary Interest</label>
              <select {...register('primaryInterest')} className="w-full text-slate-800 bg-transparent border-0 p-0 focus:ring-0 appearance-none cursor-pointer" disabled={isRegistering} suppressHydrationWarning>
                <option value="Use it in my company">Use it in my company</option>
                <option value="Provide services to others">Provide services to others</option>
                <option value="I am a student">I am a student</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Password Field (Added because email sending isn't configured) */}
          <div className="bg-white rounded-lg shadow-sm relative pt-6 pb-2 px-4 mt-4 border border-brand-highlight/30">
            <label className="absolute top-2 left-4 text-xs text-[#DD88CF] font-bold">Create a Password</label>
            <input
              {...register('password')}
              type="password"
              className={`w-full text-slate-800 bg-transparent border-0 p-0 focus:ring-0 ${errors.password ? 'text-rose-500' : ''}`}
              placeholder="••••••••"
              disabled={isRegistering}
              suppressHydrationWarning
            />
          </div>

          {/* Errors Display */}
          {(Object.keys(errors).length > 0) && (
            <div className="text-center text-sm text-rose-500 py-2">
              Please correct the highlighted fields.
            </div>
          )}

          {/* Footer & Submit */}
          <div className="text-center mt-8">
            <p className="text-sm text-slate-600 mb-6">
              By clicking on <strong className="text-slate-800">Start Now</strong>, you accept our <a href="#" className="underline text-slate-600 hover:text-slate-800">Subscription Agreement</a> and <a href="#" className="underline text-slate-600 hover:text-slate-800">Privacy Policy</a>
            </p>

            <button
              type="submit"
              disabled={isRegistering}
              suppressHydrationWarning
              className="bg-[#4B164C] hover:bg-[#3A103B] text-white font-bold py-4 px-12 rounded shadow-md hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center justify-center min-w-[200px]"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Creating Account...
                </>
              ) : (
                'Start Now'
              )}
            </button>
            
            <p className="mt-4 text-sm text-slate-500">
              Already have an account? <Link href="/login" className="text-[#DD88CF] hover:text-[#C76FBA] font-medium">Log in</Link>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
