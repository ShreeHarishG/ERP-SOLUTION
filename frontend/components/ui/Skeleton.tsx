import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const variantClass = {
    text: 'h-4 w-full rounded',
    rect: 'rounded-xl',
    circle: 'rounded-full',
  }[variant];

  return (
    <div
      className={`animate-pulse bg-slate-200/80 ${variantClass} ${className}`}
      style={{
        animationDuration: '1.5s',
      }}
    />
  );
};

export default Skeleton;
