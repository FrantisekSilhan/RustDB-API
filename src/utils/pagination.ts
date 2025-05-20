import type { Request } from "express";

export const getPaginationParams = (req: Request) => {
  const pageParam = Number(req.query.page);
  const limitParam = Number(req.query.limit);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const limit = isNaN(limitParam) || limitParam < 1 ? 20 : limitParam;

  return {
    page,
    limit,
  };
};