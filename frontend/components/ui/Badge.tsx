import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'red' | 'blue' | 'amber' | 'purple' | 'gray';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray', className = '' }) => {
  const variantMap = {
    green: 'badge-green',
    red: 'badge-red',
    blue: 'badge-blue',
    amber: 'badge-amber',
    purple: 'badge-purple',
    gray: 'badge-gray',
  };

  return (
    <span className={`badge ${variantMap[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
