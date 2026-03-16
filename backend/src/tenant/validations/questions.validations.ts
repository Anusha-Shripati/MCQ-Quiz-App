import Joi from 'joi';

export const questionsSchema = {
  createMultiple: {
    body: Joi.object({
      technology_id: Joi.string().uuid().required().messages({
        'string.empty': 'Technology is required',
        'string.uuid': 'Invalid Technology Id format',
      }),
      questions: Joi.array().items(
        Joi.object({
          technology_id: Joi.string().uuid().optional(), // Allow but ignore
          question: Joi.string().required(),
          correct_answer: Joi.when('type', {
            is: Joi.valid('code_snippet', 'code_editor'),
            then: Joi.array().items(Joi.string()).min(1).required().messages({
              'array.min': 'At least one correct answer is required',
              'any.required': 'Correct answer is required for code_snippet and code_editor types',
            }),
            otherwise: Joi.array().items(Joi.string()).required().messages({
              'string.empty': 'Correct answer is required',
            }),
          }),
          options: Joi.when('type', {
            is: Joi.valid('mcq', 'multiple_select', 'code_snippet', 'code_snippet_with_mcq'),
            then: Joi.array().items(Joi.string().allow('')).required().messages({
              'any.required': 'Options are required for this question type',
            }),
            otherwise: Joi.array().items(Joi.string().allow('')).optional(),
          }),
          time: Joi.alternatives().try(Joi.string().allow(''), Joi.number()).optional(), // Allow but ignore
          difficulty_level: Joi.string().valid('easy', 'medium', 'hard').required().messages({
            'string.empty': 'Level is required',
            'any.only': 'Level must be one of easy, medium, hard',
          }),
          type: Joi.string()
            .valid('mcq', 'multiple_select', 'text', 'video', 'code_snippet', 'code_editor', 'code_snippet_with_mcq')
            .required()
            .messages({
              'string.empty': 'Type is required',
              'any.only': 'Type must be one of mcq, multiple_select, text, video, code_snippet, code_editor, code_snippet_with_mcq',
            }),
          meta: Joi.object().unknown(true).default({}),
        }).custom((value, helpers) => {
          // Custom validation for options based on type
          if (['mcq', 'multiple_select', 'code_snippet', 'code_snippet_with_mcq'].includes(value.type)) {
            const filledOptions = (value.options || []).filter((opt: string) => opt && opt.trim());
            const minOptions = value.type === 'code_snippet' ? 2 : 
                              value.type === 'code_snippet_with_mcq' ? 4 : 2;
            
            if (filledOptions.length < minOptions) {
              return helpers.error('any.custom', {
                message: `At least ${minOptions} non-empty options are required for ${value.type} type`,
              });
            }
          }
          return value;
        }, 'Options validation')
      ).min(1).required().messages({
        'array.min': 'At least one question is required',
        'any.required': 'Questions array is required',
      }),
    }),
  },
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
        is: Joi.valid('code_snippet', 'code_editor'),
        then: Joi.array().items(Joi.string()).min(1).required().messages({
          'array.min': 'At least one correct answer is required',
          'any.required': 'Correct answer is required for code_snippet and code_editor types',
        }),
        otherwise: Joi.array().items(Joi.string()).required().messages({
          'string.empty': 'Correct answer is required',
        }),
      }),
      
      options: Joi.when('type', {
        is: Joi.valid('mcq', 'multiple_select', 'code_snippet', 'code_snippet_with_mcq'),
        then: Joi.array().items(Joi.string()).min(Joi.ref('...minOptions')).required().messages({
          'array.min': 'Minimum options required',
          'any.required': 'Options are required for this question type',
        }),
        otherwise: Joi.array().items(Joi.string()).optional(),
      }),
      // time: Joi.number().required().messages({
      //   'string.empty': 'Time is required',
      // }),
      difficulty_level: Joi.string().valid('easy', 'medium', 'hard').required().messages({
        'string.empty': 'Level is required',
        'any.only': 'Level must be one of easy, medium, hard',
      }),
      type: Joi.string()
        .valid('mcq', 'multiple_select', 'text', 'video', 'code_snippet', 'code_editor', 'code_snippet_with_mcq')
        .required()
        .messages({
          'string.empty': 'Type is required',
          'any.only': 'Type must be one of mcq, multiple_select, text, video, code_snippet, code_editor, code_snippet_with_mcq',
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

      if ((value.type === 'code_snippet' || value.type === 'code_snippet_with_mcq') && (!value.meta?.code || value.meta.code.trim() === '')) {
        return helpers.error('any.custom', {
          message: 'Code snippet is required for code_snippet and code_snippet_with_mcq types',
        });
      }

      if (value.type === 'code_snippet') {
        const filledOptions = (value.options || []).filter((opt: string) => opt.trim()).length;
        if (filledOptions < 2) {
          return helpers.error('any.custom', {
            message: 'At least 2 options are required for code_snippet type',
          });
        }
      }

      if (value.type === 'code_snippet_with_mcq') {
        const filledOptions = (value.options || []).filter((opt: string) => opt.trim()).length;
        if (filledOptions < 4) {
          return helpers.error('any.custom', {
            message: 'At least 4 options are required for code_snippet_with_mcq type',
          });
        }
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
        is: Joi.valid('code_snippet', 'code_editor'),
        then: Joi.array().items(Joi.string()).min(1).required().messages({
          'array.min': 'At least one correct answer is required',
          'any.required': 'Correct answer is required for code_snippet and code_editor types',
        }),
        otherwise: Joi.array().items(Joi.string()).required().messages({
          'string.empty': 'Correct answer is required',
        }),
      }),
      options: Joi.when('type', {
        is: Joi.valid('mcq', 'multiple_select', 'code_snippet', 'code_snippet_with_mcq'),
        then: Joi.array().items(Joi.string()).min(Joi.ref('...minOptions')).required().messages({
          'array.min': 'Minimum options required',
          'any.required': 'Options are required for this question type',
        }),
        otherwise: Joi.array().items(Joi.string()).optional(),
      }),
      // time: Joi.number().required().messages({
      //   'string.empty': 'Time is required',
      // }),
      difficulty_level: Joi.string().valid('easy', 'medium', 'hard').required().messages({
        'string.empty': 'Level is required',
        'any.only': 'Level must be one of easy, medium, hard',
      }),
      type: Joi.string()
        .valid('mcq', 'multiple_select', 'text', 'video', 'code_snippet', 'code_editor', 'code_snippet_with_mcq')
        .required()
        .messages({
          'string.empty': 'Type is required',
          'any.only': 'Type must be one of mcq, multiple_select, text, video, code_snippet, code_editor, code_snippet_with_mcq',
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

      if ((value.type === 'code_snippet' || value.type === 'code_snippet_with_mcq') && (!value.meta?.code || value.meta.code.trim() === '')) {
        return helpers.error('any.custom', {
          message: 'Code snippet is required for code_snippet and code_snippet_with_mcq types',
        });
      }

      if (value.type === 'code_snippet') {
        const filledOptions = (value.options || []).filter((opt: string) => opt.trim()).length;
        if (filledOptions < 2) {
          return helpers.error('any.custom', {
            message: 'At least 2 options are required for code_snippet type',
          });
        }
      }

      if (value.type === 'code_snippet_with_mcq') {
        const filledOptions = (value.options || []).filter((opt: string) => opt.trim()).length;
        if (filledOptions < 4) {
          return helpers.error('any.custom', {
            message: 'At least 4 options are required for code_snippet_with_mcq type',
          });
        }
      }

      return value;
    }, 'Custom validation for update'),
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
