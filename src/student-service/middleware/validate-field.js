import Joi from "joi";

export const studentSchema = Joi.object({
  full_name: Joi.string().required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[0-9]{10,11}$/).optional(),
  gender: Joi.string().valid("male", "female").optional(),
  address: Joi.string().optional(),
  date_of_birth: Joi.date().less("now").optional(),
  enrollment_date: Joi.date().optional(),
});

export const validateStudent = (req, res, next) => {
  const { error } = studentSchema.validate(req.body);
  if (error) {
    return next(error);
  }
  
  next();
};