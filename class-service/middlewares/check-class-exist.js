import ClassRepository from '../repositories/classRepository.js'
import { NotFoundError } from "#shared/errors/errors.js"

export default async function checkClassExist(req, res, next) {
  const classId = req.params.id;

  const classExist = await ClassRepository.findOne({ class_id: classId });
  
  if (!classExist)
    return next(new NotFoundError("Wrong class Id! Class does not exist."));

  next();
}