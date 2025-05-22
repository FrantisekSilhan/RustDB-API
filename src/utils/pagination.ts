import type { Request } from "express";

const MAX_LIMIT = 250;
const DEFAULT_LIMIT = 20;
const MIN_LIMIT = 1;
const DEFAULT_PAGE = 1;
const MIN_PAGE = 1;

export const getPaginationParams = (req: Request) => {
  const pageParam = Math.floor(Number(req.query.page));
  const limitParam = Math.floor(Number(req.query.limit));
  const page = isNaN(pageParam) || pageParam < MIN_PAGE
    ? DEFAULT_PAGE
    : pageParam > Number.MAX_SAFE_INTEGER
      ? Number.MAX_SAFE_INTEGER
      : pageParam;
  const limit = isNaN(limitParam) || limitParam < MIN_LIMIT
    ? DEFAULT_LIMIT
    : limitParam > MAX_LIMIT
      ? MAX_LIMIT
      : limitParam;

  return {
    page,
    limit,
  };
};