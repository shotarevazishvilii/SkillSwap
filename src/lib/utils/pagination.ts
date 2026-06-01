export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type PaginationMeta = {
  limit: number;
  offset: number;
  page: number;
  pageSize: number;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function getPagination({
  page = DEFAULT_PAGE,
  pageSize = DEFAULT_PAGE_SIZE,
}: PaginationParams) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, pageSize));

  return {
    limit: safePageSize,
    offset: (safePage - 1) * safePageSize,
    page: safePage,
    pageSize: safePageSize,
  } satisfies PaginationMeta;
}
