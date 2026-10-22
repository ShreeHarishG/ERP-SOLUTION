import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, label, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={`input-field ${error ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-rose-400 text-xs mt-1 animate-slide-up">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
export default Input;
