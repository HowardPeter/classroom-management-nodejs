import { NotFoundError } from "../errors/errors.js";
import ClassRepository from "../repositories/classRepository.js";
import UserClassRepository from "../repositories/userClassRepository.js";

export const checkPermission = async (userId, classId, allowedRoles = []) => {
  const isClass = await ClassRepository.findOne({
    class_id: classId
  })
  if (!isClass) {
    throw new NotFoundError("Wrong class Id! Class does not exist.");
  }

  const userClass = await UserClassRepository.findOne({
    user_id: userId,
    class_id: classId,
  });

  if (!userClass) return false;

  const userRole = userClass.role;

  return allowedRoles.includes(userRole);
};