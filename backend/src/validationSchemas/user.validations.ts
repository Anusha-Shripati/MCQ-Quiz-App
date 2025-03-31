import Joi from "joi";

// Article Validation Schema
const createUserSchema = {
  body: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
    role_id: Joi.string().required(),
  }),
};

const loginSchema = {
  body: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } }) 
      .required()
      .messages({
        "string.email": "Email must be a valid email address",
        "string.empty": "Email is required",
      }),
    password: Joi.string()
      .min(6) 
      .required()
      .messages({
        "string.min": "Password must be at least 6 characters long",
        "string.empty": "Password is required",
      }),
  }),
};

export { createUserSchema, loginSchema };
