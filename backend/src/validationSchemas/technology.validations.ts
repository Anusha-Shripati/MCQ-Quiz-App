import Joi from "joi";

export const teachnologySchema = {
    create: {
        body: Joi.object({
            name: Joi.string().required().messages({
                "string.empty": "Technology name is required",
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
            name: Joi.string().optional(),
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