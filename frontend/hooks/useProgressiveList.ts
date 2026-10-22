'use client';

import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

export type ListPage<T> = {
  items: T[];
  page: number;
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
  summary?: Record<string, number>;
};

const FIRST = 5;
const REST = 50;

export function useProgressiveList<T>(options: {
  queryKey: unknown[];
  fetchPage: (params: { offset: number; limit: number; page: number }) => Promise<ListPage<T>>;
  enabled?: boolean;
  initialData?: any;
}) {
  const { queryKey, fetchPage, enabled = true, initialData } = options;

  const initialItems = useMemo(() => {
    if (!initialData) return null;
    return (
      initialData.items ||
      initialData.products ||
      initialData.orders ||
      initialData.balances ||
      initialData.boms ||
      []
    );
  }, [initialData]);

  const first = useQuery({
    queryKey: [...queryKey, 'first', FIRST],
    queryFn: () => fetchPage({ offset: 0, limit: FIRST, page: 1 }),
    enabled,
    initialData: initialItems
      ? {
          items: initialItems.slice(0, FIRST),
          page: 1,
          limit: FIRST,
          offset: 0,
          total: initialData.total ?? initialItems.length,
          hasMore: (initialData.total ?? initialItems.length) > FIRST,
          summary: initialData.summary,
        }
      : undefined,
  });

  const rest = useQuery({
    queryKey: [...queryKey, 'rest', REST],
    queryFn: () => fetchPage({ offset: FIRST, limit: REST, page: 2 }),
    enabled: enabled && Boolean(first.data?.hasMore) && first.isSuccess,
    initialData:
      initialItems && initialItems.length > FIRST
        ? {
            items: initialItems.slice(FIRST, FIRST + REST),
            page: 2,
            limit: REST,
            offset: FIRST,
            total: initialData.total ?? initialItems.length,
            hasMore: (initialData.total ?? initialItems.length) > FIRST + REST,
            summary: initialData.summary,
          }
        : undefined,
  });

  useEffect(() => {
    if (first.data?.hasMore && first.isSuccess && !rest.data && !rest.isFetching) {
      void rest.refetch();
    }
  }, [first.data?.hasMore, first.isSuccess, rest]);

  const items = useMemo(() => {
    const head = first.data?.items ?? [];
    const tail = rest.data?.items ?? [];
    if (tail.length === 0) return head;
    const seen = new Set(head.map((item) => (item as { id?: string }).id));
    return [...head, ...tail.filter((item) => !seen.has((item as { id?: string }).id))];
  }, [first.data?.items, rest.data?.items]);

  return {
    data: items,
    isLoading: first.isLoading,
    isError: first.isError || rest.isError,
    isFetchingMore: rest.isFetching,
    hasMore: Boolean(rest.data ? rest.data.hasMore : first.data?.hasMore),
    total: rest.data?.total ?? first.data?.total ?? items.length,
    summary: first.data?.summary ?? initialData?.summary,
  };
}
