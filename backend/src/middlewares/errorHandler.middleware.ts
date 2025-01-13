import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";
import { AppError } from "../common/errors/AppError";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  logger.error(err);
  if (err instanceof AppError) {
    res.status(err.status).json({
      success: false,
      status: err.status,
      message: err.message || "Something went wrong!",
      isOperation: err.isOperational,
    });
  } else if (
    err instanceof PrismaClientKnownRequestError &&
    err.code === "P2025"
  ) {
    res.status(404).json({
      success: false,
      status: 404,
      message: "Parent not found!",
      isOperation: true,
    });
  } else {
    res.status(500).json({
      success: false,
      status: 500,
      message: "Something went wrong!",
      isOperation: false,
    });
  }
};