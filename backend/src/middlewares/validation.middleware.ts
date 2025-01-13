import { Request, Response, NextFunction } from "express";
import Joi from "joi";

import { AppError } from "../common/errors/AppError";
import { IValidatedSchema, IValidationSchema, TRequestPart } from "../common/types/types";

export const validateRequest = (schema: IValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];
    const validatedData: IValidatedSchema = {
      body: {},
      params: {},
      query: {}
    };

    Object.entries(schema).forEach(([part, partSchema]) => {
      const data = req[part as TRequestPart];
      const { error, value } = partSchema.validate(data, {
        abortEarly: false
      });

      if (error) {
        error.details.forEach((detail: Joi.ValidationErrorItem) => {
          errors.push(detail.message);
        });
      } else {
        validatedData[part as keyof IValidatedSchema] = value;
      }
    });

    if (errors.length > 0) {
      const message = `Validation error: ${errors.join(", ")}`;
      return next(new AppError(message, 400));
    } else {
      req.validatedData = validatedData;
    }
    next();
  };
};
