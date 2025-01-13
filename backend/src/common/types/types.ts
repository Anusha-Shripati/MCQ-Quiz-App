import Joi from "joi";

export type TRequestPart = "body" | "params" | "query";

export type IValidatedSchema = {
  [P in TRequestPart]: any;
};

export interface IValidationSchema {
  body?: Joi.Schema;
  params?: Joi.Schema;
  query?: Joi.Schema;
}

export interface IPagination {
  page: number;
  limit: number;
  offset: number;
}
