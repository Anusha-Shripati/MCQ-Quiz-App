import Joi from 'joi';

export const usageValidations = {
  resetMetric: {
    params: Joi.object({
      tenantId: Joi.string().uuid().required(),
      metric: Joi.string()
        .valid('candidates', 'assessments', 'questions')
        .required(),
    }),
  },
  getUsageStats: {
    params: Joi.object({
      tenantId: Joi.string().uuid().required(),
    }),
  },
  getMetricUsage: {
    params: Joi.object({
      tenantId: Joi.string().uuid().required(),
      metric: Joi.string()
        .valid('candidates', 'assessments', 'questions')
        .required(),
    }),
  },
  syncUsage: {
    params: Joi.object({
      tenantId: Joi.string().uuid().required(),
    }),
  },
};
