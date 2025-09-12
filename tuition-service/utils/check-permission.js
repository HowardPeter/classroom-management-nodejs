import { ClassServiceClient } from "../api/index.js";

export const checkPermission = async (classId, userId, token, allowedRoles = []) => {
  const userClass = await ClassServiceClient.getUserClass(classId, userId, token);

  if (!userClass) return false;

  const userRole = userClass.role;

  return allowedRoles.includes(userRole);
};