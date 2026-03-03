import Joi from 'joi';

export const createTenantRequestValidation = Joi.object({
  organization_name: Joi.string().min(2).max(100).required(),
  slug: Joi.string().min(2).max(50).pattern(/^[a-z0-9-]+$/).required(),
  admin_name: Joi.string().min(2).max(100).required(),
  admin_email: Joi.string().email().required(),
  admin_password: Joi.string().min(6).required(),
  requested_plan_id: Joi.string().uuid().optional()
});

export const checkSlugValidation = Joi.object({
  slug: Joi.string().min(2).max(50).pattern(/^[a-z0-9-]+$/).required()
});

export const checkOrganizationValidation = Joi.object({
  slug: Joi.string().min(2).max(50).pattern(/^[a-z0-9-]+$/).required()
});

export const checkStatusValidation = Joi.object({
  admin_email: Joi.string().email().required(),
  admin_password: Joi.string().required()
});

export const cancelRequestValidation = Joi.object({
  admin_email: Joi.string().email().required(),
  admin_password: Joi.string().required()
});

export const rejectRequestValidation = Joi.object({
  reason: Joi.string().min(10).max(500).required()
});