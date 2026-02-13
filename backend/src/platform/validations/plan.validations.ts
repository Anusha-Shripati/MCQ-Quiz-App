import Joi from 'joi';

export const planSchema = {
  create: {
    body: Joi.object({
      name: Joi.string().required().messages({
        'string.empty': 'Plan name is required',
      }),
      description: Joi.string().optional().allow(''),
      price: Joi.number().min(0).required().messages({
        'number.base': 'Price must be a number',
        'number.min': 'Price cannot be negative',
      }),
      limits: Joi.object({
        candidates: Joi.number().integer().required(),
        assessments: Joi.number().integer().required(),
        questions: Joi.number().integer().required(),
        storage_mb: Joi.number().integer().required(),
        api_calls: Joi.number().integer().required(),
      }).required(),
      features: Joi.object({
        custom_branding: Joi.boolean().required(),
        api_access: Joi.boolean().required(),
        priority_support: Joi.boolean().required(),
        advanced_analytics: Joi.boolean().optional(),
      }).required(),
    }),
  },

  update: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid plan ID format',
      }),
    }),
    body: Joi.object({
      name: Joi.string().optional(),
      description: Joi.string().optional().allow(''),
      price: Joi.number().min(0).optional(),
      limits: Joi.object({
        candidates: Joi.number().integer().optional(),
        assessments: Joi.number().integer().optional(),
        questions: Joi.number().integer().optional(),
        storage_mb: Joi.number().integer().optional(),
        api_calls: Joi.number().integer().optional(),
      }).optional(),
      features: Joi.object({
        custom_branding: Joi.boolean().optional(),
        api_access: Joi.boolean().optional(),
        priority_support: Joi.boolean().optional(),
        advanced_analytics: Joi.boolean().optional(),
      }).optional(),
    }),
  },

  getById: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid plan ID format',
      }),
    }),
  },

  delete: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid plan ID format',
      }),
    }),
  },

  toggle: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid plan ID format',
      }),
    }),
  },

  getTenants: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid plan ID format',
      }),
    }),
  },
};
