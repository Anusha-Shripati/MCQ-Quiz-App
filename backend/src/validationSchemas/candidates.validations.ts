import Joi from 'joi';

export const candidateSchema = {
	create: {
		body: Joi.object({
			assessment_id: Joi.string().required().messages({
				'string.empty': 'Assessment ID is required',
			}),
			name: Joi.string().required().messages({
				'string.empty': 'Candidate name is required',
			}),
			email: Joi.string().required().messages({
				'string.empty': 'Candidate email is required',
			}),
			experience: Joi.string().required().messages({
				'string.empty': 'Candidate experience is required',
			}),
			phone: Joi.string().required().messages({
				'string.empty': 'Candidate phone is required',
			}),
			meta: Joi.object({
				'string.empty': 'Candidate meta is required',
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
			assessment_id: Joi.string().required().messages({
				'string.empty': 'Assessment ID is required',
			}),
			name: Joi.string().required().messages({
				'string.empty': 'Candidate name is required',
			}),
			email: Joi.string().required().messages({
				'string.empty': 'Candidate email is required',
			}),
			experience: Joi.string().required().messages({
				'string.empty': 'Candidate experience is required',
			}),
			phone: Joi.string().required().messages({
				'string.empty': 'Candidate phone is required',
			}),
			meta: Joi.object({
				'string.empty': 'Candidate meta is required',
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
};
