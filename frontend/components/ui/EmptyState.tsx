import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon: Icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-card/30 border border-dashed border-surface-border rounded-2xl py-12">
      <div className="p-4 rounded-full bg-brand-highlight/10 text-brand-primary mb-4">
        <Icon size={36} />
      </div>
      <h3 className="text-lg font-semibold text-brand-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;
