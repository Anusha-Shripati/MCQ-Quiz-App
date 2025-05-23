import Joi from 'joi';

export const resultSchema = {
  get: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.empty': 'Exam ID is required',
        'string.uuid': 'Invalid Exam ID format',
      }),
    }),
  },
};
