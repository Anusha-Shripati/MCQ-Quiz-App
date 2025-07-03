import Joi from 'joi';

export const assessmentSchema = {
  create: {
    body: Joi.object({
      name: Joi.string().required().messages({
        'string.empty': 'Technology name is required',
      }),
      pass_criteria: Joi.number().required().messages({
        'number.base': 'Passing score must be a number',
        'number.empty': 'Passing score is required',
      }),
      technologies: Joi.array().items(
        Joi.object({
          technology_id: Joi.string().required().messages({
            'string.empty': 'Technology ID is required',
          }),
          easy: Joi.object(),
          medium: Joi.object(),
          hard: Joi.object(),
        })
      ),
      duration: Joi.number().required().messages({
        'number.base': 'Duration must be a number',
        'number.empty': 'Duration is required',
      }),
    }),
  },
  update: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.empty': 'Technology Id is required',
        'string.uuid': 'Invalid Technology Id format',
      }),
    }),
    body: Joi.object({
      name: Joi.string().required().messages({
        'string.empty': 'Technology name is required',
      }),
      pass_criteria: Joi.number().required().messages({
        'number.empty': 'Passing score is required',
        'number.base': 'Passing score must be a number',
      }),
      technologies: Joi.array().items(
        Joi.object({
          technology_id: Joi.string().required().messages({
            'string.empty': 'Technology ID is required',
          }),
          easy: Joi.object(),
          medium:Joi.object(),
          hard:Joi.object(),
        })
      ),
      duration: Joi.number().required().messages({
        'number.base': 'Duration must be a number',
        'number.empty': 'Duration is required',
      }),
    }),
  },

  delete: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.empty': 'Technology Id is required',
        'string.uuid': 'Invalid Technology Id format',
      }),
    }),
  },

  get: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.empty': 'Technology Id is required',
        'string.uuid': 'Invalid Technology Id format',
      }),
    }),
  },
  checkUnique: {
    body: Joi.object({
      name: Joi.string().required().messages({
        'string.empty': 'Technology name is required',
      }),
    }),
  },
  checkQuestion: {
    body: Joi.object({
      technologies: Joi.array()
    }),
  },
};
