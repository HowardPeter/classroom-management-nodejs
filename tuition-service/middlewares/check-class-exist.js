import { ClassServiceClient } from '../api/index.js'
import { NotFoundError, BadRequestError } from "#shared/errors/errors.js"
import { getBearer } from '#shared/utils/index.js'

export default async function checkClassExist(req, res, next) {
  const { class_id: classId } = req.query;
  const token = getBearer(req);

  if (!classId)
    return next(new BadRequestError("Class Id is required!"));

  const classExist = await ClassServiceClient.getClassById(classId, token);
  if (!classExist)
    return next(new NotFoundError("Wrong class Id! Class does not exist."));

  next();
}