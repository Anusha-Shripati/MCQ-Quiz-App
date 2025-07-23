import Joi from 'joi';

export const candidateExamSchema = {
  create: {
    body: Joi.object({
      technology_id: Joi.string().uuid().required().messages({
        'string.empty': 'Technology is required',
        'string.uuid': 'Invalid Technology Id format',
      }),
      question: Joi.string().required().messages({
        'string.empty': 'Question is required',
      }),
      correct_answer: Joi.when('type', {
        is: 'code_snippet',
        then: Joi.any().optional(),
        otherwise: Joi.array().items(Joi.string()).required().messages({
          'string.empty': 'Correct answer is required',
        }),
      }),
      options: Joi.array().items(Joi.string()),
      time: Joi.string().required().messages({
        'string.empty': 'Time is required',
      }),
      difficulty_level: Joi.string().valid('easy', 'medium', 'hard').required().messages({
        'string.empty': 'Level is required',
        'any.only': 'Level must be one of easy, medium, hard',
      }),
      type: Joi.string()
        .valid('mcq', 'multiple_select', 'text', 'video', 'code_snippet', 'code_snippet_with_mcq')
        .required()
        .messages({
          'string.empty': 'Type is required',
          'any.only': 'Type must be one of mcq, multiple_select, text, video',
        }),
      meta: Joi.object().messages({
        'object.base': 'Meta must be an object',
      }),
    }),
  },
  startExam: {
    params: Joi.object({
      examId: Joi.string().uuid().required().messages({
        'string.empty': 'Question Id is required',
        'string.uuid': 'Invalid Question Id format',
      }),
    }),
  },
  get: {
    params: Joi.object({
      examId: Joi.string().uuid().required().messages({
        'string.empty': 'ExamId Id is required',
        'string.uuid': 'Invalid Question Id format',
      }),
    }),
  },
  resetAnswer: {
    params: Joi.object({
      examId: Joi.string().uuid().required().messages({
        'string.empty': 'ExamId Id is required',
        'string.uuid': 'Invalid Question Id format',
      }),
    }),
    body: Joi.object({
      answer_id: Joi.string().uuid().required().messages({
        'string.empty': 'ExamId Id is required',
        'string.uuid': 'Invalid Question Id format',
      }),
    }),
  },

  // Feedback submission validation schema
  submitFeedback: {
    params: Joi.object({
      examId: Joi.string().uuid().required().messages({
        'string.empty': 'Exam ID is required',
        'string.uuid': 'Invalid Exam ID format',
      }),
    }),
    body: Joi.object({
      experience_rating: Joi.number().min(1).max(5).required().messages({
        'number.base': 'Experience rating must be a number',
        'number.min': 'Experience rating must be at least 1',
        'number.max': 'Experience rating must be at most 5',
        'any.required': 'Experience rating is required',
      }),
      question_clarity: Joi.string().required().messages({
        'string.empty': 'Question clarity is required',
        'any.required': 'Question clarity is required',
      }),
      difficulty: Joi.string().required().messages({
        'string.empty': 'Difficulty is required',
        'any.required': 'Difficulty is required',
      }),
      technical_issues: Joi.string().required().messages({
        'string.empty': 'Technical issues response is required',
        'any.required': 'Technical issues response is required',
      }),
      comments: Joi.string().allow('', null),
    }),
  },
};

