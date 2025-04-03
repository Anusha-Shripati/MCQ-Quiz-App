import Joi from "joi";


export const roleSchema = {
    create: {
        body: Joi.object({
            name: Joi.string().required().messages({
                "string.empty": "Role name is required",
            }),
            rolePermissions:Joi.array()
        }),
    },

    update: {
        params: Joi.object({
            id: Joi.string().uuid().required().messages({
                "string.empty": "Role ID is required",
                "string.uuid": "Invalid Role ID format",
            }),
        }),
        body: Joi.object({
            name: Joi.string().optional(),
            rolePermissions:Joi.array()
        }),
    },

    delete: {
        params: Joi.object({
            id: Joi.string().uuid().required().messages({
                "string.empty": "Role ID is required",
                "string.uuid": "Invalid Role ID format",
            }),
        }),
    },
};
