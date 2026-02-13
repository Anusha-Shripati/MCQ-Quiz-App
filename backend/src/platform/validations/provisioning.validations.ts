import Joi from 'joi';

export const provisioningValidations = {
  provision: Joi.object({
    name: Joi.string().required().min(2).max(100),
    slug: Joi.string()
      .required()
      .pattern(/^[a-z0-9-]+$/)
      .min(2)
      .max(50)
      .messages({
        'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens',
      }),
    plan_id: Joi.string().uuid().required(),
    admin_email: Joi.string().email().required(),
    admin_name: Joi.string().required().min(2).max(100),
    admin_password: Joi.string().required().min(8),
  }),
};
