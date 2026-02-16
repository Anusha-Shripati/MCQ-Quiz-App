import Joi from 'joi';

export const platformRoleSchema = {
  create: {
    body: Joi.object({
      name: Joi.string().required().messages({
        'string.empty': 'Role name is required',
      }),
      description: Joi.string().optional(),
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
      description: Joi.string().optional(),
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

  getById: {
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
