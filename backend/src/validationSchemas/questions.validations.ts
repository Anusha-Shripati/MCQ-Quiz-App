import Joi from 'joi';

export const questionsSchema = {
  create: {
    body: Joi.object({
      technology_id: Joi.string().uuid().required().messages({
        'string.empty': 'Technology is required',
        'string.uuid': 'Invalid Technology Id format',
      }),
      question: Joi.string().required(),
        // .allow('')
        // .when('type', {
        //   is: 'video',
        //   then: Joi.optional(),
        //   otherwise: Joi.required().messages({
        //     'string.empty': 'Question is required',
        //   }),
        // }),
      correct_answer: Joi.when('type', {
        is: 'code_snippet',
        then: Joi.any().optional(),
        otherwise: Joi.array().items(Joi.string()).required().messages({
          'string.empty': 'Correct answer is required',
        }),
      }),
      
      options: Joi.when('type', {
        is: Joi.valid('mcq', 'multiple_select'),
        then: Joi.array().items(Joi.string()).min(4).required().messages({
          'array.min': 'At least 4 options are required',
          'any.required': 'Options are required for MCQ and Multiple Select types',
        }),
        otherwise: Joi.array().items(Joi.string()).optional(),
      }),
      // time: Joi.string().required().messages({
      //   'string.empty': 'Time is required',
      // }),
      difficulty_level: Joi.string().valid('easy', 'medium', 'hard').required().messages({
        'string.empty': 'Level is required',
        'any.only': 'Level must be one of easy, medium, hard',
      }),
      type: Joi.string()
        .valid('mcq', 'multiple_select', 'text', 'video', 'code_snippet', 'code_editor')
        .required()
        .messages({
          'string.empty': 'Type is required',
          'any.only': 'Type must be one of mcq, multiple_select, text, video, code_snippet, code_editor',
        }),
      meta: Joi.object().unknown(true).default({}),
    }).custom((value, helpers) => {
      if (
        value.type === 'video' &&
        (!value.question?.trim() || value.question.trim() === '') &&
        (!value.meta?.video_url || value.meta.video_url.trim() === '')
      ) {
        return helpers.error('any.custom', {
          message: 'Either question or meta.video_url is required for video type',
        });
      }

      return value;
    }, 'Custom validation'),
  },
  update: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.empty': 'Question Id is required',
        'string.uuid': 'Invalid Question Id format',
      }),
    }),
    body: Joi.object({
      technology_id: Joi.string().uuid().required().messages({
        'string.empty': 'Technology is required',
        'string.uuid': 'Invalid Technology Id format',
      }),
      question: Joi.string().required(),
        // .allow('')
        // .when('type', {
        //   is: 'video',
        //   then: Joi.optional(),
        //   otherwise: Joi.required().messages({
        //     'string.empty': 'Question is required',
        //   }),
        // }),
      correct_answer: Joi.when('type', {
        is: 'code_snippet',
        then: Joi.any().optional(),
        otherwise: Joi.array().items(Joi.string()).required().messages({
          'string.empty': 'Correct answer is required',
        }),
      }),
      options: Joi.when('type', {
        is: Joi.valid('mcq', 'multiple_select'),
        then: Joi.array().items(Joi.string()).min(4).required().messages({
          'array.min': 'At least 4 options are required',
          'any.required': 'Options are required for MCQ and Multiple Select types',
        }),
        otherwise: Joi.array().items(Joi.string()).optional(),
      }),
      // time: Joi.string().required().messages({
      //   'string.empty': 'Time is required',
      // }),
      difficulty_level: Joi.string().valid('easy', 'medium', 'hard').required().messages({
        'string.empty': 'Level is required',
        'any.only': 'Level must be one of easy, medium, hard',
      }),
      type: Joi.string()
        .valid('mcq', 'multiple_select', 'text', 'video', 'code_snippet', 'code_editor')
        .required()
        .messages({
          'string.empty': 'Type is required',
          'any.only': 'Type must be one of mcq, multiple_select, text, video, code_snippet, code_editor',
        }),
      meta: Joi.object().unknown(true).default({}),
    }).custom((value, helpers) => {
      if (
        value.type === 'video' &&
        (!value.question?.trim() || value.question.trim() === '') &&
        (!value.meta?.video_url || value.meta.video_url.trim() === '')
      ) {
        return helpers.error('any.custom', {
          message: 'Either question or meta.video_url is required for video type',
        });
      }

      return value;
    }, 'Custom validation for video type'),
  },

  delete: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.empty': 'Question Id is required',
        'string.uuid': 'Invalid Question Id format',
      }),
    }),
  },

  get: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.empty': 'Question Id is required',
        'string.uuid': 'Invalid Question Id format',
      }),
    }),
  },
};
