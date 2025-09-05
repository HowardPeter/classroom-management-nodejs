import Joi from "joi";
import { BadRequestError } from "#shared/errors/errors.js";

const invoiceSchema = Joi.object({
  description: Joi.string().optional(),
  required_amount: Joi.decimal().required(),
  due_date: Joi.date().optional(),
  status: Joi.string().optional(),
  created_at: Joi.date().optional(),
});

const paymentSchema = Joi.object({
  amount: Joi.decimal().required(),
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

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return next(new BadRequestError(error.details[0].message));
    }

    next();
  }
};