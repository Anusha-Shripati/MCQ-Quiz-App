import Joi from 'joi';

export const usageValidations = {
  resetMetric: {
    params: Joi.object({
      tenantId: Joi.string().uuid().required(),
      metric: Joi.string()
        .valid('candidates', 'assessments', 'questions', 'storage_mb', 'api_calls')
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
        .valid('candidates', 'assessments', 'questions', 'storage_mb', 'api_calls')
        .required(),
    }),
  },
  syncUsage: {
    params: Joi.object({
      tenantId: Joi.string().uuid().required(),
    }),
  },
};
