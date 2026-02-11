import Joi from 'joi';

export const roleSchema = {
  create: {
    body: Joi.object({
      name: Joi.string().required().messages({
        'string.empty': 'Role name is required',
      }),
      role_permissions: Joi.array(),
    }),
  },

  update: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.empty': 'Role Id is required',
        'string.uuid': 'Invalid Role Id format',
      }),
    }),
    body: Joi.object({
      name: Joi.string().optional(),
      role_permissions: Joi.array(),
    }),
  },

  delete: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.empty': 'Role Id is required',
        'string.uuid': 'Invalid Role Id format',
      }),
    }),
  },
  get: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.empty': 'Role Id is required',
        'string.uuid': 'Invalid Role Id format',
      }),
    }),
  },
};
