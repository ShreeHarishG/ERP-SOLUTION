import React from 'react';

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'warning' | 'danger' | 'info';
}

interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  const statusColors = {
    success: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
    warning: 'border-amber-500 bg-amber-500/10 text-amber-400',
    danger: 'border-rose-500 bg-rose-500/10 text-rose-400',
    info: 'border-blue-500 bg-blue-500/10 text-blue-400',
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:inset-y-0 before:left-2.5 before:w-0.5 before:bg-surface-border">
      {items.map((item) => (
        <div key={item.id} className="relative group">
          {/* Indicator Dot */}
          <div
            className={`absolute -left-[1.55rem] w-4.5 h-4.5 rounded-full border-2 bg-surface-card flex items-center justify-center transition-transform group-hover:scale-115 ${
              item.status ? statusColors[item.status] : 'border-surface-border bg-surface-card'
            }`}
          />
          {/* Content Card */}
          <div className="p-4 rounded-xl bg-surface-input border border-surface-border group-hover:border-brand-primary/30 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-brand-primary">{item.title}</span>
              <span className="text-xs text-text-muted">{item.time}</span>
            </div>
            <p className="text-xs text-text-secondary">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
