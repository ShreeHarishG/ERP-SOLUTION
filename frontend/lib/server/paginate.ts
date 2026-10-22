export type PageResult<T> = {
  items: T[];
  page: number;
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
};

export const FIRST_PAGE_SIZE = 5;
export const NEXT_PAGE_SIZE = 50;

export function parseListParams(url: URL, defaults = { limit: FIRST_PAGE_SIZE }) {
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || String(defaults.limit), 10)));
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const offsetParam = url.searchParams.get('offset');
  const offset = offsetParam !== null ? Math.max(0, parseInt(offsetParam, 10) || 0) : (page - 1) * limit;
  return { limit, page, offset };
}

export function toPageResult<T>(
  items: T[],
  total: number,
  params: { page: number; limit: number; offset: number },
): PageResult<T> {
  return {
    items,
    page: params.page,
    limit: params.limit,
    offset: params.offset,
    total,
    hasMore: params.offset + items.length < total,
  };
}
