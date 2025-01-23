import { Response } from "express";

export const generateResponse = (
  res: Response,
  status: number,
  data: any,
  success: boolean = true,
  message: string = "success"
) => {
  return res.status(status).json({
    success: success,
    status,
    message,
    data,
  });
};
