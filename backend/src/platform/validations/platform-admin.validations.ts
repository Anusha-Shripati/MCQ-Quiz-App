import Joi from 'joi';

export const platformAdminSchema = {
  login: {
    body: Joi.object({
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
          'string.email': 'Email must be a valid email address',
          'string.empty': 'Email is required',
        }),
      password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.empty': 'Password is required',
      }),
    }),
  },

  create: {
    body: Joi.object({
      email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.email': 'Email must be a valid email address',
        'string.empty': 'Email is required',
      }),
      password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.empty': 'Password is required',
      }),
      name: Joi.string().required().messages({
        'string.empty': 'Name is required',
      }),
      role_id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid role ID format',
        'string.empty': 'Role ID is required',
      }),
    }),
  },

  update: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid admin ID format',
      }),
    }),
    body: Joi.object({
      email: Joi.string().email({ tlds: { allow: false } }).optional(),
      name: Joi.string().optional(),
      role_id: Joi.string().uuid().optional(),
      is_active: Joi.boolean().optional(),
    }),
  },

  getById: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid admin ID format',
      }),
    }),
  },

  delete: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid admin ID format',
      }),
    }),
  },

  changePassword: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.uuid': 'Invalid admin ID format',
      }),
    }),
    body: Joi.object({
      old_password: Joi.string().optional(),
      new_password: Joi.string().min(6).required().messages({
        'string.min': 'New password must be at least 6 characters long',
        'string.empty': 'New password is required',
      }),
    }),
  },
};
