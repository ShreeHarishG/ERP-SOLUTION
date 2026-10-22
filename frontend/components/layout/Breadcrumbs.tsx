'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1 text-xs text-text-muted mb-3">
      <Link href="/dashboard" className="hover:text-brand-highlight transition-colors">
        Home
      </Link>
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1">
          <ChevronRight size={12} className="text-text-muted/60" />
          {item.href ? (
            <Link href={item.href} className="hover:text-brand-highlight transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-text-secondary font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
