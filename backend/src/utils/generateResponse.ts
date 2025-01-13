import { Response } from "express";

export const generateResponse = (
  res: Response,
  status: number,
  data: any,
  message: string = "success"
) => {
  return res.status(status).json({
    success: true,
    status,
    message,
    data
  });
};
