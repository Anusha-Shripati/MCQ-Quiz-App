import Joi from 'joi';

export const examSchema = {
    create: {
        body: Joi.object({
            user_id: Joi.string().uuid().required().messages({
                'string.empty': 'User ID is required',
                'string.uuid': 'Invalid User ID format',
            }),
            assessment_id: Joi.string().uuid().required().messages({
                'string.empty': 'Assessment ID is required',
                'string.uuid': 'Invalid Assessment ID format',
            }),
            end_time: Joi.date().required().messages({
                'date.base': 'End time must be a valid date',
            }),
            start_time: Joi.date().required().messages({
                'date.base': 'Start time must be a valid date',
            }),
            is_completed: Joi.boolean().required().messages({
                'boolean.base': 'Is completed must be a boolean',
            }),
            meta: Joi.object().default({}).messages({
                'object.base': 'Meta must be an object',
            }),
        }),
    },
    update: {
        params: Joi.object({
            id: Joi.string().uuid().required().messages({
                'string.empty': 'Exam ID is required',
                'string.uuid': 'Invalid Exam ID format',
            }),
        }),
        body: Joi.object({
            end_time: Joi.date().messages({
                'date.base': 'End time must be a valid date',
            }),
            start_time: Joi.date().messages({
                'date.base': 'Start time must be a valid date',
            }),
            is_completed: Joi.boolean().messages({
                'boolean.base': 'Is completed must be a boolean',
            }),
            meta: Joi.object().messages({
                'object.base': 'Meta must be an object',
            }),
        }),
    },
    delete: {
        params: Joi.object({
            id: Joi.string().uuid().required().messages({
                'string.empty': 'Exam ID is required',
                'string.uuid': 'Invalid Exam ID format',
            }),
        }),
    },
    get: {
        params: Joi.object({
            id: Joi.string().uuid().required().messages({
                'string.empty': 'Exam ID is required',
                'string.uuid': 'Invalid Exam ID format',
            }),
        }),
    },
}; 