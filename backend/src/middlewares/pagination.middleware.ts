import { Request, Response, NextFunction } from "express";

const paginationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const page = parseInt(req.query.page as string) || 1; // Default to page 1
  const limit = parseInt(req.query.limit as string) || 20; // Default to 20 items per page

  // Ensure limit is capped to a maximum value (e.g., 100)
  const maxLimit = 100;
  const safeLimit = limit > maxLimit ? maxLimit : limit;

  // Calculate the offset for the query (skip items for pagination)
  const offset = (page - 1) * safeLimit;

  // Attach pagination info to the request object
  req.pagination = {
    page,
    limit: safeLimit,
    offset,
  };

  next();
};

export default paginationMiddleware;
