import React from 'react';
import { LucideIcon } from 'lucide-react';
import Card from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  bg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color = 'text-brand-primary', bg = 'bg-brand-highlight/10' }) => {
  return (
    <Card className="flex items-center hover:shadow-card-hover transition-all duration-300 group">
      <div className={`p-3 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={24} />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <h3 className="text-2xl font-bold text-brand-primary">{value}</h3>
      </div>
    </Card>
  );
};

export default StatCard;
