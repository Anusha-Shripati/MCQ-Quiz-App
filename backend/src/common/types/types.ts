import Joi from 'joi';

export type TRequestPart = 'body' | 'params' | 'query';

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


export interface Result {
  percentage: number;
  candidate: Candidate;
  exam: Exam;
}

export interface Exam {
  start_time: string;
  assessment: Assessment;
}

export interface Candidate {
  name: string;
  email: string;
}

export interface Technology {
  technology: {
    name: string;
  };
}

export interface Assessment {
  name: string;
  technologies: Technology[];
}

