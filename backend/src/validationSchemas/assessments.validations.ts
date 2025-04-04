import Joi from "joi";

export const assessmentSchema = {
    create: {
        body: Joi.object({
            name: Joi.string().required().messages({
                "string.empty": "Technology name is required",
            }),
            technologies: Joi.array().items(
                Joi.object({
                    technology_id: Joi.string().required().messages({
                        "string.empty": "Technology ID is required",
                    }),
                    easy: Joi.number().messages({
                        "number.base": "Easy must be a number",
                    }),
                    medium: Joi.number().messages({
                        "number.base": "Medium must be a number",
                    }),
                    hard: Joi.number().messages({
                        "number.base": "Hard must be a number",
                    }),
                })
            ),
            duration: Joi.number().required().messages({
                "number.base": "Duration must be a number",
                "number.empty": "Duration is required",
            }),
        }),
    },
    update: {
        params: Joi.object({
            id: Joi.string().uuid().required().messages({
                "string.empty": "Technology Id is required",
                "string.uuid": "Invalid Technology Id format",
            }),
        }),
        body: Joi.object({
            name: Joi.string().required().messages({
                "string.empty": "Technology name is required",
            }),
            technologies: Joi.array().items(
                Joi.object({
                    technology_id: Joi.string().required().messages({
                        "string.empty": "Technology ID is required",
                    }),
                    easy: Joi.number().messages({
                        "number.base": "Easy must be a number",
                    }),
                    medium: Joi.number().messages({
                        "number.base": "Medium must be a number",
                    }),
                    hard: Joi.number().messages({
                        "number.base": "Hard must be a number",
                    }),
                })
            ),
            duration: Joi.number().required().messages({
                "number.base": "Duration must be a number",
                "number.empty": "Duration is required",
            }),
        }),
    },

    delete: {
        params: Joi.object({
            id: Joi.string().uuid().required().messages({
                "string.empty": "Technology Id is required",
                "string.uuid": "Invalid Technology Id format",
            }),
        }),
    },

    get: {
        params: Joi.object({
            id: Joi.string().uuid().required().messages({
                "string.empty": "Technology Id is required",
                "string.uuid": "Invalid Technology Id format",
            }),
        }),
    },
};