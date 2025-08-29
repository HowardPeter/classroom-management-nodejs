import Joi from "joi";
import { BadRequestError } from "../errors/errors.js";

const classSchema = Joi.object({
  class_name: Joi.string().required(),
  teacher_id: Joi.string().optional(),
  student_number: Joi.number().integer().optional(),
  schedule: Joi.array().items(
    Joi.object({
      day: Joi.string().required(),
      time: Joi.string().required()
    })
  ).optional()
});

const userClassSchema = Joi.object({
  class_id: Joi.string().required(),
  user_id: Joi.string().required(),
  role: Joi.string().valid("owner", "manager").required(),
});

const enrollmentSchema = Joi.object({
  student_id: Joi.string().required(),
  user_id: Joi.string().required(),
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