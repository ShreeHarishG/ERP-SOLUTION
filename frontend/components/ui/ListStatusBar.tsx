import { Loader2 } from 'lucide-react';

export function ListStatusBar({
  shown,
  total,
  isFetchingMore,
}: {
  shown: number;
  total?: number;
  isFetchingMore?: boolean;
}) {
  if (!shown) return null;

  return (
    <div className="px-4 py-2 text-[11px] text-text-muted flex items-center gap-2 border-t border-surface-border">
      {isFetchingMore ? (
        <>
          <Loader2 size={12} className="animate-spin" />
          Showing first {shown} — loading the rest…
        </>
      ) : (
        <span>
          Showing {shown}
          {typeof total === 'number' ? ` of ${total}` : ''} records
        </span>
      )}
    </div>
  );
}
