import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', variant = 'primary', isLoading, disabled, ...props }, ref) => {
    let variantClass = 'btn-primary';
    if (variant === 'secondary') {
      variantClass = 'inline-flex items-center justify-center gap-2 bg-surface-hover hover:bg-surface-border text-brand-primary border border-surface-border font-semibold rounded-xl px-5 py-3 transition-all duration-200 disabled:opacity-50';
    } else if (variant === 'danger') {
      variantClass = 'btn-danger';
    } else if (variant === 'ghost') {
      variantClass = 'btn-ghost';
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${variantClass} ${className} flex items-center justify-center gap-2`}
        {...props}
      >
        {isLoading && <Loader2 className="animate-spin shrink-0" size={18} />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
export default Button;
