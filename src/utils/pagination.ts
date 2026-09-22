export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export const getPagination = (
  page: number = 1,
  limit: number = 20,
  maxLimit: number = 100
): PaginationResult => {
  const sanitizedPage = Math.max(1, page);
  const sanitizedLimit = Math.min(Math.max(1, limit), maxLimit);
  const skip = (sanitizedPage - 1) * sanitizedLimit;

  return {
    skip,
    take: sanitizedLimit,
    page: sanitizedPage,
    limit: sanitizedLimit,
  };
};

export const getPaginationMeta = (
  page: number,
  limit: number,
  total: number
) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
