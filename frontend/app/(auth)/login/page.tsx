import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import AuthLayout from '@/components/auth/AuthLayout';

export const metadata: Metadata = {
  title: 'Login | Shiv Furniture Works ERP',
  description: 'Log in to Shiv Furniture Works Enterprise Resource Planning System',
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="text-left mb-5">
        <h1 className="text-2xl font-extrabold text-[#4B164C] tracking-tight">Sign In</h1>
        <p className="text-text-secondary text-xs font-semibold mt-1">Enter your credentials to access the manufacturing engine.</p>
      </div>
      <LoginForm />
    </AuthLayout>
  );
}
