import Joi from 'joi';

export const userSchema = {
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
      email: Joi.string().required(),
      password: Joi.string().required(),
      role_id: Joi.string().required(),
      name: Joi.string().required(),
    }),
  },
  get: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.empty': 'User Id is required',
        'string.uuid': 'Invalid User Id format',
      }),
    }),
  },

  delete: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.empty': 'User Id is required',
        'string.uuid': 'Invalid User Id format',
      }),
    }),
  },

  update: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.empty': 'User Id is required',
        'string.uuid': 'Invalid User Id format',
      }),
    }),
    body: Joi.object({
      email: Joi.string().required(),
      password: Joi.optional(),
      role_id: Joi.string().optional(),
      name: Joi.string().required(),
    }),
  },
  changePassword: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.empty': 'User Id is required',
        'string.uuid': 'Invalid User Id format',
      }),
    }),
    body: Joi.object({
      oldPassword: Joi.string().required(),
      newPassword: Joi.optional(),
    }),
  },
};
