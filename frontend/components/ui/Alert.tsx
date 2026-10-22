import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ children, variant = 'info', className = '' }) => {
  const styles = {
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  };

  const Icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    danger: XCircle,
  };

  const Icon = Icons[variant];

  return (
    <div className={`p-4 rounded-xl flex items-start gap-3 ${styles[variant]} ${className}`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="text-sm font-medium leading-relaxed">{children}</div>
    </div>
  );
};

export default Alert;
