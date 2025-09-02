import UserClassRepository from "../repositories/userClassRepository.js";

export const checkPermission = async (userId, classId, allowedRoles = []) => {
  const userClass = await UserClassRepository.findOne({
    user_id: userId,
    class_id: classId,
  });

  if (!userClass) return false;

  const userRole = userClass.role;

  return allowedRoles.includes(userRole);
};