import type { PaginatedResponse } from '@gympal/shared';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

interface PaginationQuery {
  page?: number;
  limit?: number;
}

export function getPaginationParams(query?: PaginationQuery) {
  const page = query?.page ?? DEFAULT_PAGE;
  const limit = Math.min(query?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
  };
}
