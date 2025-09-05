import Joi from "joi";
import { BadRequestError } from "#shared/errors/errors.js";

const invoiceSchema = Joi.object({
  student_id: Joi.string().required(),
  description: Joi.string().optional(),
  required_amount: Joi.number().required(),
  due_date: Joi.date().optional(),
  status: Joi.string().optional(),
  created_at: Joi.date().optional(),
});

const paymentSchema = Joi.object({
  amount: Joi.number().required(),
  method: Joi.string().optional(),
  paid_at: Joi.date().optional(),
});

export default function validate(type) {
  return (req, res, next) => {
    if (!type)
      throw new BadRequestError("Model type input required!");

    let schema;
    switch (type) {
      case "invoice":
        schema = invoiceSchema;
        break;
      case "payment":
        schema = paymentSchema;
        break;
      default:
        return next(new BadRequestError("Wrong validate model name!"));
    }

    const { error } = schema.validate(req.body);
    if (error) {
      return next(new BadRequestError("Validate failed: ", error.details[0].message));
    }

    next();
  }
};