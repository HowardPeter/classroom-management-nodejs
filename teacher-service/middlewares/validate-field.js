import Joi from "joi";

export const teacherSchema = Joi.object({
  full_name: Joi.string().required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[0-9]{10,11}$/).optional(),
  expertise: Joi.string().optional(),
  avatar_url: Joi.string().optional()
});

export const validate = (req, res, next) => {
  const { error } = teacherSchema.validate(req.body);
  if (error) {
    return next(error);
  }
  
  next();
};