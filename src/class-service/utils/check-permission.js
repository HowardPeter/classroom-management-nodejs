import UserClassRepository from "../repositories/userClassRepository.js";

export const checkPermission = async (userId, classId, allowedRoles = []) => {
  const userClass = await UserClassRepository.findOne({
    class_id_user_id: {
      class_id: classId,
      user_id: userId
    }
  });

  if (!userClass) return false;

  const userRole = userClass.role;

  return allowedRoles.includes(userRole);
};