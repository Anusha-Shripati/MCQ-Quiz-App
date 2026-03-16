import Joi from 'joi';

export const tenantSchema = {
  create: {
    body: Joi.object({
      name: Joi.string().required().messages({
        'string.empty': 'Tenant name is required',
      }),
      slug: Joi.string()
        .lowercase()
        .pattern(/^[a-z0-9-]+$/)
        .required()
        .messages({
          'string.empty': 'Slug is required',
          'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens',
        }),
      plan_id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid plan ID format',
      }),
      db_name: Joi.string().required().messages({
        'string.empty': 'Database name is required',
      }),
      db_url: Joi.string().required().messages({
        'string.empty': 'Database URL is required',
      }),
      admin_email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.email': 'Invalid email format',
        'string.empty': 'Admin email is required',
      }),
      admin_name: Joi.string().required().messages({
        'string.empty': 'Admin name is required',
      }),
      status: Joi.string().valid('active', 'suspended', 'trial', 'expired', 'cancelled').optional(),
      subscription_starts_at: Joi.date().optional(),
      subscription_ends_at: Joi.date().optional(),
    }),
  },

  update: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid tenant ID format',
      }),
    }),
    body: Joi.object({
      name: Joi.string().optional(),
      slug: Joi.string()
        .lowercase()
        .pattern(/^[a-z0-9-]+$/)
        .optional()
        .messages({
          'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens',
        }),
      plan_id: Joi.string().uuid().optional(),
      admin_email: Joi.string().email({ tlds: { allow: false } }).optional(),
      admin_name: Joi.string().optional(),
    }),
  },

  getById: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid tenant ID format',
      }),
    }),
  },

  delete: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid tenant ID format',
      }),
    }),
  },

  updateStatus: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid tenant ID format',
      }),
    }),
    body: Joi.object({
      status: Joi.string()
        .valid('active', 'suspended', 'trial', 'expired', 'cancelled')
        .required()
        .messages({
          'any.only': 'Status must be one of: active, suspended, trial, expired, cancelled',
        }),
    }),
  },

  updateSubscription: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid tenant ID format',
      }),
    }),
    body: Joi.object({
      subscription_ends_at: Joi.date().required().messages({
        'date.base': 'subscription_ends_at must be a valid date',
        'any.required': 'subscription_ends_at is required',
      }),
    }),
  },

  getUsage: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid tenant ID format',
      }),
    }),
  },

  validatePlanChange: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid tenant ID format',
      }),
    }),
    body: Joi.object({
      new_plan_id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid plan ID format',
        'any.required': 'new_plan_id is required',
      }),
    }),
  },

  applyPlanChange: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid tenant ID format',
      }),
    }),
    body: Joi.object({
      new_plan_id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid plan ID format',
        'any.required': 'new_plan_id is required',
      }),
    }),
  },
};
