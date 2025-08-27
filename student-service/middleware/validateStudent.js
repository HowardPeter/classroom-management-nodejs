import Joi from "joi";

const studentSchema = Joi.object({
  full_name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10,11}$/).required(),
  date_of_birth: Joi.date().less("now").required(),
});

const validateStudent = (req, res, next) => {
  const { error } = studentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }
  next();
};