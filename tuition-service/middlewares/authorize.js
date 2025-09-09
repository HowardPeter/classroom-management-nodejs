import { checkPermission } from '../utils/index.js'
import { getBearer } from '#shared/utils/index.js'

export const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const classId = req.query.class_id || req.params.classId;
      const userId = req.user.userId;
      const token = getBearer(req);

      console.log("Class ", classId);
      console.log("User ", userId);

      const allowed = await checkPermission(classId, userId, token, allowedRoles);

      if (!allowed) {
        return res.status(403).json({
          success: false,
          msg: "User does not have permission to perform this action!",
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
