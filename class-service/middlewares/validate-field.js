import Joi from "joi";
import { BadRequestError } from "#shared/errors/errors.js";

const classSchema = Joi.object({
  class_name: Joi.string().required(),
  teacher_id: Joi.string().optional(),
  schedule: Joi.array().items(
    Joi.object({
      day: Joi.string().required(),
      time: Joi.string().required()
    })
  ).optional()
});

const enrollmentSchema = Joi.object({
  student_id: Joi.string().optional(),
  class_id: Joi.string().optional(),
});

const userClassSchema = Joi.object({
  user_id: Joi.string().optional(),
  role: Joi.string().valid("owner", "manager", "viewer").required(),
});

export default function validate(type) {
  return (req, res, next) => {
    if (!type)
      throw new BadRequestError("Model type input required!");

    let schema;
    switch (type) {
      case "class":
        schema = classSchema;
        break;
      case "userClass":
        schema = userClassSchema;
        break;
      case "enrollment":
        schema = enrollmentSchema;
        break;
      default:
        return next(new BadRequestError("Wrong validate model name!"));
    }

    const { error } = schema.validate(req.body);
    if (error) {
      return next(new BadRequestError(error.details[0].message));
    }

    next();
  }
};