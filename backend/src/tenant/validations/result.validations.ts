import Joi from 'joi';

export const resultSchema = {
  get: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.empty': 'ID is required',
        'string.uuid': 'Invalid  ID format',
      }),
    }),
  },
  updateScore : {
    body: Joi.object({
      resultId:Joi.string().uuid().required(),
      questionId:Joi.string().uuid().required(),
      score:Joi.number().required(),
    }),
  }
};
